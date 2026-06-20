// Data shapes for the eligibility engine

export interface UserProfile {
  dateOfBirth: string; // ISO date: "1995-03-15"
  qualification: "10th" | "12th" | "diploma" | "UG" | "PG";
  degree?: string; // "B.E." | "B.Tech" | "B.Sc" | "B.A." etc.
  branch?: string; // "Mechanical" | "Civil" | "CS" | "ECE" etc.
  category: "OC" | "BC" | "BCM" | "MBC" | "SC" | "ST";
  state: string; // "Tamil Nadu" | "Karnataka" etc.
  gender: "male" | "female" | "other";
}

export interface Exam {
  id: string;
  name: string;
  conductingBody: string; // "TNPSC" | "UPSC" | "SSC" | "RRB"
  post: string; // "Assistant Engineer" | "Group 2" etc.
  minAge: number;
  maxAge: number | null; // null = no upper limit
  maxAgeRelaxation: Record<string, number>; // { "BC": 5, "SC": 10 }
  requiredQualification: string; // "UG" | "PG" | "10th"
  requiredDegree?: string[]; // ["B.E.", "B.Tech"]
  requiredBranch?: string[]; // ["Mechanical"] — empty means any
  examDate?: string;
  applicationDeadline?: string;
  notificationUrl?: string;
  syllabus: string[];
  isActive: boolean;
}

export interface EligibilityResult {
  exam: Exam;
  isEligible: boolean;
  reasons: string[]; // All failing criteria (empty when eligible)
  reason?: string; // First failing reason — kept for backward compatibility
  nearMiss: boolean; // Failing by exactly one criterion (e.g. only the branch)
  daysUntilDeadline?: number;
  daysUntilExam?: number;
}
