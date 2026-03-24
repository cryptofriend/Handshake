import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, User, Handshake } from 'lucide-react';
import { useTonAddress, useTonConnectModal } from '@tonconnect/ui-react';
import { cn } from '@/lib/utils';
import logoImg from '@/assets/logo.png';

const NAV_ITEMS = [
  { icon: null as any, label: 'Home', path: '/', requiresAuth: false, isLogo: true },
  { icon: Sparkles, label: 'Agent', path: '/agent', requiresAuth: false, isLogo: false },
  { icon: Handshake, label: 'To Sign', path: '/sign', requiresAuth: false, isLogo: false },
  { icon: User, label: 'Profile', path: '/profile', requiresAuth: false, isLogo: false },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userAddress = useTonAddress();
  const { open: openTonModal } = useTonConnectModal();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto h-16">
        {NAV_ITEMS.map(({ icon: Icon, label, path, requiresAuth, isLogo }) => {
          const isActive = location.pathname === path;
          const isLocked = requiresAuth && !userAddress;
          return (
            <button
              key={path}
              onClick={() => isLocked ? openTonModal() : navigate(path)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                isActive
                  ? 'text-primary'
                  : isLocked
                  ? 'text-muted-foreground/40'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isLogo ? (
                <img src={logoImg} alt="Home" className={cn('w-5 h-5 object-contain', !isActive && 'opacity-60')} />
              ) : (
                Icon && <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              )}
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
