import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Languages, Sparkles } from "lucide-react";
import { cn } from "@/utils/format";
import { useApp } from "@/context/AppContext";
import { chatLanguages } from "@/data/chatbot";
import { sendChatMessage } from "@/services/mockProcurement";
import type { ChatMessage } from "@/types";
import { Button } from "@/components/common/Button";

const quickPrompts: Record<string, string[]> = {
  en: [
    "Find wheat procurement centres near me",
    "मुझे PM किसान योजना के लिए क्या चाहिए?",
    "Show schemes for small farmers",
    "What is today's MSP for cotton?",
  ],
  hi: ["मेरे पास गेहूं खरीदी केंद्र कहां है?", "स्लॉट कैसे बुक करें?", "आज के भाव बताइए"],
  mr: ["माझ्या जवळ गहू विक्रीसाठी केंद्र कुठे आहे?", "स्लॉट कसे बुक करायचे?"],
};

export function KrushiAI() {
  const { chatOpen, setChatOpen } = useApp();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      text: chatLanguages[0].greeting,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, chatOpen]);

  // switch greeting with language
  useEffect(() => {
    const lang = chatLanguages.find((l) => l.code === language);
    if (!lang) return;
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "welcome") {
        return [{ ...prev[0], text: lang.greeting }];
      }
      return prev;
    });
  }, [language]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "farmer", text: trimmed, timestamp: now }]);
    setInput("");
    setTyping(true);
    const reply = await sendChatMessage(trimmed, language);
    setTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: reply.id, role: "ai", text: reply.text, timestamp: reply.timestamp, language },
    ]);
    // attach action chips to the reply card
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last && last.role === "ai") {
        (last as ChatMessage & { actions?: { label: string; to: string }[] }).actions = reply.actions;
      }
      return copy;
    });
  };

  const lastLang = chatLanguages.find((l) => l.code === language);
  const prompts = quickPrompts[language] ?? quickPrompts.en;

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={cn(
          "fixed bottom-20 right-4 z-[70] flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700 text-white shadow-lift transition-all hover:bg-primary-800 hover:scale-105 md:bottom-6",
          chatOpen && "scale-0 opacity-0",
        )}
        aria-label="Open Krushi AI assistant"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-saffron-400 text-[10px] font-extrabold text-ink-900">
          AI
        </span>
      </button>

      {/* Chat panel */}
      {chatOpen && (
        <div
          className="fixed inset-x-2 bottom-2 z-[75] flex max-h-[76vh] flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-lift animate-fade-up sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[24rem]"
          role="dialog"
          aria-label="Krushi AI assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Sparkles className="h-4.5 w-4.5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold">Krushi AI</p>
                <p className="text-[11px] text-primary-100">Multilingual farm assistant · demo</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label="Assistant language"
                  className="appearance-none rounded-lg bg-white/10 py-1.5 pl-7 pr-2 text-xs font-semibold text-white outline-none"
                >
                  {chatLanguages.map((l) => (
                    <option key={l.code} value={l.code} className="text-ink-900">
                      {l.label}
                    </option>
                  ))}
                </select>
                <Languages className="pointer-events-none absolute left-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary-100" />
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/80 hover:bg-white/10"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-earth-50 px-3.5 py-4">
            {messages.map((m) => {
              const withActions = m as ChatMessage & { actions?: { label: string; to: string }[] };
              return (
                <div key={m.id} className={cn("flex", m.role === "farmer" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-soft",
                      m.role === "farmer"
                        ? "rounded-br-md bg-primary-700 text-white"
                        : "rounded-bl-md border border-ink-100 bg-white text-ink-900",
                    )}
                  >
                    <p>{m.text}</p>
                    {withActions.actions && withActions.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {withActions.actions.map((a) => (
                          <button
                            key={a.label + a.to}
                            onClick={() => {
                              setChatOpen(false);
                              navigate(a.to);
                            }}
                            className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-800 hover:bg-primary-100"
                          >
                            {a.label} →
                          </button>
                        ))}
                      </div>
                    )}
                    <p className={cn("mt-1 text-[10px]", m.role === "farmer" ? "text-primary-100" : "text-ink-400")}>
                      {m.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-ink-100 bg-white px-4 py-3 shadow-soft">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 animate-bounce rounded-full bg-primary-400"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-t border-ink-100 bg-white px-3 pt-2.5">
            {prompts.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="whitespace-nowrap rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-primary-400 hover:text-primary-700"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            className="flex items-center gap-2 bg-white p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask in ${lastLang?.label ?? "English"}…`}
              aria-label="Message Krushi AI"
              className="h-11 flex-1 rounded-xl border border-ink-200 bg-earth-50 px-3.5 text-sm outline-none focus:border-primary-500 focus:bg-white"
            />
            <Button type="submit" size="md" className="!px-3.5" disabled={!input.trim() || typing} aria-label="Send message">
              <Send className="h-4.5 w-4.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
