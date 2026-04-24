import type { Spin } from '@/types/app';
import { getNearMissMessage } from '@/lib/spin';
import { Sparkles, X } from 'lucide-react';

interface SpinResultModalProps {
  spin: Spin;
  onClose: () => void;
}

export function SpinResultModal({ spin, onClose }: SpinResultModalProps) {
  const nearMiss = getNearMissMessage(
    spin.visualBand,
    spin.activatedTier,
    spin.wasDowngraded,
  );

  const isJackpot = spin.actualBand === 'jackpot';
  const isBig = spin.actualBand === 'big';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-xl ${
          isJackpot ? 'ring-4 ring-amber-400' : ''
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>

        {isJackpot && (
          <div className="mb-2 flex justify-center gap-1">
            <Sparkles size={36} className="text-amber-400" />
            <Sparkles size={36} className="text-amber-400" />
            <Sparkles size={36} className="text-amber-400" />
          </div>
        )}

        <h2 className={`font-extrabold ${isJackpot ? 'text-3xl text-amber-400' : 'text-xl'}`}>
          {isJackpot
            ? 'JACKPOT!'
            : isBig
              ? 'Big hit!'
              : spin.wasDowngraded
                ? 'Near miss!'
                : 'Spin result'}
        </h2>

        <div className="mt-3">
          <p className="text-sm text-muted-foreground">
            Wheel landed on{' '}
            <span className="font-semibold text-foreground">
              {spin.visualBand.charAt(0).toUpperCase() + spin.visualBand.slice(1)}
            </span>
          </p>

          {spin.wasDowngraded && (
            <p className="mt-1 text-sm text-danger">
              {nearMiss}
            </p>
          )}

          {!spin.wasDowngraded && spin.actualBand === 'big' && (
            <p className="mt-1 text-sm text-primary">
              Big hit! You unlocked the full payout.
            </p>
          )}

          {!spin.wasDowngraded && isJackpot && (
            <p className="mt-1 text-sm text-danger">
              Tier {spin.activatedTier} multiplier applied!
            </p>
          )}
        </div>

        <div className="mt-4">
          <span className={`font-extrabold ${isJackpot ? 'text-5xl text-amber-400' : 'text-3xl text-accent'}`}>
            +{spin.creditsWon}
          </span>
          <p className="text-xs text-muted-foreground">Credits won</p>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          Tier {spin.activatedTier} spin
        </div>

        <button
          onClick={onClose}
          className={`mt-5 w-full rounded-full px-4 py-3 text-sm font-semibold shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] ${
            isJackpot
              ? 'bg-amber-500 text-white'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          Collect {spin.creditsWon} Credits
        </button>
      </div>
    </div>
  );
}
