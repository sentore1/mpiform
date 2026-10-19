"use client";

import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import type { CertificateTemplate, CertificateField } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface CertificateTemplateEditorProps {
  initialTemplate?: Partial<CertificateTemplate>;
  onSave: (
    template: Omit<CertificateTemplate, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onImageUpload: (file: File) => Promise<string>;
  saving?: boolean;
}

const FONT_FAMILIES = [
  // Sans-serif
  { label: "Sans-serif (default)", value: "sans-serif" },
  { label: "Arial",                value: "Arial, sans-serif" },
  { label: "Verdana",              value: "Verdana, sans-serif" },
  { label: "Trebuchet MS",         value: "'Trebuchet MS', sans-serif" },
  { label: "Tahoma",               value: "Tahoma, sans-serif" },
  // Serif
  { label: "Serif (default)",      value: "serif" },
  { label: "Georgia",              value: "Georgia, serif" },
  { label: "Times New Roman",      value: "'Times New Roman', serif" },
  { label: "Garamond",             value: "Garamond, serif" },
  { label: "Palatino",             value: "'Palatino Linotype', Palatino, serif" },
  // Script / Cursive
  { label: "Cursive (default)",    value: "cursive" },
  { label: "Dancing Script",       value: "'Dancing Script', cursive" },
  { label: "Great Vibes",          value: "'Great Vibes', cursive" },
  { label: "Pacifico",             value: "'Pacifico', cursive" },
  { label: "Satisfy",              value: "'Satisfy', cursive" },
  { label: "Allura",               value: "'Allura', cursive" },
  { label: "Sacramento",           value: "'Sacramento', cursive" },
  // Monospace
  { label: "Monospace (default)",  value: "monospace" },
  { label: "Courier New",          value: "'Courier New', monospace" },
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64].map(
  (s) => ({ label: `${s}px`, value: String(s) })
);

const ALIGNS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

export function CertificateTemplateEditor({
  initialTemplate,
  onSave,
  onImageUpload,
  saving = false,
}: CertificateTemplateEditorProps) {
  const [name, setName] = useState(initialTemplate?.name ?? "");
  const [description, setDescription] = useState(
    initialTemplate?.description ?? ""
  );
  const [applicationName, setApplicationName] = useState(
    initialTemplate?.applicationName ?? ""
  );
  const [signerName, setSignerName] = useState(
    initialTemplate?.signerName ?? ""
  );
  const [signerTitle, setSignerTitle] = useState(
    initialTemplate?.signerTitle ?? ""
  );
  const [imageUrl, setImageUrl] = useState(initialTemplate?.imageUrl ?? "");
  const [fields, setFields] = useState<CertificateField[]>(
    initialTemplate?.fields ?? []
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // ── QR code position & size ─────────────────────────────────────────────────
  const [qrX, setQrX] = useState(initialTemplate?.qrX ?? 90);
  const [qrY, setQrY] = useState(initialTemplate?.qrY ?? 88);
  const [qrSize, setQrSize] = useState(initialTemplate?.qrSize ?? 60);
  const [draggingQr, setDraggingQr] = useState(false);
  const [qrDragOffset, setQrDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;

  // ── Image upload ────────────────────────────────────────────────────────────
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      setImageUrl(url);
    } finally {
      setUploading(false);
    }
  }

  // ── Fields ──────────────────────────────────────────────────────────────────
  function addField() {
    const newField: CertificateField = {
      id: uuidv4(),
      label: "New Field",
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: "sans-serif",
      color: "#ffffff",
      fontWeight: "normal",
      align: "center",
    };
    setFields((prev) => [...prev, newField]);
    setSelectedId(newField.id);
  }

  function updateField(id: string, patch: Partial<CertificateField>) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  }

  function deleteField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  // ── Drag-to-position on canvas ───────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      setSelectedId(id);
      setDraggingId(id);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const field = fields.find((f) => f.id === id)!;
      const elX = (field.x / 100) * rect.width;
      const elY = (field.y / 100) * rect.height;
      setDragOffset({
        x: e.clientX - rect.left - elX,
        y: e.clientY - rect.top - elY,
      });
    },
    [fields]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

      if (draggingQr) {
        const rawX = e.clientX - rect.left - qrDragOffset.x;
        const rawY = e.clientY - rect.top - qrDragOffset.y;
        setQrX(parseFloat(Math.min(100, Math.max(0, (rawX / rect.width) * 100)).toFixed(2)));
        setQrY(parseFloat(Math.min(100, Math.max(0, (rawY / rect.height) * 100)).toFixed(2)));
        return;
      }

      if (!draggingId) return;
      const rawX = e.clientX - rect.left - dragOffset.x;
      const rawY = e.clientY - rect.top - dragOffset.y;
      const x = Math.min(100, Math.max(0, (rawX / rect.width) * 100));
      const y = Math.min(100, Math.max(0, (rawY / rect.height) * 100));
      updateField(draggingId, { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
    },
    [draggingId, draggingQr, dragOffset, qrDragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setDraggingQr(false);
  }, []);

  // ── QR drag ──────────────────────────────────────────────────────────────────
  const handleQrMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingQr(true);
    setSelectedId(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const elX = (qrX / 100) * rect.width;
    const elY = (qrY / 100) * rect.height;
    setQrDragOffset({
      x: e.clientX - rect.left - elX,
      y: e.clientY - rect.top - elY,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrX, qrY]);

  // ── Save ─────────────────────────────────────────────────────────────────────
  async function handleSave() {
    await onSave({ name, description, applicationName, signerName, signerTitle, imageUrl, fields, qrX, qrY, qrSize });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Meta */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Participation Certificate"
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
        />
        <Input
          label="Application / Organisation Name"
          value={applicationName}
          onChange={(e) => setApplicationName(e.target.value)}
          placeholder="e.g. MPI Training Institute"
        />
        <div className="sm:col-span-1" />
        <Input
          label="Signer Name"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="e.g. Dr. John Smith"
        />
        <Input
          label="Signer Title / Position"
          value={signerTitle}
          onChange={(e) => setSignerTitle(e.target.value)}
          placeholder="e.g. Director of Training"
        />

        {/* Auto-field cheat sheet */}
        <div className="sm:col-span-2 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
          <p className="text-xs font-semibold text-indigo-700 mb-2">
            ✦ Special auto-populated placeholders — use these as field labels on the canvas:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { key: "__recipient_name__", desc: "Submitter's full name" },
              { key: "__app_name__",       desc: "Application name above" },
              { key: "__description__",    desc: "Template description" },
              { key: "__signer_name__",    desc: "Signer name above" },
              { key: "__signer_title__",   desc: "Signer title above" },
              { key: "__date__",           desc: "Submission date (auto)" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className="text-left text-xs bg-white border border-indigo-200 rounded px-2 py-1.5 hover:bg-indigo-100 transition-colors"
                onClick={() => {
                  const newField: CertificateField = {
                    id: uuidv4(),
                    label: item.key,
                    x: 50, y: 50,
                    fontSize: 20,
                    fontFamily: "sans-serif",
                    color: "#ffffff",
                    fontWeight: "normal",
                    align: "center",
                  };
                  setFields((prev) => [...prev, newField]);
                  setSelectedId(newField.id);
                }}
                title={`Add ${item.key} to canvas`}
              >
                <span className="font-mono text-indigo-600">{item.key}</span>
                <span className="block text-gray-500 mt-0.5">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image upload */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Certificate Background Image
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
          >
            {imageUrl ? "Change Image" : "Upload Image"}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          aria-label="Upload certificate background image"
        />
        {!imageUrl && (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 flex items-center justify-center text-gray-400 text-sm">
            No image uploaded yet. Upload a certificate background to get started.
          </div>
        )}
      </div>

      {/* Canvas + field properties */}
      {imageUrl && (
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Canvas */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Position Fields
              </h2>
              <Button variant="outline" size="sm" onClick={addField}>
                + Add Text Field
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Drag text fields to position them on the certificate.
            </p>
            <div
              ref={canvasRef}
              className="relative w-full select-none overflow-hidden rounded-lg border border-gray-200 cursor-crosshair"
              style={{ aspectRatio: "1.414 / 1" }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Background image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Certificate background"
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />

              {/* Overlay fields */}
              {fields.map((field) => {
                const canvas = canvasRef.current;
                const canvasWidth = canvas?.offsetWidth ?? 800;
                // Scale font: design at 800px wide, scale proportionally
                const scaledSize = (field.fontSize / 800) * canvasWidth;
                return (
                  <div
                    key={field.id}
                    className={`absolute cursor-move px-1 rounded transition-shadow ${
                      selectedId === field.id
                        ? "ring-2 ring-indigo-500 shadow-lg bg-black/10"
                        : "hover:ring-1 hover:ring-white/60"
                    }`}
                    style={{
                      left: `${field.x}%`,
                      top: `${field.y}%`,
                      transform: "translate(-50%, -50%)",
                      fontSize: `${scaledSize}px`,
                      fontFamily: field.fontFamily,
                      color: field.color,
                      fontWeight: field.fontWeight,
                      textAlign: field.align,
                      whiteSpace: "nowrap",
                      textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                    }}
                    onMouseDown={(e) => handleMouseDown(e, field.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Field: ${field.label}`}
                  >
                    {field.label}
                  </div>
                );
              })}

              {/* QR code — draggable on canvas */}
              {(() => {
                const canvasWidth = canvasRef.current?.offsetWidth ?? 800;
                const scaledQrSize = Math.round((qrSize / 800) * canvasWidth);
                return (
                  <div
                    className={`absolute cursor-move flex flex-col items-center gap-0.5 ${draggingQr ? "ring-2 ring-indigo-500 rounded" : "hover:ring-2 hover:ring-indigo-400 rounded"}`}
                    style={{
                      left: `${qrX}%`,
                      top: `${qrY}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onMouseDown={handleQrMouseDown}
                    role="button"
                    tabIndex={0}
                    aria-label="QR code — drag to reposition"
                    title="Drag to reposition QR code"
                  >
                    <div className="bg-white p-1 rounded shadow-sm pointer-events-none">
                      <QRCodeSVG value="https://verify.example.com/preview" size={scaledQrSize} level="M" includeMargin={false} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field properties panel */}
          <div className="w-full xl:w-80 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-gray-900">
              Field Properties
            </h2>

            {!selectedField ? (
              <p className="text-sm text-gray-400">
                Click a field on the canvas to edit its properties.
              </p>
            ) : (
              <>
                <Input
                  label="Field Label / Placeholder Key"
                  value={selectedField.label}
                  onChange={(e) =>
                    updateField(selectedField.id, { label: e.target.value })
                  }
                  placeholder="e.g. Recipient Name"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="X Position (%)"
                    type="number"
                    min={0}
                    max={100}
                    value={selectedField.x}
                    onChange={(e) =>
                      updateField(selectedField.id, {
                        x: parseFloat(e.target.value),
                      })
                    }
                  />
                  <Input
                    label="Y Position (%)"
                    type="number"
                    min={0}
                    max={100}
                    value={selectedField.y}
                    onChange={(e) =>
                      updateField(selectedField.id, {
                        y: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <Select
                  label="Font Size"
                  options={FONT_SIZES}
                  value={String(selectedField.fontSize)}
                  onChange={(e) =>
                    updateField(selectedField.id, {
                      fontSize: parseInt(e.target.value),
                    })
                  }
                />
                <Select
                  label="Font Family"
                  options={FONT_FAMILIES}
                  value={selectedField.fontFamily}
                  onChange={(e) =>
                    updateField(selectedField.id, {
                      fontFamily: e.target.value,
                    })
                  }
                />
                {/* Live font preview */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center overflow-hidden">
                  <p
                    className="text-gray-700 truncate"
                    style={{
                      fontFamily: selectedField.fontFamily,
                      fontSize: "18px",
                      fontWeight: selectedField.fontWeight,
                    }}
                  >
                    Sample Text أبجد
                  </p>
                </div>
                <Select
                  label="Text Align"
                  options={ALIGNS}
                  value={selectedField.align}
                  onChange={(e) =>
                    updateField(selectedField.id, {
                      align: e.target.value as CertificateField["align"],
                    })
                  }
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={selectedField.color}
                    onChange={(e) =>
                      updateField(selectedField.id, { color: e.target.value })
                    }
                    className="w-full h-9 rounded border border-gray-300 cursor-pointer"
                    aria-label="Text color picker"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedField.fontWeight === "bold"}
                    onChange={(e) =>
                      updateField(selectedField.id, {
                        fontWeight: e.target.checked ? "bold" : "normal",
                      })
                    }
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Bold</span>
                </label>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteField(selectedField.id)}
                >
                  Delete Field
                </Button>
              </>
            )}

            {/* ── QR code controls ── always shown ── */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-700">QR Code</h3>
              <p className="text-xs text-gray-400 -mt-2">Drag it on the canvas or adjust manually.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">X Position (%)</label>
                  <input
                    type="number" min={0} max={100} step={0.5}
                    value={qrX}
                    onChange={(e) => setQrX(parseFloat(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Y Position (%)</label>
                  <input
                    type="number" min={0} max={100} step={0.5}
                    value={qrY}
                    onChange={(e) => setQrY(parseFloat(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Size — <span className="text-gray-500 font-normal">{qrSize}px</span>
                </label>
                <input
                  type="range" min={20} max={200} step={2}
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                  aria-label="QR code size"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Small</span><span>Large</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!name || !imageUrl}
        >
          Save Template
        </Button>
      </div>
    </div>
  );
}
