/**
 * Tiny authoring DSL for hardcoded curriculum content. Node and item ids
 * are always explicit, stable strings (never generated/counter-based) —
 * session progress and parent analytics persist against them, so they
 * have to survive app restarts and reorders untouched.
 */
import type {
  ChatTutorPayload,
  ContentBlock,
  GameId,
  GradeBand,
  PathNode,
  QuestionItem,
  RegulationActivity,
  SpeakPhrase,
  Subject,
  SubjectPath,
  TraceGlyph,
} from '@/features/curriculum/types';

export function mcq(id: string, prompt: string, choices: string[], correctIndex: number, coachingTip: string): QuestionItem {
  return {
    id,
    prompt,
    kind: 'multiple_choice',
    choices: choices.map((label, i) => ({ id: `${id}-c${i}`, label })),
    correctChoiceId: `${id}-c${correctIndex}`,
    coachingTip,
  };
}

export function fillBlank(id: string, prompt: string, blankAnswer: string, coachingTip: string): QuestionItem {
  return { id, prompt, kind: 'fill_blank', blankAnswer, coachingTip };
}

export function dragMatch(id: string, prompt: string, pairs: [string, string][], coachingTip: string): QuestionItem {
  return { id, prompt, kind: 'drag_match', matchPairs: pairs.map(([left, right]) => ({ left, right })), coachingTip };
}

export function questionBlock(id: string, instructions: string, items: QuestionItem[]): ContentBlock {
  return { id, source: 'hardcoded', method: 'question', payload: { instructions, items } };
}

export function videoBlock(
  id: string,
  title: string,
  youtubeId: string,
  durationSeconds: number,
  checkQuestions: QuestionItem[] = [],
): ContentBlock {
  return { id, source: 'hardcoded', method: 'video', payload: { title, youtubeId, durationSeconds, checkQuestions } };
}

export function gameBlock(
  id: string,
  gameId: GameId,
  skillChip: string,
  difficulty: number,
  roundGoal: string,
  items: QuestionItem[],
  /** Speech-driven games (Echo Tower, Echo the Space Alien) draw rounds from here; Magic Canvas draws from `traceGlyphs`. */
  pools: { speakPhrases?: SpeakPhrase[]; traceGlyphs?: TraceGlyph[] } = {},
): ContentBlock {
  return {
    id,
    source: 'hardcoded',
    method: 'game_3d',
    payload: { gameId, skillChip, difficulty, roundGoal, items, ...pools },
  };
}

export function chatTutorBlock(id: string, payload: ChatTutorPayload): ContentBlock {
  return { id, source: 'hardcoded', method: 'chat_tutor', payload };
}

export function glyph(
  id: string,
  glyphChar: string,
  guideMode: TraceGlyph['guideMode'] = 'dotted',
  expectedStrokes?: number,
): TraceGlyph {
  return { id, glyph: glyphChar, guideMode, expectedStrokes: expectedStrokes ?? STROKE_COUNTS[glyphChar] };
}

/**
 * Conventional handwriting stroke counts for the glyphs this curriculum
 * actually authors, so `glyph()` fills `expectedStrokes` in without every
 * call site restating it. Anything missing here simply gets `undefined`,
 * which the canvas treats as "don't score stroke count at all".
 */
const STROKE_COUNTS: Record<string, number> = {
  A: 3, B: 2, C: 1, D: 2, E: 4, F: 3, G: 2, H: 3, I: 3, J: 2, K: 3, L: 2, M: 4,
  N: 3, O: 1, P: 2, Q: 2, R: 3, S: 1, T: 2, U: 1, V: 2, W: 4, X: 2, Y: 3, Z: 3,
  a: 2, b: 2, c: 1, d: 2, e: 2, f: 2, g: 2, h: 2, i: 2, j: 3, k: 3, l: 1, m: 3,
  n: 2, o: 1, p: 2, q: 2, r: 2, s: 1, t: 2, u: 2, v: 2, w: 4, x: 2, y: 2, z: 3,
  '0': 1, '1': 2, '2': 1, '3': 1, '4': 2, '5': 2, '6': 1, '7': 2, '8': 1, '9': 2,
};

export function traceBlock(id: string, instructions: string, glyphs: TraceGlyph[], passAccuracy = 0.7): ContentBlock {
  return { id, source: 'hardcoded', method: 'trace', payload: { instructions, glyphs, passAccuracy } };
}

export function phrase(id: string, text: string, phoneticHint?: string): SpeakPhrase {
  return { id, text, phoneticHint };
}

export function speakBlock(id: string, instructions: string, targetPhrases: SpeakPhrase[], passAccuracy = 0.7): ContentBlock {
  return { id, source: 'hardcoded', method: 'speak_practice', payload: { instructions, targetPhrases, passAccuracy } };
}

export function reverseTutorBlock(
  id: string,
  petName: string,
  petPrompt: string,
  conceptToTeach: string,
  comprehensionChecks: string[],
): ContentBlock {
  return { id, source: 'hardcoded', method: 'reverse_tutor', payload: { petName, petPrompt, conceptToTeach, comprehensionChecks } };
}

export function storyMissionBlock(id: string, title: string, narrative: string[], embeddedChecks: QuestionItem[] = []): ContentBlock {
  return { id, source: 'hardcoded', method: 'story_mission', payload: { title, narrative, embeddedChecks } };
}

export function regulationBlock(id: string, activity: RegulationActivity, durationSeconds: number, script: string[]): ContentBlock {
  return { id, source: 'hardcoded', method: 'regulation', payload: { activity, durationSeconds, script } };
}

export function node(
  id: string,
  order: number,
  title: string,
  skill: string,
  requiredAccuracy: number,
  blocks: ContentBlock[],
): PathNode {
  return { id, order, title, skill, requiredAccuracy, blocks };
}

export function subjectPath(grade: GradeBand, subject: Subject, nodes: PathNode[]): SubjectPath {
  return { grade, subject, nodes };
}
