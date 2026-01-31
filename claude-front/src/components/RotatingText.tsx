'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const useCases = [
  { text: 'startup claim', gradient: 'from-rose-500 via-pink-500 to-purple-500' },
  { text: 'sales pitch', gradient: 'from-purple-500 via-violet-500 to-indigo-500' },
  { text: 'investor deck', gradient: 'from-indigo-500 via-blue-500 to-cyan-500' },
  { text: 'job listing', gradient: 'from-cyan-500 via-teal-500 to-emerald-500' },
  { text: 'product launch', gradient: 'from-emerald-500 via-green-500 to-lime-500' },
  { text: 'press release', gradient: 'from-orange-500 via-amber-500 to-yellow-500' },
  { text: 'testimonial', gradient: 'from-pink-500 via-rose-500 to-red-500' },
  { text: 'case study', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' },
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
    <span className="inline-flex justify-center items-center relative" style={{ minWidth: '320px', minHeight: '1.2em' }}>
      {/* Invisible text to hold the space for the longest word */}
      <span className="invisible">product launch</span>

      {/* Glow effect behind text */}
      <AnimatePresence mode="wait">
        <motion.span
          key={`glow-${index}`}
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r ${currentCase.gradient} blur-xl opacity-30`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {currentCase.text}
        </motion.span>
      </AnimatePresence>

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
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r ${currentCase.gradient} bg-clip-text text-transparent font-bold`}
          style={{
            transformOrigin: 'center center',
            perspective: '1000px',
            WebkitBackgroundClip: 'text',
            backgroundSize: '200% 200%',
          }}
        >
          <motion.span
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
            className={`bg-gradient-to-r ${currentCase.gradient} bg-clip-text text-transparent`}
          >
            {currentCase.text}
          </motion.span>
        </motion.span>
      </AnimatePresence>

      {/* Animated underline */}
      <AnimatePresence mode="wait">
        <motion.span
          key={`underline-${index}`}
          className={`absolute -bottom-2 left-1/2 h-1 rounded-full bg-gradient-to-r ${currentCase.gradient}`}
          initial={{ width: 0, x: '-50%', opacity: 0 }}
          animate={{ 
            width: '80%', 
            x: '-50%', 
            opacity: 1,
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          exit={{ width: 0, x: '-50%', opacity: 0 }}
          transition={{ 
            width: { delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            opacity: { delay: 0.3, duration: 0.4 },
            backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' }
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        />
      </AnimatePresence>
    </span>
  );
}
