import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I'm CyberForge AI Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 🔑 Track if user has ever sent a message
  const hasUserInteracted = useRef(false);

  /* =========================
     SMART AUTO-SCROLL
     ========================= */
  useEffect(() => {
    // ❌ Never scroll until user sends first message
    if (!hasUserInteracted.current) return;

    const container = chatContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
      120;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /* =========================
     SEND MESSAGE
     ========================= */
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // ✅ Mark that user has interacted
    hasUserInteracted.current = true;

    setMessages((prev) => [
      ...prev,
      { role: "user", text, timestamp: new Date() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.reply || "No response received.",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Something went wrong.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[480px]">
    <div className="h-full rounded-2xl border border-green-500/30 bg-slate-900 shadow-xl flex flex-col overflow-hidden">

        {/* HEADER (fixed) */}
        <div className="p-4 border-b border-green-500/30 shrink-0">
        <h2 className="text-green-400 font-mono font-bold">
            CyberForge AI Assistant
        </h2>
        </div>

        {/* ✅ ONLY THIS SCROLLS */}
        <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-black/40"
        >
        {messages.map((m, i) => (
            <div
            key={i}
            className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
            }`}
            >
            <div
                className={`max-w-[75%] px-4 py-3 rounded-xl text-sm ${
                m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-100 border border-green-500/20"
                }`}
            >
                {m.text}
            </div>
            </div>
        ))}

        {loading && (
            <div className="text-green-400 font-mono text-sm">
            AI is thinking...
            </div>
        )}

        <div ref={messagesEndRef} />
        </div>

        {/* INPUT (fixed) */}
        <div className="p-4 border-t border-green-500/30 bg-slate-900 shrink-0">
        <div className="flex gap-3">
            <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white border border-green-500/30 font-mono"
            placeholder="Ask something…"
            />
            <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="px-6 py-3 rounded-xl bg-green-600 text-black font-mono font-bold"
            >
            Send
            </button>
        </div>
        </div>

    </div>
    </div>

  );
}
