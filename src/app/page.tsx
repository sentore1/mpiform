"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublishedForms } from "@/lib/db";
import type { Form } from "@/types";

export default function HomePage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedForms()
      .then(setForms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoblack.png" alt="MpiForm logo" className="h-9 w-auto" />
        </div>

        {/* Admin login link — top right */}
        <Link
          href="/admin/forms"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Admin
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 py-12 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
            <p className="text-gray-500 mt-1">Select a form below to fill it in.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : forms.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-24 flex flex-col items-center gap-3 text-gray-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium">No forms available yet</p>
              <p className="text-xs">Check back later or contact the admin.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {forms.map((form) => (
                <Link
                  key={form.id}
                  href={`/forms/${form.id}`}
                  className="group block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {form.title}
                      </h2>
                      {form.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {form.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-3">
                        {form.fields.length} field{form.fields.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="shrink-0 w-9 h-9 rounded-full bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
