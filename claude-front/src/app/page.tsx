'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RotatingText } from '@/components/RotatingText';
import { SourceScanner } from '@/components/SourceScanner';

export default function HomePage() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], ['0%', '50%']);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const { currentTarget, clientX: x, clientY: y } = e;
      const el = currentTarget as HTMLElement;
      const { top: t, left: l, width: w, height: h } = el.getBoundingClientRect();
      el.style.setProperty('--posX', String(x - l - w / 2));
      el.style.setProperty('--posY', String(y - t - h / 2));
    };

    document.body.addEventListener('pointermove', handlePointerMove);
    return () => document.body.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">

      {/* Header */}
      <header className="w-full px-6 py-4 relative z-10 backdrop-blur-md bg-white/10">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            <motion.span 
              className="text-2xl drop-shadow-lg"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🔍
            </motion.span>
            <span className="font-bold text-lg text-gray-900 drop-shadow-md">BS Detector</span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => router.push('/onboarding')}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start
          </motion.button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-6 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          style={{ opacity }}
          className="text-center mb-8 backdrop-blur-sm bg-white/20 rounded-3xl p-6 shadow-2xl max-w-4xl"
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.2,
                }
              }
            }}
          >
            <motion.span 
              className="block mb-1 text-gray-900"
              variants={{
                hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  filter: 'blur(0px)',
                  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                }
              }}
            >
              Find the BS
            </motion.span>
            <motion.span 
              className="flex items-center justify-center gap-4 flex-wrap mb-2 text-gray-900"
              variants={{
                hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  filter: 'blur(0px)',
                  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                }
              }}
            >
              <span>in any</span>
              <RotatingText />
            </motion.span>
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-800 max-w-2xl mx-auto font-medium"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              filter: 'blur(0px)',
            }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Paste a landing page URL or upload a pitch deck. We&apos;ll research every claim
            against public evidence and tell you what&apos;s real.
          </motion.p>
        </motion.div>

        {/* Source Scanner Demo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl mx-auto px-4"
        >
          <motion.p
            className="text-sm font-semibold text-gray-900 mb-4 text-center backdrop-blur-sm bg-white/30 rounded-full px-6 py-2 inline-block"
            style={{ 
              textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
              display: 'block',
              margin: '0 auto 1rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            We cross-reference claims against multiple sources
          </motion.p>
          <div className="scale-90 origin-top">
            <SourceScanner />
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="mt-6"
        >
          <motion.button
            onClick={() => router.push('/onboarding')}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-white/20 relative z-10 backdrop-blur-md bg-white/10">
        <motion.div 
          className="max-w-6xl mx-auto text-center text-sm text-gray-800 font-medium"
          style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <p>Built for hackathon. Not financial advice. Do your own research.</p>
        </motion.div>
      </footer>
    </main>
  );
}
