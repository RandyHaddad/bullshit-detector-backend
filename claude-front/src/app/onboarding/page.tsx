'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ParseResponse } from '@/lib/contracts';

export default function OnboardingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to parse URL');
      }

      const data: ParseResponse = await response.json();
      sessionStorage.setItem('parseData', JSON.stringify(data));
      router.push('/analyze');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
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
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-[480px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[32px] font-semibold tracking-[-0.02em] mb-2">
              Analyze a page
            </h1>
            <p className="text-[14px] text-[#71717a]">
              Enter a URL to fact-check. We&apos;ll extract claims and verify them against public evidence.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="card p-6 mb-4">
              <label className="text-[13px] text-[#a1a1aa] mb-2 block">
                URL to analyze
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/about"
                className="w-full px-3 py-2.5 bg-[#09090b] border border-white/10 rounded-lg text-[14px] placeholder-[#52525b] focus:outline-none focus:border-white/20 mb-4"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!url.trim() || isLoading}
                className="btn btn-primary w-full justify-center disabled:opacity-50"
              >
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>

            {error && (
              <div className="card p-4 border-[#dc2626]/20 bg-[#dc2626]/5">
                <p className="text-[13px] text-[#dc2626]">{error}</p>
              </div>
            )}
          </form>

          {/* Info */}
          <div className="mt-8 text-[13px] text-[#52525b]">
            <p className="mb-2">We&apos;ll check claims against:</p>
            <ul className="space-y-1">
              <li>• LinkedIn employee counts</li>
              <li>• Crunchbase funding data</li>
              <li>• SEC filings</li>
              <li>• G2 and app store reviews</li>
              <li>• News and press coverage</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
