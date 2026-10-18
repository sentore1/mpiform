"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FormBuilder } from "@/components/admin/FormBuilder";
import { getForm, updateForm, getCertificateTemplates } from "@/lib/db";
import type { Form, CertificateTemplate } from "@/types";

export function EditFormClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getForm(id), getCertificateTemplates()])
      .then(([f, t]) => {
        setForm(f);
        setTemplates(t);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(updated: Omit<Form, "id" | "createdAt" | "updatedAt">) {
    setSaving(true);
    try {
      await updateForm(id, updated);
      router.push("/admin/forms");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-20 text-gray-500">Form not found.</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Form</h1>
        <p className="text-sm text-gray-500 mt-1">
          Modify fields, change the certificate template, and republish.
        </p>
      </div>
      <FormBuilder
        initialForm={form}
        templates={templates}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
