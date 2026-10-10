import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowUp, Plus, Menu, X, Code2, Orbit, Mic2, Camera, Github, Phone, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { profile, strengths } from './data';
import MoonEntrance from './MoonEntrance';
import MediaShowcase from './MediaShowcase';
import TechText from './TechText';
import MoonlightStudy from './MoonlightStudy';
import Journey from './Journey';
import ProjectsShowcase from './ProjectsShowcase';
import LunarHorizon from './LunarHorizon';
import CursorTrail from './CursorTrail';
import ContactLoop from './ContactLoop';
import TiltedCard from './TiltedCard';
import { MoonPrologue, StarFlight, ProjectObservatory } from './NarrativeScenes';
import { evidence } from './journal-data';
import ScrollChapter, { ChapterRail, ChapterScenes } from './ScrollChapter';
import useChapterMotion from './useChapterMotion';
import { photographs, certificates } from './media';
import { sitePath } from './sitePath';

const asset = (name) => sitePath(`assets/${name}`);
const navItems = [['about', '个人经历'], ['projects', '精选项目'], ['photography', '摄影作品'], ['certificates', '证书认证'], ['strengths', '个人优势']];
const icons = { code: Code2, orbit: Orbit, mic: Mic2, camera: Camera };

function SectionLabel({ number, children }) {
  return <div className="section-label"><span className="index">{number}</span><span>{children}</span></div>;
}

function Gallery({ gallery, onClose }) {
  const dialog = useRef(null);
  const type = typeof gallery === 'string' ? gallery : gallery.type;
  const [index, setIndex] = useState(typeof gallery === 'string' ? 0 : gallery.index);
  const files = type === 'photos' ? photographs : certificates;
  const move = (step) => setIndex((current) => (current + step + files.length) % files.length);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previous;
      if (trigger?.isConnected && !trigger.closest('[inert]')) trigger.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={dialog} className="gallery-dialog" onCancel={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={(e) => { if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); }} aria-labelledby="gallery-title">
    <div className="gallery-shell">
      <div className="gallery-top"><h2 id="gallery-title">{type === 'photos' ? '光影之间 · 摄影作品' : '持续学习 · 证书认证'}</h2><button className="icon-button" onClick={onClose} aria-label="关闭预览"><X /></button></div>
      <div className="gallery-image"><img src={files[index].src} alt={`${type === 'photos' ? '摄影作品' : '证书'} ${files[index].id}：${files[index].title}`} /></div>
      <div className="gallery-bottom"><span>{String(index + 1).padStart(2, '0')} / {String(files.length).padStart(2, '0')}</span><span className="gallery-caption">{files[index].title}</span><div><button className="icon-button" onClick={() => move(-1)} aria-label="上一张"><ChevronLeft /></button><button className="icon-button" onClick={() => move(1)} aria-label="下一张"><ChevronRight /></button></div></div>
    </div>
  </dialog>;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('top');
  const [gallery, setGallery] = useState(null);
  const [playing, setPlaying] = useState(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const video = useRef(null);
  const content = useRef(null);
  const { navigate } = useChapterMotion(content, setActive);


  useEffect(() => {
    if (!video.current) return;
    const element = video.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= .75 && playing) element.play().catch(() => setPlaying(false));
      else element.pause();
    }, { threshold: [0, .75] });
    observer.observe(element);
    return () => { observer.disconnect(); element.pause(); };
  }, [playing]);

  return <>
    <CursorTrail/>
    <a className="skip-link" href="#about">跳转到主要内容</a>
    <MoonEntrance contentRef={content} />
    <div className="site-content journal" ref={content}>
    <header className="site-header">
      <div className="header-inner container">
        <a className="brand" href="#top" aria-label="孙嘉伟，回到首页"><span className="brand-mark">REVERIE<span className="brand-dot">.</span></span><span className="brand-note">孙嘉伟 · 个人作品集<br />PORTFOLIO / 2026</span></a>
        <nav className={menuOpen ? 'navigation open' : 'navigation'} aria-label="主导航">
          {navItems.map(([id, title], index) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{title}</a>)}
          <a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>聊聊想法 <ArrowUpRight size={17} /></a>
        </nav>
        <button className="menu-button icon-button" aria-label={menuOpen ? '关闭菜单' : '打开菜单'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
    </header>

    <ChapterScenes>
      <MoonPrologue/>
      <ScrollChapter id="top"><section className={`hero ${playing ? '' : 'motion-paused'}`} aria-labelledby="hero-title">
        <video ref={video} className="hero-video" muted loop playsInline preload="metadata" poster={asset('moonlit-poster.jpg')} aria-hidden="true"><source src={asset('moonlit-drift.mp4')} type="video/mp4" /></video>
        <div className="hero-shade" />
        <div className="hero-body container">
          <div className="hero-eyebrow mono"><span className="status-dot" /> 以好奇为引力 <span className="eyebrow-line" /> SHANGHAI / EARTH</div>
          <div className="hero-content"><p className="hero-intro">你好，我是孙嘉伟。</p><h1 id="hero-title" aria-label="心怀旷野，循光而行。"><TechText text="心怀旷野，" align="left" fontFamily="'Noto Serif SC', 'STSong', 'SimSun', serif" fontWeight={400} fontSize={156} letterSpacing={.035} color="#f1f0e9" accentColor="#c3d3f3" strokeWidth={.7} reach={130} softness={.85} labels={false} specks={4} sweep={playing} speed={.55} className="hero-tech-line" /><TechText text="循光而行。" align="left" fontFamily="'Noto Serif SC', 'STSong', 'SimSun', serif" fontWeight={400} fontSize={156} letterSpacing={.035} color="#cbd9f3" accentColor="#e3deef" strokeWidth={.7} reach={130} softness={.85} labels={false} specks={4} sweep={playing} speed={.45} className="hero-tech-line" /></h1><p className="hero-description">沿着好奇心的轨道，<br />在理性与浪漫之间，收集一点新的可能。</p><a className="button button-light" href="#projects">看看我正在创造什么 <ArrowUpRight size={18} strokeWidth={1.25} /></a><p className="hero-whisper mono">A CURIOUS MIND, UNDER THE SAME SKY.</p></div>
          <MoonlightStudy playing={playing} />
          <div className="hero-bottom"><a className="scroll-link mono" href="#about"><ArrowDown size={17} strokeWidth={1.2} /> 向下，认识我 <span>SCROLL TO WANDER</span></a><p>MECHANICS × INTELLIGENCE × IMAGINATION<br /><span>让理性有温度，让想象有形状。</span></p><button className="video-control mono" onClick={() => setPlaying(!playing)} aria-label={playing ? '暂停背景视频' : '播放背景视频'}>{playing ? <Pause size={13} /> : <Play size={13} />} {playing ? 'PAUSE' : 'PLAY'}</button></div>
        </div>
      </section>

      <div className="discipline-strip"><div className="container"><span>机械工程</span><Plus /><span>人工智能</span><Plus /><span>创意表达</span><span className="strip-note mono">ONE MIND. MANY POSSIBILITIES.</span></div></div>

      </ScrollChapter>

      <ScrollChapter id="about"><section className="section about-section container">
        <SectionLabel number="01">个人经历 / ABOUT ME</SectionLabel>
        <div className="about-grid">
          <div className="profile-card"><div className="profile-visual"><div className="profile-grid" /><span className="profile-coordinate mono">31.23° N / 121.47° E</span><div className="avatar-frame"><img src={asset('微信头像.jpg')} alt="孙嘉伟的个人头像" /></div><span className="profile-visual-label mono">A CURIOUS MIND<br />IN THE MAKING.</span><Plus className="profile-plus" size={32} /></div><div className="profile-card-bottom"><div><h3>{profile.name}</h3><span className="mono">{profile.englishName}</span></div><span className="location"><span className="status-dot" /> {profile.city}，中国</span></div></div>
          <div className="about-content"><h2>理性构建。<br /><span className="muted-heading">感性探索。</span></h2><p className="about-lead">机械智能化方向的学习者，<br />也是代码、光影和文字的实践者。</p><p className="body-copy">我就读于{profile.school}{profile.major}，关注机械工程与人工智能的交叉方向。从自学 Python 到取得达摩院 AI 训练师认证，我习惯通过动手实践理解新技术。课堂之外，我也用摄影记录生活，在舞台上主持、演讲，在文字里整理思考。</p><div className="about-links"><a href={`tel:${profile.phone}`}><Phone size={15} /> {profile.phone}</a><a href={profile.github} target="_blank" rel="noreferrer"><Github size={16} /> SpringReverie <ArrowUpRight size={14} /></a></div><div className="stats"><div><strong>03<span>项</span></strong><p>交互与 AI 项目</p></div><div><strong>10<span>+ 场</span></strong><p>校园活动参与及主持</p></div><div><strong>03<span>年</span></strong><p>校级优秀学生</p></div></div></div>
        </div>
        <Journey onCertificate={() => setGallery({ type: 'certificates', index: 0 })} />
      </section>

      </ScrollChapter>

      <StarFlight/>
      <ProjectsShowcase />
      <ProjectObservatory/>

      <MediaShowcase galleryOpen={Boolean(gallery)} onOpen={(type, index) => setGallery({ type, index })} />

      <ScrollChapter id="strengths"><section className="strengths-wrap"><div className="section container">
        <SectionLabel number="05">个人优势 / WHAT I BRING</SectionLabel>
        <div className="section-heading"><h2>不止一种<br /><span className="muted-heading">思考方式。</span></h2><div className="section-heading-aside"><p>技术提供方法，创意打开视野。<br />在不同领域之间，找到新的连接。</p></div></div>
        <div className="strengths-grid">{strengths.map((strength) => { const Icon = icons[strength.icon]; const proof = evidence[strength.no]; return <TiltedCard key={strength.no}><div className="strength-top"><Icon size={32} strokeWidth={1.25} /><span className="mono">/ {strength.no}</span></div><span className="strength-en mono">{strength.en}</span><h3>{strength.title}</h3><p>{strength.text}</p><div className="strength-tags">{strength.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>{proof && (proof.certificate ? <button className="strength-evidence" onClick={() => setGallery({ type: 'certificates', index: 0 })}>{proof.label}<ArrowUpRight size={15}/></button> : <a className="strength-evidence" href={proof.href}>{proof.label}<ArrowUpRight size={15}/></a>)}</TiltedCard>; })}</div>
        <div className="strengths-note"><span className="status-dot" /><p>保持学习，也保持对世界的感受力。</p><span className="mono">ALWAYS A WORK IN PROGRESS.</span></div>
      </div></section>

      </ScrollChapter>

      <ScrollChapter id="contact"><section className="contact-section"><LunarHorizon/><div className="container contact-inner">
        <SectionLabel number="06">联系我 / SAY HELLO</SectionLabel>
        <div className="contact-main"><div className="contact-eyebrow mono"><span className="status-dot" /> OPEN TO CONVERSATIONS & COLLABORATIONS</div><h2>下一个有趣的想法，<br />从一句<span>你好</span>开始<span className="contact-period">。</span></h2><div className="contact-action-row"><p>关于机械 × AI、项目合作，或一次灵感交流，<br />我都很期待听到你的想法。</p><a className="contact-orb" href={`mailto:${profile.email}`} aria-label="发送邮件，聊聊想法"><ArrowUpRight size={50} strokeWidth={1.1} /></a></div>
          <ContactLoop />
        </div><footer className="footer"><a className="footer-brand" href="#top">SUN JIAWEI<span>© 2026</span></a><span className="mono">BUILT WITH CURIOSITY. IN SHANGHAI.</span><a href="#top">回到顶部 <ArrowUp size={16} /></a></footer>
      </div></section>
      </ScrollChapter>
    </ChapterScenes>
    </div>
    <ChapterRail active={active} onNavigate={navigate} />
    {gallery && <Gallery gallery={gallery} onClose={() => setGallery(null)} />}
  </>;
}
