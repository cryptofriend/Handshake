import { useRef, useEffect, useCallback, useState } from 'react';

// ── Tunable Parameters ──────────────────────────────────────────────
interface SimParams {
  particleCount: number;
  speed: number;
  noise: number;
  glow: number;
  pulse: number;
  interaction: number;
}

const DEFAULT_PARAMS: SimParams = {
  particleCount: 3000,
  speed: 0.3,
  noise: 0.6,
  glow: 0.8,
  pulse: 0.4,
  interaction: 1.0,
};

// ── Simplex-ish noise (fast 2D) ─────────────────────────────────────
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) / 2147483648;
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function fbm(x: number, y: number, octaves: number): number {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * smoothNoise(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return val;
}

// ── Particle type ───────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  side: 0 | 1; // 0 = green/lime, 1 = pink/magenta
  life: number;
  maxLife: number;
  size: number;
}

// ── Color palettes ──────────────────────────────────────────────────
const COLORS = {
  green: [
    [190, 220, 130],  // cyan-teal (Sovereignty)
    [170, 200, 115],
    [45, 200, 140],   // gold-amber (Alignment)
    [50, 220, 120],
    [190, 240, 160],
  ],
  pink: [
    [200, 120, 220],  // purple-magenta (Transparency)
    [240, 100, 200],
    [180, 80, 200],
    [220, 130, 240],
    [255, 100, 180],
  ],
};

function getColor(side: 0 | 1, t: number): [number, number, number] {
  const palette = side === 0 ? COLORS.green : COLORS.pink;
  const idx = Math.floor(t * (palette.length - 1));
  const frac = t * (palette.length - 1) - idx;
  const a = palette[Math.min(idx, palette.length - 1)];
  const b = palette[Math.min(idx + 1, palette.length - 1)];
  return [
    a[0] + (b[0] - a[0]) * frac,
    a[1] + (b[1] - a[1]) * frac,
    a[2] + (b[2] - a[2]) * frac,
  ];
}

// ── Main component ──────────────────────────────────────────────────
interface YinYangSimulationProps {
  params?: Partial<SimParams>;
  className?: string;
}

export default function YinYangSimulation({
  params: userParams,
  className = '',
}: YinYangSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const rippleRef = useRef<{ x: number; y: number; t: number; strength: number }[]>([]);
  const paramsRef = useRef<SimParams>({ ...DEFAULT_PARAMS, ...userParams });
  const [showControls, setShowControls] = useState(false);
  const [liveParams, setLiveParams] = useState<SimParams>({ ...DEFAULT_PARAMS, ...userParams });

  useEffect(() => {
    paramsRef.current = liveParams;
  }, [liveParams]);

  const handleParamChange = useCallback((key: keyof SimParams, value: number) => {
    setLiveParams(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true })!;

    let W = 0, H = 0, cx = 0, cy = 0, R = 0;
    let particles: Particle[] = [];
    let time = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas!.clientWidth;
      H = canvas!.clientHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
      R = Math.min(W, H) * 0.38;
    }

    function isInYinYangSide(px: number, py: number, rotation: number): 0 | 1 {
      // Rotate point around center
      const cos = Math.cos(-rotation), sin = Math.sin(-rotation);
      const dx = px - cx, dy = py - cy;
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

      // Upper/lower halves
      const halfR = R / 2;

      // Check if in top small circle (green core in pink half)
      const distTop = Math.sqrt(rx * rx + (ry + halfR) * (ry + halfR));
      if (distTop < halfR * 0.5) return 0;

      // Check if in bottom small circle (pink core in green half)
      const distBot = Math.sqrt(rx * rx + (ry - halfR) * (ry - halfR));
      if (distBot < halfR * 0.5) return 1;

      // Check if in top semicircular bulge
      if (distTop < halfR) return 1;
      // Check if in bottom semicircular bulge
      if (distBot < halfR) return 0;

      // Otherwise, left = 0 (green), right = 1 (pink)
      return rx < 0 ? 0 : 1;
    }

    function spawnParticle(): Particle {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * R;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const side = isInYinYangSide(x, y, time * paramsRef.current.speed * 0.15);
      return {
        x, y,
        vx: 0, vy: 0,
        side,
        life: 0,
        maxLife: 200 + Math.random() * 400,
        size: 0.8 + Math.random() * 1.8,
      };
    }

    function initParticles() {
      particles = [];
      const count = paramsRef.current.particleCount;
      for (let i = 0; i < count; i++) {
        const p = spawnParticle();
        p.life = Math.random() * p.maxLife;
        particles.push(p);
      }
    }

    resize();
    initParticles();
    window.addEventListener('resize', () => { resize(); initParticles(); });

    // Mouse handlers
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => { mouseRef.current.active = false; };
    const onClick = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      rippleRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        t: 0,
        strength: 8,
      });
    };
    const onTouchMove = (e: TouchEvent) => {
      const rect = canvas!.getBoundingClientRect();
      const t = e.touches[0];
      mouseRef.current.x = t.clientX - rect.left;
      mouseRef.current.y = t.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onTouchEnd = () => { mouseRef.current.active = false; };

    canvas!.addEventListener('mousemove', onMouseMove);
    canvas!.addEventListener('mouseleave', onMouseLeave);
    canvas!.addEventListener('click', onClick);
    canvas!.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas!.addEventListener('touchend', onTouchEnd);

    function tick() {
      const P = paramsRef.current;
      time += 0.016;
      const rotation = time * P.speed * 0.15;
      const breathe = 1 + Math.sin(time * P.pulse * 0.8) * 0.03 * P.pulse;
      const effectiveR = R * breathe;

      // Background
      ctx.clearRect(0, 0, W, H);

      // Outer glow
      const outerGrad = ctx.createRadialGradient(cx, cy, effectiveR * 0.6, cx, cy, effectiveR * 1.4);
      outerGrad.addColorStop(0, `rgba(140, 255, 80, ${0.02 * P.glow})`);
      outerGrad.addColorStop(0.5, `rgba(255, 60, 150, ${0.015 * P.glow})`);
      outerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGrad;
      ctx.fillRect(0, 0, W, H);

      // Update ripples
      rippleRef.current = rippleRef.current.filter(r => {
        r.t += 0.016;
        return r.t < 1.5;
      });

      // Adjust particle count dynamically
      while (particles.length < P.particleCount) particles.push(spawnParticle());
      if (particles.length > P.particleCount) particles.length = P.particleCount;

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // Respawn if dead or outside radius
        const dx = p.x - cx, dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (p.life > p.maxLife || dist > effectiveR * 1.15) {
          const np = spawnParticle();
          Object.assign(p, np);
          continue;
        }

        // Determine side based on yin-yang curve
        const targetSide = isInYinYangSide(p.x, p.y, rotation);

        // Flow: circular + noise-based perturbation
        const angle = Math.atan2(dy, dx);
        const noiseVal = fbm(p.x * 0.005 + time * 0.1, p.y * 0.005, 3) * P.noise;
        const flowAngle = angle + Math.PI / 2 + noiseVal * 1.5;
        const flowSpeed = P.speed * (0.3 + dist / R * 0.5);

        p.vx += Math.cos(flowAngle) * flowSpeed * 0.1;
        p.vy += Math.sin(flowAngle) * flowSpeed * 0.1;

        // Attract toward correct side
        if (p.side !== targetSide) {
          const pullAngle = flowAngle + (targetSide === 0 ? -0.5 : 0.5);
          p.vx += Math.cos(pullAngle) * 0.15;
          p.vy += Math.sin(pullAngle) * 0.15;
          // Gradually shift side
          if (Math.random() < 0.02) p.side = targetSide;
        }

        // Contain within circle
        if (dist > effectiveR * 0.95) {
          p.vx -= dx * 0.002;
          p.vy -= dy * 0.002;
        }

        // Mouse interaction
        if (mouseRef.current.active) {
          const mdx = p.x - mouseRef.current.x;
          const mdy = p.y - mouseRef.current.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 120 && mDist > 1) {
            const force = (120 - mDist) / 120 * P.interaction * 0.5;
            p.vx += (mdx / mDist) * force;
            p.vy += (mdy / mDist) * force;
          }
        }

        // Ripple interaction
        for (const rip of rippleRef.current) {
          const rdx = p.x - rip.x, rdy = p.y - rip.y;
          const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
          const rippleRadius = rip.t * 300;
          const rippleWidth = 60;
          if (Math.abs(rDist - rippleRadius) < rippleWidth) {
            const force = (1 - rip.t / 1.5) * rip.strength * (1 - Math.abs(rDist - rippleRadius) / rippleWidth);
            if (rDist > 1) {
              p.vx += (rdx / rDist) * force;
              p.vy += (rdy / rDist) * force;
            }
          }
        }

        // Damping
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;

        // Draw
        const lifeRatio = Math.min(p.life / 30, 1) * Math.min((p.maxLife - p.life) / 60, 1);
        const alpha = lifeRatio * (0.4 + P.glow * 0.5);
        const [r, g, b] = getColor(p.side, (Math.sin(time + i * 0.01) + 1) / 2);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow for some particles
        if (i % 5 === 0 && P.glow > 0.3) {
          ctx.globalAlpha = alpha * 0.15 * P.glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw ambient outer particles
      ctx.globalAlpha = 1;
      for (let i = 0; i < 40; i++) {
        const a = time * 0.05 * P.speed + i * (Math.PI * 2 / 40);
        const or = effectiveR * (1.05 + Math.sin(time * 0.3 + i) * 0.08);
        const ox = cx + Math.cos(a) * or;
        const oy = cy + Math.sin(a) * or;
        const oAlpha = (0.15 + Math.sin(time * 2 + i * 0.5) * 0.1) * P.glow;
        const oSide = i % 2 === 0 ? 0 : 1;
        const [r, g, b] = getColor(oSide as 0 | 1, 0.5);
        ctx.globalAlpha = oAlpha;
        ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
        ctx.beginPath();
        ctx.arc(ox, oy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas!.removeEventListener('mousemove', onMouseMove);
      canvas!.removeEventListener('mouseleave', onMouseLeave);
      canvas!.removeEventListener('click', onClick);
      canvas!.removeEventListener('touchmove', onTouchMove);
      canvas!.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const sliders: { key: keyof SimParams; label: string; min: number; max: number; step: number }[] = [
    { key: 'particleCount', label: 'Particles', min: 500, max: 8000, step: 100 },
    { key: 'speed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'noise', label: 'Noise', min: 0, max: 2, step: 0.05 },
    { key: 'glow', label: 'Glow', min: 0, max: 1.5, step: 0.05 },
    { key: 'pulse', label: 'Pulse', min: 0, max: 2, step: 0.05 },
    { key: 'interaction', label: 'Interact', min: 0, max: 3, step: 0.1 },
  ];

  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* Toggle controls */}
      <button
        onClick={() => setShowControls(c => !c)}
        className="absolute top-4 right-4 z-20 px-3 py-1.5 text-xs font-medium tracking-wider uppercase rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 backdrop-blur-sm border border-border transition-all"
      >
        {showControls ? 'Hide' : 'Tune'}
      </button>

      {/* Controls panel */}
      {showControls && (
        <div className="absolute top-14 right-4 z-20 w-56 p-4 rounded-xl bg-card/80 backdrop-blur-md border border-border space-y-3">
          {sliders.map(s => (
            <div key={s.key}>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1 font-mono uppercase tracking-wider">
                <span>{s.label}</span>
                <span>{liveParams[s.key]}</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={liveParams[s.key]}
                onChange={e => handleParamChange(s.key, parseFloat(e.target.value))}
                className="w-full h-1 appearance-none bg-muted rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
