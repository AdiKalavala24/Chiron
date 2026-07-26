import { z } from 'zod';
import { getGeminiModel, isGeminiConfigured } from './client';

const AssessmentSchema = z.object({ reply: z.string().min(1), understood: z.boolean() });

export interface ReverseTutorAssessment {
  reply: string;
  understood: boolean;
}

/**
 * Fails soft toward "understood: true" — if we can't grade the
 * explanation (no key configured, request failure, bad JSON), the kid
 * shouldn't be blocked by an infrastructure gap. This is Feynman-style
 * practice, not a test.
 */
function fallbackAssessment(petName: string): ReverseTutorAssessment {
  return { reply: `${petName} nods along happily. "Thanks for teaching me — I think I get it a little better now!"`, understood: true };
}

export async function assessReverseTutorExplanation(
  petName: string,
  petPrompt: string,
  conceptToTeach: string,
  comprehensionChecks: string[],
  explanation: string,
): Promise<ReverseTutorAssessment> {
  if (!isGeminiConfigured()) return fallbackAssessment(petName);
  const model = getGeminiModel();
  if (!model) return fallbackAssessment(petName);

  const prompt = `You are ${petName}, a friendly, slightly clueless pet character in a kids' learning app. A child just tried to teach you about: "${conceptToTeach}".

${petName}'s starting confusion: "${petPrompt}"
What the child explained to you: "${explanation}"

Comprehension checks to informally judge against (does the explanation touch on these ideas, even loosely? be generous — this is a young child explaining out loud):
${comprehensionChecks.map((c) => `- ${c}`).join('\n')}

Reply in character as ${petName}: 1-2 warm, curious, encouraging sentences reacting to what the child taught you. Never mention "checks," grading, or scoring.

Return ONLY JSON: { "reply": string, "understood": boolean }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    });
    const parsed = JSON.parse(result.response.text());
    const validated = AssessmentSchema.safeParse(parsed);
    if (!validated.success) return fallbackAssessment(petName);
    return validated.data;
  } catch (error) {
    console.warn('[gemini] reverse-tutor assessment failed, defaulting to an encouraging pass', error);
    return fallbackAssessment(petName);
  }
}
