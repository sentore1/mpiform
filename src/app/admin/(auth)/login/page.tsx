import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const instant = false;

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="flex justify-center mb-8">
          <img
            src="/logoblack.png"
            alt="MpiForm"
            className="h-10 w-auto"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Admin sign in</h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter your credentials to access the dashboard.
          </p>

          <Suspense fallback={<div className="h-44 animate-pulse bg-gray-50 rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Admin access only.{" "}
          <a href="/" className="underline hover:text-gray-600">
            Public forms →
          </a>
        </p>
      </div>
    </div>
  );
}
