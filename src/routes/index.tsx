import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '@/lib/state';
import { BalanceBar } from '@/components/BalanceBar';
import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CompletionModal } from '@/components/CompletionModal';
import { EmptyState } from '@/components/EmptyState';
import type { Token, Habit } from '@/types/app';

export function HomePage() {
  const rawHabits = useStore((s) => s.habits);
  const completions = useStore((s) => s.completions);
  const createHabit = useStore((s) => s.createHabit);
  const updateHabit = useStore((s) => s.updateHabit);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const completeHabit = useStore((s) => s.completeHabit);

  const habits = useMemo(() => rawHabits.filter((h) => h.isActive), [rawHabits]);

  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Habit | null>(null);
  const [earnedTokens, setEarnedTokens] = useState<Token[] | null>(null);

  const handleComplete = (habitId: string) => {
    const tokens = completeHabit(habitId);
    if (tokens.length > 0) {
      setEarnedTokens(tokens);
    }
  };

  const todayCompletions = completions.filter((c) => {
    const d = new Date(c.completedAt);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });

  return (
    <div>
      <BalanceBar />
      <div className="mx-auto max-w-lg px-4 pb-6">
        {/* Header */}
        <div className="mb-4 mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Habeatz</h1>
            <p className="text-sm text-muted-foreground">
              Do habits. Earn Tokens. Spin for Credits.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-primary p-2.5 text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Habits */}
        {habits.length === 0 ? (
          <EmptyState
            message="No habits yet. Create your first habit to start earning Tokens."
            action={{ label: 'Create Habit', onClick: () => setShowForm(true) }}
          />
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={() => handleComplete(habit.id)}
                onEdit={() => setEditingHabit(habit)}
              />
            ))}
          </div>
        )}

        {/* Today's Completions */}
        {todayCompletions.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
              Completed today
            </h2>
            <div className="space-y-1.5">
              {todayCompletions.slice(0, 10).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm"
                >
                  <span>{c.habitNameSnapshot}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.completedAt).toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Habit Modal */}
      {showForm && (
        <HabitForm
          onSubmit={(data) => {
            createHabit(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Habit Modal */}
      {editingHabit && (
        <HabitForm
          habit={editingHabit}
          onSubmit={(data) => {
            updateHabit(editingHabit.id, data);
            setEditingHabit(null);
          }}
          onDelete={() => {
            setEditingHabit(null);
            setConfirmDelete(editingHabit);
          }}
          onCancel={() => setEditingHabit(null)}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Habit?"
          message={`"${confirmDelete.name}" will be permanently removed.`}
          onConfirm={() => {
            deleteHabit(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Completion Modal */}
      {earnedTokens && (
        <CompletionModal
          tokens={earnedTokens}
          onClose={() => setEarnedTokens(null)}
        />
      )}
    </div>
  );
}
