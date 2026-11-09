export type ChatApiError = {
  status: number;
  message: string;
};

type ChatResponse = {
  reply?: string;
  detail?: string;
};

/**
 * Sends a user message to the FastAPI backend.
 * Locally, Next.js rewrites /api/* to http://localhost:8000.
 * On Vercel, /api/chat is handled by api/index.py.
 */
export async function sendChatMessage(message: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } catch {
    throw {
      status: 0,
      message: "Could not reach the backend. Start FastAPI on http://localhost:8000 and try again.",
    } satisfies ChatApiError;
  }

  let payload: ChatResponse = {};
  try {
    payload = (await response.json()) as ChatResponse;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const error: ChatApiError = {
      status: response.status,
      message: payload.detail || "The coach could not reply. Please try again.",
    };
    throw error;
  }

  if (!payload.reply) {
    throw {
      status: 500,
      message: "The backend returned an empty reply.",
    } satisfies ChatApiError;
  }

  return payload.reply;
}
