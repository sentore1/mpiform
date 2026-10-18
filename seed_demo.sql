-- ============================================================
-- DEMO SEED: Sample form + certificate template
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Insert a certificate template
-- NOTE: image_url points to a placeholder — replace with a real
--       image you've uploaded via Settings > Certificate Templates
insert into certificate_templates (
  id,
  name,
  description,
  image_url,
  fields,
  application_name,
  signer_name,
  signer_title
) values (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Participation Certificate',
  'Standard certificate of participation',
  'https://placehold.co/1414x1000/1a1a2e/ffffff?text=Certificate+Background',
  '[
    {
      "id": "cf-name",
      "label": "__recipient_name__",
      "x": 50,
      "y": 52,
      "fontSize": 36,
      "fontFamily": "Georgia, serif",
      "color": "#1a1a1a",
      "fontWeight": "bold",
      "align": "center"
    },
    {
      "id": "cf-date",
      "label": "__date__",
      "x": 50,
      "y": 65,
      "fontSize": 16,
      "fontFamily": "Arial, sans-serif",
      "color": "#555555",
      "fontWeight": "normal",
      "align": "center"
    },
    {
      "id": "cf-app",
      "label": "__app_name__",
      "x": 50,
      "y": 75,
      "fontSize": 14,
      "fontFamily": "Arial, sans-serif",
      "color": "#888888",
      "fontWeight": "normal",
      "align": "center"
    },
    {
      "id": "cf-signer",
      "label": "__signer_name__",
      "x": 50,
      "y": 85,
      "fontSize": 14,
      "fontFamily": "Arial, sans-serif",
      "color": "#1a1a1a",
      "fontWeight": "bold",
      "align": "center"
    },
    {
      "id": "cf-signer-title",
      "label": "__signer_title__",
      "x": 50,
      "y": 90,
      "fontSize": 12,
      "fontFamily": "Arial, sans-serif",
      "color": "#888888",
      "fontWeight": "normal",
      "align": "center"
    }
  ]'::jsonb,
  'MPI Institute',
  'Dr. Ahmed Al-Rashid',
  'Director of Training'
)
on conflict (id) do update set
  name            = excluded.name,
  fields          = excluded.fields,
  application_name = excluded.application_name,
  signer_name     = excluded.signer_name,
  signer_title    = excluded.signer_title;


-- Step 2: Insert the form, linked to the certificate template above
insert into forms (
  id,
  title,
  description,
  fields,
  certificate_template_id,
  is_published
) values (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'Training Programme Registration',
  'Register for the upcoming training programme and receive your certificate of participation.',
  '[
    {
      "id": "__sys_name__",
      "type": "text",
      "label": "Full Name",
      "placeholder": "Enter your full name",
      "required": true,
      "mapsToCertificate": "__recipient_name__"
    },
    {
      "id": "__sys_email__",
      "type": "email",
      "label": "Email Address",
      "placeholder": "Enter your email",
      "required": true
    },
    {
      "id": "__sys_phone__",
      "type": "text",
      "label": "Phone Number",
      "placeholder": "Enter your phone number",
      "required": true
    },
    {
      "id": "field-training",
      "type": "select",
      "label": "Training Programme",
      "required": true,
      "options": [
        { "label": "Leadership & Management",   "value": "leadership" },
        { "label": "Project Management",        "value": "project_mgmt" },
        { "label": "Digital Transformation",   "value": "digital" },
        { "label": "Communication Skills",      "value": "communication" }
      ]
    },
    {
      "id": "field-org",
      "type": "text",
      "label": "Organisation / Company",
      "placeholder": "Where do you work?",
      "required": false
    },
    {
      "id": "field-notes",
      "type": "textarea",
      "label": "Additional Notes",
      "placeholder": "Anything else you want to tell us?",
      "required": false
    }
  ]'::jsonb,
  'aaaaaaaa-0000-0000-0000-000000000001',
  true
)
on conflict (id) do update set
  title                   = excluded.title,
  description             = excluded.description,
  fields                  = excluded.fields,
  certificate_template_id = excluded.certificate_template_id,
  is_published            = excluded.is_published;

-- ============================================================
-- Done! 
-- Form URL:        /forms/bbbbbbbb-0000-0000-0000-000000000001
-- Submissions:     /admin/forms/bbbbbbbb-0000-0000-0000-000000000001/submissions
-- ============================================================
