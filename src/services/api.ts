import type { InteractionEvent } from '@/adaptive/types';

/**
 * Client-facing contract for the Postgres-backed backend (schema sketched in
 * `server/schema.sql`). No server exists yet, so this is an in-memory mock —
 * every function here maps to a real REST/GraphQL call once one does. The
 * shapes below match the schema tables directly so the eventual wiring is
 * mechanical.
 */
export type Child = { id: string; name: string };

export type SessionRecord = {
  id: string;
  childId: string;
  startedAt: string;
  endedAt?: string;
  events: InteractionEvent[];
};

export type ParentDebriefRecord = {
  id: string;
  sessionId: string;
  narrative: string;
  createdAt: string;
};

export interface ChironApiClient {
  listChildren(): Promise<Child[]>;
  startSession(childId: string): Promise<SessionRecord>;
  appendEvent(sessionId: string, event: InteractionEvent): Promise<void>;
  endSession(sessionId: string): Promise<void>;
  saveDebrief(sessionId: string, narrative: string): Promise<ParentDebriefRecord>;
  listDebriefs(childId: string): Promise<ParentDebriefRecord[]>;
}

/**
 * In-memory mock so the prototype screens have something real to call
 * during development. Swap for an HTTP client pointed at
 * `process.env.EXPO_PUBLIC_API_BASE_URL` once the backend exists —
 * TODO(backend): implement `server/` (Node/Express, Fastify, or similar) over
 * the Postgres schema in `server/schema.sql`, and deploy it somewhere the
 * app can reach.
 */
export function createMockApiClient(): ChironApiClient {
  const children: Child[] = [{ id: 'child-1', name: 'Explorer' }];
  const sessions = new Map<string, SessionRecord>();
  const debriefs: ParentDebriefRecord[] = [];

  return {
    async listChildren() {
      return children;
    },
    async startSession(childId) {
      const session: SessionRecord = {
        id: `session-${Date.now()}`,
        childId,
        startedAt: new Date().toISOString(),
        events: [],
      };
      sessions.set(session.id, session);
      return session;
    },
    async appendEvent(sessionId, event) {
      sessions.get(sessionId)?.events.push(event);
    },
    async endSession(sessionId) {
      const session = sessions.get(sessionId);
      if (session) session.endedAt = new Date().toISOString();
    },
    async saveDebrief(sessionId, narrative) {
      const record: ParentDebriefRecord = {
        id: `debrief-${Date.now()}`,
        sessionId,
        narrative,
        createdAt: new Date().toISOString(),
      };
      debriefs.push(record);
      return record;
    },
    async listDebriefs(childId) {
      const childSessionIds = new Set(
        [...sessions.values()].filter((s) => s.childId === childId).map((s) => s.id),
      );
      return debriefs.filter((d) => childSessionIds.has(d.sessionId));
    },
  };
}
