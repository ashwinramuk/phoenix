import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Project Phoenix</h1>
        <p className="text-xl text-slate-300 mb-8">
          AI-powered exam preparation platform for government job aspirants
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/eligibility"
            className="block p-6 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">🎯 Eligibility Checker</h2>
            <p className="text-slate-400">
              Enter your profile and instantly see all government exams you&apos;re
              eligible for
            </p>
          </Link>

          <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg opacity-50">
            <h2 className="text-xl font-semibold mb-2">📰 Daily Current Affairs</h2>
            <p className="text-slate-400">Coming soon — AI-curated daily digest</p>
          </div>

          <Link
            href="/practice"
            className="block p-6 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">📝 Practice Quiz</h2>
            <p className="text-slate-400">
              Real TNPSC CTS Mechanical previous-year paper (2018) — 200 questions, by subject,
              with instant TNPSC-style scoring
            </p>
          </Link>

          <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg opacity-50">
            <h2 className="text-xl font-semibold mb-2">📊 Progress Tracker</h2>
            <p className="text-slate-400">Coming soon — Track your preparation journey</p>
          </div>
        </div>
      </div>
    </main>
  );
}
