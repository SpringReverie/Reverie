import LunarDisc from './LunarDisc';

export default function LunarHorizon() {
  return <div className="lunar-horizon" aria-hidden="true"><svg viewBox="0 0 1700 1000" preserveAspectRatio="xMidYMid slice">
    <defs><radialGradient id="horizon-glow"><stop stopColor="#b9cdf4" stopOpacity=".13"/><stop offset=".5" stopColor="#919fda" stopOpacity=".06"/><stop offset="1" stopColor="#9cb8f0" stopOpacity="0"/></radialGradient><linearGradient id="water-light"><stop stopColor="#b3c9eb" stopOpacity="0"/><stop offset=".5" stopColor="#b3c9eb" stopOpacity=".22"/><stop offset="1" stopColor="#b3c9eb" stopOpacity="0"/></linearGradient></defs>
    <circle cx="1350" cy="310" r="310" fill="url(#horizon-glow)"/>
    <g className="horizon-moon"><LunarDisc x={1215} y={150} size={270} phase="crescent"/></g>
    <g fill="none" stroke="#b9cdee" strokeWidth=".6"><path d="M 1518 224 H 1555 M 1537 205 V 243" strokeOpacity=".15"/></g>
    <g stroke="#c4d5f0" strokeOpacity=".13" strokeWidth=".6"><path d="M 1070 176 L 1125 143 L 1162 182 L 1198 137" fill="none"/>{[[1070,176],[1125,143],[1162,182],[1198,137]].map(([x,y],i)=><circle key={x} cx={x} cy={y} r={i===1?2:1.3} fill="#c9daf4" stroke="none"/>)}</g>
    <path d="M -80 760 Q 850 460 1780 760" fill="none" stroke="#b6c6e3" strokeOpacity=".18"/>
    <path d="M -40 780 Q 850 510 1740 785" fill="none" stroke="#b6c6e3" strokeOpacity=".05"/>
    {Array.from({length:11},(_,i)=><path key={i} d={`M ${1304-i*13} ${632+i*16} Q 1350 ${626+i*16} ${1396+i*13} ${632+i*16}`} fill="none" stroke="url(#water-light)" strokeOpacity={.85-i*.06} strokeWidth={i<3?1.1:.65}/>)}
    {[[1100,170],[1510,125],[1210,385],[1620,420],[780,120],[1440,475]].map(([x,y])=><circle key={x} cx={x} cy={y} r="1.3" fill="#d7e3f4" opacity=".4"/>)}
  </svg><span className="mono">UNDER THE SAME SKY</span></div>;
}
