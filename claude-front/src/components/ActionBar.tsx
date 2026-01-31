'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { EmailModal } from './EmailModal';

interface ActionBarProps {
  onExportPDF: () => void;
  onViewOnPage: () => void;
  onSendEmail: (email: string) => Promise<void>;
  isTransforming?: boolean;
  url?: string;
}

export function ActionBar({
  onExportPDF,
  onViewOnPage,
  onSendEmail,
  isTransforming,
  url,
}: ActionBarProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-3 no-print"
      >
        {/* Email button */}
        <Button
          variant="outline"
          onClick={() => setShowEmailModal(true)}
          className="gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Send as Email
        </Button>

        {/* PDF button */}
        <Button variant="outline" onClick={onExportPDF} className="gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export PDF
        </Button>

        {/* View on Page button - only show if we have a URL */}
        {url && (
          <Button
            variant="default"
            onClick={onViewOnPage}
            disabled={isTransforming}
            className="gap-2"
          >
            {isTransforming ? (
              <>
                <motion.span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Annotating...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View on Page
              </>
            )}
          </Button>
        )}
      </motion.div>

      <EmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={onSendEmail}
      />
    </>
  );
}
