"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { GoogleButton } from "@/components/auth/GoogleButton";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [serverError, setServerError] = useState(initialError ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormData) {
    setServerError("");

    let recaptchaToken = "";

    if (recaptchaLoaded && typeof window !== "undefined" && (window as any).grecaptcha) {
      try {
        recaptchaToken = await (window as any).grecaptcha.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          { action: "login" }
        );
      } catch {
        recaptchaToken = "";
      }
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        recaptchaToken,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setServerError(result.error ?? "Something went wrong");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setRecaptchaLoaded(true)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {serverError}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Email
          </label>
          <Input
            {...register("email")}
            type="email"
            placeholder="john@example.com"
            className="bg-surface-2 border-border text-text-primary"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Password
          </label>
          <div className="relative">
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="bg-surface-2 border-border text-text-primary pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-muted text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register("rememberMe")}
            className="h-4 w-4 rounded border-border bg-surface-2 accent-primary"
          />
          <span className="text-sm text-text-muted">Remember Me</span>
        </label>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-text-subtle">or continue with</span>
          </div>
        </div>

        <GoogleButton mode="signin" />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-primary hover:bg-primary-hover text-white"
        >
          {isSubmitting ? <LoadingSpinner size="sm" /> : "Sign In"}
        </Button>

        <p className="text-center text-xs text-text-subtle">
          Protected by reCAPTCHA. Google&apos;s{" "}
          <a href="https://policies.google.com/privacy" className="underline hover:text-text-muted" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="https://policies.google.com/terms" className="underline hover:text-text-muted" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{" "}
          apply.
        </p>

        <p className="text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </>
  );
}
