import { useEffect, useState } from 'react';
import GlowCursor from './GlowCursor';
import './GlowCursor.css';
import LightPointer from './LightPointer';

export default function CursorTrail() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const pointer = matchMedia('(any-pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(pointer.matches && !reduced.matches);
    update();
    pointer.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => { pointer.removeEventListener('change', update); reduced.removeEventListener('change', update); };
  }, []);
  return <><LightPointer/>{enabled && <GlowCursor/>}</>;
}
