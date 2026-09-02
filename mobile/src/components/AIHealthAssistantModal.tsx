import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, RefreshCw } from 'lucide-react';
import { healthApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AIHealthAssistantModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: "Namaste! I am your NutriRegion AI Health Assistant. I have analyzed today's live calories, protein target, remaining macros, and regional cuisine preferences. How can I help you right now?",
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const sampleQuestions = [
    'Suggest a Maharashtrian high-protein dinner under 550 kcal',
    'Why am I low on protein today?',
    'I have 600 calories remaining. What should I eat?',
    'What regional food can replace chicken?',
  ];

  const handleAsk = async (queryText?: string) => {
    const textToAsk = queryText || question;
    if (!textToAsk.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToAsk }]);
    if (!queryText) setQuestion('');
    setLoading(true);

    try {
      const res = await healthApi.askAI(textToAsk);
      if (res.success && res.data?.answer) {
        setMessages((prev) => [...prev, { sender: 'ai', text: res.data.answer }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Apologies, I could not process your query at the moment. Please try again.' }]);
      }
    } catch (err) {
      console.error('AI ask error:', err);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Unable to connect to AI Assistant. Please check your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[80vh] max-h-[650px] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ask NutriRegion AI</h3>
              <p className="text-xs text-teal-400">Contextual regional AI health guidance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Quick Questions */}
        <div className="py-3 flex space-x-2 overflow-x-auto no-scrollbar border-b border-slate-800/60">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleAsk(sq)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-teal-400/60 text-slate-300 hover:text-teal-200 text-xs font-medium whitespace-nowrap transition"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`p-2 rounded-xl border flex-shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[82%] ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                    : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-teal-400 italic py-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>NutriRegion AI is analyzing your daily macros & regional database...</span>
            </div>
          )}
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="pt-3 border-t border-slate-800 flex items-center space-x-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about dinner, protein targets, or substitutes..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="p-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
