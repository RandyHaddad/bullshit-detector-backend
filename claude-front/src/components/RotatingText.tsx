'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = [
  'pitch deck',
  'landing page',
  'press release',
  'job listing',
  'case study',
];

export function RotatingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block" style={{ minWidth: '180px' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="inline-block text-[#f87171]"
        >
          {words[index]}
          <span
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f87171]/40"
            style={{ bottom: '-2px' }}
          />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
