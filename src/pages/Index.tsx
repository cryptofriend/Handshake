import YinYangSimulation from '@/components/YinYangSimulation';

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center py-4 bg-background min-h-[calc(100vh-8rem)]">
      <YinYangSimulation className="!h-[28vh] max-h-[250px]" />
    </div>
  );
};

export default Index;
