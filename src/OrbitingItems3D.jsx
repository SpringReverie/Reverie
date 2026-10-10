import { useEffect, useRef } from 'react';

const TAU = Math.PI * 2;
const initialAngles = [235, 325, 145, 55];
const pointOnOrbit = (angle, radiusX, radiusY, tilt) => {
  const x = radiusX * Math.cos(angle), y = radiusY * Math.sin(angle);
  return { x: x * Math.cos(tilt) - y * Math.sin(tilt), y: x * Math.sin(tilt) + y * Math.cos(tilt), depth: (Math.sin(angle) + 1) / 2 };
};

// Elliptical orbit adapted from the supplied component. One time-based frame
// loop updates DOM refs, without per-item timers or React renders every frame.
export default function OrbitingItems3D({ items, radiusX = 39, radiusY = 28, tiltAngle = -18, duration = 108, playing = true, onActive }) {
  const root = useRef(null);
  const links = useRef([]);
  const stars = useRef([]);
  const phase = useRef(0);
  const velocity = useRef(0);
  const hovering = useRef(false);
  const focused = useRef(false);
  const wake = useRef(() => {});
  const isPlaying = useRef(playing);
  isPlaying.current = playing;
  useEffect(() => {
    let frame = 0, previous, visible = false;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const tilt = tiltAngle * Math.PI / 180;
    const paint = () => {
      links.current.forEach((element, index) => {
        if (!element) return;
        const angle = initialAngles[index % 4] * Math.PI / 180 + phase.current;
        const p = pointOnOrbit(angle, radiusX, radiusY, tilt);
        element.style.left = `${50 + p.x}%`; element.style.top = `${50 + p.y}%`;
        element.style.transform = `translate(-50%, -50%) scale(${(.91 + p.depth * .14).toFixed(4)})`;
        element.style.opacity = (.72 + p.depth * .28).toFixed(3);
        element.style.zIndex = p.depth > .5 ? '6' : '2';
      });
      stars.current.forEach((element, index) => {
        if (!element) return;
        const angle = phase.current * (index % 2 ? -.68 : 1.26) + index * 2.3;
        const p = pointOnOrbit(angle, index === 1 ? 38 : 42, index === 1 ? 16 : 20, index === 1 ? .82 : -.49);
        element.style.left = `${50 + p.x}%`; element.style.top = `${50 + p.y}%`;
        element.style.transform = `translate(-50%, -50%) scale(${.7 + p.depth * .55}) rotate(${angle * 180 / Math.PI}deg)`;
        element.style.opacity = (.3 + p.depth * .5).toFixed(3);
        element.style.zIndex = p.depth > .5 ? '5' : '1';
      });
    };
    const render = time => {
      frame = 0;
      if (!visible || document.hidden) return;
      const dt = previous === undefined ? 0 : Math.min((time - previous) / 1000, .05);
      previous = time;
      const target = isPlaying.current && !media.matches && !hovering.current && !focused.current ? TAU / duration : 0;
      velocity.current += (target - velocity.current) * (1 - Math.exp(-dt * 7));
      phase.current = (phase.current + velocity.current * dt) % TAU;
      paint();
      if (target !== 0 || Math.abs(velocity.current) > .00002) frame = requestAnimationFrame(render);
    };
    const resume = () => { if (!frame && visible && !document.hidden) { previous = undefined; frame = requestAnimationFrame(render); } };
    wake.current = resume;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resume(); else { cancelAnimationFrame(frame); frame = 0; velocity.current = 0; }
    }, { threshold: .05 });
    observer.observe(root.current);
    const onVisibility = () => { cancelAnimationFrame(frame); frame = 0; if (!document.hidden) resume(); };
    const onMotion = () => { velocity.current = 0; resume(); };
    document.addEventListener('visibilitychange', onVisibility);
    media.addEventListener('change', onMotion);
    paint();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); media.removeEventListener('change', onMotion); wake.current = () => {}; };
  }, [duration, radiusX, radiusY, tiltAngle]);
  useEffect(() => wake.current(), [playing]);
  return <nav ref={root} className="atlas-nodes orbiting-items-3d" aria-label="探索我的四个方向">
    {items.map((item, index) => <a key={item.name} ref={node => { links.current[index] = node; }} href={item.href} data-orbit-item={item.en} onPointerEnter={() => { hovering.current = true; onActive(item); wake.current(); }} onPointerLeave={() => { hovering.current = false; onActive(null); wake.current(); }} onFocus={() => { focused.current = true; onActive(item); wake.current(); }} onBlur={() => { focused.current = false; onActive(null); wake.current(); }}><i aria-hidden="true"/><span>{item.name}<small className="mono">{item.en}</small></span></a>)}
    {[0, 1, 2].map(index => <span key={index} ref={node => { stars.current[index] = node; }} className="orbit-spark" aria-hidden="true"/>)}
  </nav>;
}
