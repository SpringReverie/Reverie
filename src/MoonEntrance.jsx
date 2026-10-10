import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import './moon.css';
import { sitePath } from './sitePath';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };

export default function MoonEntrance({ contentRef }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const mountRef = useRef(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: -.38, y: .22 });
  const enterPending = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const content = contentRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scrollFrame = 0;

    function updateScroll() {
      scrollFrame = 0;
      const bounds = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-bounds.top / distance);
      progressRef.current = progress;
      const reveal = reducedMotion.matches ? (progress > .65 ? 1 : 0) : smooth((progress - .34) / .58);
      section.style.setProperty('--lunar-progress', progress);
      section.style.setProperty('--intro-text-opacity', 1 - smooth(progress / .4));
      section.style.setProperty('--intro-text-y', `${reducedMotion.matches ? 0 : -progress * 45}px`);
      stage.style.opacity = 1 - smooth((progress - .12) / .62);
      stage.style.pointerEvents = progress > .65 ? 'none' : 'auto';
      stage.inert = progress > .65;
      content.style.setProperty('--arrival', reveal);
      content.style.setProperty('--arrival-offset', `${reducedMotion.matches ? 0 : (1 - reveal) * 28}px`);
      content.inert = progress < .65;
      if (progress >= 1) stage.style.visibility = 'hidden';
      else stage.style.visibility = 'visible';
      if (enterPending.current && progress >= .995) {
        enterPending.current = false;
        content.querySelector('.brand')?.focus({ preventScroll: true });
      }
    }
    const scheduleScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
    const onPointer = (event) => {
      if (event.pointerType === 'touch') return;
      pointerRef.current.x = clamp(event.clientX / window.innerWidth * 2 - 1, -1, 1);
      pointerRef.current.y = clamp(1 - event.clientY / window.innerHeight * 2, -1, 1);
    };
    const resetPointer = () => { pointerRef.current = { x: -.38, y: .22 }; };
    updateScroll();
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleScroll);
    stage.addEventListener('pointermove', onPointer, { passive: true });
    stage.addEventListener('pointerleave', resetPointer);
    reducedMotion.addEventListener('change', scheduleScroll);
    return () => {
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener('scroll', scheduleScroll);
      window.removeEventListener('resize', scheduleScroll);
      stage.removeEventListener('pointermove', onPointer);
      stage.removeEventListener('pointerleave', resetPointer);
      reducedMotion.removeEventListener('change', scheduleScroll);
      content.inert = false;
    };
  }, [contentRef]);

  useEffect(() => {
    const mount = mountRef.current;
    let disposed = false;
    let cleanup = () => {};

    // Keep the renderer in its own chunk. The entrance and links work while it loads.
    import('./lunar-three').then((THREE) => {
      if (disposed) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      } catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
      camera.position.z = 4.25;
      const geometry = new THREE.SphereGeometry(1, 128, 96);
      const material = new THREE.MeshStandardMaterial({ color: 0xe2e5f4, roughness: 1, metalness: 0, bumpScale: .028 });
      const moon = new THREE.Mesh(geometry, material);
      moon.rotation.set(.06, -Math.PI / 2, -.08);
      scene.add(moon);
      const sunlight = new THREE.DirectionalLight(0xe2e9ff, 3.2);
      sunlight.position.set(-3.3, 1.6, 3.5);
      scene.add(sunlight);
      scene.add(new THREE.AmbientLight(0x8291c3, .012));

      // Deterministic stars: a stable sky on resize and during React's development remounts.
      let seed = 731;
      const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      const starPositions = [], starSizes = [], starPhases = [];
      for (let i = 0; i < 5200; i++) {
        starPositions.push((random() - .5) * 30, (random() - .5) * 20, -2 - random() * 11);
        starSizes.push(i % 33 === 0 ? 2.5 + random() * 2 : .65 + random() * 1.65);
        starPhases.push(random() * Math.PI * 2);
      }
      const starsGeometry = new THREE.BufferGeometry();
      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
      starsGeometry.setAttribute('aSize', new THREE.Float32BufferAttribute(starSizes, 1));
      starsGeometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(starPhases, 1));
      const starsMaterial = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uPixelRatio: { value: renderer.getPixelRatio() }, uTime: { value: 0 } },
        vertexShader: `attribute float aSize; attribute float aPhase; varying float vAlpha; uniform float uPixelRatio; uniform float uTime;
          void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*p;
            gl_PointSize=aSize*uPixelRatio; vAlpha=(.26+aSize*.14)*(.78+.22*sin(uTime*.45+aPhase)); }`,
        fragmentShader: `varying float vAlpha; void main(){ float r=length(gl_PointCoord-.5);
          float alpha=(1.-smoothstep(.1,.5,r))*vAlpha; gl_FragColor=vec4(.78,.83,1.,alpha); }`,
      });
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);
      const loader = new THREE.TextureLoader();
      const textures = [];
      const loadTexture = (url, color) => loader.load(url, (texture) => {
        if (disposed) { texture.dispose(); return; }
        if (color) { texture.colorSpace = THREE.SRGBColorSpace; material.map = texture; }
        else { material.bumpMap = texture; }
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        material.needsUpdate = true;
        if (color) mount.classList.add('is-ready');
      }, undefined, () => {});
      textures.push(loadTexture(sitePath('assets/moon-color.jpg'), true), loadTexture(sitePath('assets/moon-height.jpg'), false));

      let frame = 0;
      let lastTime = 0;
      let visible = true;
      let contextAvailable = true;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const lightTarget = new THREE.Vector3();
      const resize = () => {
        const width = mount.clientWidth, height = mount.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / Math.max(height, 1);
        // Preserve the full lunar silhouette on portrait screens.
        camera.position.z = width < height * .85 ? 4.25 / Math.max(.5, camera.aspect) : 4.25;
        camera.updateProjectionMatrix();
      };
      resize();
      const render = (time) => {
        frame = 0;
        if (disposed || !visible || document.hidden || !contextAvailable) return;
        // Cap the scene at 30 fps; scroll styling stays on the browser's own refresh rate.
        if (time - lastTime >= 1000 / 30) {
          const delta = Math.min((time - lastTime) / 1000, .1);
          lastTime = time;
          const p = progressRef.current;
          const pointer = pointerRef.current;
          lightTarget.set(pointer.x * 7, pointer.y * 5, 2.5);
          sunlight.position.lerp(lightTarget, reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 7));
          const scale = reducedMotion.matches ? 1 : 1 - smooth(p / .85) * .2;
          moon.scale.setScalar(scale);
          moon.position.y = reducedMotion.matches ? 0 : p * .14;
          stars.position.x = reducedMotion.matches ? 0 : pointer.x * -.035;
          stars.position.y = reducedMotion.matches ? 0 : pointer.y * -.025;
          starsMaterial.uniforms.uTime.value = reducedMotion.matches ? 0 : time / 1000;
          // The globe stays fixed while only the light moves: the terminator follows the cursor.
          if (p < 1) renderer.render(scene, camera);
        }
        frame = requestAnimationFrame(render);
      };
      const resume = () => { if (!frame && visible && !document.hidden && contextAvailable) { lastTime = 0; frame = requestAnimationFrame(render); } };
      const visibilityChange = () => { cancelAnimationFrame(frame); frame = 0; resume(); };
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) resume();
        else { cancelAnimationFrame(frame); frame = 0; }
      });
      observer.observe(sectionRef.current);
      window.addEventListener('resize', resize);
      document.addEventListener('visibilitychange', visibilityChange);
      const contextLost = (event) => { event.preventDefault(); contextAvailable = false; cancelAnimationFrame(frame); frame = 0; mount.classList.remove('is-ready'); };
      const contextRestored = () => { contextAvailable = true; if (material.map) mount.classList.add('is-ready'); resume(); };
      renderer.domElement.addEventListener('webglcontextlost', contextLost);
      renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
      resume();
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('resize', resize);
        document.removeEventListener('visibilitychange', visibilityChange);
        renderer.domElement.removeEventListener('webglcontextlost', contextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
        textures.forEach((texture) => texture.dispose());
        geometry.dispose(); material.dispose(); starsGeometry.dispose(); starsMaterial.dispose();
        renderer.dispose(); renderer.domElement.remove();
        mount.classList.remove('is-ready');
      };
    }).catch(() => {});
    return () => { disposed = true; cleanup(); };
  }, []);

  const enter = () => {
    const target = contentRef.current;
    enterPending.current = true;
    // offsetTop is the layout position, unaffected by the reveal transform.
    window.scrollTo({ top: target.offsetTop, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  return <section className="lunar-entrance" ref={sectionRef} id="entrance" aria-labelledby="lunar-title">
    <div className="lunar-stage" ref={stageRef}>
      <div className="lunar-sky" aria-hidden="true" />
      <div className="lunar-renderer" ref={mountRef} aria-hidden="true"><img className="lunar-fallback" src={sitePath('assets/moon-fallback.png')} alt="" /></div>
      <div className="lunar-vignette" aria-hidden="true" />
      <header className="lunar-header"><span className="lunar-edition mono">PERSONAL PORTFOLIO<br /><span>SHANGHAI / 2026</span></span><a href="#entrance" className="lunar-wordmark" aria-label="孙嘉伟，入场首页">REVERIE<span>孙 嘉 伟 / SUN JIAWEI</span></a><a className="lunar-contact" href="#contact">联系我 <ArrowUpRight size={16} /></a></header>
      <div className="lunar-copy"><p className="lunar-kicker mono">MECHANICS. INTELLIGENCE. IMAGINATION.</p><h2 id="lunar-title">STAY CURIOUS.<br /><span>GO BEYOND THE KNOWN.</span></h2><p className="lunar-subtitle">以好奇为引力，探索未被定义的可能。</p></div>
      <div className="lunar-footer"><p className="lunar-instruction mono"><span className="lunar-light-dot" />MOVE YOUR CURSOR<br /><span>移动鼠标，改变月面的光照</span></p><button className="lunar-enter" onClick={enter}><span className="lunar-enter-circle"><ArrowDown size={20} strokeWidth={1.25} /></span><span>向下滚动，进入我的世界</span><span className="mono">SCROLL TO DISCOVER</span></button><a className="lunar-credit mono" href="https://svs.gsfc.nasa.gov/4720/" target="_blank" rel="noreferrer">LUNAR SURFACE<br /><span>NASA'S SCIENTIFIC VISUALIZATION STUDIO ↗</span></a></div>
    </div>
  </section>;
}
