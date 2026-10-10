import { useState } from 'react';
import LunarDisc from './LunarDisc';
import OrbitingItems3D from './OrbitingItems3D';

const nodes = [
  { name: '机械', en: 'MECHANICS', href: '#about', note: '从机械工程出发，探索智能化的可能。' },
  { name: '智能', en: 'INTELLIGENCE', href: '#projects', note: '让学习中的概念，变成可以体验的应用。' },
  { name: '摄影', en: 'PHOTOGRAPHY', href: '#photography', note: '把目光停留的瞬间，收进流动的记忆。' },
  { name: '表达', en: 'EXPRESSION', href: '#strengths', note: '在文字与舞台上，让想法被听见。' },
];

export default function MoonlightStudy({ playing }) {
  const [active, setActive] = useState(null);
  return <div className={`moonlight-study ${playing ? '' : 'is-paused'}`}>
    <svg className="moonlight-orbits" viewBox="0 0 640 640" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="poetic-orbit" x1="80" y1="100" x2="560" y2="580" gradientUnits="userSpaceOnUse"><stop stopColor="#d0dcf8" stopOpacity=".55" /><stop offset=".55" stopColor="#b9c4ed" stopOpacity=".1" /><stop offset="1" stopColor="#abbcf1" stopOpacity=".4" /></linearGradient>
        <radialGradient id="poetic-halo"><stop stopColor="#a4b9ec" stopOpacity=".14" /><stop offset="1" stopColor="#9fa9ed" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="320" cy="320" r="300" fill="url(#poetic-halo)" />
      <g stroke="url(#poetic-orbit)" strokeWidth=".65"><ellipse cx="320" cy="320" rx="249.6" ry="179.2" transform="rotate(-18 320 320)"/><ellipse cx="320" cy="320" rx="268.8" ry="128" transform="rotate(-28 320 320)"/><ellipse cx="320" cy="320" rx="243.2" ry="102.4" transform="rotate(47 320 320)"/></g>
      <g className="lunar-observation" stroke="#b9cfee" strokeOpacity=".3" strokeWidth=".7">{Array.from({length:12},(_,i)=><path key={i} d="M 320 133 V 138" transform={`rotate(${i*30} 320 320)`}/>)}<path d="M 466 320 H 499 M 320 466 V 492"/><circle cx="503" cy="320" r="2" fill="#dae7fb" stroke="none"/></g>
      <g fill="#c1d4ed" opacity=".4"><circle cx="461" cy="133" r="1.1"/><circle cx="473" cy="154" r="1.8"/><circle cx="493" cy="142" r="1"/><path d="M 461 133 L 473 154 L 493 142" fill="none" stroke="#c1d4ed" strokeWidth=".5"/></g>
      <path d="M 502 186 V 206 M 492 196 H 512" stroke="#d9e4f7" strokeWidth=".8" opacity=".7" /><circle cx="127" cy="439" r="1.8" fill="#bbc9e5" />
    </svg>
    <svg className="moonlight-moon-layer" viewBox="0 0 640 640" aria-hidden="true"><LunarDisc x={174} y={174} size={292}/></svg>
    <OrbitingItems3D items={nodes} playing={playing} onActive={setActive}/>
    <div className="moonlight-note"><span className="mono">{active?.en ?? 'BETWEEN REASON & REVERIE'}</span><p>{active?.note ?? '一半理性，一半月光。'}</p></div>
  </div>;
}
