import { ResetForm } from "./ResetForm";
import { Suspense } from "react";

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <ResetForm />
    </Suspense>
  );
}
