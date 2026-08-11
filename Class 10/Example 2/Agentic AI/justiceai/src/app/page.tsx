import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-text-primary">
      {/* SECTION 1 - PUBLIC NAVBAR */}
      <nav className="fixed top-0 z-50 h-[60px] w-full border-b border-[#1E1E2E] bg-[#111118]">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="gradient-text text-lg font-bold">
            ⚖️ JusticeAI
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 2 - HERO */}
      <section className="flex min-h-screen flex-col items-center justify-center px-4 pt-[60px]">
        <h1 className="mb-6 text-center text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Legal &amp; Code Help,
          <br />
          <span className="gradient-text">For Everyone.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-center text-xl text-gray-400">
          92% of people get no legal help when they need it most.
          JusticeAI gives everyone &mdash; in Ghana, the US, India, everywhere &mdash;
          instant AI-powered legal document analysis and code review. Free.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/auth/signup">
            <Button size="lg" className="min-w-[220px] bg-indigo-600 hover:bg-indigo-700 text-white text-base h-12">
              ⚖️ Analyze a Document
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline" className="min-w-[220px] text-base h-12">
              💻 Review My Code
            </Button>
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-gray-400">
          <span className="rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-4 py-1.5">⚖️ Legal Analysis</span>
          <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-1.5">💻 Code Review</span>
          <span className="rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-1.5">🌍 Open to Everyone</span>
        </div>
      </section>

      {/* SECTION 3 - THE PROBLEM */}
      <section className="bg-[#111118] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              The Problem We&apos;re Solving
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              The justice gap is global. Not just American.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-[#1E1E2E] bg-[#0A0A0F] p-8 text-center">
              <p className="text-5xl font-bold gradient-text">92%</p>
              <p className="mt-4 text-gray-400">
                of people get no legal help for serious legal problems
              </p>
              <p className="mt-3 text-xs text-gray-600">Source: Legal Services Corp</p>
            </Card>
            <Card className="border-[#1E1E2E] bg-[#0A0A0F] p-8 text-center">
              <p className="text-5xl font-bold gradient-text">53%</p>
              <p className="mt-4 text-gray-400">
                don&apos;t know if they could find or afford a lawyer when they need one
              </p>
            </Card>
            <Card className="border-[#1E1E2E] bg-[#0A0A0F] p-8 text-center">
              <p className="text-5xl font-bold gradient-text">75%</p>
              <p className="mt-4 text-gray-400">
                of civil court cases have at least one party with no legal representation
              </p>
            </Card>
          </div>

          <p className="mx-auto mt-14 max-w-3xl text-center text-lg leading-relaxed text-gray-400">
            In Ghana, Nigeria, India, and across the Global South, the problem is worse.
            Legal aid barely exists. A single lawyer consultation costs more than a week&apos;s wages.
            Millions sign documents they don&apos;t understand. We built JusticeAI to change that.
          </p>
        </div>
      </section>

      {/* SECTION 4 - TWO TOOLS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-16 text-center text-3xl font-bold text-text-primary sm:text-4xl">
            Two Tools. One Mission.
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-2 border-[#8B5CF6] bg-[#111118] p-8">
              <h3 className="mb-3 text-xl font-semibold text-text-primary">
                ⚖️ Legal Document Analyzer
              </h3>
              <p className="mb-4 text-gray-400 leading-relaxed">
                Upload any contract, lease, NDA, loan, or employment agreement.
                Get instant risk analysis, clause-by-clause breakdown in plain English,
                and a persistent AI chat for follow-up questions.
              </p>
              <p className="mb-6 text-sm text-[#8B5CF6]">
                For lawyers, tenants, freelancers, employees, and everyone.
              </p>
              <Link href="/auth/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Try Legal Analyzer &rarr;
                </Button>
              </Link>
            </Card>

            <Card className="border-2 border-[#10B981] bg-[#111118] p-8">
              <h3 className="mb-3 text-xl font-semibold text-text-primary">
                💻 AI Code Reviewer
              </h3>
              <p className="mb-4 text-gray-400 leading-relaxed">
                Paste any code for a security scan, bug detection, performance review,
                and expert explanations anyone can understand.
              </p>
              <p className="mb-6 text-sm text-[#10B981]">
                For developers, students, freelancers, and everyone.
              </p>
              <Link href="/auth/signup">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Try Code Reviewer &rarr;
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 5 - HOW IT WORKS */}
      <section className="bg-[#111118] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-16 text-center text-3xl font-bold text-text-primary sm:text-4xl">
            Up and running in 60 seconds
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: "👤",
                title: "Create your free account",
                description: "30 seconds. No credit card. Ever.",
              },
              {
                number: "02",
                icon: "📄",
                title: "Upload or paste your content",
                description: "Drop a PDF or paste your code.",
              },
              {
                number: "03",
                icon: "✨",
                title: "Get expert AI analysis",
                description: "Ask follow-up questions in plain English.",
              },
            ].map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A0A0F] text-2xl">
                  <span>{step.icon}</span>
                </div>
                <div className="mb-2 text-sm font-bold gradient-text">{step.number}</div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - WHO IT'S FOR */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-16 text-center text-3xl font-bold text-text-primary sm:text-4xl">
            Built For Everyone
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[
              { icon: "👩‍⚖️", title: "Lawyers", description: "Review contracts faster. Flag risks automatically." },
              { icon: "🏠", title: "Tenants", description: "Understand your lease. Know your rights before signing." },
              { icon: "💼", title: "Freelancers", description: "Protect your work. Review client contracts instantly." },
              { icon: "👨‍💻", title: "Developers", description: "Security audits. Bug detection. Better code." },
              { icon: "🏢", title: "Small Businesses", description: "Understand vendor agreements and partnership contracts." },
              { icon: "🎓", title: "Students", description: "Decode loan documents. Get code reviews for assignments." },
            ].map((persona) => (
              <Card key={persona.title} className="border-[#1E1E2E] bg-[#111118] p-8 text-center">
                <div className="mb-4 text-4xl">{persona.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">{persona.title}</h3>
                <p className="text-gray-400 leading-relaxed">{persona.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 - FOOTER */}
      <footer className="border-t border-[#1E1E2E] bg-[#111118]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row">
          <div className="text-lg font-bold">
            <span className="gradient-text">⚖️ JusticeAI</span>
            <p className="mt-1 text-sm font-normal text-gray-400">Justice for everyone.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
            <Link href="/auth/signup" className="hover:text-text-primary transition-colors">Sign Up</Link>
            <Link href="/auth/login" className="hover:text-text-primary transition-colors">Sign In</Link>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} JusticeAI. Built in Ghana. Designed for the world.
          </p>
        </div>
      </footer>
    </div>
  );
}
