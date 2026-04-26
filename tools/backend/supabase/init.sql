create table if not exists public.megan_deploy_logs (id text primary key, payload jsonb not null default '{}'::jsonb);
