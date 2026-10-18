"use client";

import { useRef, useState } from "react";
import type { CertificateTemplate, FormSubmission, FormField } from "@/types";
import { SYSTEM_FIELD_IDS } from "@/types";
import { Button } from "@/components/ui/Button";

interface CertificatePreviewProps {
  template: CertificateTemplate;
  submission: FormSubmission;
  formFields: FormField[];
}

export function CertificatePreview({
  template,
  submission,
  formFields,
}: CertificatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Get submitter name for filename
  const submitterName =
    (submission.data[SYSTEM_FIELD_IDS.name] as string | undefined) ?? "certificate";

  // ── Value resolver ────────────────────────────────────────────────────────
  function resolveValue(certFieldLabel: string): string {
    switch (certFieldLabel) {
      case "__date__":
        return new Date(submission.createdAt).toLocaleDateString("en-GB", {
          day: "numeric", month: "long", year: "numeric",
        });
      case "__app_name__":
        return template.applicationName ?? "";
      case "__description__":
        return template.description ?? "";
      case "__signer_name__":
        return template.signerName ?? "";
      case "__signer_title__":
        return template.signerTitle ?? "";
      case "__recipient_name__":
        // Always pull from the locked system Name field
        return resolveSystemOrMapped(SYSTEM_FIELD_IDS.name, certFieldLabel);
      default:
        // Try mapped form field first
        return resolveSystemOrMapped(null, certFieldLabel);
    }
  }

  function resolveSystemOrMapped(systemId: string | null, certLabel: string): string {
    // If a systemId is provided, read directly from submission data
    if (systemId) {
      const val = submission.data[systemId];
      if (val) return Array.isArray(val) ? val.join(", ") : String(val);
    }
    // Fall back to mapsToCertificate lookup
    const formField = formFields.find((f) => f.mapsToCertificate === certLabel);
    if (!formField) return "";
    const val = submission.data[formField.id];
    if (!val) return "";
    return Array.isArray(val) ? val.join(", ") : String(val);
  }

  // ── html2canvas capture ───────────────────────────────────────────────────
  async function capture() {
    if (!containerRef.current) throw new Error("Container not ready");
    const html2canvas = (await import("html2canvas")).default;
    return html2canvas(containerRef.current, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      backgroundColor: null,
      logging: false,
    });
  }

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      const canvas = await capture();
      const jsPDF = (await import("jspdf")).default;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${submitterName}-certificate.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Could not generate PDF. Try the PNG option instead.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadPNG() {
    setDownloading(true);
    try {
      const canvas = await capture();
      const link = document.createElement("a");
      link.download = `${submitterName}-certificate.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("PNG download failed:", err);
      alert("Could not generate PNG.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      {/* Submitter info bar */}
      {submitterName && submitterName !== "certificate" && (
        <div className="w-full max-w-3xl bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm text-gray-700">
            Certificate for <strong>{submitterName}</strong>
            {submission.data[SYSTEM_FIELD_IDS.email] && (
              <span className="text-gray-400 ml-2">
                · {String(submission.data[SYSTEM_FIELD_IDS.email])}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Certificate canvas */}
      <div
        ref={containerRef}
        className="relative w-full max-w-3xl shadow-2xl overflow-hidden"
        style={{ aspectRatio: "1.414 / 1" }}
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.imageUrl}
          alt="Certificate background"
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
          onLoad={() => setImgLoaded(true)}
          draggable={false}
        />

        {/* Text overlays — only render after image loads to get correct dimensions */}
        {imgLoaded &&
          template.fields.map((field) => {
            const text = resolveValue(field.label);
            return (
              <div
                key={field.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${field.x}%`,
                  top: `${field.y}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: `${field.fontSize}px`,
                  fontFamily: field.fontFamily,
                  color: field.color,
                  fontWeight: field.fontWeight,
                  textAlign: field.align,
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                }}
              >
                {text}
              </div>
            );
          })}
      </div>

      {/* Download buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleDownloadPDF}
          loading={downloading}
          className="bg-black hover:bg-gray-900 border-black focus:ring-gray-800"
        >
          Download PDF
        </Button>
        <Button variant="outline" onClick={handleDownloadPNG} loading={downloading}>
          Download PNG
        </Button>
      </div>
    </div>
  );
}
