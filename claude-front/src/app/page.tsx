'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
      <header className="w-full px-6 py-4 relative z-10 backdrop-blur-md bg-card/30 border-b border-border/50">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="relative w-10 h-10"
            >
              <Image
                src="/penguin-logo.png"
                alt="Penguin.AI Logo"
                width={40}
                height={40}
                className="drop-shadow-lg"
              />
            </motion.div>
            <span className="font-bold text-lg text-foreground">BS Detector</span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => router.push('/onboarding')}
            className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
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
          className="text-center mb-8 backdrop-blur-md bg-card/50 border border-border/50 rounded-3xl p-6 shadow-2xl max-w-4xl"
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground"
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
              className="block mb-1"
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
              className="flex items-center justify-center gap-4 flex-wrap mb-2"
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
            className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium"
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
            className="text-sm font-semibold text-foreground mb-4 text-center backdrop-blur-sm bg-card/40 border border-border/50 rounded-full px-6 py-2 inline-block"
            style={{ 
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
            className="px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-border/50 relative z-10 backdrop-blur-md bg-card/30">
        <motion.div 
          className="max-w-6xl mx-auto text-center text-sm text-muted-foreground font-medium"
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
