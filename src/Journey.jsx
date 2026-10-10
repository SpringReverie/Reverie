import { ArrowUpRight } from 'lucide-react';
import { journey } from './journal-data';

export default function Journey({ onCertificate }) {
  return <div className="journey">
    <div className="journey-heading"><span className="mono">FIELD NOTES / THE JOURNEY</span><h3>走过的路，也是一张星图。</h3></div>
    <div className="journey-path">
      <svg className="journey-line" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true"><path d="M 30 75 C 250 -10 310 140 430 75 S 710 20 820 75 S 1040 130 1170 55" /></svg>
      {journey.map((item, i) => <article className="journey-stop" key={item.title}><span className="journey-star" aria-hidden="true"/><span className="journey-date mono">{item.date}</span><h4>{item.title}</h4><p>{item.text}</p>{item.certificate ? <button onClick={onCertificate}>{item.label}<ArrowUpRight size={14}/></button> : item.href ? <a href={item.href}>{item.label}<ArrowUpRight size={14}/></a> : <span className="journey-label">{item.label}</span>}<span className="journey-number mono">0{i + 1}</span></article>)}
    </div>
  </div>;
}
