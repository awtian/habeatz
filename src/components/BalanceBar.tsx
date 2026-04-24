import { Coins } from 'lucide-react';
import { useStore } from '@/lib/state';
import { TokenInventory } from './TokenInventory';

export function BalanceBar() {
  const credits = useStore((s) => s.wallet.creditBalance);

  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Coins size={18} className="text-accent" />
          <span className="text-sm font-bold">{credits}</span>
          <span className="text-xs text-muted-foreground">Credits</span>
        </div>
        <TokenInventory />
      </div>
    </div>
  );
}
