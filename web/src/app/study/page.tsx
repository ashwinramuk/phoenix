"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getTopics,
  getQuestions,
  submitAnswer,
  type Topic,
  type Question,
} from "../../lib/study-api";
import SystemDesignEditor, { type DiagramData } from "./SystemDesignEditor";

type Category = "dsa" | "system-design";

export default function StudyPage() {
  const [category, setCategory] = useState<Category>("dsa");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);

  const [answerText, setAnswerText] = useState("");
  const [selfGrade, setSelfGrade] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const diagramRef = useRef<DiagramData>({ nodes: [], edges: [] });
  const onDiagramChange = useCallback((d: DiagramData) => {
    diagramRef.current = d;
  }, []);

  useEffect(() => {
    getTopics(category)
      .then(setTopics)
      .catch(() =>
        setError("Study Engine not reachable on port 3001. Start it first."),
      );
  }, [category]);

  const openTopic = async (t: Topic) => {
    setTopic(t);
    setQuestion(null);
    setQuestions(await getQuestions(t.id));
  };

  const openQuestion = (q: Question) => {
    setQuestion(q);
    setAnswerText("");
    setSelfGrade(null);
    setSubmitted(false);
    diagramRef.current = { nodes: [], edges: [] };
  };

  const submit = async () => {
    if (!question || selfGrade === null) return;
    try {
      if (question.type === "system-design") {
        await submitAnswer(question.id, {
          diagram: diagramRef.current as unknown as Record<string, unknown>,
          selfGrade,
        });
      } else {
        await submitAnswer(question.id, { answerText, selfGrade });
      }
      setSubmitted(true);
    } catch {
      setError("Failed to submit. Is the Study Engine running?");
    }
  };

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
        <h1 className="text-3xl font-bold mb-1">🧠 Study Engine</h1>
        <p className="text-slate-400 mb-6">
          Practice DSA patterns and system design. Submitting with a self-grade schedules your next review (spaced repetition).
        </p>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6">
          {(["dsa", "system-design"] as Category[]).map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setTopic(null);
                setQuestion(null);
              }}
              className={`px-4 py-2 rounded font-medium ${
                category === c
                  ? "bg-blue-600"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              {c === "dsa" ? "DSA Patterns" : "System Design"}
            </button>
          ))}
        </div>

        {/* Breadcrumb */}
        {(topic || question) && (
          <div className="text-sm text-slate-400 mb-4">
            <button onClick={() => { setTopic(null); setQuestion(null); }} className="hover:text-white">
              Topics
            </button>
            {topic && (
              <>
                {" / "}
                <button onClick={() => setQuestion(null)} className="hover:text-white">
                  {topic.name}
                </button>
              </>
            )}
            {question && <> / {question.title}</>}
          </div>
        )}

        {/* View: topics */}
        {!topic && (
          <div className="grid gap-3 sm:grid-cols-2">
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => openTopic(t)}
                className="text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-4"
              >
                <div className="font-semibold">{t.name}</div>
                {t.difficulty && (
                  <span className="text-xs text-amber-400">{t.difficulty}</span>
                )}
                {t.description && (
                  <p className="text-sm text-slate-400 mt-1">{t.description}</p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* View: questions in a topic */}
        {topic && !question && (
          <div className="space-y-2">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => openQuestion(q)}
                className="w-full text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-3 flex justify-between"
              >
                <span>{q.title}</span>
                {q.difficulty && (
                  <span className="text-xs text-slate-400">{q.difficulty}</span>
                )}
              </button>
            ))}
            {questions.length === 0 && (
              <p className="text-slate-500">No questions in this topic yet.</p>
            )}
          </div>
        )}

        {/* View: a question */}
        {question && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-1">{question.title}</h2>
            <p className="text-slate-300 mb-4">{question.prompt}</p>

            {question.hints && question.hints.length > 0 && (
              <details className="mb-4 text-sm text-slate-400">
                <summary className="cursor-pointer">Hints</summary>
                <ul className="list-disc ml-5 mt-1">
                  {question.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </details>
            )}

            {/* Answer area */}
            {question.type === "system-design" ? (
              <SystemDesignEditor onChange={onDiagramChange} />
            ) : (
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write your approach / solution here…"
                className="w-full h-48 p-3 bg-slate-900 border border-slate-600 rounded font-mono text-sm"
              />
            )}

            {/* Self-grade + submit */}
            {!submitted ? (
              <div className="mt-4">
                <div className="text-sm text-slate-400 mb-1">
                  How well did you know it? (drives spaced repetition)
                </div>
                <div className="flex gap-2 mb-3">
                  {[0, 1, 2, 3, 4, 5].map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelfGrade(g)}
                      className={`w-9 h-9 rounded ${
                        selfGrade === g
                          ? "bg-blue-600"
                          : "bg-slate-700 hover:bg-slate-600"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <button
                  onClick={submit}
                  disabled={selfGrade === null}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded font-medium"
                >
                  Submit
                </button>
              </div>
            ) : (
              <div className="mt-4 text-green-400">
                ✅ Submitted — next review scheduled.
                <button
                  onClick={() => setQuestion(null)}
                  className="ml-3 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                >
                  Back to questions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
