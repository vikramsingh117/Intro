// Run with Sharp available: node scripts/optimize-city.cjs
// Originals remain untouched; runtime uses optimized.gltf.
const fs=require('node:fs/promises');
const path=require('node:path');
const sharp=require('sharp');
(async()=>{
  const root=path.join(__dirname,'../public/models/city');
  const model=JSON.parse(await fs.readFile(path.join(root,'scene.gltf'),'utf8'));
  await fs.mkdir(path.join(root,'optimized'),{recursive:true});
  for(let i=0;i<model.images.length;i++){
    const image=model.images[i],input=path.join(root,image.uri);
    const color=/baseColor|emissive/.test(image.uri);
    const name=path.basename(image.uri).replace(/\.png$/,'.webp');
    let pipeline=sharp(input).resize(color?1536:512,color?1536:512,{fit:'inside',withoutEnlargement:true});
    if(/_normal/.test(image.uri)){
      // Renormalize the filtered tangent-space vectors after downsampling.
      const {data,info}=await pipeline.raw().toBuffer({resolveWithObject:true});
      for(let j=0;j<data.length;j+=info.channels){
        const x=data[j]/127.5-1,y=data[j+1]/127.5-1,z=data[j+2]/127.5-1;
        const length=Math.hypot(x,y,z)||1;
        data[j]=Math.round((x/length+1)*127.5);data[j+1]=Math.round((y/length+1)*127.5);data[j+2]=Math.round((z/length+1)*127.5);
      }
      pipeline=sharp(data,{raw:info});
    }
    // Keep data-map channels exact after resizing; only color maps use lossy encoding.
    pipeline=color?pipeline.webp({quality:/emissive/.test(image.uri)?85:80,effort:6}):pipeline.webp({lossless:true,effort:6});
    await pipeline.toFile(path.join(root,'optimized',name));
    image.uri='optimized/'+name;
    for(const texture of model.textures){if(texture.source===i){texture.extensions={...texture.extensions,EXT_texture_webp:{source:i}};delete texture.source;}}
  }
  model.extensionsUsed=[...new Set([...(model.extensionsUsed||[]),'EXT_texture_webp'])];
  model.extensionsRequired=[...new Set([...(model.extensionsRequired||[]),'EXT_texture_webp'])];
  await fs.writeFile(path.join(root,'optimized.gltf'),JSON.stringify(model));
  for(const file of ['scene.gltf','optimized.gltf']){
    const g=JSON.parse(await fs.readFile(path.join(root,file),'utf8'));
    const files=new Set([file,...g.images.map(i=>i.uri),...g.buffers.map(b=>b.uri)]);
    let bytes=0;for(const f of files)bytes+=(await fs.stat(path.join(root,f))).size;
    console.log(file,bytes,'bytes');
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
