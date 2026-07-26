import { getGeminiModel, isGeminiConfigured } from './client';

export interface ChatTurn {
  role: 'tutor' | 'kid';
  text: string;
}

function fallbackLine(sampleProbes: string[], turnNumber: number, isLastTurn: boolean): string {
  if (isLastTurn) return "Great talking with you about this — nice work! Let's head back to your practice.";
  if (sampleProbes.length === 0) return 'Tell me more about that!';
  return sampleProbes[turnNumber % sampleProbes.length];
}

/**
 * One turn of the bounded voice-tutor conversation. Fails soft to a
 * scripted probe from the node's own `sampleProbes` any time Gemini is
 * unconfigured or the request fails — the conversation should never
 * stall waiting on a network call the kid can't see the reason for.
 */
export async function generateNextTutorLine(
  persona: string,
  objective: string,
  history: ChatTurn[],
  sampleProbes: string[],
  turnNumber: number,
  maxTurns: number,
): Promise<string> {
  const isLastTurn = turnNumber >= maxTurns - 1;

  if (!isGeminiConfigured()) return fallbackLine(sampleProbes, turnNumber, isLastTurn);
  const model = getGeminiModel();
  if (!model) return fallbackLine(sampleProbes, turnNumber, isLastTurn);

  const transcript = history.map((turn) => `${turn.role === 'tutor' ? persona : 'Kid'}: ${turn.text}`).join('\n');
  const instruction = isLastTurn
    ? 'This is the FINAL turn — write one short, warm closing line that wraps up the conversation and celebrates what the child shared. Do not ask a new question.'
    : 'Write your next single line as the tutor: either a brief, encouraging reaction to what the child just said, or one simple follow-up question that keeps teaching toward the objective. Keep it to 1-2 short sentences, age-appropriate, and easy to say out loud.';

  const prompt = `You are "${persona}", a friendly, patient voice tutor for a young child in the Chiron learning app. Your teaching objective for this short conversation: ${objective}.

Conversation so far:
${transcript || '(conversation just started)'}

${instruction}

Return ONLY the line of dialogue — no quotes, no speaker labels, no markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text || fallbackLine(sampleProbes, turnNumber, isLastTurn);
  } catch (error) {
    console.warn('[gemini] chat tutor turn generation failed, using a scripted probe instead', error);
    return fallbackLine(sampleProbes, turnNumber, isLastTurn);
  }
}
