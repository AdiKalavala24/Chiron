import { getAdaptiveAdjustment } from '@/adaptive/adaptive-theme';
import type { EngagementState, InteractionEvent } from '@/adaptive/types';

/**
 * Client-facing contract for the tutor's language model turns. The prototype
 * screens (`@/app/lesson`) only depend on this interface, so swapping the
 * mock below for a real Gemini-backed implementation is a one-line change at
 * the call site.
 *
 * IMPORTANT architecture note: this should NOT call the Gemini API directly
 * from the React Native client with an embedded key. For a kids' product in
 * particular you want a backend in between to (a) keep the API key off the
 * device, (b) run moderation/safety checks on both the prompt and the
 * response before a child sees it, and (c) rate-limit/log usage. That
 * backend doesn't exist yet — this file is the seam where it plugs in.
 */
export type TutorTurnRequest = {
  childName: string;
  engagementState: EngagementState;
  recentHistory: InteractionEvent[];
  lastQuestionLabel?: string;
};

export type TutorTurnResponse = {
  message: string;
  nextDifficulty: 'easier' | 'same' | 'harder';
};

export interface TutorLLMClient {
  generateTurn(request: TutorTurnRequest): Promise<TutorTurnResponse>;
}

/**
 * Mock implementation used until a backend Gemini proxy exists. It still
 * produces state-appropriate copy (via the same adaptive-theme adjustments
 * the UI uses) so the demo behaves correctly end-to-end, it's just not
 * calling out to a real model.
 *
 * TODO(backend): replace with a client that POSTs to e.g.
 * `${API_BASE_URL}/tutor/turn` — a server route that calls Gemini
 * (`@google/generative-ai`) with the session transcript and returns
 * a moderated response.
 */
export function createMockTutorLLMClient(): TutorLLMClient {
  return {
    async generateTurn(request) {
      const adjustment = getAdaptiveAdjustment(request.engagementState);
      await new Promise((resolve) => setTimeout(resolve, 350)); // simulate network latency
      const nextDifficulty =
        request.engagementState === 'celebrating' ? 'harder' : request.engagementState === 'frustrated' ? 'easier' : 'same';
      return { message: adjustment.tutorMessage, nextDifficulty };
    },
  };
}
