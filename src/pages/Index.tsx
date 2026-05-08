import { useState } from 'react';
import YinYangSimulation from '@/components/YinYangSimulation';
import ShowcaseSteps from '@/components/ShowcaseSteps';
import TrailerPopup from '@/components/TrailerPopup';
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
      <div className="mt-10 w-full max-w-[21rem] mx-auto px-5">
        <div className="relative rounded-3xl overflow-hidden border border-border bg-card aspect-video shadow-lg">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/yKy1DHFLn7Y?rel=0&modestbranding=1"
            title="Handshake Monster trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
      <div className="mt-20 w-full">
        <ShowcaseSteps />
      </div>
    </div>
  );
};

export default Index;
