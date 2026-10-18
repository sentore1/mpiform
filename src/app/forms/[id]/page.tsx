import { Suspense } from "react";
import { FillFormClient } from "@/components/user/FillFormClient";

export const instant = false;

export default function FillFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <FillFormClient />
    </Suspense>
  );
}
