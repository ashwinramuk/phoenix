import {
  Paper,
  QuizQuestion,
  Question,
  ScoreRequest,
  ScoreResult,
  QuestionResult,
  OptionKey,
} from "../types/paper.ts";

// These are pure functions: they take a Paper and return a result, with no I/O.
// Data access lives in repositories/papers.repository.ts. Keeping the scoring
// logic pure makes it trivially unit-testable without a database.

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface QuizOptions {
  count?: number;
  subject?: string;
  shuffle?: boolean;
}

/**
 * Build a quiz from a paper: optionally filter by subject, shuffle, and limit
 * to `count` questions. Answers are stripped so the client can't peek.
 */
export function buildQuiz(paper: Paper, opts: QuizOptions): QuizQuestion[] {
  let pool: Question[] = paper.questions;
  if (opts.subject) {
    const wanted = opts.subject.toLowerCase();
    pool = pool.filter((q) => q.subject.toLowerCase() === wanted);
  }
  if (opts.shuffle) pool = shuffle(pool);
  else pool = [...pool].sort((a, b) => a.number - b.number);

  if (opts.count && opts.count > 0) pool = pool.slice(0, opts.count);

  return pool.map(({ answer, ...rest }) => rest);
}

/**
 * Score a submission against a paper using TNPSC marking:
 * +1 correct, -1/3 wrong, 0 blank.
 */
export function scorePaper(paper: Paper, submission: ScoreRequest): ScoreResult {
  const answers = submission.answers ?? {};
  const results: QuestionResult[] = [];
  let correct = 0;
  let wrong = 0;
  let blank = 0;

  for (const q of paper.questions) {
    const chosen = (answers[String(q.number)] as OptionKey | undefined) ?? null;
    const isBlank = chosen === null;
    const isCorrect = !isBlank && chosen === q.answer;

    if (isBlank) blank++;
    else if (isCorrect) correct++;
    else wrong++;

    results.push({ number: q.number, chosen, correct: q.answer, isCorrect, isBlank });
  }

  const attempted = correct + wrong;
  const rawScore = correct - wrong / 3;

  return {
    paperId: paper.id,
    totalQuestions: paper.questions.length,
    attempted,
    correct,
    wrong,
    blank,
    rawScore: Math.round(rawScore * 100) / 100,
    accuracy: attempted ? Math.round((correct / attempted) * 1000) / 10 : 0,
    results,
  };
}
