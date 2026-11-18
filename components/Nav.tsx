"use client";
import {useEffect,useState} from "react";
import {navigation} from "@/data/site";
export function Brand(){return <a className="brand" href="/#home" aria-label="Rishi Bandaru home"><span className="logomark" aria-hidden>✳</span> Rishi Bandaru<span className="branddot">.</span></a>}
export default function Nav(){const [open,set]=useState(false),[active,select]=useState("home"),[progress,setProgress]=useState(0);
useEffect(()=>{function update(){const sections=navigation.map(([,id])=>document.getElementById(id)).filter(e=>!!e);select(sections.filter(e=>e.getBoundingClientRect().top<=innerHeight*.45).pop()?.id??"home");setProgress(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight));} update();addEventListener("scroll",update,{passive:true});return()=>removeEventListener("scroll",update)},[]);
return <header><div className="navinner"><Brand/><button className="menuToggle" aria-expanded={open} aria-controls="navlinks" onClick={()=>set(!open)}>{open?"Close ×":"Menu ☰"}</button><nav id="navlinks" className={open?"open":""} aria-label="Primary">{navigation.map(([label,id])=><a key={id} className={active===id?"current":""} href={"/#"+id} onClick={()=>set(false)}>{label}</a>)}</nav><a className="contactTop" href="/#contact">Get in touch ↗</a></div><i className="progress" style={{transform:"scaleX("+progress+")"}}/></header>}
