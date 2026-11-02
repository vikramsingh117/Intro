import { Component, Suspense, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const models = ['/models/monitor.glb', '/models/desk-lamp.glb', '/models/keyboard/optimized.gltf', '/models/chair/optimized.gltf', '/models/radio/optimized.gltf', '/models/city/optimized.gltf', '/models/plane/scene.gltf', '/models/plant/optimized.gltf', '/models/stool/optimized.gltf', '/models/pascal/optimized.gltf', '/models/upliance/interactive.glb', '/models/ceiling-light/optimized.gltf'];
const textures = ['/images/upliance-display.svg', '/images/workbench-wallpaper.svg', '/images/upliance-airfryer.jpg', '/images/upliance-airfryer-mobile.jpg', '/images/upliance-appui.jpg'];
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
export default function PreloadAssets({ onLoaded, onError }) {
  return <LoadBoundary onError={onError}>
    {models.map(url => <Suspense key={url} fallback={null}><Asset url={url} onLoaded={onLoaded}/></Suspense>)}
    {textures.map(url=><Suspense key={url} fallback={null}><Asset url={url} texture onLoaded={onLoaded}/></Suspense>)}
  </LoadBoundary>;
}
