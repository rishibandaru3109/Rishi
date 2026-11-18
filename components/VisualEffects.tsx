"use client";
import {useEffect,useRef} from "react";

export function HeroName({text,className}:{text:string;className?:string}) {
  const [first,...rest]=text.split(" ");
  const canvas=useRef<HTMLCanvasElement>(null);
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    const element=heading.current, view=canvas.current;
    if (!element || !view || motion.matches || location.hash || sessionStorage.getItem("wordmark")) return;
    const ctx=view.getContext("2d");
    if(!ctx) return;
    sessionStorage.setItem("wordmark","1");
    const {width,height}=element.getBoundingClientRect();
    view.width=width;
    view.height=height;
    const style=getComputedStyle(element);
    const size=parseFloat(style.fontSize);
    ctx.font=style.fontWeight+" "+size+"px "+style.fontFamily;
    ctx.letterSpacing=style.letterSpacing;
    ctx.fillText(first,0,size*.74);
    ctx.fillText(rest.join(" "),0,size*1.57);
    const pixels=ctx.getImageData(0,0,view.width,view.height).data;
    const points: { x: number; y: number; dx: number; dy: number }[] = [];
    for(let y=0;y<view.height;y+=4) for(let x=0;x<view.width;x+=4) {
      if(pixels[(y*view.width+x)*4+3]>128) points.push({x,y,dx:(Math.random()-.5)*175,dy:(Math.random()-.5)*115});
    }
    let frame=0;
    const start=performance.now();
    element.dataset.reveal="running";
    function tick(time:number){
      if(!ctx||!view||!element)return;
      const t=Math.min(1,(time-start)/1050);
      const ease=(1-t)**3;
      ctx.clearRect(0,0,view.width,view.height);
      ctx.fillStyle="#a3deff";
      for(const p of points) ctx.fillRect(p.x+p.dx*ease,p.y+p.dy*ease,1.8,1.8);
      if(t<1&&!motion.matches&&element.getBoundingClientRect().bottom>0)frame=requestAnimationFrame(tick);
      else delete element.dataset.reveal;
    }
    frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);delete element.dataset.reveal};
  },[first,rest.join(" ")]);
  return <h1 ref={heading} className={className} aria-label={text}><span className="heroLetters"><span>{first}</span><span>{rest.join(" ")}</span></span><canvas className="particleName" ref={canvas} aria-hidden="true"/></h1>;
}

const matrix=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
export function ProjectArt({src,alt}:{src:string;alt:string}) {
 const ref=useRef<HTMLCanvasElement>(null);
 const artwork=useRef<HTMLImageElement>(null);
 useEffect(() => {
   const image=artwork.current;
   const canvas=ref.current;
   if (!image || !canvas) return;
   function paint() {
     if (image && image.naturalWidth) dither(image);
   }
   image.addEventListener("load", paint);
   if (image.complete) paint();
   return () => image.removeEventListener("load", paint);
 }, [src]);
 function dither(image:HTMLImageElement){
   const canvas=ref.current;
   const ctx=canvas?.getContext("2d");
   if(!canvas||!ctx)return;
   canvas.height=Math.round(canvas.width*image.naturalHeight/image.naturalWidth);
   ctx.drawImage(image,0,0,canvas.width,canvas.height);
   const frame=ctx.getImageData(0,0,canvas.width,canvas.height);
   for(let y=0;y<canvas.height;y++) for(let x=0;x<canvas.width;x++){
     const i=(y*canvas.width+x)*4;
     const l=frame.data[i]*.2126+frame.data[i+1]*.7152+frame.data[i+2]*.0722;
     const bright=l/255>matrix[y%4*4+x%4]/19;
     frame.data.set(bright?[99,195,250,255]:[10,19,37,255],i);
   }
   ctx.putImageData(frame,0,0);
   canvas.dataset.ready="true";
 }
 return <><img ref={artwork} src={src} alt={alt} loading="lazy"/><canvas ref={ref} width={300} className="ditherLayer" aria-hidden="true"/></>;
}
