import { Suspense } from "react";
import { EditFormClient } from "@/components/admin/EditFormClient";

export const instant = false;

export default function EditFormPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <EditFormClient />
    </Suspense>
  );
}
