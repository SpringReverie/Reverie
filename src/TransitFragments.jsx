import { useId } from 'react';

// Fixed seeds make reverse scrolling retrace the same passage without flicker.
const shards = [
  '42,48 158,25 204,119 95,149', '70,18 194,82 129,160 35,104',
  '32,82 145,31 198,64 171,145 64,137', '94,17 199,61 147,157 53,117',
  '39,42 173,54 205,135 93,157', '62,24 201,90 152,146 42,125',
  '28,66 126,22 193,104 112,158', '88,22 205,102 164,156 41,88',
];
const opening = [[-1.08,-.55,-18],[.98,-.68,12],[-.92,.64,7],[1.12,.5,-9],[-.14,-.92,-4],[.29,.84,14],[1.28,-.06,21],[-1.3,.04,-13]];
const passage = [
  { kind:'comet', vector:[-1.15,-.68,-12], delay:-.18, life:.66, size:.9 },
  { kind:'veil', vector:[1.14,.58,19], delay:-.12, life:.68, size:1.26 },
  { kind:'constellation', vector:[.96,-.75,8], delay:.02, life:.56, size:.88 },
  { kind:'nebula', vector:[-1.21,.56,-17], delay:.13, life:.68, size:1.32 },
  { kind:'dust', vector:[-.22,-.99,16], delay:.24, life:.59, size:.92 },
  { kind:'comet', vector:[1.34,-.07,-22], delay:.37, life:.57, size:1.14 },
  { kind:'veil', vector:[-1.33,.04,27], delay:.42, life:.57, size:1.16 },
  { kind:'constellation', vector:[.72,.86,-8], delay:.51, life:.48, size:1.04 },
  { kind:'dust', vector:[-.43,.92,9], delay:.57, life:.42, size:.86 },
];

function FragmentArt({ kind, seed, id }) {
  const light=`url(#${id}-light)`, glow=`url(#${id}-glow)`;
  const shift=seed%3*9;
  return <svg viewBox="0 0 240 180" fill="none">
    <defs>
      <linearGradient id={`${id}-light`} x1="26" y1="28" x2="214" y2="151" gradientUnits="userSpaceOnUse"><stop stopColor={kind==='prism'?'#f1e9dd':'#d8e9f3'} stopOpacity=".76"/><stop offset=".48" stopColor={seed%2?'#c0b6dd':'#a1c8da'} stopOpacity=".26"/><stop offset="1" stopColor="#9cbfd3" stopOpacity="0"/></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor="#d8e6f4" stopOpacity=".36"/><stop offset=".35" stopColor={seed%2?'#b9b0d8':'#91c5d4'} stopOpacity=".17"/><stop offset="1" stopColor="#91c5d4" stopOpacity="0"/></radialGradient>
    </defs>
    {kind==='prism' && <>
      <polygon points={shards[seed]} fill={light} opacity=".45" stroke={light} strokeWidth=".7"/>
      <path d={`M ${42+shift} 51 L ${160-shift} 99 L ${95+shift} 148`} stroke={light} strokeWidth=".55"/>
      <path d={`M ${62+shift} 66 L ${167-shift} 53`} stroke="#eee6da" strokeWidth=".6" opacity=".28"/>
      <circle cx={58+shift} cy="61" r="2.2" fill={glow}/>
      {Array.from({length:8},(_,i)=><circle key={i} cx={35+(i*37+seed*13)%165} cy={24+(i*23+seed*7)%125} r={i%3===0?1.2:.6} fill="#e6e5ea" opacity=".18"/>)}
    </>}
    {kind==='comet' && <g transform={`translate(0 ${shift-9})`}>
      <ellipse cx="176" cy="71" rx="25" ry="22" fill={glow}/>
      <path d={`M 24 ${127-shift} Q 106 127 178 71 M 53 ${143-shift} Q 120 120 178 71 M 46 106 Q 126 115 178 71`} stroke={light} strokeWidth=".8"/>
      <circle cx="178" cy="71" r="1.7" fill="#e9eff6" opacity=".85"/>
      {[0,1,2,3,4].map(i=><circle key={i} cx={137-i*22} cy={96+i*6} r={1-i*.14} fill="#c6dce9" opacity={.3-i*.045}/>)}
    </g>}
    {kind==='veil' && <>
      <path d={`M 20 ${103-shift} C 69 6 139 166 222 ${39+shift} C 151 148 89 30 20 ${103-shift}Z`} fill={light} opacity=".42"/>
      {[0,1,2,3].map(i=><path key={i} d={`M ${24+i*7} ${109-shift+i*4} C 70 ${24+i*8} 141 ${156-i*10} 221 ${42+shift+i*5}`} stroke={light} strokeWidth=".55" opacity={.62-i*.1}/>)}
    </>}
    {kind==='constellation' && <>
      <path d={seed%2?'M38 124L83 42L139 77L180 32 M139 77L197 136':'M29 69L96 29L128 108L206 75 M128 108L91 148'} stroke={light} strokeWidth=".65"/>
      {(seed%2?[[38,124],[83,42],[139,77],[180,32],[197,136]]:[[29,69],[96,29],[128,108],[206,75],[91,148]]).map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r={i===1?14:8} fill={glow}/><circle cx={x} cy={y} r={i===1?1.8:1.1} fill="#e4e9f6" opacity=".7"/></g>)}
    </>}
    {kind==='nebula' && <>
      <ellipse cx="106" cy="92" rx="100" ry="48" transform="rotate(-32 106 92)" fill={glow}/>
      <ellipse cx="149" cy="84" rx="65" ry="47" transform="rotate(24 149 84)" fill={glow} opacity=".65"/>
      {[0,1,2].map(i=><path key={i} d={`M 34 ${130-i*13} C 70 147 103 ${20+i*22} 201 ${56+i*11}`} stroke={light} strokeWidth=".45" opacity=".45"/>)}
    </>}
    {kind==='dust' && <>
      <ellipse cx="120" cy="90" rx="83" ry="65" fill={glow} opacity=".35"/>
      {Array.from({length:23},(_,i)=><circle key={i} cx={27+(i*41+seed*19)%183} cy={22+(i*29+seed*17)%132} r={i%7===0?1.5:.45+(i%3)*.18} fill="#dfebf3" opacity={.18+(i%5)*.11}/>)}
      <path d={`M ${73+shift} 62v8m-4-4h8`} stroke="#e5eaf3" strokeWidth=".65" opacity=".5"/>
    </>}
  </svg>;
}

export default function TransitFragments({ mode }) {
  const prefix=useId().replace(/:/g,'');
  const items=mode==='burst' ? opening.map((vector,index)=>({kind:'prism',vector,size:.8+index%3*.11})) : passage;
  return <div className={`flying-frames flying-${mode}`} aria-hidden="true">{items.map((item,index)=><div key={index} className={`flying-frame light-fragment fragment-${item.kind}`} data-vector={item.vector.join(',')} data-delay={item.delay??0} data-life={item.life??1} data-size={item.size} data-art={`${item.kind}-${index}`}>
    <FragmentArt kind={item.kind} seed={index} id={`${prefix}-${index}`}/>
  </div>)}</div>;
}
