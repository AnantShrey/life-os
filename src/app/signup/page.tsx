import Link from "next/link";
import { signup } from "@/app/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const params = await searchParams;

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
            <input
              id="password"
              name="password"
              className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              required
              type="password"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 mt-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign Up
          </button>

          {params?.message && (
            <div className="p-3 mt-4 text-sm text-center text-red-600 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
              {params.message}
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
