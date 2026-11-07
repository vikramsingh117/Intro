import { useMemo, useSyncExternalStore } from 'react';
import styles from '../../styles/Workbench.module.css';

export function useRoomHoverStore() {
  return useMemo(() => {
    let label = '';
    const listeners = new Set();
    return {
      getSnapshot: () => label,
      getServerSnapshot: () => '',
      subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
      setLabel: next => {
        if (label === next) return;
        label = next;
        listeners.forEach(listener => listener());
      },
    };
  }, []);
}

export default function RoomHoverLabel({ store, outside, cityReady, entered }) {
  const label = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return <span>{outside ? (cityReady ? 'CITY AFTER DARK · Drag to look around' : 'Loading the city…') : entered ? 'Entering workspace…' : <>{label || 'Drag to look around'}<span className={styles.roomKeyboardHint}>{label ? ' · Enter to activate' : ' · Arrow keys select · Enter activates'}</span></>}</span>;
}
