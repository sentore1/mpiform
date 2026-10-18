export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "file"
  | "image";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[]; // for select / radio / checkbox
  accept?: string; // for file/image fields
  mapsToCertificate?: string; // which certificate placeholder this field fills
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  imageUrl: string; // path to the background image
  fields: CertificateField[]; // positioned text overlays
  createdAt: string;
  updatedAt: string;
}

export interface CertificateField {
  id: string;
  label: string; // matches FormField.mapsToCertificate
  x: number; // percentage from left
  y: number; // percentage from top
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: "normal" | "bold";
  align: "left" | "center" | "right";
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  certificateTemplateId?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, string | string[] | null>;
  createdAt: string;
}
