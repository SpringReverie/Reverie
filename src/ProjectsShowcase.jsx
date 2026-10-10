import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { projects } from './data';
import { projectNotes, projectSupplements } from './journal-data';
import ScrollChapter from './ScrollChapter';
import { sitePath } from './sitePath';

function ProjectCard({ project, featured }) {
  const notes = projectNotes[project.id] ?? [];
  const supplement = projectSupplements[project.id];
  return <article className={`project-card ${project.className} ${featured ? 'project-featured' : 'project-secondary'}`}>
    <a className="project-image" href={project.href} target="_blank" rel="noreferrer" aria-label={`${project.title}：${project.action}`}><img src={sitePath(`assets/${project.image}`)} alt={`${project.title}作品画面`} loading="lazy"/><span className="image-index mono">EXPERIMENT / {project.id}</span><span className="image-arrow"><ArrowUpRight/></span>{project.id === '01' && <span className="space-cover-title">INTO THE<br/><i>UNKNOWN.</i></span>}</a>
    <div className="project-details"><span className="project-overline mono">{project.en}</span><div className="project-heading"><h3>{project.title}</h3><span className="mono">{project.id}</span></div><p>{project.description}</p><dl className="project-notes">{notes.map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}{supplement?.difficulty && <div><dt>难点</dt><dd>{supplement.difficulty}</dd></div>}{supplement?.next && <div><dt>接下来</dt><dd>{supplement.next}</dd></div>}</dl><div className="project-footer"><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><a href={project.href} target="_blank" rel="noreferrer">{project.action}<ArrowUpRight size={15}/></a></div></div>
  </article>;
}

export default function ProjectsShowcase() {
  const [filter, setFilter] = useState('全部');
  const visible = projects.filter(p => filter === '全部' || p.category === filter);
  return <ScrollChapter id="projects"><section className="section projects-section container">
    <div className="section-label"><span className="index">02</span><span>精选项目 / SELECTED WORK</span></div>
    <div className="section-heading"><h2>让好奇，<br/><span className="muted-heading">慢慢有了形状。</span></h2><div className="section-heading-aside"><p>把遥远的想象，变成可以触碰的作品。<br/>每一次动手，都是一次小小的出发。</p><span className="mono">THREE EXPERIMENTS, AND MORE TO COME.</span></div></div>
    <div className="project-filters" role="group" aria-label="筛选项目">{['全部', '交互开发', '人工智能'].map(item => <button key={item} className={filter === item ? 'selected' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}<span>{String(projects.filter(p => item === '全部' || p.category === item).length).padStart(2,'0')}</span></button>)}</div>
    <div className="projects-journal">{visible.map((project, i) => <ProjectCard key={project.id} project={project} featured={i === 0}/>)}</div>
    {filter === '全部' && projects.length < 4 && <div className="next-experiment"><Plus size={21} strokeWidth={1}/><span className="mono">04 / TO BE CONTINUED</span><p>留一处空白，给下一次出发。</p><span>新项目预留</span></div>}
  </section></ScrollChapter>;
}
