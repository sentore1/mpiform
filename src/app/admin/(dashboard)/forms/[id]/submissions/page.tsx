import { Suspense } from "react";
import { SubmissionsClient } from "@/components/admin/SubmissionsClient";

export const instant = false;

export default function SubmissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <SubmissionsClient />
    </Suspense>
  );
}
