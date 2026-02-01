'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { VerdictType } from '@/lib/contracts';

interface VerdictBadgeProps {
  verdict: VerdictType;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const verdictConfig: Record<VerdictType, { label: string; emoji: string; className: string }> = {
  false: {
    label: 'FALSE',
    emoji: '🔴',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  inflated: {
    label: 'INFLATED',
    emoji: '🔴',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  unverifiable: {
    label: 'UNVERIFIABLE',
    emoji: '🟡',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  verified: {
    label: 'VERIFIED',
    emoji: '🟢',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  partial: {
    label: 'PARTIAL',
    emoji: '🟢',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export function VerdictBadge({ verdict, size = 'md', animate = true }: VerdictBadgeProps) {
  const config = verdictConfig[verdict];

  const badge = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border',
        config.className,
        sizeClasses[size]
      )}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );

  if (!animate) return badge;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      {badge}
    </motion.span>
  );
}
