import { useEffect, useRef, useState } from "react";
import { Send, Wrench, BookOpen, Sparkles, User, Bot, AlertCircle, ImageIcon } from "lucide-react";
import type { Message, Session } from "@/types";

interface ChatPanelProps {
  session: Session | null;
  messages: Message[];
  thinking: boolean;
  onSend: (prompt: string, includeScreenshot: boolean) => void;
  isStreaming: boolean;
  error: string | null;
}

export function ChatPanel({ session, messages, thinking, onSend, isStreaming, error }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleSend = () => {
    if (!input.trim() || thinking || !session) return;
    onSend(input.trim(), isStreaming);
    setInput("");
  };

  return (
    <div className="w-[400px] shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col h-full">
      <div className="h-12 border-b border-slate-800 flex items-center px-5 gap-2.5 shrink-0">
        {session ? (
          <>
            <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
              session.mode === "tutorial" ? "bg-amber-500/15 text-amber-400" : "bg-cyan-500/15 text-cyan-400"
            }`}>
              {session.mode === "tutorial" ? <BookOpen size={15} /> : <Wrench size={15} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate">{session.title}</p>
              <p className="text-slate-500 text-xs capitalize">{session.mode} mode</p>
            </div>
          </>
        ) : (
          <p className="text-slate-500 text-sm">No session selected</p>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!session && (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} className="text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">Start a Session</p>
            <p className="text-slate-600 text-xs leading-relaxed">
              Create a new session from the sidebar, share your screen, and ask the AI for help.
            </p>
          </div>
        )}

        {session && messages.length === 0 && !thinking && (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} className="text-cyan-400" />
            </div>
            <p className="text-slate-300 text-sm font-medium mb-2">Ready to help</p>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              {session.mode === "tutorial"
                ? "Share your screen and ask what you'd like to learn. I'll walk you through it step by step."
                : "Share your screen and describe the problem. I'll analyze what I see and guide you to a fix."}
            </p>
            <div className="space-y-2 text-left">
              {session.mode === "tutorial" ? (
                <>
                  <Suggestion text="How do I create a pivot table?" onClick={() => setInput("How do I create a pivot table in Excel?")} />
                  <Suggestion text="Show me how to use VLOOKUP" onClick={() => setInput("Show me how to use VLOOKUP")} />
                </>
              ) : (
                <>
                  <Suggestion text="Why is this formula giving an error?" onClick={() => setInput("Why is this formula giving an error?")} />
                  <Suggestion text="My app won't connect to the database" onClick={() => setInput("My app won't connect to the database")} />
                </>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-3">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-xs leading-relaxed">{error}</p>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {thinking && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shrink-0">
              <Bot size={15} className="text-white" />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800 rounded-2xl rounded-tl-sm px-3.5 py-3 mt-0.5">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 p-3.5 shrink-0">
        <div className="flex items-end gap-2.5">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={session ? "Ask about what's on your screen..." : "Select a session first"}
              disabled={!session || thinking}
              rows={2}
              className="w-full bg-slate-800 text-white text-sm rounded-xl px-3.5 py-2.5 pr-10 border border-slate-700 focus:border-cyan-500 focus:outline-none transition-colors resize-none disabled:opacity-40 placeholder:text-slate-600"
            />
            {isStreaming && (
              <div className="absolute right-3 top-2.5 flex items-center gap-1">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || !session || thinking}
            className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-white flex items-center justify-center transition-all duration-200 shadow-lg shadow-cyan-500/20 disabled:shadow-none shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        {isStreaming && (
          <p className="text-green-500/70 text-xs mt-2 flex items-center gap-1.5">
            <ImageIcon size={11} />
            A screenshot will be captured with your message
          </p>
        )}
        {!isStreaming && session && (
          <p className="text-slate-600 text-xs mt-2">
            Share your screen to include visual context with your questions
          </p>
        )}
      </div>
    </div>
  );
}

function Suggestion({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 px-3 py-2.5 text-slate-300 text-xs transition-all duration-200"
    >
      {text}
    </button>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
        isUser ? "bg-slate-700" : "bg-gradient-to-br from-cyan-400 to-blue-600"
      }`}>
        {isUser ? <User size={15} className="text-slate-300" /> : <Bot size={15} className="text-white" />}
      </div>
      <div className={`max-w-[85%] ${isUser ? "items-end" : ""}`}>
        <div className={`rounded-2xl px-3.5 py-2.5 ${
          isUser
            ? "bg-slate-700 rounded-tr-sm text-slate-100"
            : "bg-slate-800 rounded-tl-sm text-slate-200"
        }`}>
          {isUser && message.image_data && (
            <img
              src={message.image_data}
              alt="Screenshot"
              className="rounded-lg mb-2 w-full border border-slate-600"
            />
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
