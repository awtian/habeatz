import type {
  ActivatedTier,
  NormalBand,
  SpinBand,
  Spin,
  Token,
} from '@/types/app';
import { generateId } from './ids';
import { nowISO } from './dates';
import { weightedRandom } from './tokens';

// ── Constants ──

export const VISUAL_SPIN_TABLE = [
  { band: 'small' as const, weight: 45 },
  { band: 'medium' as const, weight: 25 },
  { band: 'big' as const, weight: 15 },
  { band: 'bonus' as const, weight: 12 },
  { band: 'jackpot' as const, weight: 3 },
];

// Cumulative angles for wheel rendering (degrees, starting from top/12 o'clock)
export function getWheelSegments(): { band: SpinBand; startDeg: number; sweepDeg: number }[] {
  const total = VISUAL_SPIN_TABLE.reduce((s, e) => s + e.weight, 0);
  const segments: { band: SpinBand; startDeg: number; sweepDeg: number }[] = [];
  let cumulative = 0;
  for (const entry of VISUAL_SPIN_TABLE) {
    const sweep = (entry.weight / total) * 360;
    segments.push({ band: entry.band, startDeg: cumulative, sweepDeg: sweep });
    cumulative += sweep;
  }
  return segments;
}

// Get the midpoint angle (degrees from top, clockwise) for a band — used for spin target
export function getBandMidpoint(band: SpinBand): number {
  const segments = getWheelSegments();
  const seg = segments.find((s) => s.band === band);
  if (!seg) return 0;
  return seg.startDeg + seg.sweepDeg / 2;
}

const CREDIT_VALUES: Record<SpinBand, number> = {
  small: 1,
  medium: 2,
  big: 3,
  bonus: 2,
  jackpot: 10,
};

const TIER_MULTIPLIER: Record<ActivatedTier, number> = {
  1: 1,
  2: 2,
  3: 3,
};

// ── Tier Activation ──

export function getActivatedTier(
  tokens: Token[],
): ActivatedTier | null {
  if (tokens.length === 0) return null;

  // 1 gold token alone = Tier 3
  const hasGold = tokens.some((t) => t.color === 'gold');
  if (hasGold && tokens.length === 1) return 3;

  // Gold can't be mixed with other tokens
  if (hasGold) return null;

  // All must be same normal color
  const firstColor = tokens[0]!.color;
  const allSame = tokens.every((t) => t.color === firstColor);
  if (!allSame) return null;

  if (tokens.length === 1) return 1;
  if (tokens.length === 2) return 2;
  if (tokens.length === 3) return 3;

  return null;
}

// ── Band Resolution ──

function resolveNormalBand(
  visualBand: NormalBand,
  activatedTier: ActivatedTier,
): NormalBand {
  if (activatedTier === 1) return 'small';
  if (activatedTier === 2 && visualBand === 'big') return 'medium';
  return visualBand;
}

export function calculateCreditsWon(
  visualBand: SpinBand,
  activatedTier: ActivatedTier,
): { actualBand: SpinBand; creditsWon: number; wasDowngraded: boolean } {
  if (visualBand === 'bonus') {
    return {
      actualBand: 'bonus',
      creditsWon: CREDIT_VALUES.bonus * TIER_MULTIPLIER[activatedTier],
      wasDowngraded: false,
    };
  }

  if (visualBand === 'jackpot') {
    return {
      actualBand: 'jackpot',
      creditsWon: CREDIT_VALUES.jackpot * TIER_MULTIPLIER[activatedTier],
      wasDowngraded: false,
    };
  }

  const actualBand = resolveNormalBand(visualBand, activatedTier);
  return {
    actualBand,
    creditsWon: CREDIT_VALUES[actualBand] * TIER_MULTIPLIER[activatedTier],
    wasDowngraded: actualBand !== visualBand,
  };
}

// ── Near Miss Messages ──

export function getNearMissMessage(
  visualBand: SpinBand,
  activatedTier: ActivatedTier,
  wasDowngraded: boolean,
): string | null {
  if (!wasDowngraded) return null;

  const tierLabel =
    activatedTier === 1 ? 'Small' : activatedTier === 2 ? 'Medium' : 'Small';
  const bandLabel =
    visualBand.charAt(0).toUpperCase() + visualBand.slice(1);

  if (activatedTier === 1 && visualBand === 'medium') {
    return 'Near miss! Medium was locked. You received a Small reward. Save 2 matching Tokens to unlock Medium next time.';
  }
  if (activatedTier === 1 && visualBand === 'big') {
    return 'So close! Big was locked. You received a Small reward. Save 3 matching Tokens to unlock Big next time.';
  }
  if (activatedTier === 2 && visualBand === 'big') {
    return 'Near miss! Big was locked. You received a Medium reward. Save 3 matching Tokens to unlock Big next time.';
  }

  return `${bandLabel} was locked. You received a ${tierLabel} reward.`;
}

// ── Get enabled/disabled bands for tier ──

export function getEnabledBands(tier: ActivatedTier): {
  enabled: SpinBand[];
  locked: SpinBand[];
} {
  const locked: SpinBand[] = [];
  const enabled: SpinBand[] = ['small', 'bonus', 'jackpot'];

  if (tier >= 2) {
    enabled.push('medium');
  } else {
    locked.push('medium');
  }

  if (tier >= 3) {
    enabled.push('big');
  } else {
    locked.push('big');
  }

  return { enabled, locked };
}

// ── Spin Odds ──

export function getSpinOdds(): { band: SpinBand; chance: string }[] {
  const total = VISUAL_SPIN_TABLE.reduce((s, i) => s + i.weight, 0);
  return VISUAL_SPIN_TABLE.map((item) => ({
    band: item.band,
    chance: `${Math.round((item.weight / total) * 100)}%`,
  }));
}

// ── Perform Spin ──

export function performSpin(
  selectedTokenIds: string[],
  allTokens: Token[],
): {
  spin: Spin;
  updatedTokens: Token[];
  creditsWon: number;
} {
  const selectedTokens = allTokens.filter(
    (t) => selectedTokenIds.includes(t.id) && t.status === 'available',
  );

  if (selectedTokens.length !== selectedTokenIds.length) {
    throw new Error('Invalid token selection');
  }

  const activatedTier = getActivatedTier(selectedTokens);
  if (!activatedTier) {
    throw new Error('Invalid token combination');
  }

  const visualResult = weightedRandom(VISUAL_SPIN_TABLE);
  const { actualBand, creditsWon, wasDowngraded } = calculateCreditsWon(
    visualResult.band,
    activatedTier,
  );

  // Mark tokens as spent
  const updatedTokens = allTokens.map((t) =>
    selectedTokenIds.includes(t.id) ? { ...t, status: 'spent' as const } : t,
  );

  const spin: Spin = {
    id: generateId(),
    spentTokenIds: selectedTokenIds,
    activatedTier,
    visualBand: visualResult.band,
    actualBand,
    creditsWon,
    wasDowngraded,
    spunAt: nowISO(),
  };

  return { spin, updatedTokens, creditsWon };
}
