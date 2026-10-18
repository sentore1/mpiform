import { Suspense } from "react";
import { CertificateClient } from "@/components/user/CertificateClient";

export const instant = false;

export default function CertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <CertificateClient />
    </Suspense>
  );
}
