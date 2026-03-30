"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Zap } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  actions?: Array<{ type: string; result: unknown }>;
}

const SUGGESTIONS = [
  "¿Quién no ha venido en el último mes?",
  "Manda un 10% de descuento a jugadores inactivos",
  "¿Cuánto hemos ingresado esta semana?",
  "Muéstrame los leads calientes sin contactar",
  "¿Qué socios tienen membresía unlimited?",
  "Escribe un mensaje de reactivación para los que llevan 2 semanas sin venir",
];

export default function SensaChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola Pablo! Soy tu asistente de Sensa Padel. Puedo buscar jugadores inactivos, ver estadísticas, enviar mensajes de reactivación y mucho más. ¿En qué te ayudo hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMessage: Message = { role: "user", content: msg };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/sensa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });

      const data = await res.json() as { response: string; actions?: Array<{ type: string; result: unknown }> };
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response,
        actions: data.actions,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Lo siento, hubo un error. Inténtalo de nuevo.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <div className="font-bold text-white text-sm">Atlas — Sensa Padel</div>
          <div className="text-xs text-gray-500">Asistente IA · Ejecuta acciones reales</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400">Activo</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === "assistant" ? "bg-green-500/20" : "bg-blue-500/20"
            }`}>
              {msg.role === "assistant" 
                ? <Bot className="w-4 h-4 text-green-400" />
                : <User className="w-4 h-4 text-blue-400" />
              }
            </div>
            <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-gray-800 text-gray-100"
                  : "bg-blue-600 text-white"
              }`}>
                {msg.content}
              </div>
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {msg.actions.map((action, j) => (
                    <div key={j} className="flex items-center gap-1.5 text-xs bg-green-900/30 border border-green-800/50 text-green-400 px-2.5 py-1 rounded-full">
                      <Zap className="w-3 h-3" />
                      {action.type === 'whatsapp' ? '✅ WhatsApp enviado' : '✅ Email enviado'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-green-400" />
            </div>
            <div className="bg-gray-800 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              <span className="text-gray-400 text-sm">Pensando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-600 mb-2 px-1">Sugerencias:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 hover:border-gray-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Escribe un comando... ej: 'busca jugadores inactivos'"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-colors"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
