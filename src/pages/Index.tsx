import { useState } from 'react';
import YinYangSimulation from '@/components/YinYangSimulation';
import ShowcaseSteps from '@/components/ShowcaseSteps';
import { COLOR_PRESETS } from '@/components/dashboard/MonsterCreator';

const Index = () => {
  const [activeScheme] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center py-2 bg-background min-h-[calc(100vh-8rem)] relative">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-4">
        Agreements for <span className="text-primary">Humans</span>
      </h1>
      <YinYangSimulation
        className="transition-all duration-300 !h-[56vh] max-h-[500px]"
        colorScheme={COLOR_PRESETS[activeScheme]}
      />
      <div className="mt-20 w-full">
        <ShowcaseSteps />
      </div>
    </div>
  );
};

export default Index;
