'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PDFDropzoneProps {
  onFileSelect: (file: File | null) => void;
  isLoading?: boolean;
  disabled?: boolean;
  selectedFile?: File | null;
}

export function PDFDropzone({ onFileSelect, isLoading, disabled, selectedFile }: PDFDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files?.[0]?.type === 'application/pdf') {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect, disabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.[0]) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onFileSelect(null);
    },
    [onFileSelect]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-2xl"
    >
      <div className="relative">
        <label
          htmlFor="pdf-upload"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center
            w-full h-40 px-6 py-8
            border-2 border-dashed rounded-xl
            cursor-pointer transition-all duration-200
            ${
              isDragActive
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-border hover:border-primary/50 hover:bg-secondary/50'
            }
            ${isLoading || disabled ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            disabled={isLoading || disabled}
            className="sr-only"
          />

          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key="filename"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <button
                  onClick={handleClear}
                  className="text-sm text-muted-foreground mt-1 hover:text-foreground transition-colors underline"
                >
                  Clear file
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 mb-3 rounded-lg bg-secondary flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="font-medium text-foreground">
                  Drop PDF here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pitch decks, one-pagers, investor materials
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </label>

        {disabled && (
          <div className="absolute inset-0 bg-background/50 rounded-xl flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Clear URL to use PDF</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
