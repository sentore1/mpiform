"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import type { Form, FormField, CertificateTemplate } from "@/types";
import { SYSTEM_FIELDS, SYSTEM_FIELD_IDS } from "@/types";
import { FieldEditor } from "./FieldEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

const SYSTEM_IDS = new Set(Object.values(SYSTEM_FIELD_IDS));

// ─── Locked system field card ─────────────────────────────────────────────────

function SystemFieldCard({ field }: { field: FormField }) {
  const icons: Record<string, React.ReactNode> = {
    [SYSTEM_FIELD_IDS.name]: (
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    [SYSTEM_FIELD_IDS.email]: (
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    [SYSTEM_FIELD_IDS.phone]: (
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  };
  return (
    <div className="flex items-center gap-3 border border-gray-200 rounded-lg bg-gray-50 px-4 py-3">
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
        {icons[field.id]}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{field.label}</p>
        <p className="text-xs text-gray-400">{field.placeholder}</p>
      </div>
      <span className="text-xs font-medium text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
        Required · System
      </span>
    </div>
  );
}

// ─── Sortable custom field wrapper ────────────────────────────────────────────

function SortableField({
  field,
  onChange,
  onDelete,
  certificatePlaceholders,
}: {
  field: FormField;
  onChange: (f: FormField) => void;
  onDelete: () => void;
  certificatePlaceholders: string[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandle = (
    <button
      type="button"
      className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 touch-none"
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
    >
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      </svg>
    </button>
  );

  return (
    <div ref={setNodeRef} style={style}>
      <FieldEditor
        field={field}
        onChange={onChange}
        onDelete={onDelete}
        certificatePlaceholders={certificatePlaceholders}
        dragHandle={dragHandle}
      />
    </div>
  );
}

// ─── FormBuilder ──────────────────────────────────────────────────────────────

interface FormBuilderProps {
  initialForm?: Partial<Form>;
  templates: CertificateTemplate[];
  onSave: (form: Omit<Form, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  saving?: boolean;
}

export function FormBuilder({
  initialForm,
  templates,
  onSave,
  saving = false,
}: FormBuilderProps) {
  const [title, setTitle] = useState(initialForm?.title ?? "");
  const [description, setDescription] = useState(initialForm?.description ?? "");

  // Custom fields only — strip system fields from existing saved data
  const [fields, setFields] = useState<FormField[]>(
    (initialForm?.fields ?? []).filter((f) => !SYSTEM_IDS.has(f.id as never))
  );
  const [certificateTemplateId, setCertificateTemplateId] = useState(
    initialForm?.certificateTemplateId ?? ""
  );
  const [isPublished, setIsPublished] = useState(initialForm?.isPublished ?? false);

  const selectedTemplate = templates.find((t) => t.id === certificateTemplateId);
  const certificatePlaceholders = Array.from(new Set([
    "__recipient_name__",
    "__date__",
    "__app_name__",
    "__description__",
    "__signer_name__",
    "__signer_title__",
    ...(selectedTemplate?.fields ?? []).map((f) => f.label),
  ]));

  const sensors = useSensors(useSensor(PointerSensor));

  const addField = useCallback(() => {
    setFields((prev) => [
      ...prev,
      { id: uuidv4(), type: "text", label: "", required: false, placeholder: "" },
    ]);
  }, []);

  function updateField(id: string, updated: FormField) {
    setFields((prev) => prev.map((f) => (f.id === id ? updated : f)));
  }

  function deleteField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields((prev) => {
        const oldIndex = prev.findIndex((f) => f.id === active.id);
        const newIndex = prev.findIndex((f) => f.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  async function handleSave(publish: boolean) {
    // Always prepend system fields so they're stored in the form
    await onSave({
      title,
      description,
      fields: [...SYSTEM_FIELDS, ...fields],
      certificateTemplateId: certificateTemplateId || undefined,
      isPublished: publish,
    });
  }

  const templateOptions = [
    { label: "— No certificate —", value: "" },
    ...templates.map((t) => ({ label: t.name, value: t.id })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Form meta */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Form Details</h2>
        <Input
          label="Form Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Event Registration"
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this form is for…"
        />
        <Select
          label="Certificate Template"
          options={templateOptions}
          value={certificateTemplateId}
          onChange={(e) => setCertificateTemplateId(e.target.value)}
        />
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Fields{" "}
            <span className="text-gray-400 font-normal text-sm">
              ({SYSTEM_FIELDS.length + fields.length})
            </span>
          </h2>
          <Button variant="outline" size="sm" onClick={addField}>
            + Add Field
          </Button>
        </div>

        {/* Locked system fields */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Identity fields — always included
          </p>
          {SYSTEM_FIELDS.map((sf) => (
            <SystemFieldCard key={sf.id} field={sf} />
          ))}
        </div>

        {/* Custom fields */}
        {fields.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-10 flex flex-col items-center gap-2 text-gray-400 mt-1">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-sm">Click &quot;Add Field&quot; to add more fields.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-2">
              Custom fields
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {fields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      onChange={(updated) => updateField(field.id, updated)}
                      onDelete={() => deleteField(field.id)}
                      certificatePlaceholders={certificatePlaceholders}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end pt-2 border-t border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer mr-auto">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 rounded"
          />
          <span className="text-sm text-gray-700">Publish this form</span>
        </label>
        <Button variant="secondary" onClick={() => handleSave(false)} loading={saving} disabled={!title}>
          Save Draft
        </Button>
        <Button variant="primary" onClick={() => handleSave(true)} loading={saving} disabled={!title}>
          Save &amp; Publish
        </Button>
      </div>
    </div>
  );
}
