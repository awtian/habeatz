import type { Token, TokenColor } from '@/types/app';
import { generateId } from './ids';
import { nowISO } from './dates';

const TOKEN_DROP_TABLE: { color: TokenColor; weight: number }[] = [
  { color: 'red', weight: 20 },
  { color: 'blue', weight: 20 },
  { color: 'green', weight: 20 },
  { color: 'white', weight: 20 },
  { color: 'purple', weight: 17 },
  { color: 'gold', weight: 3 },
];

export function weightedRandom<T extends { weight: number }>(
  items: readonly T[],
): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1]!;
}

export function drawTokenColor(): TokenColor {
  return weightedRandom(TOKEN_DROP_TABLE).color;
}

export function generateTokens(
  count: number,
  habitId: string,
  habitName: string,
): Token[] {
  const now = nowISO();
  return Array.from({ length: count }, () => ({
    id: generateId(),
    color: drawTokenColor(),
    sourceHabitId: habitId,
    sourceHabitNameSnapshot: habitName,
    earnedAt: now,
    status: 'available' as const,
  }));
}

export function getAvailableTokens(tokens: Token[]): Token[] {
  return tokens.filter((t) => t.status === 'available');
}

export function getTokenCountsByColor(
  tokens: Token[],
): Record<TokenColor, number> {
  const counts: Record<TokenColor, number> = {
    red: 0,
    blue: 0,
    green: 0,
    white: 0,
    purple: 0,
    gold: 0,
  };
  for (const t of tokens) {
    if (t.status === 'available') {
      counts[t.color]++;
    }
  }
  return counts;
}
