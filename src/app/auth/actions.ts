"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.error("Login error:", error.message);
    return redirect("/login?message=" + encodeURIComponent("Invalid email or password"));
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    logger.error("Signup error:", error.message);
    return redirect("/signup?message=" + encodeURIComponent("Could not create account. Please try again."));
  }

  if (data?.user?.identities?.length === 0) {
    return redirect("/signup?message=" + encodeURIComponent("Email already in use"));
  }

  return redirect("/signup?message=" + encodeURIComponent("Check your email to confirm your account"));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/update-password`,
  });

  if (error) {
    logger.error("Reset password error:", error.message);
    return redirect("/auth/reset?message=" + encodeURIComponent("Failed to send reset email: " + error.message));
  }

  return redirect("/auth/reset?message=" + encodeURIComponent("Check your email for the password reset link"));
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    logger.error("Update password error:", error.message);
    return redirect("/auth/update-password?message=" + encodeURIComponent("Failed to update password: " + error.message));
  }

  return redirect("/login?message=" + encodeURIComponent("Password updated successfully. Please log in."));
}
