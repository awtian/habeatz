import { useMemo } from 'react';
import type { Token, TokenColor, ActivatedTier } from '@/types/app';
import { TokenBadge } from './TokenBadge';

const COLORS: TokenColor[] = ['red', 'blue', 'green', 'white', 'purple'];

interface CasinoTokenSelectorProps {
  tokens: Token[];
  selectedTier: ActivatedTier | null;
  selectedColor: TokenColor | null;
  onTierSelect: (tier: ActivatedTier) => void;
  onColorSelect: (color: TokenColor) => void;
}

export function CasinoTokenSelector({
  tokens,
  selectedTier,
  selectedColor,
  onTierSelect,
  onColorSelect,
}: CasinoTokenSelectorProps) {
  const counts = useMemo(() => {
    const map: Partial<Record<TokenColor, number>> = {};
    for (const t of tokens) {
      if (t.status === 'available') {
        map[t.color] = (map[t.color] ?? 0) + 1;
      }
    }
    return map;
  }, [tokens]);

  const hasGold = (counts['gold'] ?? 0) >= 1;

  // Which tiers are available?
  const tier1Available = COLORS.some((c) => (counts[c] ?? 0) >= 1);
  const tier2Available = COLORS.some((c) => (counts[c] ?? 0) >= 2);
  const tier3Available = COLORS.some((c) => (counts[c] ?? 0) >= 3) || hasGold;

  // Which colors can fulfill the selected tier?
  const availableColors = useMemo(() => {
    if (!selectedTier) return [];
    if (selectedTier === 3 && hasGold) return ['gold' as TokenColor, ...COLORS.filter((c) => (counts[c] ?? 0) >= 3)];
    const needed = selectedTier;
    return COLORS.filter((c) => (counts[c] ?? 0) >= needed);
  }, [selectedTier, counts, hasGold]);

  const tierLabel = (t: ActivatedTier) => {
    if (t === 1) return '1 Token';
    if (t === 2) return '2 Match';
    return '3 Match';
  };

  const tierDesc = (t: ActivatedTier) => {
    if (t === 1) return 'Small only';
    if (t === 2) return '+Medium';
    return 'All unlocked';
  };

  return (
    <div className="space-y-4">
      {/* Step 1: Pick a tier */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Choose tier
        </p>
        <div className="flex gap-2">
          {([1, 2, 3] as ActivatedTier[]).map((t) => {
            const available = t === 1 ? tier1Available : t === 2 ? tier2Available : tier3Available;
            const active = selectedTier === t;
            return (
              <button
                key={t}
                disabled={!available}
                onClick={() => onTierSelect(t)}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl border-2 px-3 py-3 text-center transition-all ${
                  active
                    ? 'border-primary bg-primary/10'
                    : available
                      ? 'border-border hover:border-primary/40'
                      : 'border-border/50 opacity-40'
                }`}
              >
                <span className={`text-lg font-extrabold ${active ? 'text-primary' : ''}`}>
                  {t}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {tierLabel(t)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {tierDesc(t)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Pick a color */}
      {selectedTier && availableColors.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pick token color
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {availableColors.map((color) => {
              const active = selectedColor === color;
              const count = counts[color] ?? 0;
              return (
                <button
                  key={color}
                  onClick={() => onColorSelect(color)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-primary/15 text-primary ring-2 ring-primary/40'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <TokenBadge color={color} size="md" />
                  <span className="text-xs font-semibold text-muted-foreground">×{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
