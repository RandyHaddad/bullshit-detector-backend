'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { URLInput } from '@/components/URLInput';
import { PDFDropzone } from '@/components/PDFDropzone';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { ParsePreview } from '@/components/ParsePreview';
import { ParseResponse } from '@/lib/contracts';

type Step = 'input' | 'loading' | 'preview' | 'error';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [url, setUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [parseData, setParseData] = useState<ParseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleRun = async () => {
    if (!url && !pdfFile) return;
    
    setStep('loading');
    setError(null);

    try {
      if (url) {
        // Handle URL submission - call the backend via API route
        const response = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to parse URL');
        }
        
        const data: ParseResponse = await response.json();
        setParseData(data);
        setStep('preview');
      } else if (pdfFile) {
        // Handle PDF submission via API route
        const formData = new FormData();
        formData.append('file', pdfFile);
        
        const response = await fetch('/api/parse', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to parse PDF');
        }
        
        const data: ParseResponse = await response.json();
        setParseData(data);
        setStep('preview');
      }
    } catch (err) {
      console.error('Error processing:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStep('error');
    }
  };

  const handleConfirmAnalysis = () => {
    if (!parseData) return;
    sessionStorage.setItem('parseData', JSON.stringify(parseData));
    router.push('/analyze');
  };

  const handleBack = () => {
    setStep('input');
    setParseData(null);
    setError(null);
  };

  // Error state
  if (step === 'error') {
    return (
      <main className="min-h-screen flex flex-col relative overflow-hidden">
        <header className="w-full px-6 py-4 relative z-10 backdrop-blur-md bg-white/10">
          <nav className="max-w-6xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <span className="text-2xl drop-shadow-lg">🔍</span>
              <span className="font-bold text-lg text-gray-900 drop-shadow-md">BS Detector</span>
            </motion.div>
          </nav>
        </header>

        <section className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl bg-white/40 rounded-2xl shadow-xl border border-white/50 p-8 max-w-md text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Parsing Failed</h2>
            <p className="text-gray-700 mb-6">{error || 'An error occurred while parsing the content.'}</p>
            <motion.button
              onClick={handleBack}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Try Again
            </motion.button>
          </motion.div>
        </section>
      </main>
    );
  }

  // Loading state
  if (step === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <AnalysisLoader message="Parsing content..." />
      </main>
    );
  }

  // Preview state
  if (step === 'preview' && parseData) {
    return (
      <main className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="w-full px-6 py-4 relative z-10 backdrop-blur-md bg-white/10">
          <nav className="max-w-6xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <span className="text-2xl drop-shadow-lg">🔍</span>
              <span className="font-bold text-lg text-gray-900 drop-shadow-md">BS Detector</span>
            </motion.div>
          </nav>
        </header>

        {/* Preview Content */}
        <section className="flex-1 flex flex-col items-center justify-start px-6 py-8 relative z-10">
          <ParsePreview 
            data={parseData} 
            onConfirm={handleConfirmAnalysis}
            onBack={handleBack}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">

      {/* Header */}
      <header className="w-full px-6 py-4 relative z-10 backdrop-blur-md bg-white/10">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <span className="text-2xl drop-shadow-lg">🔍</span>
            <span className="font-bold text-lg text-gray-900 drop-shadow-md">BS Detector</span>
          </motion.div>
        </nav>
      </header>

      {/* Main Content */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 backdrop-blur-sm bg-white/20 rounded-3xl p-8 shadow-2xl"
        >
          <h1 
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            Get Started
          </h1>
          <p 
            className="text-lg text-gray-800 max-w-xl mx-auto font-medium"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
          >
            Choose how you&apos;d like to analyze your content
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          className="w-full max-w-2xl flex flex-col items-center gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              }
            }
          }}
        >
          <motion.div
            className="w-full"
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              }
            }}
          >
            <URLInput 
              value={url}
              onChange={setUrl}
              onSubmit={() => handleRun()}
              isLoading={false}
              disabled={!!pdfFile}
            />
          </motion.div>

          <motion.div
            className="flex items-center gap-4 w-full max-w-md"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { duration: 0.4 }
              }
            }}
          >
            <motion.div 
              className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"
            />
            <span 
              className="text-sm text-gray-900 font-semibold backdrop-blur-sm bg-white/30 px-3 py-1 rounded-full"
              style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
            >
              or
            </span>
            <motion.div 
              className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"
            />
          </motion.div>

          <motion.div
            className="w-full"
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              }
            }}
          >
            <PDFDropzone 
              onFileSelect={setPdfFile}
              isLoading={false}
              disabled={!!url}
              selectedFile={pdfFile}
            />
          </motion.div>

          {/* Run Button */}
          <motion.button
            onClick={handleRun}
            disabled={!url && !pdfFile}
            className="mt-4 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-lg"
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Run Analysis
          </motion.button>
        </motion.div>
      </section>
    </main>
  );
}
