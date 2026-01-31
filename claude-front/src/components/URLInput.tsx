'use client';

import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface URLInputProps {
  value: string;
  onChange: (url: string) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function URLInput({ value, onChange, onSubmit, isLoading, disabled }: URLInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && onSubmit) {
      onSubmit();
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="relative flex-1">
        <Input
          type="url"
          placeholder="https://startup-website.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading || disabled}
          className="h-14 text-lg pl-5 pr-4 bg-card border-2 border-border focus:border-primary transition-colors rounded-xl disabled:opacity-50"
        />
        {disabled && (
          <div className="absolute inset-0 bg-background/50 rounded-xl flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Clear PDF to use URL</span>
          </div>
        )}
      </div>
    </motion.form>
  );
}
