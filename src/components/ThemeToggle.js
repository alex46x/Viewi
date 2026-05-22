'use client';

import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';

export default function ThemeToggle({ className, variant = 'default' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative flex items-center justify-center rounded-xl border transition-all duration-300 active:scale-95',
        variant === 'compact' && 'w-9 h-9',
        variant === 'default' && 'w-10 h-10',
        variant === 'pill' && 'h-9 px-3 gap-2',
        isDark
          ? 'border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08] hover:text-white'
          : 'border-black/[0.08] bg-black/[0.04] text-zinc-600 hover:bg-black/[0.06] hover:text-zinc-900',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <Sun
        className={cn(
          'transition-all duration-300',
          variant === 'compact' ? 'w-4 h-4' : 'w-[18px] h-[18px]',
          isDark ? 'scale-0 rotate-90 opacity-0 absolute' : 'scale-100 rotate-0 opacity-100'
        )}
      />
      <Moon
        className={cn(
          'transition-all duration-300',
          variant === 'compact' ? 'w-4 h-4' : 'w-[18px] h-[18px]',
          isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0 absolute'
        )}
      />
      {variant === 'pill' && (
        <span className="text-xs font-semibold hidden sm:inline">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
