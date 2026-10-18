"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getForm, getCertificateTemplate, getSubmissions } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import type { Form, CertificateTemplate, FormSubmission } from "@/types";
import { CertificatePreview } from "@/components/user/CertificatePreview";
import { Button } from "@/components/ui/Button";

export function AdminCertificateClient() {
  const { id, submissionId } = useParams<{ id: string; submissionId: string }>();

  const [form, setForm] = useState<Form | null>(null);
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const f = await getForm(id);
        if (!f) throw new Error("Form not found.");
        if (!f.certificateTemplateId)
          throw new Error(
            `This form has no certificate template assigned. Go to Edit Form and select a Certificate Template.`
          );

        const supabase = createClient();
        const { data: subData, error: subError } = await supabase
          .from("form_submissions")
          .select("*")
          .eq("id", submissionId)
          .single();

        if (subError || !subData) throw new Error("Submission not found.");

        const sub: FormSubmission = {
          id: subData.id,
          formId: subData.form_id,
          data: subData.data ?? {},
          createdAt: subData.created_at,
        };

        const t = await getCertificateTemplate(f.certificateTemplateId);
        if (!t)
          throw new Error(
            "Certificate template not found in database. It may have been deleted."
          );

        setForm(f);
        setTemplate(t);
        setSubmission(sub);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, submissionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
      </div>
    );
  }

  if (error || !form || !template || !submission) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900 mb-1">Cannot generate certificate</p>
          <p className="text-sm text-gray-500 max-w-md">{error ?? "Something went wrong."}</p>
        </div>
        <Link href={`/admin/forms/${id}/submissions`}>
          <Button variant="outline">← Back to Submissions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/admin/forms/${id}/submissions`}>
          <Button variant="ghost" size="sm">← Submissions</Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Certificate Preview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {form.title} — submission from{" "}
            {new Date(submission.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
      </div>

      <CertificatePreview
        template={template}
        submission={submission}
        formFields={form.fields}
      />
    </div>
  );
}
