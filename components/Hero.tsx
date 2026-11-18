"use client";

import { useEffect, useState } from "react";
import { person } from "@/data/site";
import { HeroName } from "./VisualEffects";
import SignalKnot from "./SignalKnot";

export default function Hero() {
  const [arrival, setArrival] = useState(false);

  useEffect(() => {
    if (location.hash || scrollY > 20 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem("arrival")) return;
      sessionStorage.setItem("arrival", "1");
    } catch {}
    setArrival(true);
    const dismiss = () => {
      if (scrollY > 30) setArrival(false);
    };
    const timeout = setTimeout(() => setArrival(false), 6000);
    addEventListener("scroll", dismiss, { passive: true });
    return () => {
      clearTimeout(timeout);
      removeEventListener("scroll", dismiss);
    };
  }, []);

  return <section id="home" className="motion-hero" data-scroll-scene data-pinned>
    <div className="hero-stage">
      <div className="hero-atmosphere" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <SignalKnot />
      <div className="hero-content">
        <HeroName text={person.name.toUpperCase()} className="heroName" />
        <div className="hero-introduction">
          <p className="tag">{person.tagline}</p>
          <p className="introtext">{person.intro}</p>
          <div className="actions">
            <a className="primary" href="#projects">Explore projects <span aria-hidden="true">↓</span></a>
            <a className="github" href={person.github}>GitHub ↗</a>
          </div>
        </div>
      </div>
      <div className="hero-next" aria-hidden="true">Selected<br />projects.</div>
      <a className="scroll-invitation" href="#projects"><span aria-hidden="true">↓</span> Scroll to explore</a>
      {arrival && <div className="arrival-actions">
        <button onClick={() => { setArrival(false); window.scrollTo({ top: innerHeight * .23, behavior: "smooth" }); }}>Enter ↓</button>
        <button onClick={() => setArrival(false)}>Skip intro</button>
      </div>}
    </div>
  </section>;
}
