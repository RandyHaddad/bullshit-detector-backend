'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockBSReport } from '@/lib/contracts';

export default function DemoPage() {
  const router = useRouter();
  const [url, setUrl] = useState('https://techstartup.ai');
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowReport(true);
    }, 1500);
  };

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-medium">
            <span>🔍</span>
            <span>BS Detector</span>
          </Link>
          <button
            onClick={() => router.push('/analyze')}
            className="btn btn-primary text-[13px] py-2 px-4"
          >
            Try for real
          </button>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-[800px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <span className="inline-block px-2 py-1 text-[11px] uppercase tracking-wide text-[#d97706] bg-[#d97706]/10 rounded mb-4">
              Demo
            </span>
            <h1 className="text-[32px] font-semibold tracking-[-0.02em] mb-2">
              See BS Detector in action
            </h1>
            <p className="text-[14px] text-[#71717a]">
              This shows mock results. Try the real app to analyze actual URLs.
            </p>
          </div>

          {!showReport && (
            <div className="card p-6 mb-6">
              <label className="text-[13px] text-[#a1a1aa] mb-2 block">URL to analyze</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#09090b] border border-white/10 rounded-lg text-[14px] focus:outline-none focus:border-white/20"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
          )}

          {showReport && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
                  <span className="text-[14px] font-medium">Analysis complete</span>
                </div>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-[12px] text-[#71717a] hover:text-[#a1a1aa]"
                >
                  Analyze another
                </button>
              </div>

              <div className="px-6 py-6">
                <div className="prose prose-sm prose-invert max-w-none text-[14px] leading-relaxed text-[#a1a1aa]">
                  {mockBSReport.split('\n').map((line, idx) => {
                    if (line.startsWith('## ')) {
                      return (
                        <h2 key={idx} className="text-[18px] font-semibold text-[#fafafa] mt-8 mb-3 first:mt-0">
                          {line.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (line.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-[15px] font-medium text-[#fafafa] mt-6 mb-2">
                          {line.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('**Verdict:')) {
                      const text = line.replace(/\*\*/g, '');
                      const isRed = text.includes('False') || text.includes('Inflated');
                      const isAmber = text.includes('Unverifiable');
                      const isGreen = text.includes('Verified');
                      return (
                        <p key={idx} className={`font-medium mb-2 ${isRed ? 'text-[#dc2626]' : isAmber ? 'text-[#d97706]' : isGreen ? 'text-[#16a34a]' : 'text-[#a1a1aa]'}`}>
                          {text}
                        </p>
                      );
                    }
                    if (line.startsWith('---')) {
                      return <hr key={idx} className="my-6 border-white/5" />;
                    }
                    if (line.trim() === '') {
                      return null;
                    }
                    return (
                      <p key={idx} className="mb-2">
                        {line.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')}
                      </p>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/5">
                <button
                  onClick={() => router.push('/analyze')}
                  className="btn btn-primary w-full justify-center"
                >
                  Try with a real URL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
