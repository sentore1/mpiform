"use client";

import { useState } from "react";
import { FormField, FieldType, FieldOption } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface FieldEditorProps {
  field: FormField;
  onChange: (updated: FormField) => void;
  onDelete: () => void;
  certificatePlaceholders?: string[];
  dragHandle?: React.ReactNode;
}

const FIELD_TYPES: { label: string; value: FieldType }[] = [
  { label: "Short Text", value: "text" },
  { label: "Email", value: "email" },
  { label: "Number", value: "number" },
  { label: "Long Text", value: "textarea" },
  { label: "Dropdown", value: "select" },
  { label: "Checkboxes", value: "checkbox" },
  { label: "Radio Buttons", value: "radio" },
  { label: "Date", value: "date" },
  { label: "File Upload", value: "file" },
  { label: "Image Upload", value: "image" },
];

export function FieldEditor({
  field,
  onChange,
  onDelete,
  certificatePlaceholders = [],
  dragHandle,
}: FieldEditorProps) {
  const [expanded, setExpanded] = useState(true);

  function update(patch: Partial<FormField>) {
    onChange({ ...field, ...patch });
  }

  function addOption() {
    const options = [...(field.options ?? []), { label: "", value: "" }];
    update({ options });
  }

  function updateOption(index: number, patch: Partial<FieldOption>) {
    const options = (field.options ?? []).map((o, i) =>
      i === index ? { ...o, ...patch } : o
    );
    update({ options });
  }

  function removeOption(index: number) {
    const options = (field.options ?? []).filter((_, i) => i !== index);
    update({ options });
  }

  const hasOptions = ["select", "checkbox", "radio"].includes(field.type);

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        {dragHandle}
        <button
          type="button"
          className="flex-1 text-left flex items-center gap-2"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            {FIELD_TYPES.find((t) => t.value === field.type)?.label ?? field.type}
          </span>
          <span className="text-sm font-medium text-gray-800 truncate">
            {field.label || <span className="text-gray-400 italic">Untitled field</span>}
          </span>
          {field.required && (
            <span className="text-red-500 text-xs font-semibold">Required</span>
          )}
          <svg
            className={`ml-auto w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <Button variant="danger" size="sm" onClick={onDelete} aria-label="Delete field">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 py-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Field Type"
            options={FIELD_TYPES}
            value={field.type}
            onChange={(e) => update({ type: e.target.value as FieldType, options: [] })}
          />
          <Input
            label="Label"
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="e.g. Full Name"
            required
          />
          {!hasOptions && field.type !== "file" && field.type !== "image" && (
            <Input
              label="Placeholder"
              value={field.placeholder ?? ""}
              onChange={(e) => update({ placeholder: e.target.value })}
              placeholder="e.g. Enter your name"
            />
          )}
          {(field.type === "file" || field.type === "image") && (
            <Input
              label="Accepted file types"
              value={field.accept ?? ""}
              onChange={(e) => update({ accept: e.target.value })}
              placeholder={field.type === "image" ? "image/*" : ".pdf,.doc,.docx"}
            />
          )}

          {/* Certificate placeholder mapping */}
          {certificatePlaceholders.length > 0 && (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Maps to certificate placeholder
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={field.mapsToCertificate ?? ""}
                onChange={(e) =>
                  update({ mapsToCertificate: e.target.value || undefined })
                }
              >
                <option value="">— None —</option>
                {Array.from(new Set(certificatePlaceholders)).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Required toggle */}
          <label className="flex items-center gap-2 cursor-pointer sm:col-span-2">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => update({ required: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <span className="text-sm text-gray-700">Required field</span>
          </label>

          {/* Options for select/checkbox/radio */}
          {hasOptions && (
            <div className="sm:col-span-2 flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-700">Options</p>
              {(field.options ?? []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Label"
                    value={opt.label}
                    onChange={(e) => {
                      updateOption(idx, {
                        label: e.target.value,
                        value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      });
                    }}
                  />
                  <Input
                    placeholder="Value"
                    value={opt.value}
                    onChange={(e) => updateOption(idx, { value: e.target.value })}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(idx)}
                    aria-label="Remove option"
                  >
                    <svg className="w-4 h-4 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                    </svg>
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption} className="w-fit">
                + Add Option
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
