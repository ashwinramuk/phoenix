import { UserProfile, Exam, EligibilityResult } from "../types/exam.ts";
import { exams } from "../data/exams.ts";

// Parse a YYYY-MM-DD string into a local-midnight Date. `new Date("2026-08-03")`
// parses as UTC midnight, which can shift the calendar day in non-UTC timezones
// and throw off day/age math by one. Splitting the parts keeps it local.
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function calculateAge(dob: string, referenceDate?: string): number {
  const birth = parseLocalDate(dob);
  const ref = referenceDate ? parseLocalDate(referenceDate) : new Date();
  let age = ref.getFullYear() - birth.getFullYear();
  const monthDiff = ref.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function daysUntil(dateStr?: string, referenceDate?: string): number | undefined {
  if (!dateStr) return undefined;
  const target = parseLocalDate(dateStr);
  // Reference "now" is injectable so deadline math is deterministic under test
  // (mirrors calculateAge). Falls back to the system clock in production.
  const now = referenceDate ? parseLocalDate(referenceDate) : new Date();
  // Compare at day granularity so a same-day deadline reads as 0, not negative.
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = target.getTime() - startOfToday.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function checkEligibility(profile: UserProfile, exam: Exam, referenceDate?: string): EligibilityResult {
  const age = calculateAge(profile.dateOfBirth, referenceDate);
  const reasons: string[] = [];

  // Age check — minimum and (category-relaxed) maximum
  if (age < exam.minAge) {
    reasons.push(`Minimum age is ${exam.minAge}. You are ${age}.`);
  }
  if (exam.maxAge !== null) {
    const relaxation = exam.maxAgeRelaxation[profile.category] || 0;
    const effectiveMaxAge = relaxation >= 100 ? Infinity : exam.maxAge + relaxation;
    if (age > effectiveMaxAge) {
      reasons.push(`Maximum age is ${effectiveMaxAge} for ${profile.category} category. You are ${age}.`);
    }
  }

  // Qualification check
  const qualificationOrder = ["10th", "12th", "diploma", "UG", "PG"];
  const userQualLevel = qualificationOrder.indexOf(profile.qualification);
  const requiredLevel = qualificationOrder.indexOf(exam.requiredQualification);
  if (userQualLevel < requiredLevel) {
    reasons.push(`Requires ${exam.requiredQualification}. You have ${profile.qualification}.`);
  }

  // Degree check (if specified)
  if (exam.requiredDegree && exam.requiredDegree.length > 0 && profile.degree) {
    if (!exam.requiredDegree.includes(profile.degree)) {
      reasons.push(`Requires degree: ${exam.requiredDegree.join(" or ")}. You have ${profile.degree}.`);
    }
  }

  // Branch check (if specified)
  if (exam.requiredBranch && exam.requiredBranch.length > 0 && profile.branch) {
    if (!exam.requiredBranch.includes(profile.branch)) {
      reasons.push(`Requires branch: ${exam.requiredBranch.join(" or ")}. You have ${profile.branch}.`);
    }
  }

  const isEligible = reasons.length === 0;
  return {
    exam,
    isEligible,
    reasons,
    reason: reasons[0],
    nearMiss: reasons.length === 1, // failing by exactly one criterion
    daysUntilDeadline: daysUntil(exam.applicationDeadline, referenceDate),
    daysUntilExam: daysUntil(exam.examDate, referenceDate),
  };
}

export function getEligibleExams(profile: UserProfile): EligibilityResult[] {
  return exams
    .filter((exam) => exam.isActive)
    .map((exam) => checkEligibility(profile, exam))
    .sort((a, b) => {
      // Eligible first, then near-misses (most actionable), then by fewest
      // failing criteria, then by deadline urgency.
      if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
      if (a.nearMiss !== b.nearMiss) return a.nearMiss ? -1 : 1;
      if (a.reasons.length !== b.reasons.length) return a.reasons.length - b.reasons.length;
      return (a.daysUntilDeadline ?? 999) - (b.daysUntilDeadline ?? 999);
    });
}

export function getAllExams(): Exam[] {
  return exams.filter((exam) => exam.isActive);
}
