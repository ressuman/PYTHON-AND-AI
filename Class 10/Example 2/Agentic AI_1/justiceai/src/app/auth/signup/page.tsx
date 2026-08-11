import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden bg-gradient-to-br from-indigo-600 to-purple-700 p-12 md:flex md:w-1/2 md:flex-col md:justify-center">
        <div className="mx-auto max-w-md">
          <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-white">
            <span>&#x2696;&#xFE0F;</span>
            <span>JusticeAI</span>
          </div>
          <p className="mb-8 text-lg text-indigo-100">Justice for everyone.</p>
          <ul className="space-y-4 text-indigo-50">
            <li className="flex items-start gap-3">
              <span className="text-white">&#x2713;</span>
              <span>Legal analysis in seconds</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white">&#x2713;</span>
              <span>Code review for everyone</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white">&#x2713;</span>
              <span>Free, forever. No credit card.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-12 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:hidden">
            <div className="mb-2 text-2xl font-bold text-text-primary">
              <span>&#x2696;&#xFE0F;</span> JusticeAI
            </div>
            <p className="text-text-muted">Justice for everyone.</p>
          </div>
          <h2 className="mb-6 text-center text-2xl font-bold text-text-primary md:text-left">
            Create your account
          </h2>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
