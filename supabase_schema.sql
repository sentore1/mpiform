-- ============================================================
-- Run this SQL in your Supabase SQL Editor to set up the schema
-- ============================================================

-- Forms table
create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  fields jsonb not null default '[]',
  certificate_template_id uuid,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Certificate templates table
create table if not exists certificate_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text not null,
  fields jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Form submissions table
create table if not exists form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Storage bucket for certificate template images and form uploads
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict do nothing;

-- RLS Policies (open for now – tighten per your auth setup)
alter table forms enable row level security;
alter table certificate_templates enable row level security;
alter table form_submissions enable row level security;

create policy "Allow all on forms" on forms for all using (true) with check (true);
create policy "Allow all on certificate_templates" on certificate_templates for all using (true) with check (true);
create policy "Allow all on form_submissions" on form_submissions for all using (true) with check (true);

-- Storage policies
create policy "Public read certificates" on storage.objects for select using (bucket_id = 'certificates');
create policy "Allow upload certificates" on storage.objects for insert with check (bucket_id = 'certificates');
create policy "Allow delete certificates" on storage.objects for delete using (bucket_id = 'certificates');

create policy "Public read uploads" on storage.objects for select using (bucket_id = 'uploads');
create policy "Allow upload uploads" on storage.objects for insert with check (bucket_id = 'uploads');

-- ============================================================
-- Set info@mp-i.org as admin
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Set app_metadata role = 'admin' for the user
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
where email = 'info@mp-i.org';

-- ============================================================
-- Migration: add application_name, signer_name, signer_title
-- to certificate_templates
-- Run this in Supabase SQL Editor
-- ============================================================
alter table certificate_templates
  add column if not exists application_name text,
  add column if not exists signer_name text,
  add column if not exists signer_title text;

-- ============================================================
-- Migration: add logo_url to forms
-- Run this in Supabase SQL Editor
-- ============================================================
alter table forms
  add column if not exists logo_url text;

-- ============================================================
-- Migration: add qr_x, qr_y, qr_size to certificate_templates
-- Run this in Supabase SQL Editor
-- ============================================================
alter table certificate_templates
  add column if not exists qr_x numeric not null default 90,
  add column if not exists qr_y numeric not null default 88,
  add column if not exists qr_size numeric not null default 60;
