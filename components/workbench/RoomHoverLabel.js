// Displays the current room-object hover label or the scene's general navigation status.
// ProductWorkbench supplies its external store, while WorkbenchScene updates the active label.
import { useMemo, useSyncExternalStore } from 'react';

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
  return <span>{outside ? (cityReady ? 'CITY AFTER DARK · Drag to look around' : 'Loading the city…') : entered ? 'Entering workspace…' : label || 'Drag to look around'}</span>;
}
