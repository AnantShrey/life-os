"use client";
import Link from "next/link";
import { resetPassword } from "@/app/auth/actions";
import { useSearchParams } from "next/navigation";

export function ResetForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/30">
      <div className="w-full max-w-sm p-8 bg-card rounded-2xl shadow-sm border border-border">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-2">Reset password</h1>
          <p className="text-muted-foreground text-sm">Enter your email to receive a reset link</p>
        </div>

        <form action={resetPassword} className="flex flex-col gap-4">
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

          <button
            type="submit"
            className="w-full py-2.5 mt-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Send Reset Link
          </button>

          {message && (
            <div className={`${message.includes("Check your email") ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"} border text-sm rounded-[12px] px-4 py-3 mt-4 text-center`}>
              {message}
            </div>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
