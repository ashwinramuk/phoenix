// Client for the NestJS Study Engine service.
const STUDY_API =
  process.env.NEXT_PUBLIC_STUDY_API ?? "http://localhost:3001";

export interface Topic {
  id: number;
  category: "dsa" | "system-design";
  name: string;
  slug: string;
  description: string | null;
  difficulty: string | null;
}

export interface Question {
  id: number;
  type: "coding" | "system-design" | "mcq";
  title: string;
  prompt: string;
  difficulty: string | null;
  hints: string[] | null;
}

export interface SubmissionPayload {
  answerText?: string;
  diagram?: Record<string, unknown>;
  notes?: string;
  selfGrade?: number;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export function getTopics(category?: "dsa" | "system-design"): Promise<Topic[]> {
  const q = category ? `?category=${category}` : "";
  return fetch(`${STUDY_API}/topics${q}`).then(json<Topic[]>);
}

export function getQuestions(topicId: number): Promise<Question[]> {
  return fetch(`${STUDY_API}/topics/${topicId}/questions`).then(json<Question[]>);
}

export function submitAnswer(
  questionId: number,
  payload: SubmissionPayload,
): Promise<unknown> {
  return fetch(`${STUDY_API}/questions/${questionId}/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(json);
}
