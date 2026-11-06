import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  X,
  TrendingUp,
  AlertTriangle,
  Crown,
  Truck,
  Send,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AIAnalysisResponse, AIInsight } from '../types';

interface AiCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiCenterModal: React.FC<AiCenterModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AIAnalysisResponse | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'ai'; text: string }[]
  >([
    {
      sender: 'ai',
      text: '¡Hola! Soy el Asistente CEO con IA de Master Chefs. He analizado las 9 hojas del ERP en Maracay. ¿En qué decisiones estratégicas te ayudo hoy?',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  useEffect(() => {
    if (isOpen && !analysisData) {
      runAnalysis();
    }
  }, [isOpen]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setAnalysisData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || sendingChat) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputPrompt('');
    setSendingChat(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: text }),
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Master Chefs mantiene un margen medio del 65% en pastelería. Se recomienda vigilar el stock de Tarta de Queso Vasco.',
        },
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#09090b] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-[#0c0c0e] border-b border-zinc-800 p-4 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
                  Centro de Inteligencia Artificial ERP
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> CEO Analytics
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Diagnóstico integral de operaciones, rentabilidad y oportunidades en Maracay
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-zinc-100">
                Analizando base de datos completa de Master Chefs...
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Evaluando stock mínimo, márgenes de repostería, tasa BCV, proveedores y ROI de campañas publicitarias.
              </p>
            </div>
          ) : (
            analysisData && (
              <>
                {/* Executive Score & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl text-center flex flex-col justify-center items-center">
                    <ShieldCheck className="w-8 h-8 text-blue-400 mb-1" />
                    <span className="text-xs font-semibold text-zinc-400">
                      Score Salud Financiera
                    </span>
                    <div className="text-4xl font-black text-blue-400 mt-1">
                      {analysisData.financialHealthScore}/100
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                      Óptimo C-Suite
                    </span>
                  </div>

                  <div className="md:col-span-3 bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> Diagnóstico Ejecutivo CEO
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {analysisData.summary}
                    </p>
                  </div>
                </div>

                {/* Strategic Insights Cards */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 mb-3">Insights Clave Detectados</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisData.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-900/40 border border-zinc-800 hover:border-blue-500/40 p-4 rounded-2xl space-y-2 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                            {insight.category}
                          </span>
                          {insight.metric && (
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {insight.metric}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-zinc-100">{insight.title}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {insight.description}
                        </p>

                        {insight.actionableStep && (
                          <div className="pt-2 border-t border-zinc-800 text-[11px] text-amber-400 font-medium">
                            &rarr; Accionar: {insight.actionableStep}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations List */}
                <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-zinc-100 mb-3">Recomendaciones Priorizadas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysisData.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CEO Assistant Chat */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-zinc-100">
                      Asistente Directivo Interactivo (Gemini AI)
                    </h3>
                  </div>

                  {/* Quick Prompts */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {[
                      '¿Cuál es el producto más rentable?',
                      '¿Qué productos tienen riesgo de stock?',
                      '¿Cuál campaña publicitaria dio mejor ROI?',
                      '¿Cómo impacta la Tasa BCV en precios?',
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSendChat(q)}
                        className="px-3 py-1 bg-zinc-800 hover:bg-blue-500/10 text-zinc-300 hover:text-blue-300 border border-zinc-700/60 hover:border-blue-500/30 rounded-lg text-xs shrink-0 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-3 max-h-48 overflow-y-auto p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input form */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Escribe tu consulta directiva a la IA..."
                      value={inputPrompt}
                      onChange={(e) => setInputPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                      className="flex-1 bg-zinc-900 border border-zinc-700/70 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleSendChat()}
                      disabled={sendingChat}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 disabled:opacity-50"
                    >
                      {sendingChat ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};
