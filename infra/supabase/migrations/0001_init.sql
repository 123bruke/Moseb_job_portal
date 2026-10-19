-- Smart Resume Checker v2 — schema, triggers and Row Level Security.
-- Supabase Postgres is the source of truth. The backend connects with a
-- privileged role (bypasses RLS) and ALSO enforces ownership in code; RLS
-- protects direct client access (supabase-js) as defence in depth.

create extension if not exists pgcrypto;

create type user_role as enum ('candidate','company','admin');
create type job_status as enum ('draft','open','closed','ranked');
create type rubric_status as enum ('none','pending','ready','failed');
create type importance as enum ('must','nice');
create type application_status as enum
  ('submitted','processing','processed','failed','shortlisted','not_selected','withdrawn');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'candidate',
  full_name text not null default '',
  email text not null default '',
  nationality text,
  phone text,
  location text,
  created_at timestamptz not null default now()
);

create table candidate_profiles (
  profile_id uuid primary key references profiles(id) on delete cascade,
  headline text,
  years_experience numeric(4,1) not null default 0,
  domain text,
  education_level text,
  languages text[] not null default '{}',
  expected_salary numeric,
  skills text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table companies (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null unique references profiles(id) on delete cascade,
  name text not null,
  industry text,
  website text,
  size text,
  logo_url text,
  brand_color text default '#4f46e5',
  created_at timestamptz not null default now()
);

create table skills (
  id serial primary key,
  name text not null unique,
  aliases text[] not null default '{}',
  category text
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  title text not null,
  description text not null default '',
  domain text,
  min_experience numeric(4,1) not null default 0,
  education_required text,
  location text,
  seats int not null default 1 check (seats > 0),
  deadline timestamptz,
  status job_status not null default 'draft',
  rubric_status rubric_status not null default 'none',
  rubric_json jsonb,
  requirement_file_path text,
  requirement_text text,
  created_at timestamptz not null default now(),
  published_at timestamptz
);
create index jobs_status_deadline on jobs(status, deadline);

create table job_skills (
  job_id uuid references jobs(id) on delete cascade,
  skill_id int references skills(id) on delete cascade,
  importance importance not null,
  min_years numeric(3,1),
  primary key (job_id, skill_id)
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  candidate_id uuid not null references profiles(id) on delete cascade,
  form_answers_json jsonb not null default '{}',
  resume_path text,
  consent_deletion boolean not null default false,
  status application_status not null default 'submitted',
  error text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (job_id, candidate_id)
);
create index applications_job on applications(job_id, status);

create table parsed_resumes (
  application_id uuid primary key references applications(id) on delete cascade,
  structured_json jsonb not null,
  total_years numeric(4,1) not null default 0,
  parse_confidence numeric(3,2) not null default 0
);

create table scores (
  application_id uuid primary key references applications(id) on delete cascade,
  total numeric(5,2) not null default 0,
  breakdown_json jsonb not null default '{}',
  eligible boolean not null default true,
  ineligible_reasons text[] not null default '{}',
  rank int,
  confidence numeric(3,2)
);

create table reasoning_traces (
  id bigserial primary key,
  application_id uuid not null references applications(id) on delete cascade,
  step int not null,
  name text not null,
  content text not null,
  evidence_refs jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index traces_app on reasoning_traces(application_id, step);

create table shortlists (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  generated_at timestamptz not null default now(),
  delivered_at timestamptz,
  report_path text,
  comparison_text text
);

create table shortlist_items (
  shortlist_id uuid references shortlists(id) on delete cascade,
  application_id uuid references applications(id) on delete cascade,
  rank int not null,
  summary text,
  primary key (shortlist_id, application_id)
);

create table notifications (
  id bigserial primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table audit_log (
  id bigserial primary key,
  actor uuid,
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb,
  at timestamptz not null default now()
);

-- Create a profile on sign-up. Admin can never be self-assigned.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare r user_role;
begin
  r := case when new.raw_user_meta_data->>'role' = 'company' then 'company'::user_role
            else 'candidate'::user_role end;
  insert into profiles (id, role, full_name, email, nationality, phone, location)
  values (new.id, r,
          coalesce(new.raw_user_meta_data->>'full_name',''),
          coalesce(new.email,''),
          new.raw_user_meta_data->>'nationality',
          new.raw_user_meta_data->>'phone',
          new.raw_user_meta_data->>'location');
  if r = 'candidate' then
    insert into candidate_profiles (profile_id) values (new.id);
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ------------------------------------------------------------------ RLS
create or replace function is_admin() returns boolean language sql stable security definer
set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

create or replace function owns_job(j uuid) returns boolean language sql stable security definer
set search_path = public as $$
  select exists (select 1 from jobs jb join companies c on c.id = jb.company_id
                 where jb.id = j and c.owner_profile_id = auth.uid()) $$;

create or replace function owns_application_job(a uuid) returns boolean language sql stable security definer
set search_path = public as $$
  select exists (select 1 from applications ap where ap.id = a and owns_job(ap.job_id)) $$;

alter table profiles enable row level security;
alter table candidate_profiles enable row level security;
alter table companies enable row level security;
alter table skills enable row level security;
alter table jobs enable row level security;
alter table job_skills enable row level security;
alter table applications enable row level security;
alter table parsed_resumes enable row level security;
alter table scores enable row level security;
alter table reasoning_traces enable row level security;
alter table shortlists enable row level security;
alter table shortlist_items enable row level security;
alter table notifications enable row level security;
alter table audit_log enable row level security;

create policy profiles_self on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_self_upd on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));

create policy cand_self on candidate_profiles for all using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid());

create policy company_owner on companies for all using (owner_profile_id = auth.uid() or is_admin())
  with check (owner_profile_id = auth.uid());
create policy company_public_read on companies for select using (true);

create policy skills_read on skills for select using (true);

create policy jobs_public_open on jobs for select using (status = 'open' or owns_job(id) or is_admin());
create policy jobs_owner_write on jobs for all using (owns_job(id)) with check (
  company_id in (select id from companies where owner_profile_id = auth.uid()));

create policy job_skills_read on job_skills for select using (
  exists (select 1 from jobs j where j.id = job_id and (j.status = 'open' or owns_job(j.id))));
create policy job_skills_write on job_skills for all using (owns_job(job_id)) with check (owns_job(job_id));

create policy app_candidate on applications for select using (candidate_id = auth.uid());
create policy app_candidate_ins on applications for insert with check (candidate_id = auth.uid());
create policy app_company on applications for select using (owns_job(job_id));
create policy app_admin on applications for select using (is_admin());

create policy parsed_candidate on parsed_resumes for select using (
  exists (select 1 from applications a where a.id = application_id and a.candidate_id = auth.uid()));
create policy parsed_company on parsed_resumes for select using (owns_application_job(application_id));

create policy scores_candidate on scores for select using (
  exists (select 1 from applications a where a.id = application_id and a.candidate_id = auth.uid()));
create policy scores_company on scores for select using (owns_application_job(application_id));

create policy traces_company on reasoning_traces for select using (owns_application_job(application_id));

create policy shortlists_company on shortlists for select using (owns_job(job_id));
create policy shortlist_items_company on shortlist_items for select using (
  exists (select 1 from shortlists s where s.id = shortlist_id and owns_job(s.job_id)));

create policy notif_self on notifications for all using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy audit_admin on audit_log for select using (is_admin());

-- Storage bucket (private). Files are served only through signed URLs.
insert into storage.buckets (id, name, public) values ('resumes','resumes', false)
  on conflict (id) do nothing;
