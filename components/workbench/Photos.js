/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from 'react';
import noteDate from './noteDate';
import styles from '../../styles/Photos.module.css';

const FILTER='saturate(.65) contrast(1.12) brightness(.96)';
function preparePhoto(source){
  const width=source.videoWidth||source.naturalWidth,height=source.videoHeight||source.naturalHeight;
  if(!width||!height)throw Error('The camera is still warming up. Try again in a moment.');
  const canvas=document.createElement('canvas'),scale=Math.min(1,1280/Math.max(width,height));
  canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
  const ctx=canvas.getContext('2d');ctx.filter=FILTER;ctx.drawImage(source,0,0,canvas.width,canvas.height);ctx.filter='none';
  ctx.fillStyle='rgba(100,150,180,.07)';ctx.fillRect(0,0,canvas.width,canvas.height);
  // Bake the CRT lines into the photo so the shared version keeps the same look.
  const pitch=Math.max(3,canvas.height/90);
  ctx.fillStyle='rgba(5,14,24,.2)';
  for(let y=0;y<canvas.height;y+=pitch)ctx.fillRect(0,y,canvas.width,pitch*.3);
  let url;for(const quality of [.82,.7,.58,.46]){url=canvas.toDataURL('image/jpeg',quality);if(url.length<800000)break;}
  if(url.length>=800000)throw Error('This photo is too detailed. Please choose a smaller image.');
  const thumb=document.createElement('canvas'),ratio=Math.min(1,320/Math.max(canvas.width,canvas.height));
  thumb.width=Math.max(1,Math.round(canvas.width*ratio));thumb.height=Math.max(1,Math.round(canvas.height*ratio));
  thumb.getContext('2d').drawImage(canvas,0,0,thumb.width,thumb.height);
  return {id:crypto.randomUUID(),url,image:url.split(',')[1],thumbnail:thumb.toDataURL('image/jpeg',.65).split(',')[1]};
}
export default function Photos({active}){
  const [photos,setPhotos]=useState([]),[draft,setDraft]=useState(null),[selected,setSelected]=useState(null);
  const [nextPage,setNextPage]=useState(null),[loadingMore,setLoadingMore]=useState(false);
  const expanded=useRef(false);
  const [camera,setCamera]=useState(false),[starting,setStarting]=useState(false),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[revision,setRevision]=useState(0);
  const stream=useRef(null),video=useRef(null),fileInput=useRef(null),owner=useRef(null),request=useRef(0),activeRef=useRef(active),mounted=useRef(true);
  activeRef.current=active;
  const identity=()=>{
    if(!owner.current){try{owner.current=localStorage.getItem('cozy-photo-owner');}catch{}if(!/^[\da-f-]{36}$/i.test(owner.current||'')){owner.current=crypto.randomUUID();try{localStorage.setItem('cozy-photo-owner',owner.current);}catch{}}}
    return owner.current;
  };
  const releaseCamera=useCallback(()=>{request.current++;stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;if(video.current)video.current.srcObject=null;},[]);
  const stopCamera=useCallback(()=>{releaseCamera();setCamera(false);setStarting(false);},[releaseCamera]);
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;releaseCamera();};},[releaseCamera]);
  useEffect(()=>{if(!active)stopCamera();},[active,stopCamera]);
  useEffect(()=>{const hide=()=>{if(document.hidden)stopCamera();};document.addEventListener('visibilitychange',hide);return ()=>document.removeEventListener('visibilitychange',hide);},[stopCamera]);
  useEffect(()=>{
    if(!active)return;
    const controller=new AbortController();setLoading(true);
    fetch('/api/photos',{headers:{'x-photo-owner':identity()},signal:controller.signal}).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error);if(!controller.signal.aborted){setPhotos(data.photos);setNextPage(data.next);expanded.current=false;setError('');}}).catch(e=>{if(!controller.signal.aborted)setError(e.message||'Could not load photos.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    const timer=setInterval(()=>{if(!document.hidden&&!expanded.current)setRevision(v=>v+1);},30000);
    return ()=>{controller.abort();clearInterval(timer);};
  },[active,revision]);
  useEffect(()=>{if(camera&&video.current&&stream.current){const media=stream.current;video.current.srcObject=media;video.current.play().catch(()=>{if(stream.current===media){setError('Camera preview could not start. Please try again.');stopCamera();}});}},[camera,stopCamera]);
  const startCamera=async()=>{
    stopCamera();setError('');setDraft(null);setSelected(null);
    if(!navigator.mediaDevices?.getUserMedia){setError('Camera requires HTTPS or localhost and a supported browser. You can still upload a photo.');return;}
    const id=++request.current;setStarting(true);
    try{
      const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});
      if(id!==request.current||!activeRef.current||!mounted.current){media.getTracks().forEach(track=>track.stop());return;}
      stream.current=media;setCamera(true);setStarting(false);
    }catch(e){if(id===request.current&&mounted.current){setStarting(false);setError(e.name==='NotAllowedError'?'Camera permission was denied. Allow it in your browser or upload a photo.':'Could not open the camera. Try uploading a photo instead.');}}
  };
  const capture=()=>{try{setDraft(preparePhoto(video.current));setError('');stopCamera();}catch(e){setError(e.message);}};
  const chooseFile=async event=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    stopCamera();setSelected(null);setError('');
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024){setError('Choose a JPG, PNG or WebP smaller than 20 MB.');return;}
    const url=URL.createObjectURL(file);
    try{const image=new Image();image.src=url;await image.decode();const prepared=preparePhoto(image);if(mounted.current)setDraft(prepared);}catch{if(mounted.current)setError('This image could not be opened. Try a JPG, PNG or WebP.');}finally{URL.revokeObjectURL(url);}
  };
  const loadMore=async()=>{
    if(loadingMore||!nextPage)return;setLoadingMore(true);expanded.current=true;
    try{const response=await fetch(`/api/photos?before=${encodeURIComponent(nextPage)}`,{headers:{'x-photo-owner':identity()}});const data=await response.json();if(!response.ok)throw Error(data.error);if(mounted.current){setPhotos(current=>[...current,...data.photos.filter(photo=>!current.some(existing=>existing.id===photo.id))]);setNextPage(data.next);}}catch(e){if(mounted.current)setError(e.message||'Could not load more photos.');}finally{if(mounted.current)setLoadingMore(false);}
  };
  const publish=async()=>{
    if(!draft||busy)return;setBusy(true);setError('');
    try{const response=await fetch('/api/photos',{method:'POST',headers:{'Content-Type':'application/json','x-photo-owner':identity()},body:JSON.stringify({id:draft.id,image:draft.image,thumbnail:draft.thumbnail})});const data=await response.json();if(!response.ok)throw Error(data.error);if(mounted.current){setDraft(null);setRevision(v=>v+1);}}catch(e){if(mounted.current)setError(e.message||'Upload failed. Your preview is still here; try again.');}finally{if(mounted.current)setBusy(false);}
  };
  const remove=async photo=>{
    if(busy)return;setBusy(true);setError('');
    try{const response=await fetch('/api/photos',{method:'DELETE',headers:{'Content-Type':'application/json','x-photo-owner':identity()},body:JSON.stringify({id:photo.id})});const data=await response.json();if(!response.ok)throw Error(data.error);if(mounted.current){setSelected(null);setRevision(v=>v+1);}}catch(e){if(mounted.current)setError(e.message||'Could not remove photo.');}finally{if(mounted.current)setBusy(false);}
  };
  return <section className={styles.photos} onKeyDown={event=>{if(event.key==='Escape'&&(camera||starting||draft||selected)){event.stopPropagation();event.preventDefault();if(!busy){stopCamera();setDraft(null);setSelected(null);}}}}>
    <header><div><h2>Photos</h2><p>A little album from everyone who stops by.</p></div><span className={styles.badge}>RETRO / CRT</span></header>
    <nav aria-label="Photo actions"><button disabled={busy||starting} onClick={startCamera}>◉ Camera</button><button disabled={busy} onClick={()=>fileInput.current?.click()}>＋ Upload image</button><button disabled={busy||loading} onClick={()=>setRevision(v=>v+1)}>↻ Refresh</button><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={chooseFile}/></nav>
    {error&&<p role="alert" className={styles.error}>{error}</p>}
    {(camera||starting)&&<div className={styles.capture}><div className={styles.cameraStage}><video ref={video} autoPlay muted playsInline style={{filter:FILTER}}/>{starting&&<span>Opening camera…</span>}</div><footer><button disabled={!camera} onClick={capture}>Take photo</button><button onClick={stopCamera}>Cancel</button></footer></div>}
    {draft&&<div className={styles.capture}><img src={draft.url} alt="Your photo preview with retro scanline filter"/><footer><span>Preview · uploading makes this visible to everyone.</span><button disabled={busy} onClick={publish}>{busy?'Uploading…':'Share photo'}</button><button disabled={busy} onClick={()=>setDraft(null)}>Discard</button></footer></div>}
    {selected&&<div className={styles.capture}><img src={`/api/photos?id=${selected.id}`} alt="Shared visitor photo"/><footer><time>{noteDate(selected.createdAt)}</time><button onClick={()=>setSelected(null)}>Back to gallery</button>{selected.canDelete&&<button disabled={busy} onClick={()=>remove(selected)}>Delete my photo</button>}</footer></div>}
    {!camera&&!starting&&!draft&&!selected&&<>{loading&&<p role="status">Loading album…</p>}{!loading&&!photos.length&&!error&&<p className={styles.empty}>The album is waiting for its first photo.</p>}<div className={styles.grid}>{photos.map(photo=><button key={photo.id} className={styles.print} onClick={()=>setSelected(photo)} aria-label={`Open photo from ${noteDate(photo.createdAt)}`}><img loading="lazy" src={`/api/photos?id=${photo.id}&thumb=1`} alt="Visitor upload"/><time>{noteDate(photo.createdAt)}</time></button>)}</div>{nextPage&&<button disabled={loadingMore||loading} onClick={loadMore}>{loadingMore?'Loading…':'Load more photos'}</button>}</>}
  </section>;
}
