// Data shapes for previous-year question papers and the quiz engine

export type OptionKey = "A" | "B" | "C" | "D";

export interface Question {
  number: number;
  subject: string;
  topic: string;
  question: string;
  hasFigure: boolean;
  options: Record<OptionKey, string>;
  answer: OptionKey;
}

export interface Paper {
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
  questions: Question[];
}

// A paper without its questions — used for list views
export type PaperSummary = Omit<Paper, "questions">;

// A question with the answer removed — what we send to a live quiz
export type QuizQuestion = Omit<Question, "answer">;

export interface ScoreRequest {
  // Map of question number -> chosen option (omit a number to leave it blank)
  answers: Record<string, OptionKey>;
}

export interface QuestionResult {
  number: number;
  chosen: OptionKey | null;
  correct: OptionKey;
  isCorrect: boolean;
  isBlank: boolean;
}

export interface ScoreResult {
  paperId: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  blank: number;
  // TNPSC scoring: +1 per correct, -1/3 per wrong, 0 for blank
  rawScore: number;
  results: QuestionResult[];
  // Accuracy on attempted questions, as a percentage
  accuracy: number;
}
