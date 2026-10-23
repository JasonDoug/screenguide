import { useCallback, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ScreenView } from "@/components/ScreenView";
import { ChatPanel } from "@/components/ChatPanel";
import { useScreenStream } from "@/hooks/useScreenStream";
import { useSessions } from "@/hooks/useSessions";
import { captureFrame } from "@/lib/screenCapture";
import type { Message } from "@/types";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-screen`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function App() {
  const { videoRef, isStreaming, error: streamError, startStream, stopStream } = useScreenStream();
  const {
    sessions,
    activeSession,
    messages,
    setMessages,
    selectSession,
    createSession,
    deleteSession,
    addMessageOptimistically,
  } = useSessions();

  const [thinking, setThinking] = useState(false);
  const [lastScreenshot, setLastScreenshot] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleSend = useCallback(
    async (prompt: string, includeScreenshot: boolean) => {
      if (!activeSession) return;
      setChatError(null);

      let screenshot: string | null = null;
      if (includeScreenshot && videoRef.current && isStreaming) {
        screenshot = await captureFrame(videoRef.current);
        if (screenshot) setLastScreenshot(screenshot);
      }

      addMessageOptimistically({
        session_id: activeSession.id,
        role: "user",
        content: prompt,
        image_data: screenshot,
      });

      setThinking(true);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const body: Record<string, unknown> = {
          prompt,
          mode: activeSession.mode,
          history,
          sessionId: activeSession.id,
        };
        if (screenshot) {
          body.imageData = screenshot;
        }

        const response = await fetch(EDGE_FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ANON_KEY}`,
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          const errMsg = data.error || `Request failed (${response.status})`;
          setChatError(errMsg);
          setThinking(false);
          return;
        }

        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          session_id: activeSession.id,
          role: "assistant",
          content: data.response,
          image_data: null,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to reach the AI service";
        setChatError(msg);
      } finally {
        setThinking(false);
      }
    },
    [activeSession, videoRef, isStreaming, messages, addMessageOptimistically, setMessages],
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession?.id ?? null}
        onSelect={selectSession}
        onNew={createSession}
        onDelete={deleteSession}
      />
      <ScreenView
        videoRef={videoRef}
        isStreaming={isStreaming}
        onStart={startStream}
        onStop={stopStream}
        lastScreenshot={lastScreenshot}
        thinking={thinking}
      />
      <ChatPanel
        session={activeSession}
        messages={messages}
        thinking={thinking}
        onSend={handleSend}
        isStreaming={isStreaming}
        error={streamError || chatError}
      />
    </div>
  );
}
