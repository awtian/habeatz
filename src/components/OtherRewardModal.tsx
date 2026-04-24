import { useState } from 'react';
import { X, Coins } from 'lucide-react';
import { useStore } from '@/lib/state';

interface OtherRewardModalProps {
  onClose: () => void;
  onRedeemed: () => void;
}

export function OtherRewardModal({ onClose, onRedeemed }: OtherRewardModalProps) {
  const credits = useStore((s) => s.wallet.creditBalance);
  const redeemOtherReward = useStore((s) => s.redeemOtherReward);

  const [name, setName] = useState('');
  const [creditCost, setCreditCost] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (creditCost < 1) return;
    if (creditCost > credits) {
      setError('Not enough credits');
      return;
    }
    try {
      redeemOtherReward({ name: name.trim(), creditCost });
      onRedeemed();
    } catch {
      setError('Not enough credits');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Other Reward</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-3 text-sm text-muted-foreground">
          Balance: <span className="font-bold text-accent">{credits} Credits</span>
        </p>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              What are you treating yourself to?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Coffee break"
              className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Credit cost</label>
            <input
              type="number"
              min={1}
              max={credits}
              value={creditCost}
              onChange={(e) => setCreditCost(Number(e.target.value))}
              className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || creditCost < 1 || creditCost > credits}
            className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-1.5">
              <Coins size={14} />
              Use {creditCost} Credit{creditCost > 1 ? 's' : ''}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
