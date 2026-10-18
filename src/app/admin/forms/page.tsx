"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getForms, deleteForm, updateForm } from "@/lib/db";
import type { Form } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AdminFormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await getForms();
      setForms(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this form and all its submissions?")) return;
    await deleteForm(id);
    setForms((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleTogglePublish(form: Form) {
    const updated = await updateForm(form.id, { isPublished: !form.isPublished });
    setForms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage dynamic forms
          </p>
        </div>
        <Link href="/admin/forms/new">
          <Button>+ New Form</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : forms.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-20 flex flex-col items-center gap-3 text-gray-400">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">No forms yet</p>
          <Link href="/admin/forms/new">
            <Button size="sm">Create your first form</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-6 py-3 text-left font-semibold">Title</th>
                <th className="px-6 py-3 text-left font-semibold">Fields</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Created</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{form.title}</p>
                    {form.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                        {form.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {form.fields.length}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={form.isPublished ? "green" : "yellow"}>
                      {form.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(form.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/forms/${form.id}`} target="_blank">
                        <Button variant="ghost" size="sm">Preview</Button>
                      </Link>
                      <Link href={`/admin/forms/edit/${form.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleTogglePublish(form)}
                      >
                        {form.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(form.id)}
                      >
                        Delete
                      </Button>
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
