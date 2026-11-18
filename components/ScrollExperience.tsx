"use client";

import { useEffect, type ReactNode } from "react";

export default function ScrollExperience({ children }: { children: ReactNode }) {
  useEffect(() => {
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-scene]"));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    function update() {
      frame = 0;
      for (const scene of scenes) {
        if (reduced.matches) {
          scene.style.removeProperty("--scene");
          continue;
        }
        const bounds = scene.getBoundingClientRect();
        const pinned = scene.hasAttribute("data-pinned");
        const offset = pinned ? 0 : innerHeight * .75;
        const available = document.documentElement.scrollHeight - innerHeight - (scrollY + bounds.top - offset);
        const distance = Math.min(pinned ? bounds.height - innerHeight : bounds.height, available);
        const progress = Math.max(0, Math.min(1, (offset - bounds.top) / Math.max(1, distance)));
        const value = progress.toFixed(4);
        if (scene.style.getPropertyValue("--scene") === value) continue;
        scene.style.setProperty("--scene", value);
        if (bounds.bottom > 0 && bounds.top < innerHeight) {
          scene.dispatchEvent(new CustomEvent("scene-progress", { detail: progress }));
        }
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, []);

  return <main id="main" className="experience">{children}</main>;
}
