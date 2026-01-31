'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ParseResponse } from '@/lib/contracts';

interface ParsePreviewProps {
  data: ParseResponse;
  onConfirm: () => void;
  onBack: () => void;
}

export function ParsePreview({ data, onConfirm, onBack }: ParsePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      {/* Header Card */}
      <div className="backdrop-blur-xl bg-white/40 rounded-2xl shadow-xl border border-white/50 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-white/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">Content Parsed Successfully</h2>
              <p className="text-sm text-gray-700">
                Source: <span className="font-medium capitalize">{data.source}</span>
                {data.url && (
                  <>
                    {' '}&middot;{' '}
                    <a 
                      href={data.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-700 hover:underline"
                    >
                      {new URL(data.url).hostname}
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="backdrop-blur-xl bg-white/40 rounded-2xl shadow-xl border border-white/50 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-white/30 bg-white/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Extracted Content Preview</h3>
            <span className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded-full">
              {data.markdown.split('\n').length} lines
            </span>
          </div>
        </div>
        
        {/* Scrollable markdown preview */}
        <div className="max-h-[400px] overflow-y-auto">
          <div className="px-6 py-4 prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-a:text-purple-700 prose-strong:text-gray-900 prose-ul:text-gray-800 prose-li:text-gray-800">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300/50">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-gray-900 mt-3 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-800 mb-2 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-3 space-y-1">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="text-gray-800">
                    {children}
                  </li>
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-700 hover:underline"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100/50 px-2 py-1 rounded">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {alt || 'Image'}
                  </span>
                ),
              }}
            >
              {data.markdown}
            </ReactMarkdown>
          </div>
        </div>

        {/* Fade overlay at bottom */}
        <div className="h-8 bg-gradient-to-t from-white/60 to-transparent -mt-8 relative pointer-events-none" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <motion.button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 font-medium rounded-xl bg-white/50 hover:bg-white/70 border border-white/50 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </span>
        </motion.button>

        <motion.button
          onClick={onConfirm}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center gap-2">
            Analyze for BS
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
