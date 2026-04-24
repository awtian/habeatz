import type { Token, TokenColor } from '@/types/app';
import { useNavigate } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { TokenBadge } from './TokenBadge';

const COLOR_LABELS: Record<TokenColor, string> = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  white: 'White',
  purple: 'Purple',
  gold: 'Gold',
};

interface CompletionModalProps {
  tokens: Token[];
  onClose: () => void;
}

export function CompletionModal({ tokens, onClose }: CompletionModalProps) {
  const navigate = useNavigate();

  const uniqueColors = [...new Set(tokens.map((t) => t.color))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-xl">
        <div className="mb-3 flex justify-center">
          <Sparkles size={32} className="text-accent" />
        </div>
        <h2 className="text-lg font-bold">Nice!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You earned{' '}
          {tokens.length > 1
            ? `${tokens.length} Tokens`
            : `a ${COLOR_LABELS[tokens[0]!.color]} Token`}
        </p>

        <div className="mt-3 flex justify-center gap-2">
          {uniqueColors.map((color) => (
            <TokenBadge key={color} color={color} size="md" />
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Collect matching colors to unlock better spins.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Keep earning
          </button>
          <button
            onClick={() => {
              onClose();
              navigate({ to: '/casino' });
            }}
            className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to Spin
          </button>
        </div>
      </div>
    </div>
  );
}
