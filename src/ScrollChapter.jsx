import ChapterDrawing from './ChapterDrawing';
import { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const SceneHost = createContext(null);

// One sticky surface holds all scenes. Scroll spacers never move scene pixels.
export function ChapterScenes({ children }) {
  const [host, setHost] = useState(null);
  const [enabled, setEnabled] = useState(() => innerWidth >= 980 && !matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = matchMedia('(min-width: 980px) and (prefers-reduced-motion: no-preference)');
    const update = () => setEnabled(query.matches);
    query.addEventListener('change', update);
    update();
    return () => query.removeEventListener('change', update);
  }, []);
  return <main className="chapter-timeline"><div className="chapter-viewport" ref={setHost}/><SceneHost.Provider value={enabled ? host : null}>{children}</SceneHost.Provider></main>;
}

export const chapters = [
  { id: 'prologue', name: '月光序章', no: '序', english: 'THROUGH THE MOONLIGHT', transition: 'veil', span: .5, duration: 2.6 },
  { id: 'top', name: '循光而行', no: '00', english: 'A CURIOUS MIND', transition: 'moon', span: .95 },
  { id: 'about', name: '个人经历', no: '01', english: 'REASON & REVERIE', transition: 'moon', span: .85, center: [30, 45] },
  { id: 'starflight', name: '星光穿行', no: '间', english: 'LIGHT BECOMES A MEMORY', transition: 'moon', span: .9, duration: 1.8 },
  { id: 'projects', name: '精选项目', no: '02', english: 'IDEAS TAKE SHAPE', transition: 'mist', span: .72 },
  { id: 'observatory', name: '作品观察台', no: '观', english: 'A CLOSER LOOK', transition: 'rise', span: .85, duration: 2 },
  { id: 'photography', name: '摄影作品', no: '03', english: 'COLLECTING LIGHT', transition: 'moon', span: .95, center: [68, 48] },
  { id: 'certificates', name: '证书认证', no: '04', english: 'THE LEARNING CONTINUES', transition: 'side', span: .85 },
  { id: 'strengths', name: '个人优势', no: '05', english: 'MANY WAYS TO SEE', transition: 'side', span: .8 },
  { id: 'contact', name: '联系我', no: '06', english: 'UNDER THE SAME SKY', transition: 'rise', span: .85 },
];

export default function ScrollChapter({ id, children }) {
  const host = useContext(SceneHost);
  const index = chapters.findIndex(chapter => chapter.id === id);
  const chapter = chapters[index];
  const stage = <div className={`chapter-stage chapter-${id}`} data-stage={id} aria-label={chapter.name} style={{ '--chapter-index': index }}>
      <div className="chapter-atmosphere" aria-hidden="true"><div className="chapter-halo" /><div className="star-sky" /><ChapterDrawing scene={id}/></div>
      <div className="chapter-content">{children}</div>
      <div className="chapter-aperture-rim" aria-hidden="true"/>
      <div className="chapter-signature mono" aria-hidden="true"><span>{chapter.no} / {chapter.english}</span><span>SCROLL TO UNFOLD</span></div>
    </div>;
  return <section id={id} className={`scroll-chapter chapter-${id}`} data-chapter={id} data-transition={chapter.transition} aria-label={host ? undefined : chapter.name} style={{ '--chapter-index': index }}>
    {host ? createPortal(stage, host) : stage}
  </section>;
}

export function ChapterRail({ active, onNavigate }) {
  return <nav className="chapter-rail" aria-label="章节进度">{chapters.map(chapter => <button key={chapter.id} onClick={() => onNavigate(chapter.id)} aria-label={`进入${chapter.name}`} aria-current={active === chapter.id ? 'step' : undefined}><svg viewBox="0 0 24 24" aria-hidden="true"><circle className="chapter-dot-track" cx="12" cy="12" r="9" /><circle className="chapter-dot-progress" cx="12" cy="12" r="9" /><circle className="chapter-dot" cx="12" cy="12" r="2" /></svg><span>{chapter.name}</span></button>)}</nav>;
}
