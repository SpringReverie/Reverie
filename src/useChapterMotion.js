import { useCallback, useEffect, useRef } from 'react';
import { chapters } from './ScrollChapter';
import { scenePainter } from './sequenceMotion';

const clamp = value => Math.min(1, Math.max(0, value));
const smooth = value => { const x = clamp(value); return x * x * (3 - 2 * x); };
const layoutTop = element => { let top = 0; for (let node = element; node; node = node.offsetParent) top += node.offsetTop; return top; };
const effects = [
  ['.section-label, .hero-eyebrow, .media-eyebrow', 'label'], ['h2, #hero-title', 'title'],
  ['.hero-intro, .hero-description, .hero-whisper, .about-lead, .body-copy, .about-links, .section-heading-aside, .photo-description, .photo-summary, .photo-postcard, .photo-index, .photo-controls, .certificate-introduction, .strengths-note, .contact-eyebrow, .contact-action-row', 'copy'],
  ['.profile-card', 'portrait'], ['.stats, .journey-heading, .journey-stop, .credential-tabs, .next-experiment', 'copy'],
  ['.project-card', 'project'], ['.photo-spiral-panel', 'orbit'], ['.certificate-reel-frame', 'reels'],
  ['.strength-tilt', 'ability'], ['.contact-loop-shell, .footer, .moonlight-study', 'copy'],
];

// Native scroll is the timeline. Each scene has a reading interval followed by
// a separate handoff; incoming stages stay aligned while their aperture opens.
export default function useChapterMotion(contentRef, onActive) {
  const controller = useRef(null);
  const navigate = useCallback(id => controller.current?.navigate(id), []);
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const rail = document.querySelector('.chapter-rail');
    const states = new WeakMap();
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    let enabled = false, frame = 0, resizeFrame = 0, disposed = false, firstMeasure = true;
    let viewWidth = innerWidth, viewHeight = innerHeight;
    let active = '', visualY = scrollY, previousTime = performance.now();
    const records = [...root.querySelectorAll('.scroll-chapter')].map(section => ({
      id: section.dataset.chapter, section, stage: section.querySelector('.chapter-stage'),
      content: section.querySelector('.chapter-content'), items: [],
      config: chapters.find(chapter => chapter.id === section.dataset.chapter),
    }));
    const measure = () => {
      resizeFrame = 0;
      if (disposed) return;
      const desiredMode = innerWidth >= 980 && !reduced.matches;
      const portalled = root.querySelectorAll('.chapter-viewport > [data-stage]').length === records.length;
      // React must finish moving scenes before the new layout is measured.
      if (desiredMode !== portalled) { resize(); return; }
      const viewportChanged = innerWidth!==viewWidth || innerHeight!==viewHeight || enabled!==desiredMode;
      // Keep the last painted scene: moving the portals can clamp native scroll
      // before this measurement, so scrollY no longer describes the old layout.
      const previousRecord = !firstMeasure && viewportChanged
        ? records.find(record => record.id===active) ?? records.findLast(record => Number.isFinite(record.start) && visualY>=record.start)
        : null;
      const previousDistance = previousRecord ? (enabled ? previousRecord.storyTravel : previousRecord.overflow) : 0;
      const previousFraction = previousDistance>0 ? clamp((visualY-previousRecord.start)/previousDistance) : 0;
      viewWidth=innerWidth; viewHeight=innerHeight;
      enabled = desiredMode;
      root.classList.toggle('chapter-motion-enabled', enabled);
      root.classList.toggle('chapter-reveals-enabled', !reduced.matches);
      root.style.setProperty('--chapter-nav', innerWidth > 760 ? '104px' : '82px');
      records.forEach(record => {
        record.stage = root.querySelector(`[data-stage="${record.id}"]`);
        record.content = record.stage.querySelector('.chapter-content');
        const items = [], seen = new Set();
        for (const [selector, effect] of effects) {
          record.content.querySelectorAll(selector).forEach(element => {
            if (seen.has(element)) return;
            seen.add(element); element.dataset.motion = effect;
            const group = effect === 'project' || effect === 'ability' ? items.filter(item => item.effect === effect).length : 0;
            let state = states.get(element);
            if (!state) { state = { value: 0 }; states.set(element, state); }
            items.push({ element, effect, group, state });
          });
        }
        record.items = items;
        record.inset = record.id === 'top' ? 0 : (innerWidth > 760 ? 104 : 82);
        record.viewport = innerHeight - record.inset;
        record.entryDistance = record.viewport * record.config.span;
        record.section.style.setProperty('--chapter-viewport', `${record.viewport}px`);
        record.stage.style.setProperty('--chapter-viewport', `${record.viewport}px`);
        record.stage.style.top = enabled ? `${record.inset}px` : '';
        record.overflow = record.config.duration ? 0 : Math.max(0, record.content.offsetHeight - record.viewport);
        const next = records[records.indexOf(record)+1];
        const reading = record.config.duration ? record.viewport*record.config.duration : record.overflow+record.viewport*.5;
        const handoff = next ? (innerHeight-(next.id==='top'?0:104))*next.config.span : record.viewport*.2;
        record.travel = reading + handoff;
        record.storyTravel = reading;
        const sceneRoot = record.stage.querySelector('[data-sequence-scene]');
        if (sceneRoot !== record.sceneRoot || !record.paint) { record.sceneRoot = sceneRoot; record.paint = scenePainter(sceneRoot); }
        record.section.style.setProperty('--chapter-height', `${record.viewport + record.travel}px`);
        record.section.style.setProperty('--chapter-viewport', `${record.viewport}px`);
      });
      // Cache geometry once, keeping layout reads out of the scroll render loop.
      records.forEach(record => {
        record.start = layoutTop(record.section) - (enabled ? 0 : record.inset);
        const contentTop = layoutTop(record.content);
        record.items.forEach(item => { item.offset = layoutTop(item.element) - contentTop; item.height = item.element.offsetHeight; });
      });
      records.forEach((record,index) => {
        const next = records[index+1];
        if (next) record.storyTravel = Math.max(1,next.start-next.entryDistance-record.start);
      });
      if (previousRecord) {
        visualY = Math.max(0,previousRecord.start+previousFraction*(enabled?previousRecord.storyTravel:previousRecord.overflow));
        scrollTo({top:visualY,behavior:'instant'});
      }
      if (firstMeasure) {
        firstMeasure = false;
        const record = records.find(item => item.id === location.hash.slice(1));
        if (record) { visualY = Math.max(0,record.start); scrollTo({top:visualY,behavior:'instant'}); }
      }
      schedule();
    };
    const render = now => {
      frame = 0;
      if (disposed || document.hidden || records.some(record => !Number.isFinite(record.start))) return;
      if (innerWidth!==viewWidth || innerHeight!==viewHeight || enabled!==(innerWidth>=980&&!reduced.matches)) { resize(); return; }
      const dt = Math.min(50, Math.max(1, now - previousTime));
      previousTime = now;
      const nativeY = scrollY;
      if (!enabled) visualY = nativeY;
      else visualY += (nativeY - visualY) * (1 - Math.exp(-dt / 145));
      if (Math.abs(nativeY - visualY) < .15) visualY = nativeY;
      const y = visualY, height = innerHeight;
      let unsettled = y !== nativeY, current = records[0];
      for (const record of records) if (y >= record.start - record.entryDistance * .08) current = record;
      if (current && active !== current.id) { active = current.id; onActive(active); }
      root.classList.toggle('chapter-rail-visible', enabled && y >= records[0].start - 2);
      rail?.style.setProperty('--chapter-progress', current ? clamp((y - current.start) / current.travel) : 0);
      const revealBlend = 1 - Math.exp(-dt / 110);
      for (const [index,record] of records.entries()) {
        const entry = clamp((y-record.start+record.entryDistance)/record.entryDistance);
        const front = enabled ? smooth(entry) : 1;
        const next = records[index+1];
        const exit = enabled && next ? smooth((y-next.start+next.entryDistance)/next.entryDistance) : 0;
        const pan = enabled ? record.overflow * smooth((y-record.start)/Math.max(record.overflow+record.viewport*.25,1)) : 0;
        const onStage = enabled && y >= record.start-record.entryDistance && y <= record.start+record.travel;
        const visualTop = enabled ? record.inset : record.start + record.inset - nativeY;
        record.stage.style.visibility = !enabled || onStage ? 'visible' : 'hidden';
        record.stage.style.translate = enabled && !onStage ? '0 200vh' : '';
        record.stage.style.setProperty('--chapter-front', front.toFixed(4));
        record.stage.style.setProperty('--chapter-exit', exit.toFixed(4));
        record.stage.style.setProperty('--chapter-pan', `${pan.toFixed(3)}px`);
        record.stage.style.setProperty('--chapter-drift', `${(clamp((y - record.start) / record.travel) * 32).toFixed(3)}px`);
        const [cx,cy] = record.config.center ?? [50,50];
        const radius = Math.hypot(innerWidth*Math.max(cx,100-cx)/100,record.viewport*Math.max(cy,100-cy)/100)*front;
        const transition = record.config.transition;
        let clip = 'inset(0)';
        if (enabled && front<.9999) {
          if (transition==='rise') clip=`inset(${(1-front)*100}% 0 0 0)`;
          else if (transition==='side') clip=`inset(0 ${(1-front)*100}% 0 0)`;
          else if (transition!=='veil') clip=`circle(${radius}px at ${cx}% ${cy}%)`;
        }
        record.stage.style.clipPath = enabled ? clip : '';
        record.stage.style.setProperty('--aperture-radius',`${Math.max(0,radius-2)}px`);
        record.stage.style.setProperty('--aperture-x',`${cx}%`);
        record.stage.style.setProperty('--aperture-y',`${cy}%`);
        record.stage.style.setProperty('--aperture-light',enabled && (transition==='moon'||transition==='mist') ? String(smooth(entry/.12)*(1-smooth((entry-.72)/.28))*.7) : '0');
        record.stage.style.setProperty('--veil-opacity',enabled&&transition==='veil'?front:1);
        record.section.dataset.scenePhase = front<1?'entering':exit>0?'leaving':'reading';
        if (!enabled || (y>=record.start-record.entryDistance&&y<=record.start+record.travel+record.viewport)) record.paint(clamp((y-record.start)/record.storyTravel),innerWidth,record.viewport,!enabled);
        const hidden = enabled && (front < .92 || exit > .75);
        record.stage.inert = hidden; record.stage.style.pointerEvents = hidden ? 'none' : '';
        for (const item of record.items) {
          let target = 1;
          if (!reduced.matches) {
            const top = visualTop + item.offset - pan;
            const view = smooth((height - top - 8) / Math.min(height * .24, Math.max(48, item.height * .6)));
            const entrance = enabled ? smooth((front - item.group * .035) / .85) : 1;
            target = Math.min(view, entrance);
          }
          const state = item.state;
          if (reduced.matches) state.value = 1;
          else state.value += (target - state.value) * revealBlend;
          if (Math.abs(target - state.value) < .002) state.value = target;
          else unsettled = true;
          item.element.style.setProperty('--reveal', state.value.toFixed(4));
        }
      }
      if (unsettled) schedule();
    };
    const schedule = () => { if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(render); };
    const resize = () => { if (!resizeFrame) resizeFrame = requestAnimationFrame(measure); };
    const navigateTo = id => {
      const record = records.find(item => item.id === id);
      if (!record) return;
      scrollTo({ top: Math.max(0, record.start), behavior: reduced.matches ? 'instant' : 'smooth' });
      history.replaceState(null, '', `#${id}`); schedule();
    };
    const hashChange = () => navigateTo(location.hash.slice(1));
    controller.current = { navigate: navigateTo };
    const click = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const id = event.target.closest('a[href^="#"]')?.getAttribute('href')?.slice(1);
      if (!records.some(record => record.id === id)) return;
      event.preventDefault(); navigateTo(id);
    };
    const key = event => {
      if (event.key !== 'Tab' || !enabled) return;
      requestAnimationFrame(() => {
        if (disposed) return;
        const focused = document.activeElement, record = records.find(item => item.stage.contains(focused));
        if (!record || focused === document.body) return;
        const bounds = focused.getBoundingClientRect();
        if (bounds.top >= record.inset && bounds.bottom <= innerHeight - 20) return;
        const offset = layoutTop(focused) - layoutTop(record.content);
        const fraction = clamp(Math.min(record.overflow, Math.max(0, offset - record.viewport * .45)) / Math.max(record.overflow, 1));
        // Invert smoothstep to reveal the keyboard focus in a pinned chapter.
        const progress = .5 - Math.sin(Math.asin(1 - 2 * fraction) / 3);
        visualY = record.start + progress * (record.overflow + record.viewport * .25);
        scrollTo({ top: visualY, behavior: 'instant' }); schedule();
      });
    };
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else { previousTime = performance.now(); schedule(); }
    };
    // Observe size changes, not every rotating caption / active chapter update.
    const observer = new ResizeObserver(resize);
    const watchContents = () => { observer.disconnect(); records.forEach(record => { if (record.content) observer.observe(record.content); }); };
    const mutation = new MutationObserver(entries => {
      if (entries.some(entry => [...entry.addedNodes, ...entry.removedNodes].some(node => node.nodeType === 1 && (node.matches?.('[data-stage]') || node.querySelector?.('[data-stage]'))))) {
        measure(); watchContents();
      }
    });
    mutation.observe(root, { childList: true, subtree: true });
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', resize);
    window.addEventListener('hashchange', hashChange);
    document.addEventListener('click', click); document.addEventListener('keydown', key);
    document.addEventListener('visibilitychange', visibility); reduced.addEventListener('change', resize);
    measure();
    watchContents();
    return () => {
      disposed = true; cancelAnimationFrame(frame); cancelAnimationFrame(resizeFrame); controller.current = null;
      history.scrollRestoration = previousRestoration;
      observer.disconnect(); mutation.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', resize);
      window.removeEventListener('hashchange', hashChange);
      document.removeEventListener('click', click); document.removeEventListener('keydown', key);
      document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', resize);
      root.classList.remove('chapter-motion-enabled', 'chapter-reveals-enabled', 'chapter-rail-visible');
      records.forEach(record => { record.stage.inert = false; record.stage.style.pointerEvents = ''; record.stage.style.removeProperty('--chapter-follow'); });
    };
  }, [contentRef, onActive]);
  return { navigate };
}
