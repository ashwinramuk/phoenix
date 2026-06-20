"use client";

import { useState } from "react";

interface EligibilityResult {
  exam: {
    id: string;
    name: string;
    conductingBody: string;
    post: string;
    examDate?: string;
    applicationDeadline?: string;
    syllabus: string[];
  };
  isEligible: boolean;
  reason?: string;
  reasons: string[];
  nearMiss: boolean;
  daysUntilDeadline?: number;
  daysUntilExam?: number;
}

interface FormData {
  dateOfBirth: string;
  qualification: string;
  degree: string;
  branch: string;
  category: string;
  state: string;
  gender: string;
}

export default function EligibilityPage() {
  const [form, setForm] = useState<FormData>({
    dateOfBirth: "",
    qualification: "UG",
    degree: "B.E.",
    branch: "Mechanical",
    category: "BC",
    state: "Tamil Nadu",
    gender: "male",
  });

  const [results, setResults] = useState<{
    eligible: EligibilityResult[];
    ineligible: EligibilityResult[];
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResults(data.data);
    } catch {
      alert("API not reachable. Make sure backend is running on port 4000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🎯 Eligibility Checker</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg mb-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Qualification</label>
              <select
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="diploma">Diploma</option>
                <option value="UG">UG (Degree)</option>
                <option value="PG">PG (Post Graduate)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Degree</label>
              <select
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="B.E.">B.E.</option>
                <option value="B.Tech">B.Tech</option>
                <option value="B.Sc">B.Sc</option>
                <option value="B.A.">B.A.</option>
                <option value="B.Com">B.Com</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Branch</label>
              <select
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="CS">Computer Science</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="OC">OC (General)</option>
                <option value="BC">BC</option>
                <option value="BCM">BCM</option>
                <option value="MBC">MBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.dateOfBirth}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded font-medium transition-colors"
          >
            {loading ? "Checking..." : "Check Eligibility"}
          </button>
        </form>

        {/* Results */}
        {results && (
          <div>
            {/* Eligible */}
            <h2 className="text-xl font-semibold text-green-400 mb-3">
              ✅ Eligible ({results.eligible.length} exams)
            </h2>
            <div className="grid gap-3 mb-8">
              {results.eligible.map((r) => (
                <div key={r.exam.id} className="bg-slate-800 border border-green-800 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{r.exam.name}</h3>
                      <p className="text-sm text-slate-400">{r.exam.post}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {r.exam.conductingBody} • {r.exam.syllabus.slice(0, 3).join(", ")}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      {r.daysUntilDeadline !== undefined && r.daysUntilDeadline > 0 && (
                        <p className={r.daysUntilDeadline < 30 ? "text-red-400 font-bold" : "text-slate-400"}>
                          ⏰ {r.daysUntilDeadline} days to apply
                        </p>
                      )}
                      {r.daysUntilExam !== undefined && r.daysUntilExam > 0 && (
                        <p className="text-slate-500">📅 Exam in {r.daysUntilExam} days</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ineligible */}
            {results.ineligible.length > 0 && (
              <>
                <h2 className="text-xl font-semibold text-red-400 mb-3">
                  ❌ Not Eligible ({results.ineligible.length} exams)
                </h2>
                <div className="grid gap-3">
                  {results.ineligible.map((r) => (
                    <div
                      key={r.exam.id}
                      className={`bg-slate-800 p-4 rounded-lg ${
                        r.nearMiss ? "border border-amber-600/70" : "border border-red-900 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{r.exam.name}</h3>
                        {r.nearMiss && (
                          <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded">
                            So close — fails by 1
                          </span>
                        )}
                      </div>
                      <ul className="text-sm text-red-400 mt-1 list-disc list-inside">
                        {(r.reasons?.length ? r.reasons : [r.reason ?? "Not eligible"]).map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
