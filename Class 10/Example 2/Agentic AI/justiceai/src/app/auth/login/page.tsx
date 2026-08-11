import { LoginForm } from "@/components/auth/LoginForm";

const googleErrors: Record<string, string> = {
  google_denied: "Google sign-in was cancelled.",
  state_mismatch: "Security verification failed. Please try again.",
  google_auth_failed: "Google sign-in failed. Please try again or use email.",
  invalid_request: "Invalid sign-in request. Please try again.",
};

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const error = (await searchParams)?.error;
  const serverError = error ? googleErrors[error] ?? "Authentication failed." : undefined;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden bg-gradient-to-br from-indigo-600 to-purple-700 p-12 md:flex md:w-1/2 md:flex-col md:justify-center">
        <div className="mx-auto max-w-md">
          <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-white">
            <span>&#x2696;&#xFE0F;</span>
            <span>JusticeAI</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white">Welcome back.</h1>
          <p className="text-indigo-100">
            Continue reviewing contracts, auditing code, and getting answers &mdash;
            all in plain English, all for free.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-12 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:hidden">
            <div className="mb-2 text-2xl font-bold text-text-primary">
              <span>&#x2696;&#xFE0F;</span> JusticeAI
            </div>
            <p className="text-text-muted">Welcome back.</p>
          </div>
          <h2 className="mb-6 text-center text-2xl font-bold text-text-primary md:text-left">
            Sign in to your account
          </h2>
          <LoginForm initialError={serverError} />
        </div>
      </div>
    </div>
  );
}
