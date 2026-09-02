export type DocumentStatus =
  | "idle"
  | "processing"
  | "completed"
  | "duplicate"
  | "error";

export type DocumentStage =
  | "uploading"
  | "loading"
  | "chunking"
  | "embedding"
  | "storing"
  | "completed"
  | "duplicate"
  | "error"
  | "";

export interface DocumentState {
  status: DocumentStatus;
  stage: DocumentStage;
  message: string;
  ready: boolean;
  filename?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
