import { ArrowDown, ArrowUpRight } from 'lucide-react';
import ScrollChapter from './ScrollChapter';
import Observatory from './Observatory';
import TransitFragments from './TransitFragments';
import { sitePath } from './sitePath';

const paragraphs = [
  { eyebrow: 'BETWEEN REASON & REVERIE', title: <>在理性与浪漫之间，<br/>留一点空白给好奇。</> },
  { eyebrow: 'CODE / LIGHT / EXPRESSION', title: <>以代码构建，<br/>以镜头观察，<br/>以表达连接。</> },
  { eyebrow: 'SUN JIAWEI / A CURIOUS MIND', title: <>我是孙嘉伟。<br/>愿每一次探索，<br/>都靠近新的可能。</> },
];

export function MoonPrologue() {
  return <ScrollChapter id="prologue"><div className="narrative-scene moon-prologue" data-sequence-scene="prologue">
    <div className="scene-gate" aria-hidden="true"/>
    <div className="story-window" role="group" aria-label="月光中的三段序言">{paragraphs.map((paragraph,index) => <article className="story-panel" key={paragraph.eyebrow} aria-hidden={index !== 0}><p className="mono">{paragraph.eyebrow}</p><h2>{paragraph.title}</h2><span className="story-count mono">0{index+1} / 03</span></article>)}</div>
    <TransitFragments mode="burst"/>
    <div className="scene-bottom container"><span className="mono scene-scroll-note"><ArrowDown size={14}/>让滚动，翻开月光里的下一页</span><a href="#top">进入正文 <ArrowUpRight size={15}/></a></div>
    <div className="story-progress" aria-hidden="true"><i/><i/><i/></div>
  </div></ScrollChapter>;
}

export function StarFlight() {
  return <ScrollChapter id="starflight"><div className="narrative-scene starflight" data-sequence-scene="flight">
    <div className="flight-nebula" aria-hidden="true"/>
    <TransitFragments mode="depth"/>
    <div className="flight-stars" aria-hidden="true">{Array.from({length:42},(_,index) => <i key={index} className="depth-star" data-angle={index*2.399963}/>)}</div>
    <div className="flight-copy"><p className="mono">A PASSAGE THROUGH LIGHT</p><h2>光经过的地方，<br/><span>留下探索的回声。</span></h2><p>让一个瞬间，通向更多可能。</p></div>
    <div className="scene-bottom container"><span className="mono">MOON DUST / AN OPEN HORIZON</span><a href="#projects">随光，看看我的作品 <ArrowUpRight size={15}/></a></div>
  </div></ScrollChapter>;
}

export function ProjectObservatory() {
  return <ScrollChapter id="observatory"><div className="narrative-scene project-observatory" data-sequence-scene="observatory">
    <Observatory/>
    <div className="observatory-copy container"><p className="mono">EXPERIMENT 01 / A CLOSER LOOK</p><h2>把想象，<br/><span>放进一个小小的宇宙。</span></h2><p>从远处的轮廓，到眼前的细节。<br/>继续滚动，靠近这次探索。</p><a href={sitePath('game.html')} target="_blank" rel="noreferrer">体验「星际躲避」 <ArrowUpRight size={16}/></a></div>
    <div className="observatory-focus" aria-hidden="true"><span/><span/></div>
    <div className="scene-bottom container"><span className="mono">CODE / INTERACTION / IMAGINATION</span><a href="#photography">循光，进入镜头里的世界 <ArrowUpRight size={15}/></a></div>
  </div></ScrollChapter>;
}
