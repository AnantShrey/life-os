"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signup } from "@/app/auth/actions";
import { useSearchParams } from "next/navigation";

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/30">
      <div className="w-full max-w-sm p-8 bg-card rounded-2xl shadow-sm border border-border">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-2">Create an account</h1>
          <p className="text-muted-foreground text-sm">Sign up to start tracking your life</p>
        </div>

        <form action={signup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              autoComplete="email"
              className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                autoComplete="new-password"
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                minLength={6}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 mt-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign Up
          </button>

          {message && (
            <div className={`${message.includes("Check your email") ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"} border text-sm rounded-[12px] px-4 py-3 mt-4 text-center`}>
              {message}
            </div>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
