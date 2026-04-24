import { useMemo } from 'react';
import type { TokenColor } from '@/types/app';
import { useStore, getTokenCounts } from '@/lib/state';
import { TokenBadge } from './TokenBadge';

const COLORS: TokenColor[] = ['red', 'blue', 'green', 'white', 'purple', 'gold'];
const COLOR_KEYS: TokenColor[] = ['red', 'blue', 'green', 'white', 'purple', 'gold'];

export function TokenInventory() {
  const countsStr = useStore(getTokenCounts);
  const counts = useMemo(() => {
    const nums = countsStr.split(',').map(Number);
    return Object.fromEntries(COLOR_KEYS.map((c, i) => [c, nums[i]!])) as Record<TokenColor, number>;
  }, [countsStr]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {COLORS.map((color) => (
        <TokenBadge key={color} color={color} count={counts[color]} />
      ))}
    </div>
  );
}
