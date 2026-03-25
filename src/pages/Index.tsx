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

const Index = () => {
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-4 bg-background min-h-[calc(100vh-8rem)] relative">
      <YinYangSimulation className="!h-[56vh] max-h-[500px]" />

      {/* Tune button */}
      <button
        onClick={() => setShowControls(c => !c)}
        className="mt-4 px-4 py-1.5 text-xs font-medium tracking-wider uppercase rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border transition-all"
      >
        {showControls ? 'Hide' : 'Tune'}
      </button>

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
    </div>
  );
};

export default Index;
