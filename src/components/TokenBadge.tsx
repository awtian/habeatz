import type { TokenColor } from '@/types/app';

const TOKEN_STYLES: Record<TokenColor, { bg: string; label: string; textColor: string }> = {
  red: { bg: 'bg-token-red', label: 'Red', textColor: 'text-white' },
  blue: { bg: 'bg-token-blue', label: 'Blue', textColor: 'text-white' },
  green: { bg: 'bg-token-green', label: 'Green', textColor: 'text-white' },
  white: { bg: 'bg-token-white ring-2 ring-border', label: 'White', textColor: 'text-foreground' },
  purple: { bg: 'bg-token-purple', label: 'Purple', textColor: 'text-white' },
  gold: { bg: 'bg-token-gold ring-2 ring-amber-300', label: 'Gold', textColor: 'text-white' },
};

interface TokenBadgeProps {
  color: TokenColor;
  count?: number;
  size?: 'sm' | 'md';
}

export function TokenBadge({ color, count, size = 'sm' }: TokenBadgeProps) {
  const style = TOKEN_STYLES[color];
  const sizeClass = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs';

  return (
    <div className="flex items-center gap-1">
      <div
        className={`${style.bg} ${sizeClass} flex items-center justify-center rounded-full font-bold text-white shadow-sm`}
        title={`${style.label} Token`}
      />
      {count !== undefined && (
        <span className="text-xs font-semibold text-foreground">
          {count}
        </span>
      )}
    </div>
  );
}
