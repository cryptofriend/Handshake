import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import YinYangSimulation from '@/components/YinYangSimulation';
import ShowcaseSteps from '@/components/ShowcaseSteps';

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
  const [activeScheme, setActiveScheme] = useState(0);
  const [mode, setMode] = useState<'human' | 'agent'>('human');
  const navigate = useNavigate();

  const handleModeSwitch = (newMode: 'human' | 'agent') => {
    setMode(newMode);
    setActiveScheme(prev => {
      let next;
      do { next = Math.floor(Math.random() * COLOR_SCHEMES.length); } while (next === prev);
      return next;
    });
    if (newMode === 'agent') {
      navigate('/agent-mode');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 bg-background min-h-[calc(100vh-8rem)] relative">
      <YinYangSimulation
        className="transition-all duration-300 !h-[56vh] max-h-[500px]"
        colorScheme={COLOR_SCHEMES[activeScheme]}
      />

      {/* Human / Agent switcher */}
      <div className="mt-4">
        <div className="flex items-center rounded-full border border-border bg-muted/50 p-0.5">
          <button
            onClick={() => handleModeSwitch('human')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === 'human'
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Human
          </button>
          <button
            onClick={() => handleModeSwitch('agent')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === 'agent'
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Agent
          </button>
        </div>
      </div>

      {/* Showcase steps */}
      <div className="mt-20 w-full">
        <ShowcaseSteps />
      </div>
    </div>
  );
};

export default Index;
