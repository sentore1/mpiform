import type { Form, FormSubmission } from "@/types";
import { SYSTEM_FIELD_IDS } from "@/types";

// ─── Build rows ───────────────────────────────────────────────────────────────

interface ExportRow {
  "#": number;
  "Submitted At": string;
  [key: string]: string | number;
}

export function buildRows(
  form: Form,
  submissions: FormSubmission[]
): ExportRow[] {
  const systemIds = new Set(Object.values(SYSTEM_FIELD_IDS));
  const systemFields = form.fields.filter((f) => systemIds.has(f.id as never));
  const customFields = form.fields.filter(
    (f) => !systemIds.has(f.id as never) && f.type !== "file" && f.type !== "image"
  );
  const orderedFields = [...systemFields, ...customFields];

  return submissions.map((sub, idx) => {
    const row: ExportRow = {
      "#": submissions.length - idx,
      "Submitted At": new Date(sub.createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    for (const field of orderedFields) {
      const val = sub.data[field.id];
      row[field.label] = val
        ? Array.isArray(val) ? val.join(", ") : String(val)
        : "";
    }
    return row;
  });
}

// ─── Excel export ─────────────────────────────────────────────────────────────

export async function exportToExcel(
  form: Form,
  submissions: FormSubmission[]
): Promise<void> {
  const XLSX = await import("xlsx");
  const rows = buildRows(form, submissions);
  const ws = XLSX.utils.json_to_sheet(rows);

  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? "").length)) + 2,
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Submissions");
  XLSX.writeFile(wb, `${form.title}-submissions.xlsx`);
}

// ─── Logo loader ──────────────────────────────────────────────────────────────

async function loadLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch("/logoblack.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─── PDF export ───────────────────────────────────────────────────────────────

export async function exportToPDF(
  form: Form,
  submissions: FormSubmission[]
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const rows = buildRows(form, submissions);
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const body = rows.map((r) => headers.map((h) => String(r[h] ?? "")));

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 10;
  const marginR = 10;
  const usableW = pageW - marginL - marginR;

  // ── Logo ───────────────────────────────────────────────────────────────────
  const logoBase64 = await loadLogoBase64();
  const logoH = 10; // mm
  let headerBottomY = 10;

  if (logoBase64) {
    // Place logo top-left; width = auto (pass 0), height = logoH
    doc.addImage(logoBase64, "PNG", marginL, 6, 0, logoH);
    headerBottomY = 6 + logoH + 3; // below logo
  }

  // ── Title ──────────────────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(form.title, marginL, headerBottomY + 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(130, 130, 130);
  doc.text(
    `${submissions.length} submission${submissions.length !== 1 ? "s" : ""} · Exported ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
    marginL,
    headerBottomY + 11
  );
  doc.setTextColor(0, 0, 0);

  // ── Divider ────────────────────────────────────────────────────────────────
  const dividerY = headerBottomY + 14;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(marginL, dividerY, marginL + usableW, dividerY);

  // ── Table ──────────────────────────────────────────────────────────────────
  const rowH = 7;
  const headerH = 8;
  let y = dividerY + 3;

  const colWidths: number[] = headers.map((h) => {
    if (h === "#") return 8;
    if (h === "Submitted At") return 28;
    return (usableW - 8 - 28) / Math.max(headers.length - 2, 1);
  });

  function drawRow(cells: string[], rowY: number, height: number, isHeader: boolean) {
    if (isHeader) {
      doc.setFillColor(15, 15, 15);
      doc.rect(marginL, rowY, usableW, height, "F");
    }
    let x = marginL;
    cells.forEach((cell, i) => {
      const cw = colWidths[i] ?? 20;
      if (isHeader) {
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
      } else {
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
      }
      const maxChars = Math.floor(cw / 1.8);
      const clipped = cell.length > maxChars ? cell.slice(0, maxChars - 1) + "…" : cell;
      doc.text(clipped, x + 1.5, rowY + height * 0.65);
      x += cw;
    });
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.15);
    doc.line(marginL, rowY + height, marginL + usableW, rowY + height);
  }

  drawRow(headers, y, headerH, true);
  y += headerH;

  body.forEach((row, idx) => {
    if (y + rowH > pageH - 12) {
      doc.addPage();
      y = 15;
      drawRow(headers, y, headerH, true);
      y += headerH;
    }
    if (idx % 2 === 0) {
      doc.setFillColor(249, 249, 249);
      doc.rect(marginL, y, usableW, rowH, "F");
    }
    drawRow(row, y, rowH, false);
    y += rowH;
  });

  // ── Page numbers ───────────────────────────────────────────────────────────
  const totalPages = (
    doc.internal as unknown as { getNumberOfPages: () => number }
  ).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(`Page ${p} of ${totalPages}`, pageW - marginR, pageH - 4, {
      align: "right",
    });
  }

  doc.save(`${form.title}-submissions.pdf`);
}
