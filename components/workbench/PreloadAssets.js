import { Component, Suspense, useCallback, useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const models = ['/models/monitor.glb', '/models/desk-lamp.glb', '/models/keyboard/optimized.gltf', '/models/chair/optimized.gltf', '/models/radio/optimized.gltf', '/models/city/optimized.gltf', '/models/plane/scene.gltf', '/models/plant/optimized.gltf', '/models/stool/optimized.gltf', '/models/pascal/optimized.gltf', '/models/upliance/interactive.glb', '/models/ceiling-light/optimized.gltf', '/models/paper-ball/scene.gltf', '/models/basketball-hoop/scene.gltf'];
const textures = ['/images/upliance-display.svg', '/images/workbench-desktop-preview.svg', '/images/workbench-desktop-music.svg', '/images/workbench-wallpaper.svg'];
const priorityModels = ['/models/monitor.glb', '/models/upliance/interactive.glb'];
const priorityTextures = textures.slice(0, 3);
const priorityAssets = [...priorityModels, ...priorityTextures];
export const ASSET_COUNT = models.length + textures.length;

function Asset({ url, texture, onLoaded }) {
  // Use the same loader/cache keys as the room, including parsed models and textures.
  useLoader(texture ? TextureLoader : GLTFLoader, url);
  useEffect(() => { onLoaded(url); }, [url, onLoaded]);
  return null;
}
class LoadBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export default function PreloadAssets({ onLoaded, onError, onReady }) {
  const [completed,setCompleted]=useState([]);
  const reportLoaded=useCallback(url=>{
    setCompleted(current=>current.includes(url)?current:[...current,url]);
    onLoaded?.(url);
  },[onLoaded]);
  useEffect(()=>{if(completed.length===ASSET_COUNT)onReady?.();},[completed,onReady]);
  const screensReady=priorityAssets.every(url=>completed.includes(url));
  return <LoadBoundary onError={onError}>
    {(screensReady ? models : priorityModels).map(url => <Suspense key={url} fallback={null}><Asset url={url} onLoaded={reportLoaded}/></Suspense>)}
    {(screensReady ? textures : priorityTextures).map(url=><Suspense key={url} fallback={null}><Asset url={url} texture onLoaded={reportLoaded}/></Suspense>)}
  </LoadBoundary>;
}
