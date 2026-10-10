import { useEffect, useMemo, useRef } from 'react';
import './media-showcase.css';

const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;

// Original implementation from the user's reel/spotlight brief; no Pro package required.
export default function CertificateReels({ items, paused, onSelect }) {
  const rootRef = useRef(null);
  const baseRefs = useRef([]), lightRefs = useRef([]);
  const offsets = useRef([180, 490, 90, 350]);
  const boost = useRef(0);
  const pointer = useRef(null);
  const rows = useMemo(() => Array.from({ length: 4 }, (_, row) => Array.from({ length: 10 }, (_, column) => { const index = (column + row * 4) % items.length; return { ...items[index], index }; })), [items]);
  useEffect(() => {
    const root = rootRef.current;
    let frame = 0, visible = false, previous = 0, previousScroll = window.scrollY;
    const widths = [1, 1, 1, 1];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const measure = () => baseRefs.current.forEach((track, i) => { if (track) widths[i] = track.scrollWidth / 2; });
    const resize = new ResizeObserver(measure); resize.observe(root); measure();
    const render = (time) => {
      frame = 0;
      if (!visible || document.hidden) return;
      const delta = Math.min((time - previous) / 1000, .05); previous = time;
      boost.current *= Math.exp(-delta * 2.4);
      rows.forEach((_, i) => {
        if (!paused && !reduced.matches) offsets.current[i] += (24 + i * 7 + boost.current) * delta * (i % 2 ? -1 : 1);
        const x = -modulo(offsets.current[i], widths[i]);
        const transform = `translate3d(${x}px,0,0)`;
        baseRefs.current[i].style.transform = transform;
        lightRefs.current[i].style.transform = transform;
      });
      frame = requestAnimationFrame(render);
    };
    const resume = () => { if (!frame && visible && !document.hidden) { previous = performance.now(); frame = requestAnimationFrame(render); } };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) resume(); else { cancelAnimationFrame(frame); frame = 0; } }, { threshold: .02 }); observer.observe(root);
    const wheel = (event) => { if (!paused && !reduced.matches) boost.current = Math.min(420, boost.current + Math.abs(event.deltaY) * .8); };
    const scroll = () => {
      const next = window.scrollY, delta = Math.abs(next - previousScroll); previousScroll = next;
      if (visible && !paused && !reduced.matches) boost.current = Math.min(420, boost.current + delta * .35);
      if (pointer.current) {
        const rect = root.getBoundingClientRect(), { x, y } = pointer.current;
        root.style.setProperty('--spot-x', `${x - rect.left}px`);
        root.style.setProperty('--spot-y', `${y - rect.top}px`);
        root.classList.toggle('has-spotlight', x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
      }
    };
    const visibility = () => { cancelAnimationFrame(frame); frame = 0; resume(); };
    root.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); root.removeEventListener('wheel', wheel); window.removeEventListener('scroll', scroll); document.removeEventListener('visibilitychange', visibility); };
  }, [rows, paused]);

  const field = (lit) => <div className="certificate-reels__field">{rows.map((row, rowIndex) => <div className="certificate-reels__row" key={rowIndex}><div className="certificate-reels__track" ref={(node) => { (lit ? lightRefs : baseRefs).current[rowIndex] = node; }}>{[0, 1].map((copy) => row.map((item, column) => lit ? <div className="certificate-reels__card" key={`${copy}-${column}-${item.id}`}><img src={item.thumb} alt="" loading="lazy" /></div> : <button className="certificate-reels__card" key={`${copy}-${column}-${item.id}`} tabIndex={copy ? -1 : 0} aria-hidden={copy ? true : undefined} aria-label={`查看证书 ${item.id}：${item.title}`} onClick={() => onSelect(item.index)} onFocus={(event) => { const rect = event.currentTarget.getBoundingClientRect(), bounds = rootRef.current.getBoundingClientRect(); rootRef.current.style.setProperty('--spot-x', `${rect.left + rect.width / 2 - bounds.left}px`); rootRef.current.style.setProperty('--spot-y', `${rect.top + rect.height / 2 - bounds.top}px`); rootRef.current.classList.add('has-spotlight'); }} onBlur={() => rootRef.current.classList.remove('has-spotlight')}><img src={item.thumb} alt={item.title} loading="lazy" /><span className="certificate-reels__number mono">{item.id}</span></button>))}</div></div>)}</div>;
  return <div ref={rootRef} className="certificate-reels" onPointerMove={(event) => { pointer.current = { x: event.clientX, y: event.clientY }; const rect = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`); event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`); event.currentTarget.classList.add('has-spotlight'); }} onPointerLeave={(event) => { pointer.current = null; event.currentTarget.classList.remove('has-spotlight'); }}>
    <div className="certificate-reels__base">{field(false)}</div><div className="certificate-reels__light" aria-hidden="true">{field(true)}</div><div className="certificate-reels__aura" aria-hidden="true" /><div className="certificate-reels__edges" aria-hidden="true" />
  </div>;
}
