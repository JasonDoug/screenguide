export type SessionMode = "troubleshoot" | "tutorial";
export type SessionStatus = "active" | "ended";
export type MessageRole = "user" | "assistant";

export interface Session {
  id: string;
  title: string;
  mode: SessionMode;
  status: SessionStatus;
  created_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  image_data: string | null;
  created_at: string;
}

export interface AnalyzeResponse {
  response: string;
  error?: string;
}
