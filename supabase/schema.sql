-- Run this in your Supabase SQL editor to set up the auto-sync schema.

-- Users: stores Google OAuth tokens server-side so the cron job can act on their behalf
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  google_id     text unique not null,
  email         text,
  access_token  text not null,
  refresh_token text,
  token_expiry  bigint,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Teams each user is following
create table if not exists user_teams (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade,
  team_id       text not null,
  team_name     text not null,
  sport         text not null,
  league_id     text not null,
  league_name   text not null,
  badge         text default '',
  match_keyword text,
  created_at    timestamptz default now(),
  unique(user_id, team_id)
);

-- Calendar events already synced — prevents duplicates on each cron run
create table if not exists synced_events (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references users(id) on delete cascade,
  team_id        text not null,
  match_id       text not null,
  google_event_id text not null,
  match_date     date,
  created_at     timestamptz default now(),
  unique(user_id, match_id)
);

create index if not exists user_teams_user_id_idx     on user_teams(user_id);
create index if not exists synced_events_user_id_idx  on synced_events(user_id);
create index if not exists synced_events_lookup_idx   on synced_events(user_id, match_id);
