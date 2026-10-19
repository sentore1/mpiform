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

// Fixed IDs for system fields — always present on every form
export const SYSTEM_FIELD_IDS = {
  name:  "__sys_name__",
  email: "__sys_email__",
  phone: "__sys_phone__",
} as const;

// The three system fields every form gets automatically
export const SYSTEM_FIELDS: FormField[] = [
  {
    id: SYSTEM_FIELD_IDS.name,
    type: "text",
    label: "Full Name",
    placeholder: "Enter your full name",
    required: true,
    mapsToCertificate: "__recipient_name__",
  },
  {
    id: SYSTEM_FIELD_IDS.email,
    type: "email",
    label: "Email Address",
    placeholder: "Enter your email",
    required: true,
  },
  {
    id: SYSTEM_FIELD_IDS.phone,
    type: "text",
    label: "Phone Number",
    placeholder: "Enter your phone number",
    required: true,
  },
];

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[]; // for select / radio / checkbox
  accept?: string; // for file/image fields
  mapsToCertificate?: string; // which certificate placeholder this field fills
  isSystem?: boolean; // true = locked, cannot be deleted or reordered
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  imageUrl: string; // path to the background image
  fields: CertificateField[]; // positioned text overlays
  // Auto-populated fields stored on the template
  applicationName?: string;  // shown via __app_name__ placeholder
  signerName?: string;       // shown via __signer_name__ placeholder
  signerTitle?: string;      // shown via __signer_title__ placeholder
  // QR code position and size (percentages / design units)
  qrX?: number;    // % from left (default 90)
  qrY?: number;    // % from top  (default 88)
  qrSize?: number; // size in design units out of 800px width (default 60)
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
  logoUrl?: string;       // optional logo shown above the form
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
