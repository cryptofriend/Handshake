import { useNavigate, useLocation } from 'react-router-dom';

export const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAgent = location.pathname === '/agent-mode';

  const modes = ['Humans', 'Agents', 'Both'] as const;
  const currentIndex = isAgent ? 1 : 0;

  const handleSwitch = (index: number) => {
    if (index === 1 && !isAgent) navigate('/agent-mode');
    if (index === 0 && isAgent) navigate('/');
    // index 2 = "Both" — navigate to home for now
    if (index === 2 && isAgent) navigate('/');
  };

  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2 w-full max-w-md mx-auto">
      <h1 className="logo-text text-xl text-foreground">Handshake</h1>
      <div className="relative flex items-center rounded-full border border-border bg-muted/50 p-0.5">
        <div
          className="absolute top-0.5 bottom-0.5 rounded-full bg-foreground shadow-sm transition-all duration-300 ease-out"
          style={{
            width: `calc(${100 / modes.length}% - 2px)`,
            left: `calc(${(currentIndex * 100) / modes.length}% + 1px)`,
          }}
        />
        {modes.map((label, i) => (
          <button
            key={label}
            onClick={() => handleSwitch(i)}
            className={`relative z-10 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
              i === currentIndex ? 'text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
