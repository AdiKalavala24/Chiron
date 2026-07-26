-- Chiron data model sketch (Postgres).
--
-- This is a schema, not a running backend — there is no server implementation
-- yet. It exists so the client's service-layer stubs (src/services/api.ts)
-- have a concrete shape to target once a backend is built. Table names and
-- columns line up with the TypeScript types in that file on purpose.
--
-- Deliberately out of scope here (these are product/infra decisions, not
-- something to lock in unilaterally): auth model (parent accounts vs.
-- per-device pairing), migration tooling (Prisma/Drizzle/raw SQL), hosting,
-- and multi-child-per-family support beyond the single foreign key below.

create extension if not exists "uuid-ossp";

create table parents (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table children (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid not null references parents(id) on delete cascade,
  name text not null,
  birth_year int, -- coarse age signal for difficulty calibration; no full DOB needed
  created_at timestamptz not null default now()
);

create table sessions (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references children(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

-- One row per answered question. Mirrors `InteractionEvent` in
-- src/adaptive/types.ts — this is the raw material the engagement engine
-- (src/adaptive/engagement-engine.ts) currently derives state from in-memory,
-- and what a persisted version would read/write instead.
create table engagement_events (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  question_label text,
  correct boolean not null,
  response_time_ms int not null,
  occurred_at timestamptz not null default now()
);

-- The human, narrative pickup-line summary a parent sees — NOT a
-- progress-bar dashboard. `narrative` is model-generated in production (see
-- the TODO in src/services/llm.ts) from a session's engagement_events.
create table parent_debriefs (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  narrative text not null,
  created_at timestamptz not null default now()
);

create index idx_engagement_events_session on engagement_events(session_id);
create index idx_sessions_child on sessions(child_id);
create index idx_parent_debriefs_session on parent_debriefs(session_id);
