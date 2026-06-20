import { describe, it, expect } from "vitest";
import { scorePaper, buildQuiz } from "../../src/services/papers.service.ts";
import { Paper } from "../../src/types/paper.ts";

const paper: Paper = {
  id: "test-paper",
  examBody: "TEST",
  exam: "TEST",
  subject: "Mixed",
  level: "L",
  year: 2020,
  bookletCode: "A",
  totalQuestions: 3,
  totalMarks: 3,
  durationMinutes: 60,
  negativeMarking: "1/3",
  source: "unit-test",
  subjects: { Math: 2, Science: 1 },
  questions: [
    { number: 1, subject: "Math", topic: "t", question: "q1", hasFigure: false, options: { A: "a", B: "b", C: "c", D: "d" }, answer: "A" },
    { number: 2, subject: "Math", topic: "t", question: "q2", hasFigure: false, options: { A: "a", B: "b", C: "c", D: "d" }, answer: "B" },
    { number: 3, subject: "Science", topic: "t", question: "q3", hasFigure: false, options: { A: "a", B: "b", C: "c", D: "d" }, answer: "C" },
  ],
};

describe("scorePaper (TNPSC marking: +1 / -1/3 / 0)", () => {
  it("scores correct, wrong, and blank answers", () => {
    const r = scorePaper(paper, { answers: { "1": "A", "2": "A" } }); // 1 right, 1 wrong, 1 blank
    expect(r.correct).toBe(1);
    expect(r.wrong).toBe(1);
    expect(r.blank).toBe(1);
    expect(r.attempted).toBe(2);
    expect(r.rawScore).toBe(0.67); // 1 - 1/3, rounded to 2dp
    expect(r.accuracy).toBe(50);
  });

  it("gives a perfect score when all correct", () => {
    const r = scorePaper(paper, { answers: { "1": "A", "2": "B", "3": "C" } });
    expect(r.correct).toBe(3);
    expect(r.rawScore).toBe(3);
    expect(r.accuracy).toBe(100);
  });
});

describe("buildQuiz", () => {
  it("strips answers so clients can't peek", () => {
    const q = buildQuiz(paper, {});
    expect(q).toHaveLength(3);
    expect(q.every((x) => !("answer" in x))).toBe(true);
  });

  it("filters by subject", () => {
    expect(buildQuiz(paper, { subject: "Math" })).toHaveLength(2);
  });

  it("limits by count", () => {
    expect(buildQuiz(paper, { count: 1 })).toHaveLength(1);
  });
});
