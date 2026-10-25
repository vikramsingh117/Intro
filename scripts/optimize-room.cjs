// Run with Sharp available: node scripts/optimize-room.cjs
// Preserve original assets and material settings; generate separate runtime manifests.
const fs=require('node:fs/promises');
const path=require('node:path');
const sharp=require('sharp');
const assets=process.argv.length>2?process.argv.slice(2):['plant','ceiling-light','chair','radio','keyboard','pascal','stool'];
async function bytes(root,manifest){
  const g=JSON.parse(await fs.readFile(path.join(root,manifest),'utf8'));
  const files=new Set([manifest,...g.images.map(i=>i.uri),...g.buffers.map(b=>b.uri)]);
  let total=0;for(const file of files)total+=(await fs.stat(path.join(root,file))).size;
  return total;
}
(async()=>{
  let before=0,after=0;
  for(const asset of assets){
    const root=path.join(__dirname,'../public/models',asset);
    const source=asset==='chair'?'runtime.gltf':'scene.gltf';
    const g=JSON.parse(await fs.readFile(path.join(root,source),'utf8'));
    await fs.mkdir(path.join(root,'optimized'),{recursive:true});
    for(let i=0;i<g.images.length;i++){
      const image=g.images[i];
      const color=/baseColor|diffuse/.test(image.uri),normal=/_normal/.test(image.uri);
      const size=color?1024:512;
      let pipeline=sharp(path.join(root,image.uri)).resize(size,size,{fit:'inside',withoutEnlargement:true});
      if(normal){
        const {data,info}=await pipeline.raw().toBuffer({resolveWithObject:true});
        for(let j=0;j<data.length;j+=info.channels){
          const x=data[j]/127.5-1,y=data[j+1]/127.5-1,z=data[j+2]/127.5-1,length=Math.hypot(x,y,z)||1;
          data[j]=Math.round((x/length+1)*127.5);data[j+1]=Math.round((y/length+1)*127.5);data[j+2]=Math.round((z/length+1)*127.5);
        }
        pipeline=sharp(data,{raw:info});
      }
      const name=path.parse(image.uri).name+'.webp';
      await pipeline.webp(color?{quality:85,alphaQuality:100,effort:6}:{lossless:true,effort:6}).toFile(path.join(root,'optimized',name));
      image.uri='optimized/'+name;
      if(image.mimeType)image.mimeType='image/webp';
      for(const texture of g.textures)if(texture.source===i){
        texture.extensions={...texture.extensions,EXT_texture_webp:{source:i}};delete texture.source;
      }
    }
    g.extensionsUsed=[...new Set([...(g.extensionsUsed||[]),'EXT_texture_webp'])];
    g.extensionsRequired=[...new Set([...(g.extensionsRequired||[]),'EXT_texture_webp'])];
    await fs.writeFile(path.join(root,'optimized.gltf'),JSON.stringify(g));
    const old=await bytes(root,source),optimized=await bytes(root,'optimized.gltf');before+=old;after+=optimized;
    console.log(`${asset}: ${old} → ${optimized} bytes (${Math.round((1-optimized/old)*100)}% smaller)`);
  }
  console.log(`Total: ${before} → ${after} bytes`);
})().catch(error=>{console.error(error);process.exitCode=1;});
