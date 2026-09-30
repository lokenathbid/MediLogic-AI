import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  Bot, 
  User, 
  Info, 
  Trash2,
  Stethoscope,
  FileText,
  HelpCircle,
  Activity,
  ArrowUp
} from 'lucide-react';
import { askAiService } from '../lib/aiService';

export default function AskAiDrawer({
  isOpen,
  onClose,
  activePage = 'landing',
  selectedSymptoms = [],
  diagnosticResult = null,
  selectedReportForView = null,
  patientInfo = null
}) {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]); // [{ id, role: 'user'|'assistant', text, isError, timestamp }]
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Determine current active report context if on results/history page
  const currentReport = selectedReportForView || diagnosticResult;

  // Initial welcome message generator based on current page context
  const getContextualWelcome = (page, report, symptoms) => {
    if (page === 'symptoms') {
      const symCount = symptoms?.length || 0;
      return {
        id: 'welcome-symptoms',
        role: 'assistant',
        text: `Hello! I am your MediLogic AI Educational Assistant.\n\nI can help explain:\n• **Medical terms** (e.g., *Dyspnea*, *Phlegm*, *Wheezing*, *Myalgia*)\n• **Symptom severity levels** (Mild, Moderate, Severe)\n• **Red-flag emergency warning signs**\n\n${symCount > 0 ? `You currently have **${symCount} symptom(s)** selected.` : 'Select symptoms from the catalog or ask me any questions.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    if (page === 'results') {
      const conditionName = report?.primaryCondition?.name || report?.primary_condition?.name || 'your analysis';
      const matchPct = report?.primaryCondition?.confidencePercentage || report?.primary_condition?.confidencePercentage || 0;
      return {
        id: 'welcome-results',
        role: 'assistant',
        text: `Hello! I can explain your **${conditionName}** report in simple, everyday language.\n\nAsk me:\n• **What your report means in plain English**\n• **What the ${matchPct}% symptom match score really means**\n• **Why certain symptoms were matched or unmatched**\n• **What questions you should ask your doctor**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    if (page === 'history') {
      return {
        id: 'welcome-history',
        role: 'assistant',
        text: `Hello! You are viewing your diagnostic history. Ask me to explain any previous diagnostic evaluations or clinical terms recorded in your account.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    if (page === 'about') {
      return {
        id: 'welcome-about',
        role: 'assistant',
        text: `Hello! Ask me about how the MediLogic AI forward-chaining expert inference engine and rule-based diagnostic algorithms work.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    return {
      id: 'welcome-general',
      role: 'assistant',
      text: `Hello! I am your MediLogic AI Medical Assistant.\n\nI can explain medical terms, symptoms, and your diagnostic reports in simple, patient-friendly language. Ask me anything about what you see on screen!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Initialize messages if empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([getContextualWelcome(activePage, currentReport, selectedSymptoms)]);
    }
  }, [activePage, currentReport, selectedSymptoms]);

  // Focus input without scrolling the main page when drawer opens
  useEffect(() => {
    if (isOpen) {
      // Use preventScroll to strictly avoid page jumping
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Internal drawer scroll ONLY - never touch main window
  const scrollToInternalBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToInternalBottom();
  }, [messages, loading]);

  // Handle ESC key to close drawer without scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle sending a message
  const handleSendMessage = async (textToSend = null) => {
    const question = (textToSend || inputValue).trim();
    if (!question || loading) return;

    const userMessageId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        role: 'user',
        text: question,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    // Build relevant minimum context
    const context = {
      currentPage: activePage,
      patient: patientInfo ? { age: patientInfo.age, gender: patientInfo.gender } : null,
      selectedSymptoms: selectedSymptoms.map(s => ({
        name: s.name,
        severity: s.severity,
        duration: s.duration,
        redFlag: s.redFlag
      })),
      reportSummary: currentReport ? {
        primaryCondition: currentReport.primaryCondition?.name || currentReport.primary_condition?.name,
        matchPercentage: currentReport.primaryCondition?.confidencePercentage || currentReport.primary_condition?.confidencePercentage,
        riskLevel: currentReport.riskLevel || currentReport.risk_level,
        triageLevel: currentReport.triageLevel || currentReport.triage_level,
        matchedSymptoms: currentReport.matchedSymptoms || currentReport.matched_symptoms,
        unmatchedSymptoms: currentReport.unmatchedSymptoms || currentReport.unmatched_symptoms,
        hasEmergencyRedFlag: currentReport.hasEmergencyRedFlag || (currentReport.riskLevel === 'emergency')
      } : null
    };

    try {
      const response = await askAiService.askQuestion(question, context);
      
      if (response.error) {
        setMessages([
          ...newMessages,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: response.error,
            isError: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: response.text,
            isError: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: err.message || 'AI explanation is temporarily unavailable. Please try again.',
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([getContextualWelcome(activePage, currentReport, selectedSymptoms)]);
  };

  // Contextual suggested prompt chips
  const getSuggestedPrompts = () => {
    if (activePage === 'symptoms') {
      return [
        'What does Dyspnea mean?',
        'What is Phlegm?',
        'Explain symptom severity (1-10)',
        'What are Red-Flag symptoms?'
      ];
    }
    if (activePage === 'results') {
      return [
        'Explain my report in simple language',
        'What does my % match score mean?',
        'Why are some symptoms unmatched?',
        'What should I ask my doctor?'
      ];
    }
    if (activePage === 'history') {
      return [
        'How do I interpret my past reports?',
        'When should I redo an evaluation?'
      ];
    }
    return [
      'What is MediLogic AI?',
      'How does rule-based inference work?',
      'What is Dyspnea?'
    ];
  };

  return (
    <aside 
      aria-label="Ask AI Assistant Panel"
      className={`fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[420px] max-w-full z-50 bg-slate-900 border-l border-slate-800 shadow-[-12px_0_35px_rgba(0,0,0,0.65)] flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-white tracking-tight">
                Ask AI Assistant
              </h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-mono font-bold uppercase">
                Gemini
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Educational Explanation Layer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors"
              title="Clear conversation"
              aria-label="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close panel (Esc)"
            aria-label="Close Ask AI Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Context Badge Strip */}
      <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <Activity className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="truncate">
            Context: <strong className="text-slate-200 capitalize">{activePage === 'symptoms' ? 'Symptom Selection' : activePage === 'results' ? 'Diagnostic Report' : activePage}</strong>
          </span>
        </div>
        {activePage === 'symptoms' && selectedSymptoms.length > 0 && (
          <span className="text-teal-400 font-mono font-bold text-[10px] bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 shrink-0">
            {selectedSymptoms.length} selected
          </span>
        )}
        {activePage === 'results' && currentReport?.primaryCondition && (
          <span className="text-teal-300 font-mono font-bold text-[10px] bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 shrink-0">
            {currentReport.primaryCondition.confidencePercentage || 0}% match
          </span>
        )}
      </div>

      {/* Conversation Area (Internal scroll container ONLY) */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 p-4 space-y-3.5 overflow-y-auto overflow-x-hidden text-xs text-slate-200 leading-relaxed scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 mb-1 px-1">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <span>&bull;</span>
                  <span>{msg.timestamp}</span>
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-teal-400" />
                  <span className="text-teal-400 font-semibold">MediLogic AI</span>
                  <span>&bull;</span>
                  <span>{msg.timestamp}</span>
                </>
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[92%] break-words leading-relaxed whitespace-pre-line shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-br-none'
                  : msg.isError
                  ? 'bg-rose-950/80 border border-rose-500/40 text-rose-200 rounded-bl-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start space-y-1 animate-fade-in">
            <div className="flex items-center gap-1 text-[10px] font-mono text-teal-400 px-1">
              <Bot className="w-3 h-3" />
              <span>MediLogic AI is thinking...</span>
            </div>
            <div className="p-3.5 rounded-2xl rounded-bl-none bg-slate-950 border border-slate-800 flex items-center gap-2 text-teal-400">
              <div className="w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400 text-xs">Analyzing clinical context...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 pt-2 pb-1 bg-slate-950/70 border-t border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Suggested Questions:
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {getSuggestedPrompts().map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/80 transition-all shrink-0 disabled:opacity-50"
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box Area */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              activePage === 'symptoms' 
                ? 'Ask about symptoms, dyspnea, phlegm...' 
                : activePage === 'results' 
                ? 'Ask about your report or match %...' 
                : 'Ask a question...'
            }
            disabled={loading}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="w-9 h-9 rounded-xl bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            title="Send question"
            aria-label="Send question"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>

        {/* Disclaimer Note */}
        <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 leading-tight">
          <Info className="w-3 h-3 text-teal-400 shrink-0" />
          <span>Educational guidance only. Not a clinical diagnosis.</span>
        </div>
      </div>
    </aside>
  );
}
