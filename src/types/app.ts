// ── Token ──
export type TokenColor = 'red' | 'blue' | 'green' | 'white' | 'purple' | 'gold';

export interface Token {
  id: string;
  color: TokenColor;
  sourceHabitId: string;
  sourceHabitNameSnapshot: string;
  earnedAt: string;
  status: 'available' | 'spent';
}

// ── Habit ──
export interface Habit {
  id: string;
  name: string;
  description?: string;
  tokenReward: number;
  cooldownType: 'none' | 'daily';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Habit Completion ──
export interface HabitCompletion {
  id: string;
  habitId: string;
  habitNameSnapshot: string;
  tokenIdsEarned: string[];
  completedAt: string;
}

// ── Spin ──
export type SpinBand = 'small' | 'medium' | 'big' | 'bonus' | 'jackpot';
export type NormalBand = 'small' | 'medium' | 'big';
export type ActivatedTier = 1 | 2 | 3;

export interface Spin {
  id: string;
  spentTokenIds: string[];
  activatedTier: ActivatedTier;
  visualBand: SpinBand;
  actualBand: SpinBand;
  creditsWon: number;
  wasDowngraded: boolean;
  spunAt: string;
}

// ── Reward ──
export type RewardCategory = 'gaming' | 'break' | 'food' | 'shopping' | 'custom';

export interface Reward {
  id: string;
  name: string;
  description?: string;
  creditCost: number;
  category: RewardCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Reward Redemption ──
export interface RewardRedemption {
  id: string;
  rewardId?: string;
  rewardNameSnapshot: string;
  creditsSpent: number;
  note?: string;
  redeemedAt: string;
  source: 'shop' | 'other';
}

// ── Wallet ──
export interface Wallet {
  creditBalance: number;
  lifetimeTokensEarned: number;
  lifetimeTokensSpent: number;
  lifetimeCreditsEarned: number;
  lifetimeCreditsSpent: number;
}

// ── Settings ──
export type Theme = 'dark' | 'light';

export interface AppSettings {
  theme: Theme;
  animationsEnabled: boolean;
  soundEnabled: boolean;
  showOdds: boolean;
}

// ── App State ──
export interface AppState {
  version: string;
  wallet: Wallet;
  habits: Habit[];
  tokens: Token[];
  completions: HabitCompletion[];
  spins: Spin[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  settings: AppSettings;
}
