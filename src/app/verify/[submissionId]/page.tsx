import { createClient } from "@/lib/supabase/server";
import { SYSTEM_FIELD_IDS } from "@/types";
import Link from "next/link";

interface Props {
  params: Promise<{ submissionId: string }>;
}

export default async function VerifyPage({ params }: Props) {
  const { submissionId } = await params;
  const supabase = await createClient();

  // Fetch submission
  const { data: sub, error: subError } = await supabase
    .from("form_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (subError || !sub) {
    return <InvalidCertificate />;
  }

  // Fetch form
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("title, description")
    .eq("id", sub.form_id)
    .single();

  if (formError || !form) {
    return <InvalidCertificate />;
  }

  const data = (sub.data ?? {}) as Record<string, string | string[] | null>;
  const recipientName = data[SYSTEM_FIELD_IDS.name] as string | undefined;
  const recipientEmail = data[SYSTEM_FIELD_IDS.email] as string | undefined;
  const recipientPhone = data[SYSTEM_FIELD_IDS.phone] as string | undefined;

  const issuedDate = new Date(sub.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoblack.png" alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Verified card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Green verified banner */}
          <div className="bg-green-500 px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Certificate Verified</p>
              <p className="text-green-100 text-sm mt-0.5">This is an authentic certificate record.</p>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-6 flex flex-col gap-4">

            <Detail label="Issued to" value={recipientName ?? "—"} large />
            <Detail label="Programme" value={form.title} />
            {form.description && (
              <Detail label="Description" value={form.description} />
            )}
            <Detail label="Issue date" value={issuedDate} />
            {recipientEmail && <Detail label="Email" value={recipientEmail} />}
            {recipientPhone && <Detail label="Phone" value={recipientPhone} />}

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 leading-relaxed">
                Certificate ID:{" "}
                <span className="font-mono text-gray-600 break-all">{submissionId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-700 underline transition-colors">
            ← Back to forms
          </Link>
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className={large ? "text-xl font-bold text-gray-900" : "text-sm text-gray-800"}>
        {value}
      </span>
    </div>
  );
}

function InvalidCertificate() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoblack.png" alt="Logo" className="h-10 w-auto" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-red-500 px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Certificate Not Found</p>
              <p className="text-red-100 text-sm mt-0.5">This certificate could not be verified.</p>
            </div>
          </div>
          <div className="px-6 py-6">
            <p className="text-sm text-gray-500">
              The certificate you scanned does not exist in our records. It may have been deleted or the QR code is invalid.
            </p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-700 underline transition-colors">
            ← Back to forms
          </Link>
        </p>
      </div>
    </div>
  );
}
