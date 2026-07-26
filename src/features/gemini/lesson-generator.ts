import { GeneratedBlocksSchema } from '@/features/curriculum/schema';
import type { ContentBlock, GradeBand, PathNode, QuestionItem, Subject, TeachingMethod } from '@/features/curriculum/types';
import { getGeminiModel, isGeminiConfigured } from './client';

interface GenerateLessonBlocksOptions {
  grade: GradeBand;
  subject: Subject;
  node: PathNode;
  preferredMethod: TeachingMethod;
}

export interface GenerateLessonBlocksResult {
  blocks: ContentBlock[];
  /** True whenever this came from the offline fallback rather than a live, schema-valid Gemini response. */
  usedFallback: boolean;
  fallbackReason?: 'not_configured' | 'request_failed' | 'invalid_response';
}

const SHAPE_REFERENCE = `
QuestionItem = {
  "id": string, "prompt": string, "kind": "multiple_choice",
  "choices": [{ "id": string, "label": string }], "correctChoiceId": string, "coachingTip": string
}

Return a JSON array. Each element's shape depends on its "method":
- "question":       { "id", "source": "gemini", "method": "question", "payload": { "instructions", "items": QuestionItem[] } }
- "video":          { "id", "source": "gemini", "method": "video", "payload": { "title", "youtubeId", "durationSeconds", "checkQuestions": QuestionItem[] } }
- "game_3d":        { "id", "source": "gemini", "method": "game_3d", "payload": { "gameId": "number_garden"|"word_quest"|"ink_trail"|"echo_tower", "skillChip", "difficulty": 1-5, "roundGoal", "items": QuestionItem[] } }
- "chat_tutor":     { "id", "source": "gemini", "method": "chat_tutor", "payload": { "persona", "openingLine", "objective", "maxTurns": 2-8, "sampleProbes": string[] } }
- "trace":          { "id", "source": "gemini", "method": "trace", "payload": { "instructions", "glyphs": [{ "id", "glyph", "guideMode": "outline"|"dotted"|"ghost" }], "passAccuracy": 0-1 } }
- "speak_practice": { "id", "source": "gemini", "method": "speak_practice", "payload": { "instructions", "targetPhrases": [{ "id", "text", "phoneticHint"? }], "passAccuracy": 0-1 } }
- "reverse_tutor":  { "id", "source": "gemini", "method": "reverse_tutor", "payload": { "petName", "petPrompt", "conceptToTeach", "comprehensionChecks": string[] } }
- "story_mission":  { "id", "source": "gemini", "method": "story_mission", "payload": { "title", "narrative": string[], "embeddedChecks": QuestionItem[] } }
`.trim();

function buildPrompt({ grade, subject, node, preferredMethod }: GenerateLessonBlocksOptions): string {
  return `You are generating extra practice content for "Chiron", a K-4 learning app.

Grade: ${grade}
Subject: ${subject}
Skill: "${node.skill}" (node title: "${node.title}")
Preferred teaching method for these blocks: "${preferredMethod}"

Write 2 to 4 content blocks that give a child more practice on this exact skill, at a difficulty appropriate for grade ${grade}, primarily using the "${preferredMethod}" method. Every block must match this shape exactly:

${SHAPE_REFERENCE}

Rules:
- Every "id" must be a unique string starting with "gemini-".
- Every block's "source" must be exactly "gemini".
- Language must be warm, encouraging, and age-appropriate for grade ${grade}.
- All facts must be correct (double-check any arithmetic, phonics, or grammar rules).
- Return ONLY the JSON array — no prose, no markdown code fences.`;
}

function shuffleArray<T>(input: T[]): T[] {
  const copy = [...input];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function reshuffleItem(item: QuestionItem): QuestionItem {
  if ((item.kind !== 'multiple_choice' && item.kind !== 'tap_answer') || !item.choices || !item.correctChoiceId) {
    return item;
  }
  const correctChoice = item.choices.find((c) => c.id === item.correctChoiceId);
  return { ...item, choices: shuffleArray(item.choices), correctChoiceId: correctChoice?.id ?? item.correctChoiceId };
}

/**
 * Fail-soft path, used whenever Gemini isn't configured, the request
 * fails, or the response doesn't validate: reshuffle the node's own
 * hardcoded blocks (item order + MCQ choice order, correctness
 * preserved) as "more practice" instead of showing an error or an empty
 * state.
 */
function shuffledFallbackBlocks(node: PathNode): ContentBlock[] {
  const stamp = Date.now();
  return node.blocks.map((block) => {
    if (block.method === 'question' || block.method === 'game_3d') {
      return {
        ...block,
        id: `${block.id}-retry-${stamp}`,
        payload: { ...block.payload, items: shuffleArray(block.payload.items.map(reshuffleItem)) },
      } as ContentBlock;
    }
    if (block.method === 'video') {
      return {
        ...block,
        id: `${block.id}-retry-${stamp}`,
        payload: { ...block.payload, checkQuestions: shuffleArray(block.payload.checkQuestions.map(reshuffleItem)) },
      } as ContentBlock;
    }
    return { ...block, id: `${block.id}-retry-${stamp}` };
  });
}

export async function generateLessonBlocks(options: GenerateLessonBlocksOptions): Promise<GenerateLessonBlocksResult> {
  if (!isGeminiConfigured()) {
    return { blocks: shuffledFallbackBlocks(options.node), usedFallback: true, fallbackReason: 'not_configured' };
  }

  const model = getGeminiModel();
  if (!model) {
    return { blocks: shuffledFallbackBlocks(options.node), usedFallback: true, fallbackReason: 'not_configured' };
  }

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: buildPrompt(options) }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
    });

    const raw = result.response.text();
    const parsed = JSON.parse(raw);
    const validated = GeneratedBlocksSchema.safeParse(parsed);

    if (!validated.success) {
      console.warn('[gemini] generated lesson blocks failed schema validation', validated.error.issues);
      return { blocks: shuffledFallbackBlocks(options.node), usedFallback: true, fallbackReason: 'invalid_response' };
    }

    return { blocks: validated.data, usedFallback: false };
  } catch (error) {
    console.warn('[gemini] lesson generation request failed, falling back to shuffled hardcoded variants', error);
    return { blocks: shuffledFallbackBlocks(options.node), usedFallback: true, fallbackReason: 'request_failed' };
  }
}
