"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:4000";

interface PaperSummary {
  id: string;
  examBody: string;
  exam: string;
  subject: string;
  level: string;
  year: number;
  bookletCode: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  negativeMarking: string;
  source: string;
  subjects: Record<string, number>;
}

interface QuizQuestion {
  number: number;
  subject: string;
  topic: string;
  question: string;
  hasFigure: boolean;
  options: Record<"A" | "B" | "C" | "D", string>;
}

interface QuestionResult {
  number: number;
  chosen: string | null;
  correct: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  isBlank: boolean;
}

interface ScoreResult {
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  blank: number;
  rawScore: number;
  accuracy: number;
  results: QuestionResult[];
}

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

export default function PracticePage() {
  const [paper, setPaper] = useState<PaperSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [count, setCount] = useState(10);

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/papers`)
      .then((r) => r.json())
      .then((d) => setPaper(d.data[0] ?? null))
      .catch(() => setError("Backend not reachable on port 4000. Run the API first."));
  }, []);

  const startQuiz = async () => {
    if (!paper) return;
    setLoading(true);
    setScore(null);
    setAnswers({});
    try {
      const params = new URLSearchParams({ count: String(count), shuffle: "true" });
      if (subject) params.set("subject", subject);
      const r = await fetch(`${API}/api/papers/${paper.id}/quiz?${params}`);
      const d = await r.json();
      setQuestions(d.data);
    } catch {
      setError("Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!paper) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/papers/${paper.id}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const d = await r.json();
      setScore(d.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Failed to score quiz.");
    } finally {
      setLoading(false);
    }
  };

  const resultFor = (n: number) => score?.results.find((x) => x.number === n);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-900 text-white p-8">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">📝 Practice — Previous Year Paper</h1>
        {paper && (
          <p className="text-slate-400 mb-6">
            {paper.examBody} {paper.exam} · {paper.subject} ({paper.level}) · {paper.year} ·{" "}
            {paper.totalQuestions} Qs · {paper.negativeMarking} negative marking
          </p>
        )}

        {/* Score summary */}
        {score && (
          <div className="bg-slate-800 border border-blue-700 rounded-lg p-5 mb-6">
            <h2 className="text-xl font-semibold mb-3">Result</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <Stat label="Score" value={`${score.rawScore}`} accent="text-blue-400" />
              <Stat label="Correct" value={`${score.correct}`} accent="text-green-400" />
              <Stat label="Wrong" value={`${score.wrong}`} accent="text-red-400" />
              <Stat label="Blank" value={`${score.blank}`} accent="text-slate-400" />
              <Stat label="Accuracy" value={`${score.accuracy}%`} accent="text-blue-400" />
            </div>
            <p className="text-xs text-slate-500 mt-3">
              TNPSC marking: +1 per correct, −1/3 per wrong, 0 for blank. Correct answers are shown below.
            </p>
          </div>
        )}

        {/* Setup */}
        {paper && !questions && (
          <div className="bg-slate-800 p-6 rounded-lg mb-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="">All subjects ({paper.totalQuestions})</option>
                  {Object.entries(paper.subjects).map(([s, n]) => (
                    <option key={s} value={s}>
                      {s} ({n})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Number of questions</label>
                <input
                  type="number"
                  min={1}
                  max={paper.totalQuestions}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
            </div>
            <button
              onClick={startQuiz}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded font-medium"
            >
              {loading ? "Loading..." : "Start Quiz"}
            </button>
          </div>
        )}

        {/* Questions */}
        {questions && (
          <div className="space-y-4">
            {questions.map((q, i) => {
              const res = resultFor(q.number);
              return (
                <div key={q.number} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>Q{i + 1} · #{q.number}</span>
                    <span>{q.topic}</span>
                  </div>
                  <p className="mb-3">
                    {q.question}
                    {q.hasFigure && <span className="text-amber-400 text-xs"> [refers to a figure]</span>}
                  </p>
                  <div className="grid gap-2">
                    {OPTION_KEYS.map((key) => {
                      const chosen = answers[q.number] === key;
                      let cls = "border-slate-600 bg-slate-700/40";
                      if (score && res) {
                        if (key === res.correct) cls = "border-green-600 bg-green-900/30";
                        else if (chosen) cls = "border-red-600 bg-red-900/30";
                      } else if (chosen) {
                        cls = "border-blue-500 bg-blue-900/30";
                      }
                      return (
                        <button
                          key={key}
                          disabled={!!score}
                          onClick={() => setAnswers({ ...answers, [q.number]: key })}
                          className={`text-left p-2 rounded border ${cls} disabled:cursor-default`}
                        >
                          <span className="font-semibold mr-2">({key})</span>
                          {q.options[key]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {!score ? (
              <button
                onClick={submitQuiz}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded font-medium"
              >
                {loading ? "Scoring..." : `Submit (${Object.keys(answers).length}/${questions.length} answered)`}
              </button>
            ) : (
              <button
                onClick={() => {
                  setQuestions(null);
                  setScore(null);
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
              >
                New Quiz
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-slate-900/50 rounded p-3">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
