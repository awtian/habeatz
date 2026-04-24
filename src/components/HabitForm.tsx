import { useState } from 'react';
import type { Habit } from '@/types/app';
import { X, Trash2 } from 'lucide-react';

interface HabitFormProps {
  habit?: Habit;
  onSubmit: (data: {
    name: string;
    description: string;
    tokenReward: number;
    cooldownType: 'none' | 'daily';
  }) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function HabitForm({ habit, onSubmit, onDelete, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [tokenReward, setTokenReward] = useState(habit?.tokenReward ?? 1);
  const [cooldownType, setCooldownType] = useState<'none' | 'daily'>(
    habit?.cooldownType ?? 'none',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      tokenReward,
      cooldownType,
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
            {habit ? 'Edit Habit' : 'New Habit'}
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
              placeholder="e.g. Study for 25 minutes"
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
              Tokens per completion
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={tokenReward}
              onChange={(e) => setTokenReward(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-input-bg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Cooldown</label>
            <select
              value={cooldownType}
              onChange={(e) =>
                setCooldownType(e.target.value as 'none' | 'daily')
              }
              className="w-full rounded-xl border border-border bg-input-bg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="none">No limit</option>
              <option value="daily">Once per day</option>
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
            disabled={!name.trim()}
            className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {habit ? 'Save' : 'Create'}
          </button>
        </div>

        {habit && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
          >
            <Trash2 size={14} />
            Delete Habit
          </button>
        )}
      </form>
    </div>
  );
}
