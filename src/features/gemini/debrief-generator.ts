import { z } from 'zod';
import { describeEvent, highlightEvents, summarizeStats } from '@/features/parent/analytics';
import type { SessionEvent } from '@/stores/session-store';
import { getGeminiModel, isGeminiConfigured } from './client';

export const GuidanceRecommendationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  mostHelpful: z.boolean().optional(),
});

export const NarrativeDebriefSchema = z.object({
  narrative: z.string().min(1),
  guidance: z.array(GuidanceRecommendationSchema).min(1),
});

export type GuidanceRecommendation = z.infer<typeof GuidanceRecommendationSchema>;

export interface NarrativeDebrief {
  narrative: string;
  guidance: GuidanceRecommendation[];
  generatedBy: 'gemini' | 'fallback';
}

function buildPrompt(childName: string, eventLines: string[], statsLines: string[]): string {
  return `You are a warm, encouraging elementary-school learning counselor writing a short update for a parent about their child, ${childName}, based on a recent learning session in the "Chiron" app.

Session stats by subject:
${statsLines.join('\n') || '(no graded activity yet this session)'}

Notable moments, in order:
${eventLines.join('\n') || '(nothing notable logged yet)'}

Write:
1. "narrative": 2-3 short paragraphs in a warm, specific, counselor tone — celebrate real wins, name the actual skill and subject, and mention anything interesting (like a method switch) as a normal, positive part of how the child learns. Never sound clinical or scored. Speak directly to the parent about "${childName}".
2. "guidance": 2-4 short, concrete, actionable recommendations for the parent. Mark exactly one as "mostHelpful": true — the single best thing they could do this week.

Return ONLY JSON matching: { "narrative": string, "guidance": [{ "title": string, "body": string, "mostHelpful"?: boolean }] }. No markdown fences, no extra prose.`;
}

function fallbackDebrief(childName: string, events: SessionEvent[]): NarrativeDebrief {
  const stats = summarizeStats(events);
  const topSubject = stats[0];
  const highlights = highlightEvents(events, 3).map(describeEvent);

  const narrativeParts: string[] = [];
  if (topSubject && topSubject.attempts > 0) {
    const accuracyPct = Math.round(topSubject.accuracy * 100);
    narrativeParts.push(
      `${childName} spent the most time in ${topSubject.subject} this session, answering with ${accuracyPct}% accuracy and completing ${topSubject.nodesCompleted} skill${topSubject.nodesCompleted === 1 ? '' : 's'} along the way.`,
    );
  } else {
    narrativeParts.push(`${childName} explored Chiron this session — once there's more graded activity, this summary will get a lot more specific.`);
  }
  if (highlights.length > 0) {
    narrativeParts.push(`A few things worth knowing: ${highlights.join(' ')}`);
  }

  return {
    narrative: narrativeParts.join(' '),
    guidance: [
      {
        title: 'Keep sessions short and frequent',
        body: `A few focused minutes a day tends to build more lasting skill than one long session — especially in ${topSubject?.subject ?? 'their current subject'}.`,
        mostHelpful: true,
      },
      {
        title: 'Ask about today\'s topic',
        body: `Ask ${childName} to "teach you" one thing they practiced today — explaining it out loud is one of the fastest ways to lock in a new skill.`,
      },
    ],
    generatedBy: 'fallback',
  };
}

export async function generateNarrativeDebrief(childName: string, events: SessionEvent[]): Promise<NarrativeDebrief> {
  if (!isGeminiConfigured()) {
    return fallbackDebrief(childName, events);
  }

  const model = getGeminiModel();
  if (!model) {
    return fallbackDebrief(childName, events);
  }

  const statsLines = summarizeStats(events).map(
    (s) => `- ${s.subject}: ${s.attempts} questions answered, ${Math.round(s.accuracy * 100)}% accuracy, ${s.nodesCompleted} skill(s) completed, ${s.nodesMastered} mastered, ${s.methodSwitches} teaching-style switch(es).`,
  );
  const eventLines = highlightEvents(events, 10).map((e) => `- ${describeEvent(e)}`);

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: buildPrompt(childName, eventLines, statsLines) }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    });

    const parsed = JSON.parse(result.response.text());
    const validated = NarrativeDebriefSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('[gemini] narrative debrief failed schema validation', validated.error.issues);
      return fallbackDebrief(childName, events);
    }

    return { ...validated.data, generatedBy: 'gemini' };
  } catch (error) {
    console.warn('[gemini] narrative debrief request failed, using offline summary', error);
    return fallbackDebrief(childName, events);
  }
}
