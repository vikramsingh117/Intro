import { Component, Suspense, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const models = ['/models/monitor.glb', '/models/desk-lamp.glb', '/models/keyboard/optimized.gltf', '/models/chair/optimized.gltf', '/models/radio/optimized.gltf', '/models/city/optimized.gltf', '/models/plane/scene.gltf', '/models/plant/optimized.gltf', '/models/stool/optimized.gltf', '/models/pascal/optimized.gltf', '/models/upliance/model.glb', '/models/ceiling-light/optimized.gltf'];
export const ASSET_COUNT = models.length + 1;

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
    <Suspense fallback={null}><Asset url="/images/workbench-wallpaper.svg" texture onLoaded={onLoaded}/></Suspense>
  </LoadBoundary>;
}
