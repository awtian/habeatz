import { useMemo } from 'react';
import type { SpinBand, ActivatedTier } from '@/types/app';
import { getEnabledBands, getSpinOdds, getWheelSegments } from '@/lib/spin';
import { useStore } from '@/lib/state';

const BAND_COLORS: Record<SpinBand, string> = {
  small: '#22c55e',
  medium: '#3b82f6',
  big: '#a855f7',
  bonus: '#f59e0b',
  jackpot: '#ef4444',
};

const BAND_CREDITS: Record<SpinBand, string> = {
  small: '1',
  medium: '2',
  big: '3',
  bonus: '2×',
  jackpot: '10×',
};

interface SpinWheelProps {
  tier: ActivatedTier | null;
  animating: boolean;
  rotation: number;
}

export function SpinWheel({ tier, animating, rotation }: SpinWheelProps) {
  const showOdds = useStore((s) => s.settings.showOdds);
  const enabledBands = tier ? getEnabledBands(tier) : null;

  const segments = useMemo(() => getWheelSegments(), []);

  // Pre-compute SVG arc data for each segment
  const arcs = useMemo(() => {
    const cx = 130, cy = 130, r = 125;
    return segments.map((seg) => {
      // Convert degrees to radians, offset by -90 so 0° is at top
      const startRad = ((seg.startDeg - 90) * Math.PI) / 180;
      const endRad = (((seg.startDeg + seg.sweepDeg) - 90) * Math.PI) / 180;
      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);
      const largeArc = seg.sweepDeg > 180 ? 1 : 0;

      // Label position at midpoint, pushed inward for narrow segments
      const midRad = (((seg.startDeg + seg.sweepDeg / 2) - 90) * Math.PI) / 180;
      const labelR = seg.sweepDeg < 30 ? 70 : 80;
      const textX = cx + labelR * Math.cos(midRad);
      const textY = cy + labelR * Math.sin(midRad);

      return {
        band: seg.band,
        path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        textX,
        textY,
        sweepDeg: seg.sweepDeg,
        isLocked: enabledBands ? enabledBands.locked.includes(seg.band) : false,
      };
    });
  }, [segments, enabledBands]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Pointer */}
      <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-foreground" />

      {/* Wheel */}
      <div className="relative w-full max-w-[280px]">
        <svg
          viewBox="0 0 260 260"
          className="drop-shadow-lg h-auto w-full"
        >
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: '130px 130px',
              transition: animating
                ? 'transform 3.5s cubic-bezier(0.2, 0.8, 0.3, 1)'
                : 'none',
            }}
          >
            {arcs.map((arc) => (
              <g key={arc.band}>
                {/* Jackpot glow */}
                {arc.band === 'jackpot' && !arc.isLocked && (
                  <path
                    d={arc.path}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="5"
                    opacity={0.6}
                  />
                )}
                <path
                  d={arc.path}
                  fill={BAND_COLORS[arc.band]}
                  opacity={arc.isLocked ? 0.3 : 1}
                  stroke={arc.band === 'jackpot' ? '#fbbf24' : 'white'}
                  strokeWidth={arc.band === 'jackpot' ? '3' : '2'}
                />
                {/* Jackpot: gold outline only, no text */}
                {/* Other segments: show label if wide enough */}
                {arc.band !== 'jackpot' && arc.sweepDeg >= 20 && (
                  <>
                    <text
                      x={arc.textX}
                      y={arc.textY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize={arc.sweepDeg < 30 ? '8' : '11'}
                      fontWeight="bold"
                      opacity={arc.isLocked ? 0.5 : 1}
                    >
                      {arc.isLocked ? '🔒' : arc.band.charAt(0).toUpperCase() + arc.band.slice(1)}
                    </text>
                    {!arc.isLocked && arc.sweepDeg >= 30 && (
                      <text
                        x={arc.textX}
                        y={arc.textY + (arc.sweepDeg < 40 ? 10 : 14)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="9"
                        opacity={0.8}
                      >
                        {BAND_CREDITS[arc.band]}
                      </text>
                    )}
                  </>
                )}
              </g>
            ))}
          </g>
          <circle cx="130" cy="130" r="20" fill="var(--color-card)" stroke="var(--color-border)" strokeWidth="2" />
          <text x="130" y="130" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="bold" fill="var(--color-primary)">
            SPIN
          </text>
        </svg>
      </div>

      {/* Tier info */}
      {tier && enabledBands && (
        <p className="text-center text-xs text-muted-foreground">
          Tier {tier}: {enabledBands.enabled.filter((b) => b !== 'bonus' && b !== 'jackpot').join(', ')} enabled
          {enabledBands.locked.length > 0 &&
            `. ${enabledBands.locked.join(', ')} locked`}
        </p>
      )}

      {/* Odds */}
      {showOdds && (
        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          {getSpinOdds().map((o) => (
            <span key={o.band}>
              {o.band}: {o.chance}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
