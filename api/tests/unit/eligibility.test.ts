import { describe, it, expect } from "vitest";
import { checkEligibility, calculateAge } from "../../src/services/eligibility.service.ts";
import { UserProfile, Exam } from "../../src/types/exam.ts";

// Fixed reference date so age/date math is deterministic regardless of when tests run.
const REF = "2026-06-22";

// A baseline engineering exam: AE (Mechanical), 21–30, UG B.E./B.Tech Mechanical,
// with category relaxation (BC +5 years, SC no upper limit).
const exam: Exam = {
  id: "ae-mech",
  name: "Assistant Engineer (Mechanical)",
  conductingBody: "TNPSC",
  post: "Assistant Engineer",
  minAge: 21,
  maxAge: 30,
  maxAgeRelaxation: { BC: 5, SC: 100 },
  requiredQualification: "UG",
  requiredDegree: ["B.E.", "B.Tech"],
  requiredBranch: ["Mechanical"],
  examDate: "2026-08-03",
  applicationDeadline: "2026-06-25",
  syllabus: [],
  isActive: true,
};

// A 26-year-old (born 2000-01-01, as of REF) OC candidate who matches everything.
const eligibleProfile: UserProfile = {
  dateOfBirth: "2000-01-01",
  qualification: "UG",
  degree: "B.E.",
  branch: "Mechanical",
  category: "OC",
  state: "Tamil Nadu",
  gender: "male",
};

describe("calculateAge", () => {
  it("computes age against a reference date", () => {
    expect(calculateAge("2000-01-01", REF)).toBe(26);
  });

  it("does not count a birthday that has not occurred yet this year", () => {
    // Born 2000-12-31: on 2026-06-22 the birthday hasn't passed, so still 25.
    expect(calculateAge("2000-12-31", REF)).toBe(25);
  });
});

describe("checkEligibility — happy path", () => {
  it("marks a fully-matching candidate eligible with no reasons", () => {
    const r = checkEligibility(eligibleProfile, exam, REF);
    expect(r.isEligible).toBe(true);
    expect(r.reasons).toHaveLength(0);
    expect(r.nearMiss).toBe(false);
    expect(r.daysUntilDeadline).toBe(3); // 2026-06-25 minus 2026-06-22
  });
});

describe("checkEligibility — age limits", () => {
  it("rejects a candidate below the minimum age", () => {
    const r = checkEligibility({ ...eligibleProfile, dateOfBirth: "2010-01-01" }, exam, REF); // age 16
    expect(r.isEligible).toBe(false);
    expect(r.reason).toMatch(/Minimum age is 21/);
  });

  it("rejects an OC candidate over the (unrelaxed) maximum age", () => {
    const r = checkEligibility({ ...eligibleProfile, dateOfBirth: "1990-01-01" }, exam, REF); // age 36
    expect(r.isEligible).toBe(false);
    expect(r.reason).toMatch(/Maximum age is 30/);
  });
});

describe("checkEligibility — category relaxation", () => {
  it("applies numeric relaxation: a 34-year-old BC candidate (max 30+5) is eligible", () => {
    const r = checkEligibility(
      { ...eligibleProfile, dateOfBirth: "1992-01-01", category: "BC" }, // age 34
      exam,
      REF,
    );
    expect(r.isEligible).toBe(true);
  });

  it("treats relaxation of 100 as no upper age limit (SC)", () => {
    const r = checkEligibility(
      { ...eligibleProfile, dateOfBirth: "1980-01-01", category: "SC" }, // age 46
      exam,
      REF,
    );
    expect(r.isEligible).toBe(true);
  });

  it("falls back to no relaxation for a category not in the map", () => {
    const r = checkEligibility(
      { ...eligibleProfile, dateOfBirth: "1992-01-01", category: "MBC" }, // age 34, MBC not listed
      exam,
      REF,
    );
    expect(r.isEligible).toBe(false);
    expect(r.reason).toMatch(/Maximum age is 30/);
  });
});

describe("checkEligibility — qualification hierarchy", () => {
  it("rejects a candidate whose qualification is below the requirement", () => {
    const r = checkEligibility({ ...eligibleProfile, qualification: "12th" }, exam, REF);
    expect(r.isEligible).toBe(false);
    expect(r.reason).toMatch(/Requires UG/);
  });

  it("accepts a higher qualification than required (PG for a UG post)", () => {
    const r = checkEligibility({ ...eligibleProfile, qualification: "PG" }, exam, REF);
    expect(r.isEligible).toBe(true);
  });
});

describe("checkEligibility — degree and branch", () => {
  it("rejects a non-matching degree", () => {
    const r = checkEligibility({ ...eligibleProfile, degree: "B.Sc" }, exam, REF);
    expect(r.isEligible).toBe(false);
    expect(r.reason).toMatch(/Requires degree/);
  });

  it("rejects a non-matching branch", () => {
    const r = checkEligibility({ ...eligibleProfile, branch: "Civil" }, exam, REF);
    expect(r.isEligible).toBe(false);
    expect(r.reason).toMatch(/Requires branch/);
  });
});

describe("checkEligibility — nearMiss flag", () => {
  it("flags a candidate failing exactly one criterion as a near miss", () => {
    const r = checkEligibility({ ...eligibleProfile, branch: "Civil" }, exam, REF);
    expect(r.reasons).toHaveLength(1);
    expect(r.nearMiss).toBe(true);
  });

  it("does not flag a candidate failing multiple criteria as a near miss", () => {
    const r = checkEligibility(
      { ...eligibleProfile, branch: "Civil", qualification: "12th" }, // branch + qualification both fail
      exam,
      REF,
    );
    expect(r.reasons.length).toBeGreaterThan(1);
    expect(r.nearMiss).toBe(false);
  });
});
