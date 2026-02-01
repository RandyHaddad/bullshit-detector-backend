'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ReportRenderer } from '@/components/ReportRenderer';
import { ChatPanel } from '@/components/ChatPanel';
import { ActionBar } from '@/components/ActionBar';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import {
  mockTransformResponse,
  type ParseResponse,
} from '@/lib/contracts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [parseData, setParseData] = useState<ParseResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [report, setReport] = useState<string>('');
  const [isTransforming, setIsTransforming] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Load parse data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('parseData');
    if (!stored) {
      router.push('/');
      return;
    }
    setParseData(JSON.parse(stored));
  }, [router]);

  // Stream chat messages from the API
  const sendMessage = useCallback(async (userContent: string, isInitial = false) => {
    if (!parseData) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userContent,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ id: m.id, role: m.role, content: m.content })),
          url: parseData.url,
          sourceType: parseData.source,
          inputMarkdown: parseData.markdown,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        let fullContent = ''; // For chat messages (includes tool info)
        let reportContent = ''; // For report display (only AI text)
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Parse SSE data
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                // Handle text-delta events from AI SDK - this is the actual analysis text
                if (data.type === 'text-delta' && data.delta) {
                  fullContent += data.delta;
                  reportContent += data.delta;
                  
                  // Update the assistant message content
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.role === 'assistant') {
                      updated[lastIdx] = { ...updated[lastIdx], content: fullContent };
                    }
                    return updated;
                  });
                  
                  // Update report with only the AI's actual text (no tool metadata)
                  if (isInitial) {
                    setReport(reportContent);
                  }
                }
                
                // Handle tool calls - show in chat messages but not in main report
                if (data.type === 'tool-input-available') {
                  let toolInfo = '\n\n';
                  
                  if (data.toolName === 'search') {
                    const query = data.input?.query || 'unknown';
                    toolInfo += `🔍 **Searching:** "${query}"\n`;
                  } else if (data.toolName === 'scrape') {
                    const url = data.input?.url || 'unknown';
                    toolInfo += `📄 **Scraping:** ${url}\n`;
                  }
                  
                  fullContent += toolInfo;
                  
                  // Only update chat messages with tool info, not the report
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.role === 'assistant') {
                      updated[lastIdx] = { ...updated[lastIdx], content: fullContent };
                    }
                    return updated;
                  });
                }
                
                // Handle tool output - show in chat but not in report
                if (data.type === 'tool-output-available') {
                  let resultInfo = '';
                  
                  if (data.output?.web?.length > 0) {
                    resultInfo += `✅ Found ${data.output.web.length} results\n`;
                  } else if (data.output?.content) {
                    resultInfo += `✅ Content scraped successfully\n`;
                  }
                  
                  fullContent += resultInfo;
                  
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.role === 'assistant') {
                      updated[lastIdx] = { ...updated[lastIdx], content: fullContent };
                    }
                    return updated;
                  });
                }
                
                // Handle tool errors - show in chat but not in report
                if (data.type === 'tool-output-error') {
                  const errorShort = data.errorText?.includes('blocklisted') 
                    ? '❌ Site blocked (Terms of Service restriction)\n'
                    : `❌ Error: ${data.errorText?.substring(0, 100)}\n`;
                  
                  fullContent += errorShort;
                  
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.role === 'assistant') {
                      updated[lastIdx] = { ...updated[lastIdx], content: fullContent };
                    }
                    return updated;
                  });
                }
                
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
        
        // Final update
        if (isInitial) {
          setReport(reportContent);
          setIsAnalyzing(false);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      if (isInitial) {
        setIsAnalyzing(false);
      }
    } finally {
      setIsChatLoading(false);
    }
  }, [parseData, messages]);

  // Start the initial analysis when parseData is loaded
  useEffect(() => {
    if (!parseData || messages.length > 0) return;

    // Send the initial analysis request
    sendMessage(`Analyze this for BS:\n\n${parseData.markdown}`, true);
  }, [parseData, messages.length, sendMessage]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const content = chatInput.trim();
    setChatInput('');
    await sendMessage(content, false);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleViewOnPage = async () => {
    if (!parseData?.html || !parseData?.url) return;

    setIsTransforming(true);

    try {
      // TODO: Replace with actual API call when ready
      // const res = await fetch('/api/transform', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     report,
      //     html: parseData.html,
      //     url: parseData.url,
      //   }),
      // });
      // const data = await res.json();

      await new Promise((resolve) => setTimeout(resolve, 2000));
      const data = mockTransformResponse;

      // Open in new tab
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(data.html);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Error transforming page:', error);
    } finally {
      setIsTransforming(false);
    }
  };

  const handleSendEmail = async (email: string) => {
    const res = await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report, email, url: parseData?.url }),
    });
    
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to send email');
    }
  };

  // Show loader only when parseData is not loaded yet
  if (!parseData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <AnalysisLoader />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-border no-print">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <span className="text-2xl">🔍</span>
            <span className="font-bold text-lg">BS Detector</span>
          </button>
          {parseData.url && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Analyzing:</span>
              <a
                href={parseData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline max-w-xs truncate"
              >
                {parseData.url}
              </a>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Report Section */}
        <section className="flex-1 lg:w-2/3 border-r border-border overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Actions */}
            <div className="mb-8">
              <ActionBar
                onExportPDF={handleExportPDF}
                onViewOnPage={handleViewOnPage}
                onSendEmail={handleSendEmail}
                isTransforming={isTransforming}
                url={parseData.url}
              />
            </div>

            {/* Report */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {report ? (
                <>
                  <ReportRenderer content={report} />
                  {isAnalyzing && (
                    <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm">Analyzing...</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <AnalysisLoader />
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Chat Section */}
        <aside className="lg:w-1/3 h-[400px] lg:h-auto border-t lg:border-t-0 border-border no-print">
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-semibold">Follow-up Questions</h2>
            </div>
            <div className="flex-1 min-h-0">
              <ChatPanel
                messages={messages}
                input={chatInput}
                onInputChange={setChatInput}
                onSubmit={handleChatSubmit}
                isLoading={isChatLoading}
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
