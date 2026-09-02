import type { DocumentState } from "./types";

// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
// DOCUMENT STATUS

export async function getDocumentStatus(): Promise<DocumentState | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/status`
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();

  } catch (error) {

    console.error(
      "Status request failed:",
      error
    );

    return null;
  }
}

// UPLOAD PDF
export async function uploadDocument(
  file: File
): Promise<Response> {

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  return fetch(
    `${API_BASE_URL}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
}

// CHAT STREAM
export async function streamChat(
  query: string,
  onChunk: (text: string) => void
): Promise<void> {

  const response = await fetch(
    `${API_BASE_URL}/chat`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        query,
      }),
    }
  );

  if (!response.ok) {

    const errorText =
      await response.text();

    throw new Error(
      errorText ||
      `Chat request failed: ${response.status}`
    );
  }

  if (!response.body) {

    throw new Error(
      "Streaming response is not available."
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  while (true) {

    const {
      value,
      done,
    } = await reader.read();

    if (done) {
      break;
    }

    const text =
      decoder.decode(
        value,
        {
          stream: true,
        }
      );

    if (text) {
      onChunk(text);
    }
  }
}
