-- Create newsletter_leads table
create table if not exists public.newsletter_leads (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  source_page text not null default 'homepage',
  confirmed boolean default false,
  confirmation_token text unique,
  token_expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.newsletter_leads enable row level security;

-- Create index for faster lookups
create index if not exists newsletter_leads_email_idx on public.newsletter_leads(email);
create index if not exists newsletter_leads_token_idx on public.newsletter_leads(confirmation_token);
create index if not exists newsletter_leads_confirmed_idx on public.newsletter_leads(confirmed);

-- Create policies for public read (only confirmed emails)
drop policy if exists "Anyone can read confirmed newsletter leads" on public.newsletter_leads;
create policy "Anyone can read confirmed newsletter leads"
on public.newsletter_leads for select
using (confirmed = true);

-- Allow unauthenticated users to insert
drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_leads;
create policy "Anyone can subscribe to newsletter"
on public.newsletter_leads for insert
with check (true);

-- Allow updates for confirmation
drop policy if exists "Anyone can update with confirmation token" on public.newsletter_leads;
create policy "Anyone can update with confirmation token"
on public.newsletter_leads for update
using (true);
