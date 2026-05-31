"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MessageCircle, X, Send, Bot, Loader2,
  Minus, Maximize2, Minimize2, GripHorizontal, Download
} from "lucide-react";

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
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !initialized) {
      setPos({
        x: window.innerWidth - SIZES.medium.width - 24,
        y: window.innerHeight - SIZES.medium.height - 24,
      });
      setInitialized(true);
    }
  }, [open, initialized]);

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

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - SIZES[size].width)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - SIZES[size].height)),
      });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [size]);

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
      setPos({
        x: Math.max(0, Math.min(e.touches[0].clientX - dragOffset.current.x, window.innerWidth - SIZES[size].width)),
        y: Math.max(0, Math.min(e.touches[0].clientY - dragOffset.current.y, window.innerHeight - SIZES[size].height)),
      });
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

  // PDF download function
  const downloadAsPDF = (content: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Allow popups and try again.");
      return;
    }

    // Format content — newlines to <br>, **bold** to <strong>
    const formatted = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/#{1,3} (.*)/g, "<h3>$1</h3>")
      .replace(/\n/g, "<br/>");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8"/>
          <title>EduBot Notes</title>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 0 40px;
              color: #1a1a2e;
              line-height: 1.8;
            }
            .header {
              background: linear-gradient(135deg, #1e3a8a, #2563eb);
              color: white;
              padding: 24px 32px;
              border-radius: 12px;
              margin-bottom: 32px;
            }
            .header h1 {
              margin: 0;
              font-size: 22px;
              font-weight: 700;
            }
            .header p {
              margin: 6px 0 0;
              font-size: 13px;
              opacity: 0.85;
            }
            .content {
              font-size: 15px;
            }
            h3 {
              color: #1e3a8a;
              font-size: 17px;
              margin-top: 24px;
              margin-bottom: 8px;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 6px;
            }
            strong { color: #1e40af; }
            .footer {
              margin-top: 48px;
              padding-top: 16px;
              border-top: 1px solid #e2e8f0;
              font-size: 12px;
              color: #94a3b8;
              text-align: center;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📚 EduBot — Generated Notes</h1>
            <p>EduConnect Platform &nbsp;|&nbsp; ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div class="content">${formatted}</div>
          <div class="footer">Generated by EduBot AI &nbsp;•&nbsp; EduConnect Platform</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const cycleSize = () => {
    setSize((prev) => {
      const next = prev === "small" ? "medium" : prev === "medium" ? "large" : "small";
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

  // last assistant message jo download hogi
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-500 transition z-40"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div
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
          {/* Header */}
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
              <button onMouseDown={(e) => e.stopPropagation()} onClick={cycleSize}
                className="p-1.5 rounded-lg hover:bg-blue-500 transition text-white">
                {size === "large" ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setMinimized(!minimized)}
                className="p-1.5 rounded-lg hover:bg-blue-500 transition text-white">
                <Minus size={14} />
              </button>
              <button onMouseDown={(e) => e.stopPropagation()} onClick={() => { setOpen(false); setInitialized(false); }}
                className="p-1.5 rounded-lg hover:bg-red-500 transition text-white">
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Mode selector */}
              <div className="flex gap-1 p-2 border-b border-slate-700 bg-slate-900">
                {(Object.keys(modeLabels) as Mode[]).map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition ${
                      mode === m ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}>
                    {modeLabels[m]}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-slate-800 text-slate-200 rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>

                    {/* Download button — sirf assistant messages pe */}
                    {msg.role === "assistant" && msg.content.length > 100 && (
                      <button
                        onClick={() => downloadAsPDF(msg.content)}
                        className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition px-1"
                      >
                        <Download size={12} />
                        Download as PDF
                      </button>
                    )}
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
                  <button onClick={handleSend} disabled={loading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition disabled:opacity-50">
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