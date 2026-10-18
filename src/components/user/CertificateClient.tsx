"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getForm, getCertificateTemplate } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import type { Form, CertificateTemplate, FormSubmission } from "@/types";
import { CertificatePreview } from "@/components/user/CertificatePreview";
import { Button } from "@/components/ui/Button";

export function CertificateClient() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId");

  const [form, setForm] = useState<Form | null>(null);
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!submissionId) {
        setError("No submission ID provided.");
        setLoading(false);
        return;
      }
      try {
        const f = await getForm(id);
        if (!f) throw new Error("Form not found");
        if (!f.certificateTemplateId)
          throw new Error("This form has no certificate template.");

        const [t, sub] = await Promise.all([
          getCertificateTemplate(f.certificateTemplateId),
          fetchSubmission(submissionId),
        ]);

        if (!t) throw new Error("Certificate template not found.");
        if (!sub) throw new Error("Submission not found.");

        setForm(f);
        setTemplate(t);
        setSubmission(sub);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, submissionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !form || !template || !submission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <p>{error ?? "Something went wrong."}</p>
        <Link href="/">
          <Button variant="outline">Back to Forms</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">← Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Certificate</h1>
            <p className="text-sm text-gray-500">
              Based on your submission for &ldquo;{form.title}&rdquo;
            </p>
          </div>
        </div>

        <CertificatePreview
          template={template}
          submission={submission}
          formFields={form.fields}
        />
      </div>
    </div>
  );
}

async function fetchSubmission(id: string): Promise<FormSubmission | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return {
    id: data.id,
    formId: data.form_id,
    data: data.data ?? {},
    createdAt: data.created_at,
  };
}
