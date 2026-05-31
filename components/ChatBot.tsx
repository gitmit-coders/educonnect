"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MessageCircle, X, Send, Bot, Loader2, Minus, Maximize2, Minimize2, GripHorizontal } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Mode = "doubt" | "generate-notes" | "summarize";

const SIZES = {
  small:  { width: 320, height: 420 },
  medium: { width: 400, height: 560 },
  large:  { width: 520, height: 680 },
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("doubt");
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");

  // drag state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // set initial position bottom-right
  useEffect(() => {
    if (open && !initialized) {
      setPos({
        x: window.innerWidth - SIZES.medium.width - 24,
        y: window.innerHeight - SIZES.medium.height - 24,
      });
      setInitialized(true);
    }
  }, [open, initialized]);

  // fetch history on open
  useEffect(() => {
    if (open && messages.length === 0) {
      axios.get("/api/chatbot").then((res) => {
        setMessages(
          res.data.messages.length > 0
            ? res.data.messages
            : [{ role: "assistant", content: "Hi! I'm EduBot 👋 Ask me anything — doubts, notes, or summaries!" }]
        );
      });
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - SIZES[size].width));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - SIZES[size].height));
      setPos({ x: newX, y: newY });
    };
    const onMouseUp = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [size]);

  // touch drag (mobile)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current = true;
    dragOffset.current = {
      x: e.touches[0].clientX - pos.x,
      y: e.touches[0].clientY - pos.y,
    };
  }, [pos]);

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      const newX = Math.max(0, Math.min(e.touches[0].clientX - dragOffset.current.x, window.innerWidth - SIZES[size].width));
      const newY = Math.max(0, Math.min(e.touches[0].clientY - dragOffset.current.y, window.innerHeight - SIZES[size].height));
      setPos({ x: newX, y: newY });
    };
    const onTouchEnd = () => { dragging.current = false; };

    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [size]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    try {
      const res = await axios.post("/api/chatbot", { message: userMessage, mode });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch {
      toast.error("EduBot unavailable");
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const cycleSize = () => {
    setSize((prev) => {
      const next = prev === "small" ? "medium" : prev === "medium" ? "large" : "small";
      // reposition so it stays in viewport
      setPos((p) => ({
        x: Math.min(p.x, window.innerWidth - SIZES[next].width - 8),
        y: Math.min(p.y, window.innerHeight - SIZES[next].height - 8),
      }));
      return next;
    });
  };

  const modeLabels: Record<Mode, string> = {
    doubt: "💬 Doubt",
    "generate-notes": "📝 Notes",
    summarize: "📋 Summarize",
  };

  const sizeIcons = {
    small: <Maximize2 size={14} />,
    medium: <Maximize2 size={14} />,
    large: <Minimize2 size={14} />,
  };

  const sizeTooltip = {
    small: "Medium",
    medium: "Large",
    large: "Small",
  };

  return (
    <>
      {/* Floating Button (when closed) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-500 transition z-40"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          ref={chatRef}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            width: SIZES[size].width,
            height: minimized ? "auto" : SIZES[size].height,
            zIndex: 50,
            transition: "width 0.2s, height 0.2s",
          }}
          className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header — drag handle */}
          <div
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            className="bg-blue-600 px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal size={16} className="text-blue-300" />
              <Bot size={18} className="text-white" />
              <span className="font-semibold text-white text-sm">EduBot</span>
              <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full text-white">AI</span>
            </div>

            <div className="flex items-center gap-1">
              {/* Size toggle */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={cycleSize}
                title={`Switch to ${sizeTooltip[size]}`}
                className="p-1.5 rounded-lg hover:bg-blue-500 transition text-white"
              >
                {sizeIcons[size]}
              </button>

              {/* Minimize */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 rounded-lg hover:bg-blue-500 transition text-white"
              >
                <Minus size={14} />
              </button>

              {/* Close */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => { setOpen(false); setInitialized(false); }}
                className="p-1.5 rounded-lg hover:bg-red-500 transition text-white"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body — hidden when minimized */}
          {!minimized && (
            <>
              {/* Mode selector */}
              <div className="flex gap-1 p-2 border-b border-slate-700 bg-slate-900">
                {(Object.keys(modeLabels) as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition ${
                      mode === m
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {modeLabels[m]}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-slate-800 text-slate-200 rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 rounded-2xl px-4 py-3 rounded-bl-sm">
                      <Loader2 size={16} className="animate-spin text-blue-400" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-700 bg-slate-900">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={
                      mode === "doubt" ? "Ask your doubt..."
                      : mode === "generate-notes" ? "Enter topic for notes..."
                      : "Enter topic to summarize..."
                    }
                    className="flex-1 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}