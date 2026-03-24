import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Sparkles, User } from 'lucide-react';
import { useTonAddress } from '@tonconnect/ui-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/', requiresAuth: false },
  { icon: Sparkles, label: 'Agent', path: '/agent', requiresAuth: true },
  { icon: User, label: 'Profile', path: '/profile', requiresAuth: true },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userAddress = useTonAddress();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto h-16">
        {NAV_ITEMS.map(({ icon: Icon, label, path, requiresAuth }) => {
          const isActive = location.pathname === path;
          const isDisabled = requiresAuth && !userAddress;
          return (
            <button
              key={path}
              onClick={() => !isDisabled && navigate(path)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                isActive
                  ? 'text-primary'
                  : isDisabled
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
