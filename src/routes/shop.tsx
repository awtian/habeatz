import { useState, useMemo } from 'react';
import { Plus, Gift, Coins } from 'lucide-react';
import { useStore } from '@/lib/state';
import { BalanceBar } from '@/components/BalanceBar';
import { RewardCard } from '@/components/RewardCard';
import { RewardForm } from '@/components/RewardForm';
import { OtherRewardModal } from '@/components/OtherRewardModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import type { Reward } from '@/types/app';

export function ShopPage() {
  const rawRewards = useStore((s) => s.rewards);
  const credits = useStore((s) => s.wallet.creditBalance);
  const redemptions = useStore((s) => s.redemptions);
  const createReward = useStore((s) => s.createReward);
  const updateReward = useStore((s) => s.updateReward);
  const deleteReward = useStore((s) => s.deleteReward);
  const redeemReward = useStore((s) => s.redeemReward);

  const rewards = useMemo(() => rawRewards.filter((r) => r.isActive), [rawRewards]);

  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Reward | null>(null);
  const [showOther, setShowOther] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  const handleRedeem = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward || credits < reward.creditCost) return;
    try {
      redeemReward(rewardId);
      setRedeemSuccess(reward.name);
      setTimeout(() => setRedeemSuccess(null), 3000);
    } catch {
      // not enough credits
    }
  };

  return (
    <div>
      <BalanceBar />
      <div className="mx-auto max-w-lg px-4 pb-6">
        {/* Header */}
        <div className="mb-4 mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Reward Shop
            </h1>
            <p className="text-sm text-muted-foreground">
              Spend Credits on guilt-free rewards.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-primary p-2.5 text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Success message */}
        {redeemSuccess && (
          <div className="mb-3 rounded-2xl bg-success/10 px-4 py-3 text-center text-sm font-semibold text-success">
            Reward unlocked! Enjoy {redeemSuccess} guilt-free.
          </div>
        )}

        {/* Reward grid */}
        {rewards.length === 0 ? (
          <EmptyState
            message="No rewards yet. Create your first reward."
            action={{
              label: 'Create Reward',
              onClick: () => setShowForm(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                canAfford={credits >= reward.creditCost}
                onRedeem={() => handleRedeem(reward.id)}
                onEdit={() => setEditingReward(reward)}
              />
            ))}
          </div>
        )}

        {/* Other Reward button */}
        <button
          onClick={() => setShowOther(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-muted/30 px-4 py-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Gift size={18} />
          Other Reward — spend Credits on something custom
        </button>

        {/* Redemption History */}
        {redemptions.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
              Redemption History
            </h2>
            <div className="space-y-1.5">
              {redemptions.slice(0, 10).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{r.rewardNameSnapshot}</span>
                    {r.source === 'other' && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (other)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-accent">
                    <Coins size={12} />
                    <span className="text-xs font-semibold">
                      -{r.creditsSpent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Reward Modal */}
      {showForm && (
        <RewardForm
          onSubmit={(data) => {
            createReward(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Reward Modal */}
      {editingReward && (
        <RewardForm
          reward={editingReward}
          onSubmit={(data) => {
            updateReward(editingReward.id, data);
            setEditingReward(null);
          }}
          onDelete={() => {
            setEditingReward(null);
            setConfirmDelete(editingReward);
          }}
          onCancel={() => setEditingReward(null)}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Reward?"
          message={`"${confirmDelete.name}" will be permanently removed.`}
          onConfirm={() => {
            deleteReward(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Other Reward Modal */}
      {showOther && (
        <OtherRewardModal
          onClose={() => setShowOther(false)}
          onRedeemed={() => {
            setShowOther(false);
            setRedeemSuccess('custom reward');
            setTimeout(() => setRedeemSuccess(null), 3000);
          }}
        />
      )}
    </div>
  );
}
