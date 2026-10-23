import { useState } from "react";
import { Plus, Monitor, BookOpen, Wrench, Trash2, Clock, X, Eye } from "lucide-react";
import type { Session, SessionMode } from "@/types";

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onNew: (title: string, mode: SessionMode) => void;
  onDelete: (id: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export function Sidebar({ sessions, activeSessionId, onSelect, onNew, onDelete }: SidebarProps) {
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<SessionMode>("troubleshoot");

  const handleCreate = () => {
    const finalTitle = title.trim() || `Session ${new Date().toLocaleTimeString()}`;
    onNew(finalTitle, mode);
    setTitle("");
    setMode("troubleshoot");
    setShowNew(false);
  };

  return (
    <aside className="w-72 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Eye size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-base leading-tight">ScreenGuide</h1>
            <p className="text-slate-500 text-xs">AI-powered screen assistant</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <button
          onClick={() => setShowNew(true)}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-medium py-2.5 text-sm transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30"
        >
          <Plus size={16} />
          New Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
        {sessions.length === 0 && (
          <p className="text-slate-600 text-sm text-center px-4 py-8">
            No sessions yet. Start one to begin.
          </p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`group flex items-start gap-3 rounded-lg px-3 py-3 cursor-pointer transition-all duration-150 ${
              activeSessionId === s.id
                ? "bg-slate-800 ring-1 ring-cyan-500/40"
                : "hover:bg-slate-800/60"
            }`}
          >
            <div className={`mt-0.5 w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
              s.mode === "tutorial" ? "bg-amber-500/15 text-amber-400" : "bg-cyan-500/15 text-cyan-400"
            }`}>
              {s.mode === "tutorial" ? <BookOpen size={16} /> : <Wrench size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate">{s.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock size={11} className="text-slate-600" />
                <span className="text-slate-500 text-xs">{timeAgo(s.created_at)}</span>
                {s.status === "ended" && (
                  <span className="text-slate-600 text-xs">— ended</span>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(s.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl" onClick={() => setShowNew(false)}>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-base">New Session</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <label className="block text-slate-400 text-xs font-medium mb-2">Session Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fix Excel formula error"
              className="w-full bg-slate-900 text-white text-sm rounded-lg px-3.5 py-2.5 border border-slate-700 focus:border-cyan-500 focus:outline-none transition-colors mb-4"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <label className="block text-slate-400 text-xs font-medium mb-2">Mode</label>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <button
                onClick={() => setMode("troubleshoot")}
                className={`flex flex-col items-center gap-1.5 rounded-lg py-3 border transition-all ${
                  mode === "troubleshoot"
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                    : "border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <Wrench size={20} />
                <span className="text-xs font-medium">Troubleshoot</span>
              </button>
              <button
                onClick={() => setMode("tutorial")}
                className={`flex flex-col items-center gap-1.5 rounded-lg py-3 border transition-all ${
                  mode === "tutorial"
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <BookOpen size={20} />
                <span className="text-xs font-medium">Tutorial</span>
              </button>
            </div>
            <button
              onClick={handleCreate}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              Create Session
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
