import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Router, { useRouter } from 'next/router';

const PreloadContext = createContext({ stage: 'simple', progress: 0, ready: false });
export const useAfterHoursPreload = () => useContext(PreloadContext);

export default function AfterHoursPreload({ children }) {
  const { pathname } = useRouter();
  const eligible = pathname === '/' || pathname === '/simple';
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState('simple');
  const [Preloader, setPreloader] = useState(null);
  const [total, setTotal] = useState(8);
  const [loaded, setLoaded] = useState(0);
  const [codeReady, setCodeReady] = useState(false);
  const completed = useRef(new Set());
  const onLoaded = useCallback(url => {
    completed.current.add(url);
    setLoaded(completed.current.size);
  }, []);
  const onError = useCallback(() => setStage('error'), []);
  useEffect(() => { if (eligible) setStarted(true); }, [eligible]);
  useEffect(() => {
    if (!started) return;
    let active = true;
    async function prepare() {
      try {
        await Promise.all([
          Router.prefetch('/simple', undefined, { priority: true }),
          import('../pages/simple'),
        ]);
        if (!active) return;
        setStage('loading');
        const module = await import('./workbench/PreloadAssets');
        if (!active) return;
        setTotal(module.ASSET_COUNT);
        setPreloader(() => module.default);
        await Promise.all([
          Router.prefetch('/after-hours', undefined, { priority: true }),
          import('./workbench/WorkbenchScene'),
        ]);
        if (active) setCodeReady(true);
      } catch { if (active) setStage('error'); }
    }
    prepare();
    return () => { active = false; };
  }, [started]);
  const ready = loaded === total && codeReady && stage !== 'error';
  // Reserve the last step for the scene code, so a full card means ready to enter.
  const progress = ready ? 100 : Math.min(99, loaded / total * 100);
  return <PreloadContext.Provider value={{ stage, progress, ready, onError }}>
    {children}
    {Preloader && <Preloader onLoaded={onLoaded} onError={onError}/>}
  </PreloadContext.Provider>;
}
