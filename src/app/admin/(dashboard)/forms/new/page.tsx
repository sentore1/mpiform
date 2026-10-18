"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormBuilder } from "@/components/admin/FormBuilder";
import { createForm, getCertificateTemplates } from "@/lib/db";
import type { Form, CertificateTemplate } from "@/types";

export default function NewFormPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCertificateTemplates().then(setTemplates).catch(console.error);
  }, []);

  async function handleSave(form: Omit<Form, "id" | "createdAt" | "updatedAt">) {
    setSaving(true);
    try {
      await createForm(form);
      router.push("/admin/forms");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Form</h1>
        <p className="text-sm text-gray-500 mt-1">
          Build your form by adding fields, then publish it for users to fill in.
        </p>
      </div>
      <FormBuilder templates={templates} onSave={handleSave} saving={saving} />
    </div>
  );
}
