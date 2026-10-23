import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Message, Session, SessionMode } from "@/types";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const loadSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load sessions:", error);
      return;
    }
    setSessions((data as Session[]) ?? []);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const selectSession = useCallback(async (id: string) => {
    const { data: sData, error: sError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (sError || !sData) {
      console.error("Failed to load session:", sError);
      return;
    }
    setActiveSession(sData as Session);

    const { data: mData, error: mError } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true });
    if (mError) {
      console.error("Failed to load messages:", mError);
      return;
    }
    setMessages((mData as Message[]) ?? []);
  }, []);

  const createSession = useCallback(
    async (title: string, mode: SessionMode) => {
      const { data, error } = await supabase
        .from("sessions")
        .insert({ title, mode })
        .select()
        .single();
      if (error) {
        console.error("Failed to create session:", error);
        return;
      }
      const newSession = data as Session;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSession(newSession);
      setMessages([]);
    },
    [],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) {
        console.error("Failed to delete session:", error);
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(null);
        setMessages([]);
      }
    },
    [activeSession],
  );

  const addMessageOptimistically = useCallback(
    (msg: Omit<Message, "id" | "created_at">) => {
      const temp: Message = {
        ...msg,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, temp]);
      return temp;
    },
    [],
  );

  return {
    sessions,
    activeSession,
    messages,
    setMessages,
    selectSession,
    createSession,
    deleteSession,
    addMessageOptimistically,
  };
}
