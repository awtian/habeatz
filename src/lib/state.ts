import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppState,
  Habit,
  Token,
  HabitCompletion,
  Spin,
  Reward,
  RewardRedemption,
  AppSettings,
  RewardCategory,
  TokenColor,
} from '@/types/app';
import { generateId } from './ids';
import { nowISO, isToday } from './dates';
import { generateTokens } from './tokens';
import { performSpin } from './spin';
import { playTokenEarned, playSpinStart, playRedeem } from './sounds';

// ── Default State ──

function createDefaultState(): AppState {
  const now = nowISO();
  return {
    version: '1.0.0',
    wallet: {
      creditBalance: 0,
      lifetimeTokensEarned: 0,
      lifetimeTokensSpent: 0,
      lifetimeCreditsEarned: 0,
      lifetimeCreditsSpent: 0,
    },
    habits: [
      {
        id: generateId(),
        name: 'Study for 25 minutes',
        description: 'One focused session.',
        tokenReward: 1,
        cooldownType: 'none',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        name: 'Workout set',
        description: 'Pushups, burpees, walk, or gym set.',
        tokenReward: 1,
        cooldownType: 'none',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    tokens: [],
    completions: [],
    spins: [],
    rewards: [
      {
        id: generateId(),
        name: '1 round of game',
        description: 'One guilt-free round of a game like Clash Royale.',
        creditCost: 1,
        category: 'gaming',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        name: '10 minute break',
        description: 'A short guilt-free break.',
        creditCost: 3,
        category: 'break',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        name: 'Snack reward',
        description: 'A small snack or drink.',
        creditCost: 5,
        category: 'food',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    redemptions: [],
    settings: {
      theme: 'dark',
      animationsEnabled: true,
      soundEnabled: false,
      showOdds: true,
    },
  };
}

// ── Store Interface ──

interface AppStore extends AppState {
  // Habit CRUD
  createHabit: (data: {
    name: string;
    description?: string;
    tokenReward: number;
    cooldownType: 'none' | 'daily';
  }) => void;
  updateHabit: (
    id: string,
    data: Partial<Omit<Habit, 'id' | 'createdAt'>>,
  ) => void;
  deleteHabit: (id: string) => void;

  // Habit Completion
  completeHabit: (habitId: string) => Token[];

  // Casino
  doSpin: (selectedTokenIds: string[]) => Spin;

  // Reward CRUD
  createReward: (data: {
    name: string;
    description?: string;
    creditCost: number;
    category: RewardCategory;
  }) => void;
  updateReward: (
    id: string,
    data: Partial<Omit<Reward, 'id' | 'createdAt'>>,
  ) => void;
  deleteReward: (id: string) => void;

  // Redemption
  redeemReward: (rewardId: string) => RewardRedemption;
  redeemOtherReward: (data: {
    name: string;
    creditCost: number;
    note?: string;
  }) => RewardRedemption;

  // Settings
  updateSettings: (data: Partial<AppSettings>) => void;

  // Data
  exportState: () => string;
  importState: (json: string) => void;
  resetState: () => void;
  cleanupOld: () => void;
}

// ── Store ──

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createDefaultState(),

      createHabit: (data) => {
        const now = nowISO();
        const habit: Habit = {
          id: generateId(),
          ...data,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ habits: [habit, ...s.habits] }));
      },

      updateHabit: (id, data) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, ...data, updatedAt: nowISO() } : h,
          ),
        }));
      },

      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
      },

      completeHabit: (habitId) => {
        const state = get();
        const habit = state.habits.find((h) => h.id === habitId);
        if (!habit) return [];

        if (get().settings.soundEnabled) playTokenEarned();

        const earnedTokens = generateTokens(
          habit.tokenReward,
          habit.id,
          habit.name,
        );

        const completion: HabitCompletion = {
          id: generateId(),
          habitId: habit.id,
          habitNameSnapshot: habit.name,
          tokenIdsEarned: earnedTokens.map((t) => t.id),
          completedAt: nowISO(),
        };

        set((s) => ({
          tokens: [...earnedTokens, ...s.tokens],
          completions: [completion, ...s.completions],
          wallet: {
            ...s.wallet,
            lifetimeTokensEarned: s.wallet.lifetimeTokensEarned + earnedTokens.length,
          },
        }));

        return earnedTokens;
      },

      doSpin: (selectedTokenIds) => {
        const state = get();
        const soundOn = get().settings.soundEnabled;
        if (soundOn) playSpinStart();

        const { spin, updatedTokens, creditsWon } = performSpin(
          selectedTokenIds,
          state.tokens,
        );

        set((s) => ({
          tokens: updatedTokens,
          spins: [spin, ...s.spins],
          wallet: {
            ...s.wallet,
            creditBalance: s.wallet.creditBalance + creditsWon,
            lifetimeTokensSpent: s.wallet.lifetimeTokensSpent + selectedTokenIds.length,
            lifetimeCreditsEarned: s.wallet.lifetimeCreditsEarned + creditsWon,
          },
        }));

        return spin;
      },

      createReward: (data) => {
        const now = nowISO();
        const reward: Reward = {
          id: generateId(),
          ...data,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ rewards: [reward, ...s.rewards] }));
      },

      updateReward: (id, data) => {
        set((s) => ({
          rewards: s.rewards.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: nowISO() } : r,
          ),
        }));
      },

      deleteReward: (id) => {
        set((s) => ({ rewards: s.rewards.filter((r) => r.id !== id) }));
      },

      redeemReward: (rewardId) => {
        const state = get();
        const reward = state.rewards.find((r) => r.id === rewardId);
        if (!reward) throw new Error('Reward not found');
        if (state.wallet.creditBalance < reward.creditCost) {
          throw new Error('Not enough credits');
        }

        if (get().settings.soundEnabled) playRedeem();

        const redemption: RewardRedemption = {
          id: generateId(),
          rewardId: reward.id,
          rewardNameSnapshot: reward.name,
          creditsSpent: reward.creditCost,
          redeemedAt: nowISO(),
          source: 'shop',
        };

        set((s) => ({
          redemptions: [redemption, ...s.redemptions],
          wallet: {
            ...s.wallet,
            creditBalance: s.wallet.creditBalance - reward.creditCost,
            lifetimeCreditsSpent: s.wallet.lifetimeCreditsSpent + reward.creditCost,
          },
        }));

        return redemption;
      },

      redeemOtherReward: ({ name, creditCost, note }) => {
        const state = get();
        if (state.wallet.creditBalance < creditCost) {
          throw new Error('Not enough credits');
        }

        if (get().settings.soundEnabled) playRedeem();

        const redemption: RewardRedemption = {
          id: generateId(),
          rewardNameSnapshot: name,
          creditsSpent: creditCost,
          note,
          redeemedAt: nowISO(),
          source: 'other',
        };

        set((s) => ({
          redemptions: [redemption, ...s.redemptions],
          wallet: {
            ...s.wallet,
            creditBalance: s.wallet.creditBalance - creditCost,
            lifetimeCreditsSpent: s.wallet.lifetimeCreditsSpent + creditCost,
          },
        }));

        return redemption;
      },

      updateSettings: (data) => {
        set((s) => ({ settings: { ...s.settings, ...data } }));
      },

      exportState: () => {
        const state = get();
        const { exportState: _, importState: __, resetState: ___, ...data } = state;
        const exportable = { ...data };
        return JSON.stringify(exportable, null, 2);
      },

      importState: (json) => {
        const parsed = JSON.parse(json);
        set(parsed);
      },

      resetState: () => {
        const fresh = createDefaultState();
        set(fresh);
      },

      cleanupOld: () => {
        set((s) => ({
          tokens: s.tokens.filter((t) => t.status === 'available' || isToday(t.earnedAt)),
          completions: s.completions.filter((c) => isToday(c.completedAt)),
          spins: s.spins.filter((sp) => isToday(sp.spunAt)),
          redemptions: s.redemptions.filter((r) => isToday(r.redeemedAt)),
        }));
      },
    }),
    {
      name: 'habeatz:v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// ── Derived data (call inside useMemo in components) ──

export function getAvailableTokenCount(s: AppState): number {
  let count = 0;
  for (const t of s.tokens) {
    if (t.status === 'available') count++;
  }
  return count;
}

export function getTokenCounts(s: AppState): string {
  // Return a stable string for comparison; parse in component
  const counts: number[] = [0, 0, 0, 0, 0, 0];
  const colorIndex: Record<TokenColor, number> = {
    red: 0, blue: 1, green: 2, white: 3, purple: 4, gold: 5,
  };
  for (const t of s.tokens) {
    if (t.status === 'available') counts[colorIndex[t.color]]!++;
  }
  return counts.join(',');
}
