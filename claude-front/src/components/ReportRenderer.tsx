'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { VerdictBadge } from './VerdictBadge';
import type { VerdictType } from '@/lib/contracts';

interface ReportRendererProps {
  content: string;
}

// Extract verdict from heading text
function extractVerdict(text: string): VerdictType | null {
  const lower = text.toLowerCase();
  if (lower.includes('false') || lower.includes('fabricated')) return 'false';
  if (lower.includes('inflated') || lower.includes('likely inflated')) return 'inflated';
  if (lower.includes('unverifiable') || lower.includes('suspicious')) return 'unverifiable';
  if (lower.includes('verified') || lower.includes('checks out')) return 'verified';
  if (lower.includes('partial')) return 'partial';
  return null;
}

export function ReportRenderer({ content }: ReportRendererProps) {
  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="prose prose-slate max-w-none"
    >
      <ReactMarkdown
        components={{
          h2: ({ children }) => {
            const text = String(children);
            const isOverallAssessment = text.toLowerCase().includes('overall assessment');

            return (
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className={`text-2xl font-bold mt-8 mb-4 pb-2 border-b border-border ${
                  isOverallAssessment ? 'text-primary' : ''
                }`}
              >
                {children}
              </motion.h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const verdict = extractVerdict(text);

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 mb-3"
              >
                <h3 className="text-lg font-semibold flex items-center gap-3 flex-wrap">
                  <span className="font-mono bg-secondary px-2 py-1 rounded text-base">
                    {text.replace(/Verdict:.*$/i, '').trim()}
                  </span>
                  {verdict && <VerdictBadge verdict={verdict} size="sm" />}
                </h3>
              </motion.div>
            );
          },
          p: ({ children }) => {
            const text = String(children);

            // Check for verdict line
            if (text.startsWith('**Verdict:')) {
              const verdict = extractVerdict(text);
              return (
                <p className="flex items-center gap-2 my-3">
                  {verdict && <VerdictBadge verdict={verdict} />}
                </p>
              );
            }

            return (
              <p className="my-3 leading-relaxed text-foreground/90">
                {children}
              </p>
            );
          },
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-3 space-y-2 list-disc pl-5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 space-y-2 list-decimal pl-5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground/90">
              {children}
            </li>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-8 border-border" />,
          code: ({ children }) => (
            <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.article>
  );
}
