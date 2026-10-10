import { useEffect, useRef } from 'react';
import { sitePath } from './sitePath';

// A real Three.js stage for an existing project, loaded only as it approaches.
export default function Observatory() {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    const root = mount.closest('[data-sequence-scene]');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, started = false, visible = false, contextAvailable = true, frame = 0, target = 0, current = 0, previous = 0;
    let cleanupScene = () => {}, drawScene = () => {}, schedule = () => {};
    const start = async () => {
      if (started || motion.matches || innerWidth<980) return;
      started = true;
      try {
        const THREE = await import('./lunar-three');
        if (disposed) return;
        const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
        renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mount.append(renderer.domElement);
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#132039');
        scene.fog = new THREE.Fog('#132039',9,19);
        const camera = new THREE.PerspectiveCamera(40,1,.1,45);
        const resources = [], textures = [];
        const metal = new THREE.MeshStandardMaterial({color:0x7793b1,roughness:.55,metalness:.35});
        const stone = new THREE.MeshStandardMaterial({color:0x354b64,roughness:.93,metalness:.04});
        const night = new THREE.MeshStandardMaterial({color:0x111c2c,roughness:.62,metalness:.3});
        resources.push(metal,stone,night);
        const mesh = (geometry,material,x,y,z) => {
          const object = new THREE.Mesh(geometry,material);
          object.position.set(x,y,z); object.castShadow=true; object.receiveShadow=true;
          resources.push(geometry); scene.add(object); return object;
        };
        const floor = mesh(new THREE.PlaneGeometry(50,50),stone,0,-.5,0); floor.rotation.x=-Math.PI/2;
        mesh(new THREE.CylinderGeometry(1.35,1.48,.42,72),stone,1.2,-.28,0);
        mesh(new THREE.CylinderGeometry(.85,.9,.2,56),stone,-1.35,-.4,-1.1);
        const arch = mesh(new THREE.TorusGeometry(2.7,.07,16,128,Math.PI*1.7),metal,-1.1,1.55,-2.4); arch.rotation.z=-.62;
        const orbit = mesh(new THREE.TorusGeometry(3.8,.012,8,128),metal,0,-.44,0); orbit.rotation.x=Math.PI/2;
        [-3.8,-3.2,3.8,4.5].forEach((x,i) => mesh(new THREE.CylinderGeometry(.17,.2,2.5+i*.48,18),night,x,.8+i*.24,-3.4));
        const body = mesh(new THREE.BoxGeometry(2.75,1.72,.16),night,1.2,1.02,0);
        body.rotation.y=-.16;
        const screenMaterial = new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7,emissive:0xa2b6d8,emissiveIntensity:.42});
        resources.push(screenMaterial);
        const display = mesh(new THREE.PlaneGeometry(2.61,1.58),screenMaterial,1.186,1.02,.083);
        display.rotation.y=-.16;
        const loader = new THREE.TextureLoader();
        const texture = loader.load(sitePath('assets/星际躲避.gif'),loaded => {
          if (disposed) { loaded.dispose(); return; }
          loaded.colorSpace = THREE.SRGBColorSpace;
          screenMaterial.map = loaded; screenMaterial.emissiveMap = loaded; screenMaterial.needsUpdate=true;
          schedule();
        });
        textures.push(texture);
        // Quiet points sit at different depths rather than one flat star texture.
        const positions=[];
        let seed=2701;
        const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
        for(let i=0;i<260;i++) positions.push((random()-.5)*25,random()*10+1,-random()*13-3);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
        const pointMaterial = new THREE.PointsMaterial({color:0xc4d6ee,size:.022,transparent:true,opacity:.55,depthWrite:false});
        resources.push(geometry,pointMaterial);
        scene.add(new THREE.Points(geometry,pointMaterial));
        scene.add(new THREE.AmbientLight(0xaec4e5,.65));
        const light = new THREE.DirectionalLight(0xe0eaf9,3.1); light.position.set(-3,6,4); light.castShadow=true;
        light.shadow.mapSize.set(1024,1024); light.shadow.camera.left=-7; light.shadow.camera.right=7; light.shadow.camera.top=7; light.shadow.camera.bottom=-7; light.shadow.bias=-.0005;
        scene.add(light);
        const rim = new THREE.PointLight(0x82b5c9,13,15,2); rim.position.set(3,2.6,-2); scene.add(rim);
        const resize = () => {
          renderer.setSize(mount.clientWidth,mount.clientHeight);
          camera.aspect=mount.clientWidth/Math.max(1,mount.clientHeight); camera.updateProjectionMatrix(); schedule();
        };
        drawScene = p => {
          const t=p*p*(3-2*p);
          camera.position.set(-.25*t,2.6-1.05*t,9.5-4.8*t);
          camera.lookAt(-.25, .72+.36*t,0);
          body.rotation.z=display.rotation.z=(1-t)*-.025;
          arch.rotation.z=-.62+t*.12;
          renderer.render(scene,camera);
        };
        const render=time => {
          frame=0;
          if (!visible || disposed || !contextAvailable || document.hidden || motion.matches || innerWidth<980) return;
          const dt=Math.min((time-(previous||time-16))/1000,.05); previous=time;
          current+=(target-current)*(1-Math.exp(-dt*14));
          if(Math.abs(target-current)<.0001) current=target;
          drawScene(current);
          if(current!==target) frame=requestAnimationFrame(render);
        };
        schedule = () => {if(!frame&&visible&&!disposed&&contextAvailable&&!document.hidden&&!motion.matches&&innerWidth>=980){previous=0;frame=requestAnimationFrame(render);}};
        const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(mount);
        const lost=event=>{event.preventDefault();contextAvailable=false;cancelAnimationFrame(frame);frame=0;mount.classList.remove('is-ready');};
        const restored=()=>{contextAvailable=true;mount.classList.add('is-ready');schedule();};
        renderer.domElement.addEventListener('webglcontextlost',lost); renderer.domElement.addEventListener('webglcontextrestored',restored);
        mount.classList.add('is-ready'); mount.dataset.rendererReady='true';
        resize(); schedule();
        cleanupScene=()=>{
          resizeObserver.disconnect(); textures.forEach(item=>item.dispose()); resources.forEach(item=>item.dispose());
          light.shadow.map?.dispose(); renderer.domElement.removeEventListener('webglcontextlost',lost); renderer.domElement.removeEventListener('webglcontextrestored',restored);
          renderer.dispose(); renderer.domElement.remove(); mount.classList.remove('is-ready');
        };
      } catch { mount.dataset.rendererReady='fallback'; }
    };
    const onProgress=event=>{ target=event.detail.progress; schedule(); };
    root.addEventListener('sceneprogress',onProgress);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){start();schedule();}else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'100px',threshold:0});
    observer.observe(mount);
    const visibility=()=>{cancelAnimationFrame(frame);frame=0;if(!document.hidden)schedule();};
    const onMotion=()=>{cancelAnimationFrame(frame);frame=0;if(!motion.matches){start();schedule();}};
    const onResize=()=>{if(visible){start();schedule();}};
    document.addEventListener('visibilitychange',visibility); motion.addEventListener('change',onMotion);
    window.addEventListener('resize',onResize);
    return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();root.removeEventListener('sceneprogress',onProgress);document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',onMotion);window.removeEventListener('resize',onResize);cleanupScene();};
  },[]);
  return <div className="observatory-renderer" ref={mountRef} aria-hidden="true"><div className="observatory-fallback"><div className="fallback-arch"/><div className="fallback-plinth"/><img src={sitePath('assets/星际躲避.gif')} alt="" loading="lazy"/></div></div>;
}
