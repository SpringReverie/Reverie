import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './LightPointer.css';

export default function LightPointer() {
  const pointerRef=useRef(null);
  useEffect(()=>{
    const node=pointerRef.current, fine=matchMedia('(any-pointer: fine)'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0, shown=false, dialog=null;
    let x=0,y=0,targetX=0,targetY=0,previous=0;
    const paint=time=>{
      frame=0;
      const dt=Math.min(40,Math.max(1,time-previous)); previous=time;
      const blend=reduced.matches?1:1-Math.exp(-dt/18);
      x+=(targetX-x)*blend; y+=(targetY-y)*blend;
      node.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      if (shown && Math.hypot(targetX-x,targetY-y)>.1) frame=requestAnimationFrame(paint);
    };
    const hide=()=>{
      shown=false; cancelAnimationFrame(frame); frame=0;
      node.classList.remove('is-visible','is-down','is-action');
      document.documentElement.classList.remove('lunar-pointer-enabled');
      if (node.hidePopover && node.matches(':popover-open')) node.hidePopover();
    };
    const move=event=>{
      if (!fine.matches || event.pointerType==='touch') { hide(); return; }
      const nextDialog=document.querySelector('dialog[open]');
      // Re-enter the top layer after a gallery opens, keeping the pointer visible.
      if (node.showPopover && (!shown || nextDialog!==dialog)) {
        if (node.matches(':popover-open')) node.hidePopover();
        node.showPopover();
      } else if (!node.showPopover && nextDialog) { hide(); return; }
      dialog=nextDialog;
      targetX=event.clientX; targetY=event.clientY;
      if (!shown) { x=targetX; y=targetY; previous=performance.now(); }
      shown=true;
      node.classList.add('is-visible');
      document.documentElement.classList.add('lunar-pointer-enabled');
      node.classList.toggle('is-action',Boolean(event.target.closest?.('a,button,input,textarea,select,[role="button"],.hero-tech-line,.infinite-spiral')));
      if (!frame) frame=requestAnimationFrame(paint);
    };
    const down=event=>{ if (event.pointerType!=='touch' && shown) node.classList.add('is-down'); };
    const up=()=>node.classList.remove('is-down');
    const leave=event=>{ if (!event.relatedTarget) hide(); };
    const visibility=()=>{ if (document.hidden) hide(); };
    document.addEventListener('pointermove',move,{passive:true});
    document.addEventListener('pointerdown',down,{passive:true});
    document.addEventListener('pointerup',up,{passive:true});
    document.addEventListener('pointercancel',hide,{passive:true});
    document.addEventListener('pointerout',leave,{passive:true});
    document.addEventListener('visibilitychange',visibility);
    window.addEventListener('blur',hide); fine.addEventListener('change',hide);
    return ()=>{
      hide();
      document.removeEventListener('pointermove',move); document.removeEventListener('pointerdown',down);
      document.removeEventListener('pointerup',up); document.removeEventListener('pointercancel',hide);
      document.removeEventListener('pointerout',leave); document.removeEventListener('visibilitychange',visibility);
      window.removeEventListener('blur',hide); fine.removeEventListener('change',hide);
    };
  },[]);
  return createPortal(<div ref={pointerRef} className="lunar-pointer" popover="manual" aria-hidden="true"><i className="lunar-pointer-ring"/><i className="lunar-pointer-core"/></div>,document.body);
}
