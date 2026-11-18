"use client";

import { useEffect, useRef } from "react";

const tau = 2 * Math.PI;
const segments = 144;
const strands = 11;
const angles = Array.from({ length: segments + 1 }, (_, index) => index / segments * tau);

export default function SignalKnot() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const view = canvas.current;
    const scene = view?.closest<HTMLElement>("[data-scroll-scene]");
    const rig = view?.parentElement;
    const context = view?.getContext("2d");
    if (!view || !scene || !rig || !context) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let progress = 0;
    let pitch = 0;
    let yaw = 0;
    let targetX = 0;
    let targetY = 0;
    let width = 0;
    let height = 0;
    let visible = true;

    function draw() {
      frame = 0;
      if (!visible || motion.matches || !context || !width || !height) return;
      pitch += (targetY - pitch) * .16;
      yaw += (targetX - yaw) * .16;
      context.clearRect(0, 0, width, height);
      const scale = Math.min(width, height) * .30;
      const ay = -.54 + progress * 4.15 + yaw;
      const ax = .34 + progress * 1.1 + pitch;
      const cy = Math.cos(ay), sy = Math.sin(ay);
      const cx = Math.cos(ax), sx = Math.sin(ax);

      for (let strand = 0; strand < strands; strand++) {
        const phase = strand / strands * tau;
        context.beginPath();
        for (const [index, t] of angles.entries()) {
          const braid = 5 * t + phase;
          const radius = .81 + (.26 - .16 * progress) * Math.cos(3 * t) + .10 * Math.cos(braid);
          const x = radius * Math.cos(2 * t);
          const y = radius * Math.sin(2 * t);
          const z = (.31 + .21 * progress) * Math.sin(3 * t) + .10 * Math.sin(braid);
          const rx = x * cy + z * sy;
          const rz = z * cy - x * sy;
          const ry = y * cx - rz * sx;
          const depth = 2.8 / (2.8 - (y * sx + rz * cx));
          const px = width * .5 + rx * scale * depth;
          const py = height * .5 + ry * scale * depth;
          if (index) context.lineTo(px, py);
          else context.moveTo(px, py);
        }
        context.lineWidth = strand % 4 === 0 ? 1.55 : .85;
        context.strokeStyle = strand % 4 === 0 ? "#cbfbff" : "rgba(88, 173, 255, .63)";
        context.stroke();
      }
      view?.setAttribute("data-drawn", "true");
      if (Math.abs(targetY - pitch) + Math.abs(targetX - yaw) > .002) schedule();
    }

    function schedule() {
      if (!frame && visible && !motion.matches) frame = requestAnimationFrame(draw);
    }

    function resize() {
      if (!view || !context) return;
      width = view.clientWidth;
      height = view.clientHeight;
      const dpr = Math.min(devicePixelRatio, 1.5);
      view.width = width * dpr;
      view.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      schedule();
    }

    function track(event: PointerEvent) {
      if (!rig || event.pointerType !== "mouse" || motion.matches) return;
      const bounds = rig.getBoundingClientRect();
      targetX = (event.clientX - bounds.left - bounds.width / 2) / bounds.width * .9;
      targetY = (event.clientY - bounds.top - bounds.height / 2) / bounds.height * -.9;
      schedule();
    }

    function reset() {
      targetX = 0;
      targetY = 0;
      schedule();
    }

    function scrub(event: Event) {
      progress = (event as CustomEvent<number>).detail;
      schedule();
    }

    const size = new ResizeObserver(resize);
    size.observe(view);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        progress = Number(scene.style.getPropertyValue("--scene"));
        schedule();
      }
    });
    intersection.observe(rig);
    scene.addEventListener("scene-progress", scrub);
    rig.addEventListener("pointermove", track);
    rig.addEventListener("pointerleave", reset);
    motion.addEventListener("change", reset);

    return () => {
      cancelAnimationFrame(frame);
      size.disconnect();
      intersection.disconnect();
      scene.removeEventListener("scene-progress", scrub);
      rig.removeEventListener("pointermove", track);
      rig.removeEventListener("pointerleave", reset);
      motion.removeEventListener("change", reset);
    };
  }, []);

  return <div className="knot" aria-hidden="true">
    <img src="/art/sculpture.webp" alt="" fetchPriority="high" />
    <canvas ref={canvas} />
  </div>;
}
