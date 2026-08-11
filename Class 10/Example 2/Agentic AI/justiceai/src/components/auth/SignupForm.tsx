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
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { GoogleButton } from "@/components/auth/GoogleButton";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string(),
    role: z.enum(["lawyer", "engineer", "general", "both"]),
    rememberMe: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const roleOptions = [
  { value: "lawyer" as const, label: "Lawyer", icon: "\u2696\uFE0F" },
  { value: "engineer" as const, label: "Engineer", icon: "\uD83D\uDCBB" },
  { value: "general" as const, label: "General User", icon: "\uD83D\uDE4B" },
  { value: "both" as const, label: "Both", icon: "\uD83C\uDF0D" },
];

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "both",
      rememberMe: false,
    },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: SignupFormData) {
    let recaptchaToken = "";

    if (recaptchaLoaded && typeof window !== "undefined" && (window as any).grecaptcha) {
      try {
        recaptchaToken = await (window as any).grecaptcha.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          { action: "signup" }
        );
      } catch {
        recaptchaToken = "";
      }
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        rememberMe: data.rememberMe,
        recaptchaToken,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.error ?? "Something went wrong");
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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Full Name
          </label>
          <Input
            {...register("name")}
            placeholder="John Doe"
            className="bg-surface-2 border-border text-text-primary"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
          )}
        </div>

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
              placeholder="Min. 8 characters"
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repeat your password"
              className="bg-surface-2 border-border text-text-primary pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-muted text-sm"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-danger">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-text-primary">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("role", opt.value, { shouldValidate: true })}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all text-center ${
                  selectedRole === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface-2 text-text-muted hover:border-text-subtle"
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
          {errors.role && (
            <p className="mt-1 text-xs text-danger">{errors.role.message}</p>
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

        <GoogleButton mode="signup" />

        <p className="text-center text-xs text-text-subtle">
          Google sign-up sets your role to General &mdash; update it in settings later.
        </p>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-primary hover:bg-primary-hover text-white"
        >
          {isSubmitting ? <LoadingSpinner size="sm" /> : "Create Account"}
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
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </>
  );
}
