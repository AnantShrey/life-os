"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { updatePassword } from "@/app/auth/actions";
import { useSearchParams } from "next/navigation";

export function UpdatePasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/30">
      <div className="w-full max-w-sm p-8 bg-card rounded-2xl shadow-sm border border-border">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-2">Update password</h1>
          <p className="text-muted-foreground text-sm">Enter your new password below</p>
        </div>

        <form action={updatePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="password">
              New Password
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
            Update Password
          </button>

          {message && (
            <div className="p-3 mt-4 text-sm text-center text-red-600 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
