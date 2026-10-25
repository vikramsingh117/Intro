// Usage: node --max-old-space-size=8192 scripts/optimize-upliance.mjs INPUT.obj TOOL_DIRECTORY
// TOOL_DIRECTORY contains temporary @gltf-transform/core, functions, extensions and meshoptimizer packages.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import {Box3,Vector3,Color} from 'three';
const [input,toolDirectory]=process.argv.slice(2);
const requireTool=createRequire(path.join(toolDirectory,'package.json'));
const load=async name=>import(pathToFileURL(requireTool.resolve(name)));
const {Document,NodeIO}=await load('@gltf-transform/core');
const {dedup,weld,join,simplify,prune,quantize}=await load('@gltf-transform/functions');
const {ALL_EXTENSIONS}=await load('@gltf-transform/extensions');
const {MeshoptSimplifier}=await load('meshoptimizer');
await MeshoptSimplifier.ready;
const colors=new Map();let name;
for(const line of (await fs.readFile(input.replace(/\.obj$/i,'.mtl'),'utf8')).split(/\r?\n/)){
  if(line.startsWith('newmtl '))name=line.slice(7).trim();
  if(line.startsWith('Kd '))colors.set(name,line.slice(3).trim().split(/\s+/).map(Number));
}
const object=new OBJLoader().parse(await fs.readFile(input,'utf8'));
console.log('Original bounds',new Box3().setFromObject(object).getSize(new Vector3()).toArray());
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Upliance');
const materials=new Map();let triangles=0;
object.traverse(node=>{
  if(!node.isMesh)return;
  const geom=node.geometry,position=geom.attributes.position,normal=geom.attributes.normal;
  const mats=Array.isArray(node.material)?node.material:[node.material];
  const groups=geom.groups.length?geom.groups:[{start:0,count:position.count,materialIndex:0}];
  const mesh=doc.createMesh(node.name);
  for(const group of groups){
    const materialName=mats[group.materialIndex]?.name||'Default';
    if(!materials.has(materialName)){
      const c=new Color().setRGB(...(colors.get(materialName)||[.65,.65,.65]),'srgb');
      const metal=/steel|alumin|brass/i.test(materialName);
      materials.set(materialName,doc.createMaterial(materialName).setBaseColorFactor([c.r,c.g,c.b,1]).setMetallicFactor(metal?.65:0).setRoughnessFactor(metal?.4:.65).setDoubleSided(true));
    }
    const start=group.start*3,end=(group.start+group.count)*3;
    const primitive=doc.createPrimitive().setMaterial(materials.get(materialName));
    primitive.setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(position.array.slice(start,end)).setBuffer(buffer));
    if(normal)primitive.setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(normal.array.slice(start,end)).setBuffer(buffer));
    mesh.addPrimitive(primitive);triangles+=group.count/3;
  }
  scene.addChild(doc.createNode(node.name).setMesh(mesh));
  geom.dispose();
});
console.log('Input triangles',triangles);
await doc.transform(dedup(),weld(),join(),simplify({simplifier:MeshoptSimplifier,ratio:.08,error:.003}),prune(),quantize({quantizePosition:14,quantizeNormal:10}));
let count=0,draws=0;
for(const mesh of doc.getRoot().listMeshes())for(const p of mesh.listPrimitives()){count+=(p.getIndices()?.getCount()||p.getAttribute('POSITION').getCount())/3;draws++;}
const out=path.resolve('public/models/upliance/model.glb');await fs.mkdir(path.dirname(out),{recursive:true});
await new NodeIO().registerExtensions(ALL_EXTENSIONS).write(out,doc);
console.log({triangles:count,draws,bytes:(await fs.stat(out)).size});
