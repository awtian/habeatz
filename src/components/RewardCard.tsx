import { Coins, Pencil } from 'lucide-react';
import type { Reward } from '@/types/app';

interface RewardCardProps {
  reward: Reward;
  canAfford: boolean;
  onRedeem: () => void;
  onEdit: () => void;
}

export function RewardCard({
  reward,
  canAfford,
  onRedeem,
  onEdit,
}: RewardCardProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{reward.name}</h3>
          {reward.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {reward.description}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-1">
            <Coins size={14} className="text-accent" />
            <span className="text-sm font-bold">{reward.creditCost}</span>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          title="Edit reward"
        >
          <Pencil size={16} />
        </button>
      </div>
      <button
        onClick={onRedeem}
        disabled={!canAfford}
        className="mt-3 w-full rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
      >
        {canAfford ? 'Redeem' : 'Not enough Credits'}
      </button>
    </div>
  );
}
