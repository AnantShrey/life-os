import { UpdatePasswordForm } from "./UpdatePasswordForm";
import { Suspense } from "react";

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <UpdatePasswordForm />
    </Suspense>
  );
}
