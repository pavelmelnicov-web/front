export type WorkbookStep = {
  id: string;
  title: string;
  question: string;
  hint: string;
};

export type Workbook = {
  brand: string;
  tagline: string;
  headline: string;
  method: string;
  intro: Array<{ title: string; body: string }>;
  situations: Array<{ id: string; title: string; description: string; examples: string[] }>;
  steps: WorkbookStep[];
  versions: Array<{ id: "system" | "atmosphere"; title: string; audience: string }>;
  community: string[];
};

export type CommunityPost = {
  id: string;
  author: string;
  title: string;
  excerpt: string;
};

export type ChatMessage = {
  id: string;
  author: string;
  message: string;
  created_at: string;
};

export type SessionPayload = {
  name: string;
  version: "system" | "atmosphere";
  situation_ids: string[];
  answers: Array<{ step_id: string; answer: string }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method ?? "GET";
  const url = `${API_URL}${path}`;

  console.log("[api] Request started", { method, url, hasBody: Boolean(options?.body) });

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });

  console.log("[api] Response received", {
    method,
    url,
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    console.error("[api] Request failed", { method, url, status: response.status });
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = (await response.json()) as T;
  console.log("[api] Request succeeded", { method, url });
  return data;
}

export const api = {
  getWorkbook: () => request<Workbook>("/api/workbook"),
  getCommunity: () => request<{ posts: CommunityPost[] }>("/api/community"),
  getChat: () => request<ChatMessage[]>("/api/chat"),
  createSession: (payload: SessionPayload) =>
    request<{ id: string }>("/api/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getSummary: (sessionId: string) =>
    request<Record<string, string | string[]>>(`/api/sessions/${sessionId}/summary`),
  postChat: (author: string, message: string) =>
    request<ChatMessage>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ author, message }),
    }),
};
