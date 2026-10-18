"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getForm } from "@/lib/db";
import type { Form } from "@/types";
import { FormFiller } from "@/components/user/FormFiller";

export function FillFormClient() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getForm(id)
      .then(setForm)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-400">
        Form not found.
      </div>
    );
  }

  if (!form.isPublished) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-400">
        This form is not published yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with logo */}
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoblack.png" alt="MpiForm" className="h-8 w-auto" />
        </Link>
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← All forms
        </Link>
      </header>

      {/* Form content */}
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Form title + description */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
            {form.description && (
              <p className="text-gray-500 mt-2">{form.description}</p>
            )}
          </div>

          {/* Form card — white with subtle border */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <FormFiller form={form} />
          </div>
        </div>
      </main>
    </div>
  );
}
