import { useState } from 'react';
import type { Reward, RewardCategory } from '@/types/app';
import { X, Trash2 } from 'lucide-react';

const CATEGORIES: RewardCategory[] = ['gaming', 'break', 'food', 'shopping', 'custom'];

interface RewardFormProps {
  reward?: Reward;
  onSubmit: (data: {
    name: string;
    description: string;
    creditCost: number;
    category: RewardCategory;
  }) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function RewardForm({ reward, onSubmit, onDelete, onCancel }: RewardFormProps) {
  const [name, setName] = useState(reward?.name ?? '');
  const [description, setDescription] = useState(reward?.description ?? '');
  const [creditCost, setCreditCost] = useState(reward?.creditCost ?? 3);
  const [category, setCategory] = useState<RewardCategory>(
    reward?.category ?? 'custom',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || creditCost < 1) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      creditCost,
      category,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {reward ? 'Edit Reward' : 'New Reward'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 1 round of game"
              className="w-full rounded-xl border border-border bg-input-bg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="w-full rounded-xl border border-border bg-input-bg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Credit cost
            </label>
            <input
              type="number"
              min={1}
              value={creditCost}
              onChange={(e) => setCreditCost(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-input-bg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RewardCategory)}
              className="w-full rounded-xl border border-border bg-input-bg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || creditCost < 1}
            className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {reward ? 'Save' : 'Create'}
          </button>
        </div>

        {reward && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
          >
            <Trash2 size={14} />
            Delete Reward
          </button>
        )}
      </form>
    </div>
  );
}
