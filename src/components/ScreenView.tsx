import { Monitor, MonitorOff, Image as ImageIcon } from "lucide-react";
import { useCallback, useState } from "react";

interface ScreenViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  onStart: () => void;
  onStop: () => void;
  lastScreenshot: string | null;
  thinking: boolean;
}

export function ScreenView({ videoRef, isStreaming, onStart, onStop, lastScreenshot, thinking }: ScreenViewProps) {
  const [overlayVisible, setOverlayVisible] = useState(false);

  const handleMouseEnter = useCallback(() => setOverlayVisible(true), []);
  const handleMouseLeave = useCallback(() => setOverlayVisible(false), []);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
      <div className="h-12 border-b border-slate-800 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-2">
          <Monitor size={16} className={isStreaming ? "text-cyan-400" : "text-slate-600"} />
          <span className="text-slate-300 text-sm font-medium">
            {isStreaming ? "Screen Sharing Active" : "Screen Preview"}
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 ml-2">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-400 text-xs font-medium">LIVE</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 rounded-md bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 px-3 py-1.5 text-xs font-medium transition-all duration-200 border border-slate-700 hover:border-red-500/40"
            >
              <MonitorOff size={14} />
              Stop Sharing
            </button>
          ) : (
            <button
              onClick={onStart}
              className="flex items-center gap-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-white px-3 py-1.5 text-xs font-medium transition-all duration-200 shadow-lg shadow-cyan-500/20"
            >
              <Monitor size={14} />
              Share Screen
            </button>
          )}
        </div>
      </div>

      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center p-6"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!isStreaming ? (
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-5">
              <MonitorOff size={36} className="text-slate-600" />
            </div>
            <h3 className="text-slate-300 font-medium text-base mb-2">No Screen Shared</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Click "Share Screen" to broadcast your desktop. The AI will analyze what it sees and provide guidance.
            </p>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-medium px-4 py-2.5 text-sm transition-all duration-200 shadow-lg shadow-cyan-500/20"
            >
              <Monitor size={16} />
              Start Sharing
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              muted
              playsInline
              className="max-w-full max-h-full rounded-lg shadow-2xl border border-slate-800"
            />
            {thinking && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm rounded-full px-3.5 py-2 border border-slate-700">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span className="text-cyan-300 text-xs font-medium">Analyzing screen...</span>
              </div>
            )}
            {lastScreenshot && overlayVisible && (
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700 p-2.5 max-w-[200px]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ImageIcon size={12} className="text-slate-500" />
                  <span className="text-slate-400 text-xs">Last captured frame</span>
                </div>
                <img src={lastScreenshot} alt="Last capture" className="rounded-md w-full" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

