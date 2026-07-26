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
  speakPhrases?: SpeakPhrase[],
): ContentBlock {
  return { id, source: 'hardcoded', method: 'game_3d', payload: { gameId, skillChip, difficulty, roundGoal, items, speakPhrases } };
}

export function chatTutorBlock(id: string, payload: ChatTutorPayload): ContentBlock {
  return { id, source: 'hardcoded', method: 'chat_tutor', payload };
}

export function glyph(id: string, glyphChar: string, guideMode: TraceGlyph['guideMode'] = 'dotted'): TraceGlyph {
  return { id, glyph: glyphChar, guideMode };
}

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
