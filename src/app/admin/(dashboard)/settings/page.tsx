"use client";

import { useEffect, useState, useRef } from "react";
import {
  getCertificateTemplates,
  createCertificateTemplate,
  updateCertificateTemplate,
  deleteCertificateTemplate,
  uploadFile,
} from "@/lib/db";
import type { CertificateTemplate } from "@/types";
import { CertificateTemplateEditor } from "@/components/admin/CertificateTemplateEditor";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

type Mode = "list" | "new" | "edit";

export default function SettingsPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<CertificateTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CertificateTemplate | null>(null);

  async function load() {
    setLoading(true);
    try {
      setTemplates(await getCertificateTemplates());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleImageUpload(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `templates/${Date.now()}.${ext}`;
    return uploadFile("certificates", path, file);
  }

  async function handleCreate(
    t: Omit<CertificateTemplate, "id" | "createdAt" | "updatedAt">
  ) {
    setSaving(true);
    try {
      const created = await createCertificateTemplate(t);
      setTemplates((prev) => [created, ...prev]);
      setMode("list");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save template. Make sure you have run the database migration SQL.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(
    t: Omit<CertificateTemplate, "id" | "createdAt" | "updatedAt">
  ) {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await updateCertificateTemplate(editing.id, t);
      setTemplates((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setMode("list");
      setEditing(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update template. Make sure you have run the database migration SQL.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteCertificateTemplate(deleteTarget.id);
    setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (mode === "new") {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setMode("list")}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            New Certificate Template
          </h1>
        </div>
        <CertificateTemplateEditor
          onSave={handleCreate}
          onImageUpload={handleImageUpload}
          saving={saving}
        />
      </div>
    );
  }

  if (mode === "edit" && editing) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMode("list");
              setEditing(null);
            }}
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Template</h1>
        </div>
        <CertificateTemplateEditor
          initialTemplate={editing}
          onSave={handleUpdate}
          onImageUpload={handleImageUpload}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Certificate Templates
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage background images and field positions for certificates
          </p>
        </div>
        <Button onClick={() => setMode("new")}>+ New Template</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-20 flex flex-col items-center gap-3 text-gray-400">
          <svg
            className="w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium">No templates yet</p>
          <Button size="sm" onClick={() => setMode("new")}>
            Create your first template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Preview */}
              <div className="relative bg-gray-100 aspect-[1.414/1] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.imageUrl}
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0">
                  {t.fields.map((f) => (
                    <span
                      key={f.id}
                      className="absolute text-[8px] pointer-events-none"
                      style={{
                        left: `${f.x}%`,
                        top: `${f.y}%`,
                        transform: "translate(-50%,-50%)",
                        fontFamily: f.fontFamily,
                        color: f.color,
                        fontWeight: f.fontWeight,
                      }}
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <p className="font-semibold text-gray-900">{t.name}</p>
                {t.description && (
                  <p className="text-xs text-gray-500">{t.description}</p>
                )}
                <Badge variant="indigo">{t.fields.length} field{t.fields.length !== 1 ? "s" : ""}</Badge>
              </div>

              <div className="px-4 pb-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditing(t);
                    setMode("edit");
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(t)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Template"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
