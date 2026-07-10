"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide animated background: a slow, multi-attractor phase portrait.
 *
 * The velocity field is a superposition of several Lyapunov-stable spiral
 * attractors (alternating rotation senses), producing a rich portrait with
 * multiple basins of attraction rather than a single whirlpool. Motion is
 * deliberately slow and low-contrast for gravitas and to avoid motion
 * sickness; a readability scrim protects the central text column.
 *
 * Two layers ride the field:
 *   1. Long, faint streamline traces of the flow.
 *   2. A small number of vector line-art "agents" (quadrotor, ground robot,
 *      satellite, manipulator, surface vessel, comm relay) drawn as crisp
 *      monoline glyphs, drifting along the current.
 */

const GOLD: [number, number, number] = [244, 197, 66];
const PURPLE: [number, number, number] = [169, 140, 230];

// --------------------------------------------------------------------------
// Vector line-art glyphs (monoline, drawn in local coords around the origin)
// --------------------------------------------------------------------------

type GlyphFn = (ctx: CanvasRenderingContext2D, s: number) => void;

const drawQuadrotor: GlyphFn = (ctx, s) => {
  const arm = 0.62 * s;
  const rotor = 0.3 * s;
  ctx.beginPath();
  ctx.moveTo(-arm, -arm); ctx.lineTo(arm, arm);
  ctx.moveTo(-arm, arm); ctx.lineTo(arm, -arm);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 0.18 * s, 0, Math.PI * 2);
  ctx.stroke();
  for (const [dx, dy] of [[-arm, -arm], [arm, -arm], [-arm, arm], [arm, arm]]) {
    ctx.beginPath();
    ctx.arc(dx, dy, rotor, 0, Math.PI * 2);
    ctx.stroke();
  }
};

const drawRover: GlyphFn = (ctx, s) => {
  ctx.beginPath();
  ctx.moveTo(-0.7 * s, -0.1 * s);
  ctx.lineTo(-0.5 * s, -0.4 * s);
  ctx.lineTo(0.5 * s, -0.4 * s);
  ctx.lineTo(0.7 * s, -0.1 * s);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0.15 * s, -0.4 * s); ctx.lineTo(0.15 * s, -0.72 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0.15 * s, -0.8 * s, 0.09 * s, 0, Math.PI * 2);
  ctx.stroke();
  for (const dx of [-0.45, 0, 0.45]) {
    ctx.beginPath();
    ctx.arc(dx * s, 0.08 * s, 0.2 * s, 0, Math.PI * 2);
    ctx.stroke();
  }
};

const drawSatellite: GlyphFn = (ctx, s) => {
  ctx.strokeRect(-0.22 * s, -0.3 * s, 0.44 * s, 0.6 * s);
  ctx.beginPath();
  ctx.moveTo(-0.22 * s, 0); ctx.lineTo(-0.4 * s, 0);
  ctx.moveTo(0.22 * s, 0); ctx.lineTo(0.4 * s, 0);
  ctx.stroke();
  for (const side of [-1, 1]) {
    const x0 = side * 0.4 * s;
    const x1 = side * 0.95 * s;
    ctx.strokeRect(Math.min(x0, x1), -0.26 * s, Math.abs(x1 - x0), 0.52 * s);
    for (const f of [1 / 3, 2 / 3]) {
      const xm = x0 + (x1 - x0) * f;
      ctx.beginPath();
      ctx.moveTo(xm, -0.26 * s); ctx.lineTo(xm, 0.26 * s);
      ctx.stroke();
    }
  }
  ctx.beginPath();
  ctx.arc(0, -0.44 * s, 0.14 * s, Math.PI * 0.15, Math.PI * 0.85, true);
  ctx.stroke();
};

const drawManipulator: GlyphFn = (ctx, s) => {
  ctx.beginPath();
  ctx.moveTo(-0.42 * s, 0.62 * s); ctx.lineTo(0.42 * s, 0.62 * s);
  ctx.stroke();
  ctx.strokeRect(-0.2 * s, 0.42 * s, 0.4 * s, 0.2 * s);
  ctx.beginPath();
  ctx.moveTo(0, 0.42 * s);
  ctx.lineTo(-0.28 * s, -0.05 * s);
  ctx.lineTo(0.22 * s, -0.42 * s);
  ctx.stroke();
  for (const [jx, jy] of [[0, 0.42], [-0.28, -0.05]]) {
    ctx.beginPath();
    ctx.arc(jx * s, jy * s, 0.08 * s, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0.22 * s, -0.42 * s); ctx.lineTo(0.42 * s, -0.56 * s);
  ctx.moveTo(0.22 * s, -0.42 * s); ctx.lineTo(0.44 * s, -0.34 * s);
  ctx.stroke();
};

const drawVessel: GlyphFn = (ctx, s) => {
  ctx.beginPath();
  ctx.moveTo(-0.7 * s, -0.05 * s);
  ctx.lineTo(0.7 * s, -0.05 * s);
  ctx.lineTo(0.45 * s, 0.3 * s);
  ctx.lineTo(-0.5 * s, 0.3 * s);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeRect(-0.25 * s, -0.32 * s, 0.42 * s, 0.27 * s);
  ctx.beginPath();
  ctx.moveTo(-0.04 * s, -0.32 * s); ctx.lineTo(-0.04 * s, -0.6 * s);
  ctx.stroke();
};

const drawRelay: GlyphFn = (ctx, s) => {
  ctx.beginPath();
  ctx.moveTo(-0.26 * s, 0.6 * s); ctx.lineTo(0, -0.35 * s);
  ctx.lineTo(0.26 * s, 0.6 * s);
  ctx.moveTo(-0.15 * s, 0.2 * s); ctx.lineTo(0.15 * s, 0.2 * s);
  ctx.stroke();
  for (const r of [0.22, 0.38]) {
    ctx.beginPath();
    ctx.arc(0, -0.42 * s, r * s, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, -0.42 * s, 0.05 * s, 0, Math.PI * 2);
  ctx.stroke();
};

const GLYPHS: GlyphFn[] = [
  drawQuadrotor,
  drawRover,
  drawSatellite,
  drawManipulator,
  drawVessel,
  drawRelay,
];

// --------------------------------------------------------------------------

type Attractor = {
  fx: number;
  fy: number;
  x: number;
  y: number;
  swirl: number;
  decay: number;
  strength: number;
};

type Particle = {
  x: number;
  y: number;
  trail: Array<{ x: number; y: number }>;
  hue: number;
  life: number;
  maxLife: number;
};

type Agent = {
  x: number;
  y: number;
  glyph: GlyphFn;
  size: number;
  heading: number;
  life: number;
  maxLife: number;
};

export default function SiteBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Multiple stable spiral attractors with alternating rotation senses,
    // placed toward the page margins so the reading column stays calm.
    const attractors: Attractor[] = [
      { fx: 0.14, fy: 0.22, x: 0, y: 0, swirl: 0.55, decay: 0.16, strength: 1.0 },
      { fx: 0.88, fy: 0.30, x: 0, y: 0, swirl: -0.48, decay: 0.14, strength: 0.9 },
      { fx: 0.20, fy: 0.85, x: 0, y: 0, swirl: -0.5, decay: 0.15, strength: 0.85 },
      { fx: 0.82, fy: 0.88, x: 0, y: 0, swirl: 0.45, decay: 0.13, strength: 0.9 },
    ];

    // Global tempo: deliberately slow, unhurried drift.
    const SPEED = 0.55;
    const CAPTURE_R = 26;

    // Blended velocity field: inverse-square-weighted sum of spiral flows.
    const field = (px: number, py: number) => {
      let vx = 0;
      let vy = 0;
      for (const a of attractors) {
        const dx = px - a.x;
        const dy = py - a.y;
        const d2 = dx * dx + dy * dy + 8000;
        const w = (a.strength * 90000) / d2;
        vx += w * (-a.decay * dx - a.swirl * dy) * 0.01;
        vy += w * (a.swirl * dx - a.decay * dy) * 0.01;
      }
      // Soft speed cap for uniform, calm motion everywhere.
      const mag = Math.hypot(vx, vy) || 1;
      const capped = Math.min(mag, 1.6);
      return { vx: (vx / mag) * capped, vy: (vy / mag) * capped };
    };

    const particles: Particle[] = [];
    const agents: Agent[] = [];

    const spawnPoint = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
    });

    const nearAttractor = (x: number, y: number) =>
      attractors.some((a) => Math.hypot(x - a.x, y - a.y) < CAPTURE_R);

    const makeParticle = (): Particle => {
      const p = spawnPoint();
      return {
        x: p.x,
        y: p.y,
        trail: [],
        hue: Math.random(),
        life: 0,
        maxLife: 700 + Math.random() * 700,
      };
    };

    const makeAgent = (): Agent => {
      const p = spawnPoint();
      return {
        x: p.x,
        y: p.y,
        glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        size: 15 + Math.random() * 9,
        heading: 0,
        life: 0,
        maxLife: 1400 + Math.random() * 900,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const a of attractors) {
        a.x = a.fx * width;
        a.y = a.fy * height;
      }
    };

    const populate = () => {
      particles.length = 0;
      agents.length = 0;
      const area = width * height;
      const particleCount = Math.round(Math.min(110, Math.max(50, area / 18000)));
      const agentCount = Math.round(Math.min(9, Math.max(5, area / 260000)));

      for (let i = 0; i < particleCount; i++) {
        const p = makeParticle();
        const warm = Math.floor(Math.random() * 300);
        for (let k = 0; k < warm; k++) {
          const v = field(p.x, p.y);
          p.x += v.vx * SPEED;
          p.y += v.vy * SPEED;
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 34) p.trail.shift();
          p.life++;
        }
        particles.push(p);
      }
      for (let i = 0; i < agentCount; i++) {
        const a = makeAgent();
        const warm = Math.floor(Math.random() * 400);
        for (let k = 0; k < warm; k++) {
          const v = field(a.x, a.y);
          a.x += v.vx * SPEED;
          a.y += v.vy * SPEED;
          a.life++;
        }
        agents.push(a);
      }
    };

    resize();
    populate();

    const updateParticle = (p: Particle) => {
      const v = field(p.x, p.y);
      p.x += v.vx * SPEED;
      p.y += v.vy * SPEED;
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 34) p.trail.shift();
      p.life++;
      if (p.life > p.maxLife || nearAttractor(p.x, p.y)) {
        Object.assign(p, makeParticle());
      }
    };

    const updateAgent = (a: Agent) => {
      const v = field(a.x, a.y);
      a.x += v.vx * SPEED * 0.8; // agents drift slightly slower than the flow
      a.y += v.vy * SPEED * 0.8;
      const target = Math.atan2(v.vy, v.vx);
      let diff = target - a.heading;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      a.heading += diff * 0.02;
      a.life++;
      if (a.life > a.maxLife || nearAttractor(a.x, a.y)) {
        Object.assign(a, makeAgent());
      }
    };

    const drawParticle = (p: Particle) => {
      if (p.trail.length < 2) return;
      const r = GOLD[0] + (PURPLE[0] - GOLD[0]) * p.hue;
      const g = GOLD[1] + (PURPLE[1] - GOLD[1]) * p.hue;
      const b = GOLD[2] + (PURPLE[2] - GOLD[2]) * p.hue;
      const fadeIn = Math.min(1, p.life / 90);
      const fadeOut = Math.min(1, (p.maxLife - p.life) / 140);
      const env = Math.max(0, Math.min(fadeIn, fadeOut));
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let i = 1; i < p.trail.length; i++) {
        ctx.lineTo(p.trail[i].x, p.trail[i].y);
      }
      ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${0.26 * env})`;
      ctx.stroke();
      const head = p.trail[p.trail.length - 1];
      ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${0.55 * env})`;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 1, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawAgent = (a: Agent) => {
      const fadeIn = Math.min(1, a.life / 160);
      const fadeOut = Math.min(1, (a.maxLife - a.life) / 200);
      const env = Math.max(0, Math.min(fadeIn, fadeOut));
      if (env <= 0) return;

      ctx.save();
      ctx.translate(a.x, a.y);
      // A restrained tilt toward the heading reads more professionally
      // than full rotation.
      ctx.rotate(Math.sin(a.heading) * 0.18);

      // Soft dark halo for separation from the streamlines.
      const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, a.size * 1.5);
      halo.addColorStop(0, `rgba(11,15,25,${0.5 * env})`);
      halo.addColorStop(1, "rgba(11,15,25,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, a.size * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(222,208,186,${0.52 * env})`;
      ctx.lineWidth = 1.2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      a.glyph(ctx, a.size);
      ctx.restore();
    };

    // Thin "constellation" web linking nearby agents (and each agent to its
    // closest attractor) in a cool blue distinct from the warm streamlines.
    const drawWeb = () => {
      const LINK_R = Math.min(width, height) * 0.42;
      ctx.lineWidth = 0.7;
      ctx.setLineDash([1, 5]);
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i];
        const envA = Math.max(
          0,
          Math.min(1, a.life / 160, (a.maxLife - a.life) / 200)
        );
        // agent-to-agent links
        for (let j = i + 1; j < agents.length; j++) {
          const b = agents[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK_R) continue;
          const envB = Math.max(
            0,
            Math.min(1, b.life / 160, (b.maxLife - b.life) / 200)
          );
          const alpha = (1 - d / LINK_R) * 0.34 * Math.min(envA, envB);
          if (alpha <= 0.01) continue;
          ctx.strokeStyle = `rgba(121,184,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        // tether to the nearest attractor
        let best: Attractor | null = null;
        let bestD = Infinity;
        for (const at of attractors) {
          const d = Math.hypot(a.x - at.x, a.y - at.y);
          if (d < bestD) {
            bestD = d;
            best = at;
          }
        }
        if (best && bestD < LINK_R) {
          const alpha = (1 - bestD / LINK_R) * 0.22 * envA;
          if (alpha > 0.01) {
            ctx.strokeStyle = `rgba(121,184,255,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(best.x, best.y);
            ctx.stroke();
          }
        }
      }
      ctx.setLineDash([]);
    };

    const drawAttractorWells = () => {
      for (const a of attractors) {
        const grad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 110);
        grad.addColorStop(0, "rgba(244,197,66,0.10)");
        grad.addColorStop(0.5, "rgba(169,140,230,0.05)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 110, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(244,197,66,0.5)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      drawAttractorWells();
      for (const p of particles) drawParticle(p);
      drawWeb();
      for (const a of agents) drawAgent(a);
    };

    // Throttle to ~30 fps: calmer cadence, lower power draw.
    let raf = 0;
    let last = 0;
    const FRAME_MS = 33;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < FRAME_MS) return;
      last = t;
      for (const p of particles) updateParticle(p);
      for (const a of agents) updateAgent(a);
      render();
    };

    if (reduceMotion) {
      render();
    } else {
      raf = requestAnimationFrame(loop);
    }

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        populate();
        if (reduceMotion) render();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      />
      {/*
        Readability scrim: keeps the central reading column calm and legible
        while the attractors near the margins stay visible.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(90% 100% at 50% 45%, rgba(11,15,25,0.78) 0%, rgba(11,15,25,0.5) 55%, rgba(11,15,25,0.12) 100%)",
        }}
      />
    </>
  );
}
