-- ============================================================
-- PSF RWANDA — Youth Entrepreneurship Training Programme
-- Certificate of Participation + Registration Form
--
-- INSTRUCTIONS:
-- 1. Run the migration first (if not done yet):
--    alter table certificate_templates
--      add column if not exists application_name text,
--      add column if not exists signer_name text,
--      add column if not exists signer_title text;
--
-- 2. Paste this entire file into Supabase SQL Editor and Run.
--
-- 3. Form URL:
--    /forms/cccccccc-0000-0000-0000-000000000001
--    (or find it in Admin → Forms → "Youth Entrepreneurship Training — Registration")
--
-- 4. Submissions & Certificates:
--    Admin → Forms → Submissions (next to the form above)
-- ============================================================


-- ── Step 1: Certificate Template ─────────────────────────────────────────────
-- NOTE: Replace image_url with a real certificate background image
--       uploaded via Admin → Certificate Templates → Upload Image.
--       The placeholder below gives a professional dark-blue preview.

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
  'cc000000-0000-0000-0000-000000000001',
  'PSF Rwanda — Youth Entrepreneurship Certificate',
  'Certificate of Participation in the Youth Entrepreneurship Training Programme',
  'https://placehold.co/1414x1000/0a0a2e/f5f0e8?text=Upload+Your+Certificate+Background',
  '[
    {
      "id": "cf-title",
      "label": "__app_name__",
      "x": 50,
      "y": 18,
      "fontSize": 22,
      "fontFamily": "Georgia, serif",
      "color": "#c9a84c",
      "fontWeight": "bold",
      "align": "center"
    },
    {
      "id": "cf-presents",
      "label": "__description__",
      "x": 50,
      "y": 30,
      "fontSize": 13,
      "fontFamily": "Arial, sans-serif",
      "color": "#e8e0d0",
      "fontWeight": "normal",
      "align": "center"
    },
    {
      "id": "cf-certifies",
      "label": "This is to certify that",
      "x": 50,
      "y": 42,
      "fontSize": 14,
      "fontFamily": "Georgia, serif",
      "color": "#c9a84c",
      "fontWeight": "normal",
      "align": "center"
    },
    {
      "id": "cf-name",
      "label": "__recipient_name__",
      "x": 50,
      "y": 52,
      "fontSize": 38,
      "fontFamily": "''Great Vibes'', cursive",
      "color": "#ffffff",
      "fontWeight": "normal",
      "align": "center"
    },
    {
      "id": "cf-org-label",
      "label": "Organisation",
      "x": 50,
      "y": 61,
      "fontSize": 12,
      "fontFamily": "Arial, sans-serif",
      "color": "#c9a84c",
      "fontWeight": "normal",
      "align": "center"
    },
    {
      "id": "cf-org",
      "label": "organisation",
      "x": 50,
      "y": 67,
      "fontSize": 15,
      "fontFamily": "Georgia, serif",
      "color": "#e8e0d0",
      "fontWeight": "bold",
      "align": "center"
    },
    {
      "id": "cf-programme-label",
      "label": "has successfully completed the programme",
      "x": 50,
      "y": 75,
      "fontSize": 13,
      "fontFamily": "Arial, sans-serif",
      "color": "#c9a84c",
      "fontWeight": "normal",
      "align": "center"
    },
    {
      "id": "cf-date",
      "label": "__date__",
      "x": 25,
      "y": 87,
      "fontSize": 13,
      "fontFamily": "Arial, sans-serif",
      "color": "#e8e0d0",
      "fontWeight": "normal",
      "align": "center"
    },
    {
      "id": "cf-signer-name",
      "label": "__signer_name__",
      "x": 75,
      "y": 84,
      "fontSize": 14,
      "fontFamily": "Georgia, serif",
      "color": "#ffffff",
      "fontWeight": "bold",
      "align": "center"
    },
    {
      "id": "cf-signer-title",
      "label": "__signer_title__",
      "x": 75,
      "y": 89,
      "fontSize": 11,
      "fontFamily": "Arial, sans-serif",
      "color": "#c9a84c",
      "fontWeight": "normal",
      "align": "center"
    }
  ]'::jsonb,
  'PSF Rwanda',
  'Mr. Jean-Paul Habimana',
  'Executive Director, PSF Rwanda'
)
on conflict (id) do update set
  name             = excluded.name,
  description      = excluded.description,
  image_url        = excluded.image_url,
  fields           = excluded.fields,
  application_name = excluded.application_name,
  signer_name      = excluded.signer_name,
  signer_title     = excluded.signer_title;


-- ── Step 2: Registration Form ─────────────────────────────────────────────────

insert into forms (
  id,
  title,
  description,
  fields,
  certificate_template_id,
  is_published
) values (
  'cccccccc-0000-0000-0000-000000000001',
  'Youth Entrepreneurship Training — Registration',
  'Register for the PSF Rwanda Youth Entrepreneurship Training Programme. Upon completion, you will receive a Certificate of Participation.',
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
      "placeholder": "Enter your email address",
      "required": true
    },
    {
      "id": "__sys_phone__",
      "type": "text",
      "label": "Phone Number",
      "placeholder": "e.g. +250 78X XXX XXX",
      "required": true
    },
    {
      "id": "field-dob",
      "type": "date",
      "label": "Date of Birth",
      "required": true
    },
    {
      "id": "field-gender",
      "type": "radio",
      "label": "Gender",
      "required": true,
      "options": [
        { "label": "Male",   "value": "male" },
        { "label": "Female", "value": "female" },
        { "label": "Other",  "value": "other" }
      ]
    },
    {
      "id": "field-province",
      "type": "select",
      "label": "Province",
      "required": true,
      "options": [
        { "label": "Kigali City",      "value": "kigali" },
        { "label": "Northern Province","value": "northern" },
        { "label": "Southern Province","value": "southern" },
        { "label": "Eastern Province", "value": "eastern" },
        { "label": "Western Province", "value": "western" }
      ]
    },
    {
      "id": "field-org",
      "type": "text",
      "label": "Organisation / School / Company",
      "placeholder": "Where do you currently work or study?",
      "required": false,
      "mapsToCertificate": "organisation"
    },
    {
      "id": "field-education",
      "type": "select",
      "label": "Highest Education Level",
      "required": true,
      "options": [
        { "label": "Primary",          "value": "primary" },
        { "label": "Secondary (O-Level)","value": "o_level" },
        { "label": "Secondary (A-Level)","value": "a_level" },
        { "label": "TVET / Vocational", "value": "tvet" },
        { "label": "University / Higher","value": "university" }
      ]
    },
    {
      "id": "field-business",
      "type": "radio",
      "label": "Do you currently own a business?",
      "required": true,
      "options": [
        { "label": "Yes, already running",  "value": "yes_running" },
        { "label": "Yes, in early stage",   "value": "yes_early" },
        { "label": "No, but planning to",   "value": "no_planning" },
        { "label": "No",                    "value": "no" }
      ]
    },
    {
      "id": "field-sector",
      "type": "select",
      "label": "Business / Interest Sector",
      "required": true,
      "options": [
        { "label": "Agriculture & Agribusiness",  "value": "agriculture" },
        { "label": "Technology & ICT",            "value": "technology" },
        { "label": "Manufacturing",               "value": "manufacturing" },
        { "label": "Trade & Commerce",            "value": "trade" },
        { "label": "Tourism & Hospitality",       "value": "tourism" },
        { "label": "Creative Industries",         "value": "creative" },
        { "label": "Health & Social Services",    "value": "health" },
        { "label": "Financial Services",          "value": "finance" },
        { "label": "Other",                       "value": "other" }
      ]
    },
    {
      "id": "field-motivation",
      "type": "textarea",
      "label": "Why do you want to join this programme?",
      "placeholder": "Briefly describe your motivation and what you hope to gain…",
      "required": true
    },
    {
      "id": "field-how",
      "type": "select",
      "label": "How did you hear about this programme?",
      "required": false,
      "options": [
        { "label": "Social Media",          "value": "social_media" },
        { "label": "Friend / Colleague",    "value": "referral" },
        { "label": "PSF Rwanda Website",    "value": "website" },
        { "label": "Radio / TV",            "value": "radio_tv" },
        { "label": "Community Leader",      "value": "community" },
        { "label": "Other",                 "value": "other" }
      ]
    }
  ]'::jsonb,
  'cc000000-0000-0000-0000-000000000001',
  true
)
on conflict (id) do update set
  title                   = excluded.title,
  description             = excluded.description,
  fields                  = excluded.fields,
  certificate_template_id = excluded.certificate_template_id,
  is_published            = excluded.is_published;


-- ── Done! ─────────────────────────────────────────────────────────────────────
-- Form title:  "Youth Entrepreneurship Training — Registration"
-- Template:    "PSF Rwanda — Youth Entrepreneurship Certificate"
--
-- To access:
--   Public form  → Home page → "Youth Entrepreneurship Training — Registration"
--   Submissions  → Admin → Forms → click "Submissions" on the form above
--   Certificate  → Admin → Forms → Submissions → "Generate Certificate"
--
-- NEXT STEPS:
-- 1. Go to Admin → Certificate Templates → Edit "PSF Rwanda…"
-- 2. Upload your real certificate background image
-- 3. Adjust field positions on the canvas to match your design
-- 4. Share the form link from the home page with participants
-- ──────────────────────────────────────────────────────────────────────────────

