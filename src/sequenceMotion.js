export const clamp = value => Math.max(0, Math.min(1, value));
export const smooth = value => { const t = clamp(value); return t*t*(3-2*t); };
const mix = (a,b,t) => a+(b-a)*t;

// Cache scene nodes once; only visible scenes paint as the native scroll advances.
export function scenePainter(root) {
  if (!root) return () => {};
  const kind = root.dataset.sequenceScene;
  const gate = root.querySelector('.scene-gate');
  const panels = [...root.querySelectorAll('.story-panel')];
  const frames = [...root.querySelectorAll('.flying-frame')].map(element => ({ element, vector: element.dataset.vector.split(',').map(Number), delay:Number(element.dataset.delay), life:Number(element.dataset.life), size:Number(element.dataset.size) }));
  const stars = [...root.querySelectorAll('.depth-star')];
  const markers = [...root.querySelectorAll('.story-progress i')];
  const copy = root.querySelector('.flight-copy');
  let last = -1, lastWidth = 0, lastHeight = 0, wasStatic = false;
  return (progress,width,height,staticMode = false) => {
    if (progress === last && width === lastWidth && height === lastHeight && staticMode === wasStatic) return;
    last = progress; lastWidth = width; lastHeight = height; wasStatic = staticMode;
    root.style.setProperty('--scene-progress',progress.toFixed(5));
    root.dispatchEvent(new CustomEvent('sceneprogress',{detail:{progress,staticMode}}));
    if (kind === 'prologue') {
      const expand = smooth((progress-.79)/.21);
      const grow = smooth(progress/.13);
      const fixedRadius = Math.min(width*.29,height*.43);
      const radius = mix(mix(28,fixedRadius,grow),Math.hypot(width,height)*.7,expand);
      gate.style.width = gate.style.height = `${radius*2}px`;
      gate.style.backgroundColor = `rgb(${Math.round(mix(222,31,expand))} ${Math.round(mix(233,51,expand))} ${Math.round(mix(244,73,expand))})`;
      gate.style.opacity = staticMode ? '0' : '1';
      panels.forEach((panel,index) => {
        const enter = smooth((progress-(.10+index*.22))/.06);
        const leave = smooth((progress-(.29+index*.22))/.065);
        const opacity = staticMode ? 1 : enter*(1-leave);
        panel.style.opacity = opacity.toFixed(4);
        panel.style.transform = staticMode ? 'none' : `translateY(${(1-enter)*22-leave*20}px)`;
        panel.setAttribute('aria-hidden',staticMode || opacity>.45 ? 'false' : 'true');
        markers[index].style.opacity = opacity>.4 ? '1' : '.22';
      });
      frames.forEach(({element,vector:[x,y,rotation],size},index) => {
        const p = smooth((progress-.76-index*.008)/.20);
        element.style.transform = `translate(-50%,-50%) translate3d(${x*width*.38*p}px,${y*height*.43*p}px,${mix(-500,30,p)}px) rotate(${rotation*p}deg) scale(${size})`;
        element.style.opacity = staticMode ? '0' : (smooth(p/.3)*.7).toFixed(4);
      });
    }
    if (kind === 'flight') {
      frames.forEach(({element,vector:[x,y,rotation],delay,life,size},index) => {
        // A single, staggered appearance for each drawing; no recycled icons.
        const t = clamp((progress-delay)/life);
        const spread = mix(.24,1.3,smooth(t));
        const sway = Math.sin(t*Math.PI)*(index%2?1:-1);
        element.style.transform = `translate(-50%,-50%) translate3d(${x*width*.31*spread+sway*width*.025}px,${y*height*.37*spread}px,${mix(-850,320,t)}px) rotateZ(${rotation+sway*7}deg) rotateY(${x*-8}deg) scale(${size})`;
        element.style.opacity = staticMode ? '0' : (smooth(t/.16)*(1-smooth((t-.72)/.28))*.64).toFixed(4);
      });
      stars.forEach((star,index) => {
        const t = (progress*1.25+index*.173)%1;
        const angle = Number(star.dataset.angle);
        const radius = mix(18,Math.hypot(width,height)*.76,t*t);
        star.style.transform = `translate(${Math.cos(angle)*radius}px,${Math.sin(angle)*radius*.7}px) rotate(${angle*180/Math.PI}deg) scaleX(${1+t*4})`;
        star.style.opacity = staticMode ? '0' : (smooth(t/.1)*(1-smooth((t-.88)/.12))*.55).toFixed(4);
      });
      copy.style.opacity = staticMode ? '1' : (1-smooth((progress-.82)/.18)).toFixed(4);
      copy.style.transform = staticMode ? 'none' : `translateY(${mix(15,-18,smooth(progress))}px)`;
    }
  };
}
