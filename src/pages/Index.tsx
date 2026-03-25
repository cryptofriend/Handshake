import { useState } from 'react';
import YinYangSimulation from '@/components/YinYangSimulation';

const SLIDERS = [
  { key: 'particleCount' as const, label: 'Particles', min: 500, max: 8000, step: 100 },
  { key: 'speed' as const, label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
  { key: 'noise' as const, label: 'Noise', min: 0, max: 2, step: 0.05 },
  { key: 'glow' as const, label: 'Glow', min: 0, max: 1.5, step: 0.05 },
  { key: 'pulse' as const, label: 'Pulse', min: 0, max: 2, step: 0.05 },
  { key: 'interaction' as const, label: 'Interact', min: 0, max: 3, step: 0.1 },
];

const COLOR_SCHEMES = [
  {
    label: 'Manifesto',
    sideA: [[190, 220, 130], [170, 200, 115], [45, 200, 140], [50, 220, 120], [190, 240, 160]],
    sideB: [[200, 120, 220], [240, 100, 200], [180, 80, 200], [220, 130, 240], [255, 100, 180]],
    preview: ['hsl(190, 60%, 60%)', 'hsl(280, 60%, 60%)'],
  },
  {
    label: 'Fire & Ice',
    sideA: [[255, 140, 50], [255, 100, 30], [255, 180, 80], [240, 120, 40], [255, 160, 60]],
    sideB: [[60, 160, 255], [40, 120, 240], [80, 180, 255], [50, 140, 220], [100, 200, 255]],
    preview: ['hsl(25, 100%, 60%)', 'hsl(215, 100%, 60%)'],
  },
  {
    label: 'Neon',
    sideA: [[0, 255, 120], [50, 255, 100], [0, 220, 80], [80, 255, 140], [30, 240, 110]],
    sideB: [[255, 0, 200], [255, 50, 220], [220, 0, 180], [255, 80, 240], [240, 30, 200]],
    preview: ['hsl(150, 100%, 50%)', 'hsl(310, 100%, 50%)'],
  },
  {
    label: 'Ocean',
    sideA: [[0, 200, 180], [30, 220, 200], [0, 180, 160], [50, 240, 210], [20, 200, 190]],
    sideB: [[0, 80, 180], [20, 60, 200], [0, 100, 160], [40, 80, 220], [10, 70, 190]],
    preview: ['hsl(175, 100%, 40%)', 'hsl(220, 100%, 35%)'],
  },
  {
    label: 'Sunset',
    sideA: [[255, 200, 50], [255, 180, 30], [255, 220, 80], [240, 190, 40], [255, 210, 60]],
    sideB: [[200, 50, 100], [180, 30, 80], [220, 70, 120], [160, 40, 90], [240, 60, 110]],
    preview: ['hsl(45, 100%, 60%)', 'hsl(340, 70%, 50%)'],
  },
];

const Index = () => {
  const [showControls, setShowControls] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [activeScheme, setActiveScheme] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center py-4 bg-background min-h-[calc(100vh-8rem)] relative">
      <YinYangSimulation
        className="!h-[56vh] max-h-[500px]"
        colorScheme={COLOR_SCHEMES[activeScheme]}
      />

      {/* Buttons row */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => { setShowControls(c => !c); setShowColors(false); }}
          className="px-4 py-1.5 text-xs font-medium tracking-wider uppercase rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border transition-all"
        >
          {showControls ? 'Hide' : 'Tune'}
        </button>
        <button
          onClick={() => { setShowColors(c => !c); setShowControls(false); }}
          className="px-4 py-1.5 text-xs font-medium tracking-wider uppercase rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border transition-all flex items-center gap-1.5"
        >
          <span
            className="w-3 h-3 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${COLOR_SCHEMES[activeScheme].preview[0]}, ${COLOR_SCHEMES[activeScheme].preview[1]})`,
            }}
          />
          {showColors ? 'Hide' : 'Orb'}
        </button>
      </div>

      {/* Tune sliders */}
      {showControls && (
        <div className="mt-3 w-full max-w-2xl px-4 overflow-x-auto">
          <div className="flex gap-4 items-end min-w-max">
            {SLIDERS.map(s => (
              <div key={s.key} className="flex flex-col items-center w-24 shrink-0">
                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">{s.label}</span>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  defaultValue={s.min + (s.max - s.min) / 2}
                  className="w-full h-1 appearance-none bg-muted rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color scheme picker */}
      {showColors && (
        <div className="mt-3 w-full max-w-2xl px-4 overflow-x-auto">
          <div className="flex gap-3 items-center min-w-max justify-center">
            {COLOR_SCHEMES.map((scheme, i) => (
              <button
                key={scheme.label}
                onClick={() => setActiveScheme(i)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                  i === activeScheme
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="flex gap-0.5">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ background: scheme.preview[0] }}
                  />
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ background: scheme.preview[1] }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">{scheme.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
