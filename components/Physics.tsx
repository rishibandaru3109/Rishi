"use client";

import { useEffect, useRef, useState } from "react";

const colors = ["#5be8ff", "#a3acff", "#e9f8ff", "#8f80ff"];
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export default function Physics() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [version, reset] = useState(0);

  useEffect(() => {
    const view = canvas.current;
    const ctx = view?.getContext("2d");
    if (!view || !ctx) return;

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const bodies = colors.map((color, index) => ({ color, index, x: 0, y: 0, vx: 0, vy: 0 }));
    let width = 0, height = 0, radius = 16, selected = -1, previous = 0, frame = 0;
    let visible = false;
    let dropped = version > 0;
    let pointer: number | null = null;
    const floor = () => height - 38;

    function bumpers() {
      return [[width * .31, height * .50], [width * .66, height * .65]];
    }

    function draw(time: number) {
      frame = 0;
      if (!ctx || !width) return;
      const dt = clamp((time - previous) / 16.67, 0, 1.6);
      previous = time;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#0d2336";
      ctx.fillRect(0, floor(), width, height - floor());
      ctx.strokeStyle = "#73cfff88";
      ctx.beginPath();
      ctx.moveTo(0, floor());
      ctx.lineTo(width, floor());
      ctx.stroke();

      for (const [x, y] of bumpers()) {
        ctx.beginPath();
        ctx.arc(x, y, radius * .63, 0, 2 * Math.PI);
        ctx.fillStyle = "#132f48";
        ctx.fill();
        ctx.stroke();
      }

      let moving = false;
      for (const body of bodies) {
        if (body.index !== selected && !motion.matches) {
          body.vy += .61 * dt;
          body.x += body.vx * dt;
          body.y += body.vy * dt;
          for (const [x, y] of bumpers()) {
            const dx = body.x - x, dy = body.y - y;
            const distance = Math.hypot(dx, dy);
            const minimum = radius * 1.63;
            if (distance > 0 && distance < minimum) {
              const nx = dx / distance, ny = dy / distance;
              body.x = x + nx * minimum;
              body.y = y + ny * minimum;
              const impact = body.vx * nx + body.vy * ny;
              if (impact < 0) {
                body.vx -= 1.65 * impact * nx;
                body.vy -= 1.65 * impact * ny;
                if (Math.abs(body.vx) < .4) body.vx = body.index % 2 ? 1.1 : -1.1;
              }
            }
          }
          if (body.x < radius || body.x > width - radius) {
            body.x = clamp(body.x, radius, width - radius);
            body.vx *= -.6;
          }
          if (body.y > floor() - radius) {
            body.y = floor() - radius;
            body.vy = body.vy > 2.1 ? -body.vy * .65 : 0;
            body.vx *= .77;
            if (Math.abs(body.vx) < .1) body.vx = 0;
          }
          moving ||= Math.abs(body.vx) > 0 || Math.abs(body.vy) > 0 || body.y < floor() - radius;
        }
        const halo = ctx.createRadialGradient(body.x, body.y, 1, body.x, body.y, radius * 3.5);
        halo.addColorStop(0, body.color + "60");
        halo.addColorStop(1, body.color + "00");
        ctx.fillStyle = halo;
        ctx.fillRect(body.x - radius * 4, body.y - radius * 4, radius * 8, radius * 8);
        ctx.fillStyle = body.color;
        ctx.strokeStyle = "#eafdff";
        ctx.beginPath();
        if (body.index % 2) {
          ctx.roundRect(body.x - radius * .78, body.y - radius * .78, radius * 1.56, radius * 1.56, 5);
        } else {
          ctx.arc(body.x, body.y, radius * .88, 0, 2 * Math.PI);
        }
        ctx.fill();
        ctx.stroke();
      }
      if (moving && visible && !motion.matches) frame = requestAnimationFrame(draw);
    }

    function schedule() {
      if (frame || !visible) return;
      previous = performance.now();
      frame = requestAnimationFrame(draw);
    }

    function size() {
      if (!view || !ctx) return;
      const oldWidth = width, oldHeight = height;
      width = view.clientWidth;
      height = view.clientHeight;
      if (!width || !height) return;
      radius = clamp(width / 35, 13, 23);
      const dpr = Math.min(devicePixelRatio, 1.75);
      view.width = Math.round(width * dpr);
      view.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const body of bodies) {
        body.x = oldWidth ? body.x * width / oldWidth : width * (.14 + body.index * .24);
        body.y = oldHeight ? body.y * height / oldHeight
          : (dropped && !motion.matches) ? height * (.19 + (body.index % 2) * .14) : floor() - radius;
      }
      schedule();
    }

    function position(event: PointerEvent) {
      const bounds = view!.getBoundingClientRect();
      return [(event.clientX - bounds.left) * width / bounds.width, (event.clientY - bounds.top) * height / bounds.height];
    }

    function grab(event: PointerEvent) {
      if (pointer !== null) return;
      const [x, y] = position(event);
      selected = bodies.findIndex(body => Math.hypot(body.x - x, body.y - y) < radius + 12);
      if (selected >= 0) {
        pointer = event.pointerId;
        view?.setPointerCapture(pointer);
      }
    }

    function drag(event: PointerEvent) {
      if (pointer !== event.pointerId || selected < 0) return;
      const [x, y] = position(event);
      Object.assign(bodies[selected], { x: clamp(x, radius, width - radius), y: clamp(y, radius, floor() - radius), vx: 0, vy: 0 });
      schedule();
    }

    function drop() {
      if (selected >= 0 && motion.matches) bodies[selected].y = floor() - radius;
      selected = -1;
      pointer = null;
      schedule();
    }

    const resize = new ResizeObserver(size);
    resize.observe(view);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else { cancelAnimationFrame(frame); frame = 0; }
    });
    intersection.observe(view);
    view.addEventListener("pointerdown", grab);
    view.addEventListener("pointermove", drag);
    view.addEventListener("lostpointercapture", drop);
    motion.addEventListener("change", schedule);
    return () => {
      resize.disconnect();
      intersection.disconnect();
      cancelAnimationFrame(frame);
      view.removeEventListener("pointerdown", grab);
      view.removeEventListener("pointermove", drag);
      view.removeEventListener("lostpointercapture", drop);
      motion.removeEventListener("change", schedule);
    };
  }, [version]);

  return <div className="gravity">
    <div className="gravity-controls">
      <p>Lift a shape and drop it past the bumpers.</p>
      <button onClick={() => reset(value => value + 1)}>Reset and drop ↻</button>
    </div>
    <canvas ref={canvas} aria-label="Gravity experiment with four draggable shapes and two bumpers" />
  </div>;
}
