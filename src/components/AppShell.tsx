import { useEffect } from 'react';
import { Outlet, Link, useMatchRoute } from '@tanstack/react-router';
import { Home, Dice5, ShoppingBag, Settings } from 'lucide-react';
import { useStore } from '@/lib/state';

const tabs = [
  { to: '/' as const, label: 'Habits', icon: Home },
  { to: '/casino' as const, label: 'Spin', icon: Dice5 },
  { to: '/shop' as const, label: 'Rewards', icon: ShoppingBag },
  { to: '/settings' as const, label: 'Settings', icon: Settings },
] as const;

export function AppShell() {
  const matchRoute = useMatchRoute();
  const theme = useStore((s) => s.settings.theme);
  const cleanupOld = useStore((s) => s.cleanupOld);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Cleanup old data on mount
  useEffect(() => {
    cleanupOld();
  }, [cleanupOld]);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border backdrop-blur-sm" style={{ backgroundColor: 'var(--color-nav-bg)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 pt-1.5 pb-1">
          {tabs.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === '/'
                ? !!matchRoute({ to: '/', fuzzy: false })
                : !!matchRoute({ to });
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
