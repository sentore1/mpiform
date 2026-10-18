import { Suspense } from "react";
import { AdminCertificateClient } from "@/components/admin/AdminCertificateClient";

export const instant = false;

export default function AdminCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
        </div>
      }
    >
      <AdminCertificateClient />
    </Suspense>
  );
}
