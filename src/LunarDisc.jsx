import { useEffect, useId, useState } from 'react';
import { makeLunarSurface } from './lunarSurface';

export default function LunarDisc({ x, y, size, phase = 'quarter' }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g,'');
  const [surface, setSurface] = useState(null);
  useEffect(() => {
    let mounted = true;
    makeLunarSurface(phase).then(image => { if (mounted) setSurface(image); }).catch(() => {});
    return () => { mounted = false; };
  }, [phase]);
  return <svg x={x} y={y} width={size} height={size} viewBox="0 0 400 400" className="lunar-disc lunar-disc-natural" overflow="visible" aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-veil`}><stop offset="0" stopColor="#c8d8ee" stopOpacity=".018"/><stop offset=".48" stopColor="#a7c1e5" stopOpacity=".026"/><stop offset="1" stopColor="#acc8f0" stopOpacity="0"/></radialGradient>
      <filter id={`${id}-soft`} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation=".28"/></filter>
    </defs>
    <circle cx="200" cy="200" r="236" fill={`url(#${id}-veil)`}/>
    {surface && <image className="lunar-surface" href={surface} x="42" y="42" width="316" height="316" filter={`url(#${id}-soft)`}/>}
  </svg>;
}
