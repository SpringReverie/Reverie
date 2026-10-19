import { useState } from 'react';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { projects } from './data';
import { projectNotes, projectSupplements } from './journal-data';
import ScrollChapter from './ScrollChapter';
import { sitePath } from './sitePath';

function ProjectCard({ project, featured }) {
  const [expanded, setExpanded] = useState(false);
  const notebook = project.category === '知识手记';
  const notes = projectNotes[project.id] ?? [];
  const supplement = projectSupplements[project.id];
  return <article className={`project-card work-card ${project.className} ${notebook ? 'work-notebook' : featured ? 'work-featured' : 'work-secondary'}`}>
    <a className="work-media" href={project.href} target="_blank" rel="noreferrer" aria-label={`${project.title}：${project.action}`}>
      <img src={sitePath(`assets/${project.image}`)} alt={`${project.title}作品画面`} loading="lazy"/>
      <span className="work-media-label"><span>{notebook ? 'FIELD NOTES' : 'SELECTED EXPERIMENT'}</span><span>{project.id} / REVERIE</span></span>
      <div className="work-mobile-cover"><span>{project.category}</span><h3>{project.title}</h3><small>{project.en}</small></div>
      <span className="work-media-open" aria-hidden="true"><ArrowUpRight size={22} strokeWidth={1.3}/></span>
    </a>
    <div className="work-body">
      <div className="work-category"><span>{notebook ? <BookOpen size={14} strokeWidth={1.3}/> : <span className="work-category-dot"/>}{project.category}</span><span>{project.id}</span></div>
      <p className="work-overline">{project.en}</p><h3 className="work-title"><a href={project.href} target="_blank" rel="noreferrer">{project.title}</a></h3>
      <p className="work-description">{project.description}</p>
      <div className={`work-insight ${expanded ? 'is-expanded' : ''}`}><button className="work-expand" aria-expanded={expanded} aria-controls={`work-insight-${project.id}`} onClick={() => setExpanded(value => !value)}><span>{notebook ? '关于这本手记' : '创作手记'}</span><span aria-hidden="true">{expanded ? '−' : '+'}</span></button><div className="work-insight-content" id={`work-insight-${project.id}`}><dl className="work-records">{notes.map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}{supplement?.difficulty && <div><dt>难点</dt><dd>{supplement.difficulty}</dd></div>}</dl>{supplement?.next && <p className="work-next"><span>下一步</span>{supplement.next}</p>}</div></div>
      <div className="work-footer"><div className="work-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><a className="work-action" href={project.href} target="_blank" rel="noreferrer">{project.action}<ArrowUpRight size={16} strokeWidth={1.4}/></a></div>
    </div>
  </article>;
}

export default function ProjectsShowcase() {
  const [filter, setFilter] = useState('全部');
  const visible = projects.filter(project => filter === '全部' || project.category === filter);
  const categories = ['全部', ...new Set(projects.map(project => project.category))];
  return <ScrollChapter id="projects"><section className="section projects-section projects-editorial container" aria-labelledby="works-title">
    <div className="section-label"><span className="index">02</span><span>精选项目 / SELECTED WORK</span></div>
    <header className="works-heading"><div><p className="works-eyebrow">A FEW THINGS I'VE BEEN MAKING</p><h2 id="works-title">让好奇，<br/><span>慢慢有了形状。</span></h2></div><div className="works-mobile-index" aria-hidden="true"><strong>{String(projects.length).padStart(2, '0')}</strong><span>份探索</span></div><div className="works-introduction"><span className="works-edition">{String(projects.length).padStart(2, '0')} / OPEN EXPLORATIONS</span><p>把想象交给双手，<br/>把走过的思路留给文字。</p><span className="works-whisper">在实践与思考之间，继续出发。</span></div></header>
    <div className="works-browse"><div className="work-filters" role="group" aria-label="筛选项目">{categories.map(item => <button key={item} className={filter === item ? 'selected' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}<span>{String(projects.filter(project => item === '全部' || project.category === item).length).padStart(2, '0')}</span></button>)}</div><span className="works-browse-note" aria-live="polite">{String(visible.length).padStart(2, '0')} 个可以走近的想法</span></div>
    <div className="projects-journal works-grid">{visible.map((project, index) => <ProjectCard key={project.id} project={project} featured={index === 0}/>)}</div>
    <div className="works-colophon"><span>每一次尝试，都是理解世界的一小步。</span><span>BUILT WITH CURIOSITY.</span></div>
  </section></ScrollChapter>;
}
