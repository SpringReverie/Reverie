export default function ChapterDrawing({ scene }) {
  if (scene === 'top' || scene === 'contact') return null;
  return <svg className={`chapter-drawing drawing-${scene}`} viewBox="0 0 1700 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth=".8">
    {scene === 'about' && <><path d="M 170 830 L 340 580 L 660 690 L 1080 370 L 1410 490 L 1600 120"/>{[[170,830],[340,580],[660,690],[1080,370],[1410,490],[1600,120]].map(([x,y]) => <g key={x}><circle cx={x} cy={y} r="4" fill="currentColor"/><circle cx={x} cy={y} r="13"/></g>)}</>}
    {scene === 'projects' && <><path d="M 1050 0 V 1000 M 1450 0 V 1000 M 900 250 H 1700 M 900 650 H 1700" strokeDasharray="2 15"/><circle cx="1330" cy="440" r="220"/><circle cx="1330" cy="440" r="260" strokeDasharray="5 14"/><path d="M 1020 440 H 1640 M 1330 130 V 750 M 1000 800 H 1600"/></>}
    {scene === 'photography' && Array.from({ length: 6 }, (_,i) => <path key={i} d={`M -50 ${480+i*54} C 300 ${160+i*40} 650 ${990-i*34} 1000 ${650-i*40} S 1400 ${120+i*48} 1800 ${310+i*38}`}/>)}
    {scene === 'certificates' && <><path d="M 50 880 H 1650 M 50 840 H 1250"/>{[120,390,740,1200,1600].map(x => <path key={x} d={`M ${x} 864 V 896`}/>)}</>}
    {scene === 'strengths' && <><path d="M 180 200 L 800 450 L 1520 170 M 800 450 L 1250 900 M 800 450 L 240 840"/>{[[180,200],[800,450],[1520,170],[1250,900],[240,840]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="22"/>)}</>}
  </svg>;
}
