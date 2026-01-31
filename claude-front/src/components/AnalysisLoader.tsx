'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const stages = [
  { text: "Extracting claims...", subtext: "Finding bold statements" },
  { text: "Researching evidence...", subtext: "Searching public records" },
  { text: "Cross-referencing sources...", subtext: "LinkedIn, Crunchbase, press" },
  { text: "Verifying metrics...", subtext: "Checking the numbers" },
  { text: "Calculating BS levels...", subtext: "Almost there" },
];

interface AnalysisLoaderProps {
  message?: string;
  subtext?: string;
}

export function AnalysisLoader({ message, subtext }: AnalysisLoaderProps = {}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((s) => (s + 1) % stages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8">
      {/* Animated scanner */}
      <div className="relative w-72 h-2 bg-secondary rounded-full overflow-hidden mb-8">
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={{
            x: ['-100%', '400%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Status text */}
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {message}
          </h3>
          {subtext && (
            <p className="text-muted-foreground">
              {subtext}
            </p>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {stages[stage].text}
            </h3>
            <p className="text-muted-foreground">
              {stages[stage].subtext}
            </p>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Progress dots - only show for multi-stage */}
      {!message && (
        <div className="flex gap-2 mt-8">
          {stages.map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i <= stage ? 'bg-primary' : 'bg-secondary'
              }`}
              animate={{
                scale: i === stage ? 1.2 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
