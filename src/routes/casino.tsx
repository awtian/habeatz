import { useState, useCallback, useMemo } from 'react';
import { useStore } from '@/lib/state';
import { BalanceBar } from '@/components/BalanceBar';
import { CasinoTokenSelector } from '@/components/CasinoTokenSelector';
import { SpinWheel } from '@/components/SpinWheel';
import { SpinResultModal } from '@/components/SpinResultModal';
import { EmptyState } from '@/components/EmptyState';
import { getActivatedTier, getBandMidpoint } from '@/lib/spin';
import { useNavigate } from '@tanstack/react-router';
import { playWin, playBigWin, playJackpot, playNearMiss } from '@/lib/sounds';
import type { Spin, ActivatedTier, TokenColor } from '@/types/app';

export function CasinoPage() {
  const rawTokens = useStore((s) => s.tokens);
  const spins = useStore((s) => s.spins);
  const doSpin = useStore((s) => s.doSpin);
  const soundEnabled = useStore((s) => s.settings.soundEnabled);
  const navigate = useNavigate();

  const tokens = useMemo(() => rawTokens.filter((t) => t.status === 'available'), [rawTokens]);

  const [selectedTier, setSelectedTier] = useState<ActivatedTier | null>(null);
  const [selectedColor, setSelectedColor] = useState<TokenColor | null>(null);
  const [animating, setAnimating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastSpin, setLastSpin] = useState<Spin | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Resolve the actual token IDs from tier + color selection
  const selectedIds = useMemo(() => {
    if (!selectedTier || !selectedColor) return [];
    if (selectedColor === 'gold') return tokens.filter((t) => t.color === 'gold').slice(0, 1).map((t) => t.id);
    return tokens.filter((t) => t.color === selectedColor).slice(0, selectedTier).map((t) => t.id);
  }, [selectedTier, selectedColor, tokens]);

  const tier = useMemo(() => {
    const selectedTokens = tokens.filter((t) => selectedIds.includes(t.id));
    return getActivatedTier(selectedTokens);
  }, [selectedIds, tokens]);

  const canSpin = tier !== null && !animating;

  const handleTierSelect = useCallback((t: ActivatedTier) => {
    setSelectedTier(t);
    setSelectedColor(null); // reset color when tier changes
  }, []);

  const handleColorSelect = useCallback((color: TokenColor) => {
    setSelectedColor(color);
  }, []);

  const handleSpin = useCallback(() => {
    if (!canSpin || selectedIds.length === 0) return;

    const result = doSpin(selectedIds);
    setLastSpin(result);
    setSelectedTier(null);
    setSelectedColor(null);

    const midpoint = getBandMidpoint(result.visualBand);
    const targetAngle = 360 * 5 + (360 - midpoint);
    setRotation((prev) => prev + targetAngle);
    setAnimating(true);

    setTimeout(() => {
      setAnimating(false);
      setShowResult(true);
      if (soundEnabled) {
        if (result.actualBand === 'jackpot') playJackpot();
        else if (result.actualBand === 'big') playBigWin();
        else if (result.wasDowngraded) playNearMiss();
        else playWin();
      }
    }, 3600);
  }, [canSpin, doSpin, selectedIds]);

  const handleCloseResult = useCallback(() => {
    setShowResult(false);
  }, []);

  const displayTier = animating && lastSpin ? lastSpin.activatedTier : tier;

  return (
    <div>
      <BalanceBar />
      <div className="mx-auto max-w-lg px-4 pb-6">
        {/* Header */}
        <div className="mb-4 mt-4">
          <h1 className="text-2xl font-extrabold tracking-tight">Spin</h1>
          <p className="text-sm text-muted-foreground">
            Match Tokens to unlock better spins.
          </p>
        </div>

        {tokens.length === 0 ? (
          <EmptyState
            message="No Tokens available. Complete habits to earn Tokens."
            action={{
              label: 'Go to Habits',
              onClick: () => navigate({ to: '/' }),
            }}
          />
        ) : (
          <>
            {/* Token Selector */}
            {!animating && (
              <CasinoTokenSelector
                tokens={tokens}
                selectedTier={selectedTier}
                selectedColor={selectedColor}
                onTierSelect={handleTierSelect}
                onColorSelect={handleColorSelect}
              />
            )}

            {/* Wheel */}
            <div className="mt-6">
              <SpinWheel
                tier={displayTier}
                animating={animating}
                rotation={rotation}
              />
            </div>

            {/* Spin button */}
            <button
              onClick={handleSpin}
              disabled={!canSpin}
              className="mt-4 w-full rounded-full bg-primary px-5 py-3 text-base font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
            >
              {animating ? 'Spinning...' : 'Spin!'}
            </button>

            {/* Spin History */}
            {spins.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Recent Spins
                </h2>
                <div className="space-y-1.5">
                  {spins.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm"
                    >
                      <span>
                        Tier {s.activatedTier} →{' '}
                        <span className="font-semibold">{s.actualBand}</span>
                        {s.wasDowngraded && (
                          <span className="text-danger">
                            {' '}(was {s.visualBand})
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-accent">
                        +{s.creditsWon}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Result Modal */}
      {showResult && lastSpin && (
        <SpinResultModal spin={lastSpin} onClose={handleCloseResult} />
      )}
    </div>
  );
}
