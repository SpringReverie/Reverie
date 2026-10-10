import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import './TiltedCard.css';

const springValues = { damping: 30, stiffness: 100, mass: 2 };
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Adapted from the supplied TiltedCard. The existing text cards become the
// spring-driven surface, while the outer figure keeps chapter reveals separate.
export default function TiltedCard({ children, captionText = '', rotateAmplitude = 6, scaleOnHover = 1.018, showTooltip = false, className = '' }) {
  const ref = useRef(null);
  const lastY = useRef(0);
  const active = useRef(false);
  const [finePointer, setFinePointer] = useState(false);
  const reduced = useReducedMotion();
  const enabled = finePointer && !reduced;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(0, springValues);
  const rotateY = useSpring(0, springValues);
  const scale = useSpring(1, springValues);
  const lift = useSpring(0, springValues);
  const opacity = useSpring(0, { stiffness: 160, damping: 26 });
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });
  const light = useMotionTemplate`radial-gradient(340px circle at ${x}px ${y}px, #d7e6ff16, #b1cfec06 42%, transparent 76%)`;

  const reset = useCallback(() => {
    active.current = false;
    opacity.set(0); scale.set(1); lift.set(0);
    rotateX.set(0); rotateY.set(0); rotateFigcaption.set(0);
  }, [opacity, scale, lift, rotateX, rotateY, rotateFigcaption]);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFinePointer(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { if (!enabled) reset(); }, [enabled, reset]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) reset(); });
    observer.observe(ref.current);
    const onVisibility = () => { if (document.hidden) reset(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, [reset]);

  function handlePointer(event) {
    if (!enabled || event.pointerType === 'touch' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const offsetX = localX - rect.width / 2;
    const offsetY = localY - rect.height / 2;
    rotateX.set(clamp(offsetY / (rect.height / 2), -1, 1) * -rotateAmplitude);
    rotateY.set(clamp(offsetX / (rect.width / 2), -1, 1) * rotateAmplitude);
    x.set(localX); y.set(localY);
    rotateFigcaption.set(clamp(-(offsetY - lastY.current) * .6, -12, 12));
    lastY.current = offsetY;
    if (!active.current) {
      active.current = true;
      scale.set(scaleOnHover); lift.set(-5); opacity.set(1);
    }
  }

  return <figure ref={ref} className={`tilted-card-figure strength-tilt ${className}`} onPointerEnter={handlePointer} onPointerMove={handlePointer} onPointerLeave={reset} onPointerCancel={reset}>
    <motion.article className="strength-card tilted-card-inner" style={{ rotateX: enabled ? rotateX : 0, rotateY: enabled ? rotateY : 0, scale: enabled ? scale : 1, y: enabled ? lift : 0 }}>
      <motion.div className="tilted-card-light" style={{ background: light, opacity: enabled ? opacity : 0 }} aria-hidden="true"/>
      {children}
    </motion.article>
    {showTooltip && <motion.figcaption className="tilted-card-caption" aria-hidden="true" style={{ x, y, opacity: enabled ? opacity : 0, rotate: rotateFigcaption }}>{captionText}</motion.figcaption>}
  </figure>;
}
