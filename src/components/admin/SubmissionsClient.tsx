"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getForm, getSubmissions } from "@/lib/db";
import { exportToExcel, exportToPDF } from "@/lib/exportSubmissions";
import type { Form, FormSubmission } from "@/types";
import { SYSTEM_FIELD_IDS } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const SYSTEM_IDS = new Set(Object.values(SYSTEM_FIELD_IDS));

export function SubmissionsClient() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  useEffect(() => {
    async function load() {
      const [f, subs] = await Promise.all([getForm(id), getSubmissions(id)]);
      setForm(f);
      setSubmissions(subs);
      setLoading(false);
    }
    load().catch(console.error);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!form) {
    return <div className="text-gray-400 py-20 text-center">Form not found.</div>;
  }

  // Always show Name, Email, Phone first, then up to 2 custom fields
  const identityFields = form.fields.filter((f) => SYSTEM_IDS.has(f.id as never));
  const previewFields = form.fields
    .filter((f) => !SYSTEM_IDS.has(f.id as never) && f.type !== "file" && f.type !== "image")
    .slice(0, 2);

  // Helper: get a display value from submission data for a given field id
  function cellValue(sub: FormSubmission, fieldId: string): string {
    const val = sub.data[fieldId];
    if (!val) return "—";
    return Array.isArray(val) ? val.join(", ") : String(val);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/forms">
          <Button variant="ghost" size="sm">← Forms</Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
          </p>
        </div>
        {form.certificateTemplateId && (
          <Badge variant="indigo">Certificate enabled</Badge>
        )}
        {/* Export buttons — only show when there are submissions */}
        {submissions.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              loading={exporting === "excel"}
              onClick={async () => {
                setExporting("excel");
                try { await exportToExcel(form, submissions); }
                finally { setExporting(null); }
              }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              loading={exporting === "pdf"}
              onClick={async () => {
                setExporting("pdf");
                try { await exportToPDF(form, submissions); }
                finally { setExporting(null); }
              }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Export PDF
            </Button>
          </div>
        )}
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-20 flex flex-col items-center gap-3 text-gray-400">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">No submissions yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-semibold">#</th>
                <th className="px-5 py-3 text-left font-semibold">Submitted</th>
                {identityFields.map((f) => (
                  <th key={f.id} className="px-5 py-3 text-left font-semibold">{f.label}</th>
                ))}
                {previewFields.map((f) => (
                  <th key={f.id} className="px-5 py-3 text-left font-semibold">{f.label}</th>
                ))}
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map((sub, idx) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-400 text-xs">{submissions.length - idx}</td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                    <div>{new Date(sub.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                    <div className="text-xs text-gray-400">{new Date(sub.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </td>
                  {identityFields.map((f) => (
                    <td key={f.id} className="px-5 py-4 text-gray-800 max-w-[180px] truncate font-medium">
                      {cellValue(sub, f.id)}
                    </td>
                  ))}
                  {previewFields.map((f) => (
                    <td key={f.id} className="px-5 py-4 text-gray-600 max-w-[180px] truncate">
                      {cellValue(sub, f.id)}
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      {/* Full data modal trigger */}
                      <SubmissionDetailButton sub={sub} form={form} />
                      {/* Generate certificate — only if template assigned */}
                      {form.certificateTemplateId && (
                        <Link
                          href={`/admin/forms/${form.id}/submissions/${sub.id}/certificate`}
                          target="_blank"
                        >
                          <Button size="sm" variant="primary">
                            Generate Certificate
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Inline detail expander ────────────────────────────────────────────────────

function SubmissionDetailButton({
  sub,
  form,
}: {
  sub: FormSubmission;
  form: Form;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        View
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">Submission details</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 flex flex-col gap-4">
              <p className="text-xs text-gray-400">
                Submitted on{" "}
                {new Date(sub.createdAt).toLocaleString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
              {form.fields.map((field) => {
                const val = sub.data[field.id];
                if (!val) return null;
                const display = Array.isArray(val) ? val.join(", ") : String(val);
                // If it looks like a URL (file upload), show a link
                const isUrl = display.startsWith("http");
                return (
                  <div key={field.id} className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {field.label}
                    </span>
                    {isUrl ? (
                      <a
                        href={display}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 underline break-all"
                      >
                        View file
                      </a>
                    ) : (
                      <span className="text-sm text-gray-900 break-words">{display}</span>
                    )}
                  </div>
                );
              })}
            </div>
            {form.certificateTemplateId && (
              <div className="px-6 py-4 border-t">
                <Link
                  href={`/admin/forms/${form.id}/submissions/${sub.id}/certificate`}
                  target="_blank"
                >
                  <Button className="w-full">Generate Certificate</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
