import { useEffect, useMemo, useRef } from 'react';
import './InfiniteSpiral.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;
const smoothstep = (min, max, value) => { const x = clamp((value - min) / (max - min || 1), 0, 1); return x * x * (3 - 2 * x); };

// Based on the InfiniteSpiral source supplied by the user. The photo viewer,
// pause control, focus handling and offscreen suspension are portfolio additions.
export default function InfiniteSpiral({ items = [], speed = .55, direction = 'up', animationMode = 'all', radius = 215, cardWidth = 258, cardHeight = 178, widthFit = 2.65, verticalSpacing = 132, perspective = 1100, cardsPerTurn = 7, rotation = 0, cardTilt = -4, cardRadius = 5, centerScale = 1.18, edgeFade = .35, edgeBlur = 3, pauseOnHover = true, imageFit = 'cover', grayscale = .1, className = '', paused = false, onSelect, focusCommand, onFocused }) {
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const autoSpeedRef = useRef(0);
  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const lastPointerYRef = useRef(0);
  const dragMovedRef = useRef(false);
  const pressedIndexRef = useRef(null);
  const focusedRef = useRef(-1);
  const pendingFocusRef = useRef(null);
  const focusedCallback = useRef(onFocused);
  focusedCallback.current = onFocused;
  const normalizedItems = useMemo(() => items.map((item, index) => typeof item === 'string' ? { src: item, alt: `摄影作品 ${index + 1}` } : { alt: `摄影作品 ${index + 1}`, ...item }), [items]);

  useEffect(() => {
    if (!focusCommand || !items.length) return;
    const current = progressRef.current;
    targetProgressRef.current = current + modulo(focusCommand.index - current + items.length / 2, items.length) - items.length / 2;
    pendingFocusRef.current = focusCommand.index;
    autoSpeedRef.current = 0;
  }, [focusCommand, items.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !normalizedItems.length) return;
    let frameId = 0, previousTime = performance.now();
    let bounds = root.getBoundingClientRect(), visible = false;
    let lastScrollY = window.scrollY;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const render = (time) => {
      frameId = 0;
      if (!visible || document.hidden) return;
      const delta = Math.min((time - previousTime) / 1000, .05);
      previousTime = time;
      const autoEnabled = animationMode === 'auto' || animationMode === 'all';
      const motionPaused = paused || draggingRef.current || (pauseOnHover && hoveredRef.current);
      const desired = autoEnabled && !reducedMotion.matches && !motionPaused ? speed * (direction === 'down' ? -1 : 1) : 0;
      autoSpeedRef.current += (desired - autoSpeedRef.current) * (1 - Math.exp(-delta * 7));
      targetProgressRef.current += autoSpeedRef.current * delta;
      progressRef.current += (targetProgressRef.current - progressRef.current) * (1 - Math.exp(-delta * (draggingRef.current ? 22 : 11)));
      const count = normalizedItems.length, half = count / 2;
      const focused = modulo(Math.round(progressRef.current), count);
      if (pendingFocusRef.current !== null && Math.abs(targetProgressRef.current - progressRef.current) < .015) pendingFocusRef.current = null;
      if (pendingFocusRef.current === null && focused !== focusedRef.current) { focusedRef.current = focused; focusedCallback.current?.(focused); }
      const width = Math.max(bounds.width, 1), height = Math.max(bounds.height, 1);
      const fit = Math.min(1, width / (cardWidth * Math.max(widthFit, 1)), height / (cardHeight * 2.35));
      const responsiveRadius = Math.min(radius, Math.max(72, width * .36)) * fit;
      const fadeStart = clamp(1 - edgeFade, 0, .98), turnSize = Math.max(cardsPerTurn, 1);
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        let offset = modulo(index - progressRef.current + half, count) - half;
        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
        const opacity = 1 - smoothstep(fadeStart, 1, edge);
        const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * .65, 1), 1);
        const scale = (1 + (centerScale - 1) * focus) * fit;
        const angle = ((offset * (360 / turnSize) + rotation) * Math.PI) / 180;
        const x = Math.sin(angle) * responsiveRadius, z = Math.cos(angle) * responsiveRadius;
        const depthScale = clamp(perspective / Math.max(perspective - z, 1), .72, 1.45);
        const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2;
        const blur = edgeBlur * smoothstep(.35, 1, edge);
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * verticalSpacing * fit}px, 0) rotateZ(${cardTilt}deg) scale(${scale * depthScale})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = blur > .01 ? `blur(${blur.toFixed(2)}px)` : 'none';
        card.style.zIndex = String(Math.round(depth * 100000) + index);
        card.style.pointerEvents = opacity > .25 ? 'auto' : 'none';
        card.tabIndex = opacity > .25 ? 0 : -1;
      });
      frameId = requestAnimationFrame(render);
    };
    const resume = () => { if (!frameId && visible && !document.hidden) { previousTime = performance.now(); frameId = requestAnimationFrame(render); } };
    const resizeObserver = new ResizeObserver(() => { bounds = root.getBoundingClientRect(); });
    resizeObserver.observe(root);
    const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) resume(); else { cancelAnimationFrame(frameId); frameId = 0; } }, { threshold: .02 });
    intersectionObserver.observe(root);
    const handleScroll = () => {
      const next = window.scrollY, delta = next - lastScrollY; lastScrollY = next;
      if ((animationMode !== 'scroll' && animationMode !== 'all') || !visible || paused || reducedMotion.matches) return;
      targetProgressRef.current += clamp((delta * Math.max(speed, 0) / .55) / Math.max(verticalSpacing * 2, 1), -1.5, 1.5);
    };
    const handleVisibility = () => { cancelAnimationFrame(frameId); frameId = 0; resume(); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { cancelAnimationFrame(frameId); resizeObserver.disconnect(); intersectionObserver.disconnect(); window.removeEventListener('scroll', handleScroll); document.removeEventListener('visibilitychange', handleVisibility); };
  }, [normalizedItems, speed, direction, animationMode, radius, perspective, cardWidth, cardHeight, widthFit, verticalSpacing, cardsPerTurn, rotation, cardTilt, centerScale, edgeFade, edgeBlur, pauseOnHover, paused]);

  const dragEnabled = animationMode === 'drag' || animationMode === 'all';
  const stopDragging = (event) => { if (!draggingRef.current) return; draggingRef.current = false; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); event.currentTarget.style.cursor = dragEnabled ? 'grab' : 'default'; };
  return <div ref={rootRef} className={`infinite-spiral ${className}`} style={{ perspective: `${perspective}px`, '--infinite-spiral-card-width': `${cardWidth}px`, '--infinite-spiral-card-height': `${cardHeight}px`, '--infinite-spiral-card-radius': `${cardRadius}px`, cursor: dragEnabled ? 'grab' : 'default', touchAction: 'pan-y' }}
    onMouseEnter={() => { hoveredRef.current = true; }} onMouseLeave={() => { hoveredRef.current = false; }}
    onPointerDown={(event) => { if (!dragEnabled || event.button !== 0 || event.pointerType === 'touch') return; const button = event.target.closest('[data-photo-index]'); pressedIndexRef.current = button ? Number(button.dataset.photoIndex) : null; pendingFocusRef.current = null; draggingRef.current = true; dragMovedRef.current = false; lastPointerYRef.current = event.clientY; targetProgressRef.current = progressRef.current; event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.style.cursor = 'grabbing'; }}
    onPointerMove={(event) => { if (!draggingRef.current) return; const delta = event.clientY - lastPointerYRef.current; lastPointerYRef.current = event.clientY; if (Math.abs(delta) > .5) dragMovedRef.current = true; targetProgressRef.current -= delta / Math.max(verticalSpacing, 1); }} onPointerUp={stopDragging} onPointerCancel={stopDragging}
    onClickCapture={(event) => { if (dragMovedRef.current) { event.preventDefault(); event.stopPropagation(); dragMovedRef.current = false; } else if (event.target === event.currentTarget && pressedIndexRef.current !== null) onSelect?.(pressedIndexRef.current); pressedIndexRef.current = null; }}>
    <div className="infinite-spiral__stage" role="list" aria-label="摄影作品螺旋画廊">{normalizedItems.map((item, index) => <div role="listitem" key={item.id ?? `${item.src}-${index}`}><button data-photo-index={index} ref={(node) => { cardRefs.current[index] = node; }} className="infinite-spiral__item" style={{ width: cardWidth, height: cardHeight, borderRadius: cardRadius }} aria-label={`查看摄影作品 ${item.id}：${item.title}`} onClick={() => onSelect?.(index)} onFocus={() => { hoveredRef.current = true; }} onBlur={() => { hoveredRef.current = false; }}><img className="infinite-spiral__image" src={item.thumb ?? item.src} alt={item.alt} loading="lazy" draggable={false} style={{ objectFit: imageFit, filter: `grayscale(${clamp(grayscale, 0, 1)})` }} /><span className="spiral-caption"><span className="mono">NO. {item.id}</span>{item.title}</span></button></div>)}</div>
  </div>;
}
