/**
 * Zod mirror of ./types.ts. This is the gate Gemini output has to pass
 * through before it ever reaches the player: `GeneratedBlocksSchema`
 * validates the JSON the model returns, and anything that fails
 * validation is discarded by the caller in favor of the hardcoded
 * fallback (see src/features/gemini/lesson-generator.ts).
 */
import { z } from 'zod';

export const SubjectSchema = z.enum(['reading', 'writing', 'math', 'speaking']);
export const GradeBandSchema = z.enum(['K', '1', '2', '3', '4']);

export const TeachingMethodSchema = z.enum([
  'question',
  'video',
  'game_3d',
  'chat_tutor',
  'trace',
  'speak_practice',
  'reverse_tutor',
  'story_mission',
  'regulation',
]);

export const BlockSourceSchema = z.enum(['hardcoded', 'gemini']);

export const QuestionChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const MatchPairSchema = z.object({
  left: z.string().min(1),
  right: z.string().min(1),
});

export const QuestionItemSchema = z
  .object({
    id: z.string().min(1),
    prompt: z.string().min(1),
    kind: z.enum(['multiple_choice', 'tap_answer', 'drag_match', 'fill_blank']),
    choices: z.array(QuestionChoiceSchema).optional(),
    correctChoiceId: z.string().optional(),
    matchPairs: z.array(MatchPairSchema).optional(),
    blankAnswer: z.string().optional(),
    coachingTip: z.string().min(1),
  })
  .superRefine((item, ctx) => {
    if ((item.kind === 'multiple_choice' || item.kind === 'tap_answer') && (!item.choices?.length || !item.correctChoiceId)) {
      ctx.addIssue({ code: 'custom', message: `${item.kind} items need choices[] and correctChoiceId` });
    }
    if (item.kind === 'drag_match' && !item.matchPairs?.length) {
      ctx.addIssue({ code: 'custom', message: 'drag_match items need matchPairs[]' });
    }
    if (item.kind === 'fill_blank' && !item.blankAnswer) {
      ctx.addIssue({ code: 'custom', message: 'fill_blank items need blankAnswer' });
    }
  });

export const QuestionPayloadSchema = z.object({
  instructions: z.string().min(1),
  items: z.array(QuestionItemSchema).min(1),
});

export const VideoPayloadSchema = z.object({
  title: z.string().min(1),
  youtubeId: z.string().min(1),
  durationSeconds: z.number().positive(),
  checkQuestions: z.array(QuestionItemSchema),
});

export const SpeakPhraseSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  phoneticHint: z.string().optional(),
});

export const GameIdSchema = z.enum([
  'number_garden',
  'word_quest',
  'ink_trail',
  'echo_tower',
  'phonics_monster',
  'magic_canvas',
  'block_tower',
  'echo_alien',
]);

export const TraceGlyphSchema = z.object({
  id: z.string().min(1),
  glyph: z.string().min(1),
  guideMode: z.enum(['outline', 'dotted', 'ghost']),
  expectedStrokes: z.number().int().min(1).max(6).optional(),
});

export const GamePayloadSchema = z.object({
  gameId: GameIdSchema,
  skillChip: z.string().min(1),
  difficulty: z.number().min(1).max(5),
  roundGoal: z.string().min(1),
  items: z.array(QuestionItemSchema).min(1),
  speakPhrases: z.array(SpeakPhraseSchema).optional(),
  traceGlyphs: z.array(TraceGlyphSchema).optional(),
});

export const ChatTutorPayloadSchema = z.object({
  persona: z.string().min(1),
  openingLine: z.string().min(1),
  objective: z.string().min(1),
  maxTurns: z.number().int().min(2).max(8),
  sampleProbes: z.array(z.string().min(1)).min(1),
});

export const TracePayloadSchema = z.object({
  instructions: z.string().min(1),
  glyphs: z.array(TraceGlyphSchema).min(1),
  passAccuracy: z.number().min(0).max(1),
});

export const SpeakPracticePayloadSchema = z.object({
  instructions: z.string().min(1),
  targetPhrases: z.array(SpeakPhraseSchema).min(1),
  passAccuracy: z.number().min(0).max(1),
});

export const ReverseTutorPayloadSchema = z.object({
  petName: z.string().min(1),
  petPrompt: z.string().min(1),
  conceptToTeach: z.string().min(1),
  comprehensionChecks: z.array(z.string().min(1)).min(1),
});

export const StoryMissionPayloadSchema = z.object({
  title: z.string().min(1),
  narrative: z.array(z.string().min(1)).min(1),
  embeddedChecks: z.array(QuestionItemSchema),
});

export const RegulationPayloadSchema = z.object({
  activity: z.enum(['breathing', 'movement', 'silly_simon']),
  durationSeconds: z.number().positive(),
  script: z.array(z.string().min(1)).min(1),
});

export const ContentBlockSchema = z.discriminatedUnion('method', [
  z.object({ id: z.string().min(1), source: BlockSourceSchema, method: z.literal('question'), payload: QuestionPayloadSchema }),
  z.object({ id: z.string().min(1), source: BlockSourceSchema, method: z.literal('video'), payload: VideoPayloadSchema }),
  z.object({ id: z.string().min(1), source: BlockSourceSchema, method: z.literal('game_3d'), payload: GamePayloadSchema }),
  z.object({ id: z.string().min(1), source: BlockSourceSchema, method: z.literal('chat_tutor'), payload: ChatTutorPayloadSchema }),
  z.object({ id: z.string().min(1), source: BlockSourceSchema, method: z.literal('trace'), payload: TracePayloadSchema }),
  z.object({ id: z.string().min(1), source: BlockSourceSchema, method: z.literal('speak_practice'), payload: SpeakPracticePayloadSchema }),
  z.object({ id: z.string().min(1), source: BlockSourceSchema, method: z.literal('reverse_tutor'), payload: ReverseTutorPayloadSchema }),
  z.object({ id: z.string().min(1), source: BlockSourceSchema, method: z.literal('story_mission'), payload: StoryMissionPayloadSchema }),
  z.object({ id: z.string().min(1), source: BlockSourceSchema, method: z.literal('regulation'), payload: RegulationPayloadSchema }),
]);

export const PathNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  skill: z.string().min(1),
  order: z.number().int().nonnegative(),
  requiredAccuracy: z.number().min(0).max(1),
  blocks: z.array(ContentBlockSchema),
});

export const SubjectPathSchema = z.object({
  grade: GradeBandSchema,
  subject: SubjectSchema,
  nodes: z.array(PathNodeSchema),
});

/** What `POST generate-practice` must return: one or more validated blocks to append to a node. */
export const GeneratedBlocksSchema = z.array(ContentBlockSchema).min(1);
