import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, BookOpen, ChevronRight, FileText, FolderOpen, List, Search, X, ArrowUp } from 'lucide-react';
import NotesMarkdown from './NotesMarkdown';
import { sitePath } from './sitePath';

const noteCache = new Map();
const currentId = () => new URLSearchParams(window.location.search).get('note');
const date = value => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(new Date(value));
const label = value => value.replace(/^\d+[_\s-]*/, '').replace(/_/g, ' ');
const folderLabel = value => value.split('/').map(label).join(' / ');

function Directory({ notes, selected, onNavigate }) {
  const root = { children: new Map(), notes: [] };
  notes.forEach(note => {
    let node = root;
    for (const segment of note.folder.split('/').filter(Boolean)) {
      if (!node.children.has(segment)) node.children.set(segment, { children: new Map(), notes: [] });
      node = node.children.get(segment);
    }
    node.notes.push(note);
  });
  const branch = (node, key = '') => <>{[...node.children].map(([name, child]) => <details className="notes-folder" key={key + name} open><summary><ChevronRight size={13}/><FolderOpen size={15}/><span>{label(name)}</span></summary><div>{branch(child, key + name + '/')}</div></details>)}{node.notes.map(note => <a key={note.id} className={`notes-tree-link ${selected === note.id ? 'selected' : ''}`} aria-current={selected === note.id ? 'page' : undefined} href={`${sitePath('notes.html')}?note=${note.id}`} onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey) { event.preventDefault(); onNavigate(note.id); } }}><FileText size={14}/><span>{note.title}</span></a>)}</>;
  return <nav aria-label="笔记目录">{branch(root)}</nav>;
}

function NoteReader({ note, catalog, onNavigate }) {
  const [content, setContent] = useState(null), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  const [outline, setOutline] = useState([]);
  const [activeHeading, setActiveHeading] = useState('');
  const article = useRef(null);
  const meter = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    setContent(null); setError(''); setOutline([]);
    const load = async () => {
      let payload = noteCache.get(note.file);
      if (!payload) {
        const response = await fetch(sitePath(`notes/${note.file}`), { signal: controller.signal });
        if (!response.ok) throw new Error('笔记暂时没有加载成功。');
        payload = await response.json();
        noteCache.set(note.file, payload);
      }
      if (!controller.signal.aborted) setContent(payload.body);
    };
    load().catch(error => { if (error.name !== 'AbortError') setError('笔记加载失败，请检查网络后重试。'); });
    return () => controller.abort();
  }, [note.file, retry]);
  useEffect(() => {
    if (content === null) return;
    const elements = [...article.current.querySelectorAll('h2[id], h3[id]')];
    setOutline(elements.map(item => ({ id: item.id, title: item.textContent, level: item.tagName })));
    let frame = 0, offsets = [], start = 0, end = 1;
    const draw = () => {
      frame = 0;
      const position = window.scrollY;
      const progress = Math.max(0, Math.min(1, (position - start) / Math.max(1, end - start)));
      if (meter.current) meter.current.style.transform = `scaleX(${progress})`;
      let active = offsets[0]?.id || '';
      for (const item of offsets) { if (item.top > position + 135) break; active = item.id; }
      setActiveHeading(current => current === active ? current : active);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const measure = () => {
      offsets = elements.map(element => ({ id: element.id, top: element.getBoundingClientRect().top + window.scrollY }));
      const bounds = article.current.getBoundingClientRect();
      start = Math.max(0, bounds.top + window.scrollY - 100);
      end = bounds.bottom + window.scrollY - window.innerHeight;
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(article.current);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    let hash;
    try { hash = decodeURIComponent(window.location.hash.slice(1)); } catch { hash = ''; }
    const hashFrame = hash ? requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView()) : 0;
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(hashFrame); observer.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure); };
  }, [content]);
  const toc = <nav aria-label="本篇目录">{outline.map(item => <a key={item.id} className={item.level === 'H3' ? 'subheading' : ''} aria-current={activeHeading === item.id ? 'location' : undefined} href={`#${encodeURIComponent(item.id)}`}>{item.title}</a>)}</nav>;
  return <div className="notes-reading-layout"><article className="notes-paper" ref={article}>
    <div className="notes-reading-meter" aria-hidden="true"><span ref={meter}/></div>
    <div className="notes-breadcrumb"><BookOpen size={13}/>{folderLabel(note.folder)}</div>
    <header className="notes-article-heading"><p className="notes-kicker">REVERIE / STUDY JOURNAL</p><h1>{note.title}</h1><div><span>孙嘉伟的学习手记</span><span>更新于 {date(note.updated)}</span><span>约 {note.minutes} 分钟阅读</span></div>{note.tags.length > 0 && <p className="notes-tags">{note.tags.map(tag => <span key={tag}>#{tag}</span>)}</p>}</header>
    {outline.length > 0 && <details className="notes-mobile-toc"><summary><List size={15}/> 本篇目录</summary>{toc}</details>}
    {error ? <div className="notes-message" role="alert">{error}<button onClick={() => setRetry(value => value + 1)}>重新加载</button></div> : content === null ? <p className="notes-message" role="status">正在展开这一页……</p> : <div className="notes-prose"><NotesMarkdown body={content} note={note} catalog={catalog} onNavigate={onNavigate}/></div>}
    <footer className="notes-page-end"><span>思考未完，留待下一次重访。</span><a href="#" aria-label="回到笔记顶部"><ArrowUp size={14}/>回到顶部</a></footer>
  </article><aside className="notes-outline"><p><List size={13}/>这一页的轨迹</p>{toc}<a className="notes-back-index" href={sitePath('notes.html')} onClick={event => { event.preventDefault(); onNavigate(null); }}>← 回到全部笔记</a></aside></div>;
}

function Library({ catalog, query, onNavigate, onSearch }) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = text => terms.every(term => text.toLocaleLowerCase().includes(term));
  const notes = catalog.notes.filter(note => matches(`${note.title} ${note.folder} ${label(note.folder.split('/').at(-1) || '随手记')} ${note.aliases?.join(' ') || ''} ${note.tags.join(' ')} ${note.searchText}`)).sort((a,b) => b.updated.localeCompare(a.updated));
  const attachments = catalog.attachments.filter(file => matches(`${file.title} ${file.folder}`));
  const courses = [...new Set(catalog.notes.map(note => label(note.folder.split('/').at(-1) || '随手记')))];
  return <div className="notes-library"><header className={`notes-library-heading ${query ? 'has-query' : ''}`}><p className="notes-kicker">FIELD NOTES / REVERIE</p><h1>{query ? '沿着线索，寻找。' : <>把思考，<br/><em>留在星光里。</em></>}</h1><p>{query ? `“${query}” · 找到 ${notes.length} 篇笔记、${attachments.length} 个附件` : '从课堂出发，在实践里求证。\n把逐渐清晰的理解，整理成可以重访的轨迹。'}</p>{!query && <svg className="notes-library-drawing" viewBox="0 0 280 310" fill="none" aria-hidden="true"><ellipse cx="140" cy="152" rx="124" ry="64" transform="rotate(-35 140 152)"/><ellipse cx="140" cy="152" rx="92" ry="126" transform="rotate(25 140 152)"/><path d="M72 118q34-14 68 3q34-17 68-3v88q-34-14-68 3q-34-17-68-3zM140 121v88M88 142q18-5 35 1M88 156q18-5 35 1M157 142q18-5 35-1M157 156q18-5 35-1M157 170q18-5 35-1"/><path d="M48 70l26 18m147 140l20 22M171 31v12m-6-6h12"/><circle cx="48" cy="70" r="2.5"/><circle cx="74" cy="88" r="2.5"/><circle cx="221" cy="228" r="2.5"/><circle cx="241" cy="250" r="2.5"/></svg>}<div className="notes-library-stats"><span><b>{String(catalog.notes.length).padStart(2, '0')}</b> 篇笔记</span><span><b>{String(catalog.attachments.length).padStart(2, '0')}</b> 份资料</span><span>最近更新 {date(catalog.updated)}</span></div></header>
    {courses.length > 0 && <div className="notes-course-bar"><span>沿着课程探索</span><div>{courses.map(course => <button key={course} aria-pressed={query === course} onClick={() => onSearch(query === course ? '' : course)}><BookOpen size={13}/>{course}<ArrowUpRight size={12}/></button>)}</div>{query && <button className="notes-clear-filter" onClick={() => onSearch('')}>显示全部<X size={13}/></button>}</div>}
    <div className="notes-list-title"><span>笔记 / NOTES</span><span>{String(notes.length).padStart(2, '0')}</span></div>
    <div className="notes-card-list">{notes.map((note, index) => <a className="notes-card" key={note.id} href={`${sitePath('notes.html')}?note=${note.id}`} onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey) { event.preventDefault(); onNavigate(note.id); } }}><span className="notes-card-number"><span>{String(index + 1).padStart(2, '0')}</span><BookOpen size={26} strokeWidth={1}/><small>FIELD NOTE</small></span><div className="notes-card-copy"><span className="notes-card-folder">{folderLabel(note.folder)}</span><h2>{note.title}</h2><p>{note.excerpt}</p><span className="notes-card-date">{date(note.updated)}<i/>约 {note.minutes} 分钟</span></div><span className="notes-card-arrow"><ArrowUpRight size={20} strokeWidth={1.3}/></span></a>)}</div>
    {attachments.length > 0 && <section className="notes-attachments"><div className="notes-list-title"><span>参考资料 / RESOURCES</span><span>{String(attachments.length).padStart(2, '0')}</span></div>{attachments.map(file => <a key={file.path} href={sitePath(`notes/${file.file}`)} target="_blank" rel="noreferrer"><span className="notes-file-type">{file.extension}</span><div><strong>{file.title}</strong><span>{folderLabel(file.folder)} · {(file.bytes / 1024 / 1024).toFixed(1)} MB</span></div><ArrowUpRight size={18}/></a>)}</section>}
    {!notes.length && !attachments.length && <p className="notes-message" role="status">暂未找到匹配内容，试试课程名、概念或正文中的词句。</p>}
    <footer className="notes-library-footer">持续记录，慢慢理解。<span>UNDER THE SAME SKY.</span></footer>
  </div>;
}

export default function NotesApp() {
  const [catalog, setCatalog] = useState(null), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState(currentId), [query, setQuery] = useState(''), [drawer, setDrawer] = useState(false);
  const search = useRef(null), closeButton = useRef(null), menuButton = useRef(null);
  const openSearch = useCallback(() => {
    if (window.matchMedia('(max-width: 760px)').matches) setDrawer(true);
    requestAnimationFrame(() => search.current?.focus());
  }, []);
  useEffect(() => {
    const keydown = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
    };
    const query = window.matchMedia('(max-width: 760px)');
    const resize = () => { if (!query.matches) setDrawer(false); };
    document.addEventListener('keydown', keydown); query.addEventListener('change', resize);
    return () => { document.removeEventListener('keydown', keydown); query.removeEventListener('change', resize); };
  }, [openSearch]);
  useEffect(() => {
    const controller = new AbortController(); setError('');
    fetch(sitePath('notes/index.json'), { signal: controller.signal, cache: 'no-cache' }).then(response => { if (!response.ok) throw new Error('无法加载笔记目录'); return response.json(); }).then(setCatalog).catch(error => { if (error.name !== 'AbortError') setError('目录加载失败，请检查网络后重试。'); });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => { const pop = () => { setSelected(currentId()); setQuery(''); setDrawer(false); }; window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop); }, []);
  const navigate = useCallback((id, hash = '') => {
    const previousId = currentId();
    const url = new URL(window.location.href); url.search = ''; url.hash = hash;
    if (id) url.searchParams.set('note', id);
    window.history.pushState(null, '', url);
    setSelected(id); setQuery(''); setDrawer(false);
    if (id === previousId && hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  const note = useMemo(() => catalog?.notes.find(item => item.id === selected), [catalog, selected]);
  useEffect(() => { document.title = `${note?.title || '学习笔记'} · REVERIE`; }, [note]);
  useEffect(() => {
    if (!drawer) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; closeButton.current?.focus();
    const keydown = event => {
      if (event.key === 'Escape') setDrawer(false);
      if (event.key === 'Tab') {
        const elements = [...document.querySelectorAll('.notes-sidebar a, .notes-sidebar button, .notes-sidebar input, .notes-sidebar summary')].filter(element => element.getClientRects().length);
        if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements.at(-1)?.focus(); }
        else if (!event.shiftKey && document.activeElement === elements.at(-1)) { event.preventDefault(); elements[0]?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', keydown); menuButton.current?.focus(); };
  }, [drawer]);
  return <div className="notes-app"><a className="notes-skip" href="#notes-content">跳转到笔记内容</a><header className="notes-topbar"><a className="notes-wordmark" href={`${sitePath('')}#projects`}>REVERIE<span>.</span></a><span className="notes-topbar-label">学习笔记 / FIELD NOTES</span><button className="notes-search-trigger" aria-label="搜索笔记" onClick={openSearch}><Search size={15}/><span>搜索笔记</span><kbd>Ctrl K</kbd></button><a className="notes-home-link" href={`${sitePath('')}#projects`}><ArrowLeft size={15}/><span>返回作品集</span></a><button className="notes-menu" ref={menuButton} aria-label="打开笔记目录" aria-expanded={drawer} aria-controls="notes-directory" onClick={() => setDrawer(true)}><List size={22}/></button></header>
    {drawer && <button className="notes-drawer-shade" aria-label="关闭目录" onClick={() => setDrawer(false)}/>}
    <aside id="notes-directory" className={`notes-sidebar ${drawer ? 'open' : ''}`} role={drawer ? 'dialog' : undefined} aria-modal={drawer ? true : undefined} aria-label="学习笔记目录"><div className="notes-sidebar-heading"><BookOpen size={20}/><span>学习笔记<small>一页一页，理解世界。</small></span><button ref={closeButton} className="notes-close" aria-label="关闭目录" onClick={() => setDrawer(false)}><X size={20}/></button></div><label className="notes-search"><Search size={16}/><input ref={search} value={query} onChange={event => { setQuery(event.target.value); }} placeholder="搜索标题、正文或课程" aria-label="搜索笔记"/>{query && <button aria-label="清除搜索" onClick={() => setQuery('')}><X size={14}/></button>}</label>{drawer && query && <button className="notes-mobile-results" onClick={() => setDrawer(false)}>查看搜索结果 <ArrowUpRight size={14}/></button>}<button className={`notes-all ${!selected ? 'selected' : ''}`} onClick={() => navigate(null)}><BookOpen size={15}/>全部笔记<span>{catalog?.notes.length ?? '—'}</span></button><p className="notes-directory-label">沿着目录探索</p>{catalog && <Directory notes={catalog.notes} selected={selected} onNavigate={navigate}/>}<div className="notes-sidebar-footer"><span className="notes-status-dot"/>持续生长的知识手记<p>{catalog ? `更新于 ${date(catalog.updated)}` : '正在连接笔记库'}</p></div></aside>
    <main id="notes-content" className="notes-main" inert={drawer ? true : undefined}>{error ? <div className="notes-message" role="alert">{error}<button onClick={() => setRetry(value => value + 1)}>重新加载</button></div> : !catalog ? <p className="notes-message" role="status">正在收集这一片星光……</p> : query || !selected ? <Library catalog={catalog} query={query} onNavigate={navigate} onSearch={setQuery}/> : note ? <NoteReader key={note.id} note={note} catalog={catalog} onNavigate={navigate}/> : <div className="notes-message"><h1>这一页暂时不在目录里。</h1><p>它可能已改名或移走，可以从目录重新寻找。</p><button onClick={() => navigate(null)}>浏览全部笔记</button></div>}</main>
  </div>;
}
