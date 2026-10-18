import { createClient } from "./supabase/client";
import type { Form, CertificateTemplate, FormSubmission } from "@/types";

// ─── Forms ────────────────────────────────────────────────────────────────────

export async function getForms(): Promise<Form[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapForm);
}

export async function getForm(id: string): Promise<Form | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return mapForm(data);
}

export async function getPublishedForms(): Promise<Form[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapForm);
}

export async function createForm(
  form: Omit<Form, "id" | "createdAt" | "updatedAt">
): Promise<Form> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("forms")
    .insert({
      title: form.title,
      description: form.description,
      fields: form.fields,
      certificate_template_id: form.certificateTemplateId ?? null,
      is_published: form.isPublished,
    })
    .select()
    .single();
  if (error) throw error;
  return mapForm(data);
}

export async function updateForm(
  id: string,
  form: Partial<Omit<Form, "id" | "createdAt" | "updatedAt">>
): Promise<Form> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("forms")
    .update({
      ...(form.title !== undefined && { title: form.title }),
      ...(form.description !== undefined && { description: form.description }),
      ...(form.fields !== undefined && { fields: form.fields }),
      ...(form.certificateTemplateId !== undefined && {
        certificate_template_id: form.certificateTemplateId,
      }),
      ...(form.isPublished !== undefined && { is_published: form.isPublished }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapForm(data);
}

export async function deleteForm(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("forms").delete().eq("id", id);
  if (error) throw error;
}

// ─── Certificate Templates ────────────────────────────────────────────────────

export async function getCertificateTemplates(): Promise<CertificateTemplate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("certificate_templates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTemplate);
}

export async function getCertificateTemplate(
  id: string
): Promise<CertificateTemplate | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("certificate_templates")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return mapTemplate(data);
}

export async function createCertificateTemplate(
  t: Omit<CertificateTemplate, "id" | "createdAt" | "updatedAt">
): Promise<CertificateTemplate> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("certificate_templates")
    .insert({
      name: t.name,
      description: t.description,
      image_url: t.imageUrl,
      fields: t.fields,
    })
    .select()
    .single();
  if (error) throw error;
  return mapTemplate(data);
}

export async function updateCertificateTemplate(
  id: string,
  t: Partial<Omit<CertificateTemplate, "id" | "createdAt" | "updatedAt">>
): Promise<CertificateTemplate> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("certificate_templates")
    .update({
      ...(t.name !== undefined && { name: t.name }),
      ...(t.description !== undefined && { description: t.description }),
      ...(t.imageUrl !== undefined && { image_url: t.imageUrl }),
      ...(t.fields !== undefined && { fields: t.fields }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapTemplate(data);
}

export async function deleteCertificateTemplate(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("certificate_templates")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export async function getSubmissions(formId: string): Promise<FormSubmission[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*")
    .eq("form_id", formId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapSubmission);
}

export async function createSubmission(
  formId: string,
  submissionData: Record<string, string | string[] | null>
): Promise<FormSubmission> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("form_submissions")
    .insert({ form_id: formId, data: submissionData })
    .select()
    .single();
  if (error) throw error;
  return mapSubmission(data);
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export async function uploadFile(
  bucket: "certificates" | "uploads",
  path: string,
  file: File
): Promise<string> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteStorageFile(
  bucket: "certificates" | "uploads",
  path: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapForm(row: any): Form {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    fields: row.fields ?? [],
    certificateTemplateId: row.certificate_template_id ?? undefined,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTemplate(row: any): CertificateTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    imageUrl: row.image_url,
    fields: row.fields ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSubmission(row: any): FormSubmission {
  return {
    id: row.id,
    formId: row.form_id,
    data: row.data ?? {},
    createdAt: row.created_at,
  };
}
