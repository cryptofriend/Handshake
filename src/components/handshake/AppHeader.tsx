import { useNavigate, useLocation } from 'react-router-dom';

export const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAgent = location.pathname === '/agent-mode';

  const handleSwitch = (mode: 'human' | 'agent') => {
    if (mode === 'agent' && !isAgent) navigate('/agent-mode');
    if (mode === 'human' && isAgent) navigate('/');
  };

  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2 w-full max-w-md mx-auto">
      <h1 className="logo-text text-xl text-foreground">Handshake</h1>
      <div className="flex items-center rounded-full border border-border bg-muted/50 p-0.5">
        <button
          onClick={() => handleSwitch('human')}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
            !isAgent ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Human
        </button>
        <button
          onClick={() => handleSwitch('agent')}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
            isAgent ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Agent
        </button>
      </div>
    </div>
  );
};
