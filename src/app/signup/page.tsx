import { SignupForm } from "./SignupForm";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <SignupForm />
    </Suspense>
  );
}
