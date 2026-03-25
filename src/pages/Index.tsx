import YinYangSimulation from '@/components/YinYangSimulation';

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 bg-[#0a0a0f] min-h-[calc(100vh-8rem)]">
      <YinYangSimulation className="!h-[40vh] max-h-[400px]" />
    </div>
  );
};

export default Index;
