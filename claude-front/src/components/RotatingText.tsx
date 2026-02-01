'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const useCases = [
  { text: 'startup claim', color: 'text-purple-600' },
  { text: 'sales pitch', color: 'text-purple-600' },
  { text: 'investor deck', color: 'text-purple-600' },
  { text: 'job listing', color: 'text-purple-600' },
  { text: 'product launch', color: 'text-purple-600' },
  { text: 'press release', color: 'text-purple-600' },
  { text: 'testimonial', color: 'text-purple-600' },
  { text: 'case study', color: 'text-purple-600' },
];

export function RotatingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % useCases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentCase = useCases[index];

  return (
    <span className="inline-flex justify-start items-center relative" style={{ minWidth: '320px', minHeight: '1.2em' }}>
      {/* Invisible text to hold the space for the longest word */}
      <span className="invisible">product launch</span>

      <AnimatePresence mode="wait">
        <motion.span
          key={`text-${index}`}
          initial={{
            rotateX: -90,
            opacity: 0,
            y: 30,
            filter: 'blur(8px)',
            scale: 0.8,
          }}
          animate={{
            rotateX: 0,
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
          }}
          exit={{
            rotateX: 90,
            opacity: 0,
            y: -30,
            filter: 'blur(8px)',
            scale: 0.8,
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`absolute inset-0 flex items-center justify-start ${currentCase.color} font-bold`}
          style={{
            transformOrigin: 'center center',
            perspective: '1000px',
          }}
        >
          {currentCase.text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
