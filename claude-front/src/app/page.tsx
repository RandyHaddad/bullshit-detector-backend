'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RotatingText } from '@/components/RotatingText';
import Link from 'next/link';

const demoClaims = [
  { claim: '$100M ARR', verdict: 'red', label: 'False', note: '47 employees on LinkedIn — typical at this ARR is 300+' },
  { claim: '10,000 enterprise customers', verdict: 'red', label: 'False', note: '12 reviews on G2, no case studies' },
  { claim: 'Series B: $80M led by Sequoia', verdict: 'amber', label: 'Inflated', note: 'Actually $45M, Sequoia participated but didn\'t lead' },
  { claim: '2025 Gartner Cool Vendor', verdict: 'red', label: 'Fabricated', note: 'Not in any Gartner report' },
  { claim: 'Ex-Google VP of Engineering', verdict: 'amber', label: 'Inflated', note: 'Was Senior Engineer, not VP' },
];

export default function HomePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
          scrolled ? 'bg-[#09090b]/80 backdrop-blur-sm border-b border-white/5' : ''
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-medium">
            <span>🔍</span>
            <span>BS Detector</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-[13px] text-[#71717a] hover:text-[#a1a1aa] transition-colors">
              How it works
            </a>
            <a href="#demo" className="text-[13px] text-[#71717a] hover:text-[#a1a1aa] transition-colors">
              Demo
            </a>
            <button
              onClick={() => router.push('/onboarding')}
              className="btn btn-primary text-[13px] py-2 px-4"
            >
              Try it
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center pt-14">
        <div className="max-w-[1100px] mx-auto px-6 w-full">
          <div className="max-w-[640px]">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wide text-[#71717a] border border-white/5 bg-white/[0.02] mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]/60" />
              Built at Hackathon 2026
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-[48px] md:text-[56px] font-semibold tracking-[-0.03em] leading-[1.1] mb-5"
            >
              Find the BS in any{' '}
              <RotatingText />
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-[16px] text-[#71717a] leading-relaxed mb-8 max-w-[480px]"
            >
              Paste a URL or upload a pitch deck. We research every claim against public evidence.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() => router.push('/onboarding')}
                className="btn btn-primary"
              >
                Analyze a page
              </button>
              <a href="#demo" className="btn btn-ghost">
                See example
              </a>
            </motion.div>
          </div>
        </div>

        {/* Built with */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="max-w-[1100px] mx-auto px-6 w-full mt-20"
        >
          <p className="text-[11px] uppercase tracking-[0.1em] text-[#52525b] mb-4">Built with</p>
          <div className="flex items-center gap-8 text-[13px] text-[#52525b]/60 font-medium">
            <span>Firecrawl</span>
            <span>Claude</span>
            <span>OpenRouter</span>
            <span>MongoDB</span>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="mb-12">
            <p className="section-label mb-3">How it works</p>
            <h2 className="text-[32px] font-semibold tracking-[-0.02em]">
              From URL to verdict in seconds
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                title: 'Paste or upload',
                desc: 'Enter a landing page URL or upload a pitch deck PDF. We extract every factual claim.',
              },
              {
                step: '02',
                title: 'AI researches',
                desc: 'Our agent searches LinkedIn, Crunchbase, SEC filings, reviews, and news to verify each claim.',
              },
              {
                step: '03',
                title: 'Get verdicts',
                desc: 'Each claim gets a verdict with evidence. Red flags surface instantly.',
              },
            ].map((item) => (
              <div key={item.step} className="card p-8">
                <span className="mono text-[12px] text-[#52525b] mb-4 block">{item.step}</span>
                <h3 className="text-[18px] font-semibold mb-2">{item.title}</h3>
                <p className="text-[14px] text-[#a1a1aa] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-32 bg-[#0a0a0c]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="mb-12">
            <p className="section-label mb-3">Example report</p>
            <h2 className="text-[32px] font-semibold tracking-[-0.02em]">
              What we found on acme-ai.com
            </h2>
          </div>

          {/* Report card - designed to look like actual product */}
          <div className="card overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
                <span className="text-[14px] font-medium">5 red flags detected</span>
              </div>
              <span className="mono text-[12px] text-[#52525b]">acme-ai.com/about</span>
            </div>

            {/* Claims list */}
            <div className="divide-y divide-white/5">
              {demoClaims.map((item, idx) => (
                <div key={idx} className="px-6 py-4 flex items-start justify-between gap-8">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#fafafa] mb-1">
                      &ldquo;{item.claim}&rdquo;
                    </p>
                    <p className="text-[13px] text-[#71717a]">{item.note}</p>
                  </div>
                  <span className={`badge badge-${item.verdict} shrink-0`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
              <button
                onClick={() => router.push('/onboarding')}
                className="btn btn-primary w-full justify-center"
              >
                Analyze your own
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="mb-12">
            <p className="section-label mb-3">Features</p>
            <h2 className="text-[32px] font-semibold tracking-[-0.02em]">
              Everything you need
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'PDF support', desc: 'Upload pitch decks directly. We parse every slide.' },
              { title: 'Source links', desc: 'Every verdict links to evidence. Verify our verification.' },
              { title: 'Email reports', desc: 'Send findings to your team with one click.' },
              { title: 'Page annotations', desc: 'See claims highlighted directly on the original page.' },
              { title: 'Cached results', desc: 'Previously analyzed? Get results instantly.' },
              { title: 'API access', desc: 'Integrate BS detection into your workflow.' },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <h3 className="text-[16px] font-semibold mb-1">{item.title}</h3>
                <p className="text-[14px] text-[#a1a1aa]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <h2 className="text-[32px] font-semibold tracking-[-0.02em] mb-4">
            Ready to verify?
          </h2>
          <p className="text-[16px] text-[#71717a] mb-8">
            Paste a URL and see what we find.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="btn btn-primary"
          >
            Analyze a page
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] text-[#52525b]">
            <span>🔍</span>
            <span>BS Detector</span>
            <span className="mx-2">·</span>
            <span>Built at Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-[#52525b]">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#a1a1aa] transition-colors">
              GitHub
            </a>
            <button onClick={() => router.push('/onboarding')} className="hover:text-[#a1a1aa] transition-colors">
              Launch app
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
