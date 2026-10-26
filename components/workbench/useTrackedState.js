import { useEffect, useRef } from 'react';
import { trackInteraction } from '../../lib/visitor-analytics';
export default function useTrackedState(values){
  const previous=useRef(null);
  useEffect(()=>{
    if(previous.current)for(const [name,value]of Object.entries(values)){
      if(previous.current[name]!==value)trackInteraction('room_state',`${name}:${value}`);
    }
    previous.current=values;
  });
}
