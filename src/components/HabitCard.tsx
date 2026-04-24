import { Check, Pencil } from 'lucide-react';
import type { Habit } from '@/types/app';

interface HabitCardProps {
  habit: Habit;
  onComplete: () => void;
  onEdit: () => void;
}

export function HabitCard({ habit, onComplete, onEdit }: HabitCardProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight">{habit.name}</h3>
          {habit.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {habit.description}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            +{habit.tokenReward} Token{habit.tokenReward > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            title="Edit habit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 rounded-full bg-success px-3 py-2 text-sm font-semibold text-success-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Check size={16} />
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}
