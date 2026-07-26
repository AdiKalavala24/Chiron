/**
 * The content model shared by every hardcoded path and every Gemini
 * generation call. Nothing renders a lesson without going through these
 * shapes, which is what lets "More like this" append Gemini output next
 * to hand-authored blocks without the player caring which is which.
 */

export type Subject = 'reading' | 'writing' | 'math' | 'speaking';

export type GradeBand = 'K' | '1' | '2' | '3' | '4';

export const SUBJECTS: readonly Subject[] = ['reading', 'writing', 'math', 'speaking'];
export const GRADE_BANDS: readonly GradeBand[] = ['K', '1', '2', '3', '4'];

export type TeachingMethod =
  | 'question'
  | 'video'
  | 'game_3d'
  | 'chat_tutor'
  | 'trace'
  | 'speak_practice'
  | 'reverse_tutor'
  | 'story_mission'
  | 'regulation';

export type BlockSource = 'hardcoded' | 'gemini';

export type NodeState = 'locked' | 'current' | 'completed' | 'mastered';

export type QuestionKind = 'multiple_choice' | 'tap_answer' | 'drag_match' | 'fill_blank';

export interface QuestionChoice {
  id: string;
  label: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface QuestionItem {
  id: string;
  prompt: string;
  kind: QuestionKind;
  /** multiple_choice / tap_answer */
  choices?: QuestionChoice[];
  correctChoiceId?: string;
  /** drag_match */
  matchPairs?: MatchPair[];
  /** fill_blank */
  blankAnswer?: string;
  /** Shown immediately after the kid answers, right or wrong. */
  coachingTip: string;
}

export interface QuestionPayload {
  instructions: string;
  items: QuestionItem[];
}

export interface VideoPayload {
  title: string;
  youtubeId: string;
  durationSeconds: number;
  checkQuestions: QuestionItem[];
}

/**
 * The four `*_garden`/`*_quest`/`ink_trail`/`echo_tower` ids are the
 * original generic shells (a quiz or speech drill wrapped in a growing 3D
 * shape). The four below them are the purpose-built games — each has its
 * own interaction loop and its own adaptive easing, and each is the
 * canonical `game_3d` technique for one subject. Older hardcoded content
 * still references the generic ids, so both sets stay valid.
 */
export type GameId =
  | 'number_garden'
  | 'word_quest'
  | 'ink_trail'
  | 'echo_tower'
  | 'phonics_monster'
  | 'magic_canvas'
  | 'block_tower'
  | 'echo_alien';

export interface GamePayload {
  gameId: GameId;
  skillChip: string;
  /** 1-5, scales with node order within the path. */
  difficulty: number;
  roundGoal: string;
  /** Question pool the game loop draws from to generate rounds. */
  items: QuestionItem[];
  /** Echo Tower / Echo the Space Alien (and any other speech-driven game) draws rounds from here instead of `items`. */
  speakPhrases?: SpeakPhrase[];
  /** Magic Canvas Tracing draws its rounds from here instead of `items`. */
  traceGlyphs?: TraceGlyph[];
}

export interface ChatTutorPayload {
  persona: string;
  openingLine: string;
  objective: string;
  /** Bounded conversation — teaches a slice, then returns to the path. */
  maxTurns: number;
  sampleProbes: string[];
}

export type TraceGuideMode = 'outline' | 'dotted' | 'ghost';

export interface TraceGlyph {
  id: string;
  /** What's being traced, e.g. "A", "3", a shape name. */
  glyph: string;
  guideMode: TraceGuideMode;
  /**
   * How many pen strokes this glyph is normally written with ("A" is 3,
   * "C" is 1). Optional, and never a hard requirement — the canvas lets
   * the kid lift and redraw as many times as they like. It only nudges
   * the score, so a single scribble across a 3-stroke letter reads as
   * less deliberate than three placed strokes. Omit it and stroke count
   * is ignored entirely.
   */
  expectedStrokes?: number;
}

export interface TracePayload {
  instructions: string;
  glyphs: TraceGlyph[];
  passAccuracy: number;
}

export interface SpeakPhrase {
  id: string;
  text: string;
  phoneticHint?: string;
}

export interface SpeakPracticePayload {
  instructions: string;
  targetPhrases: SpeakPhrase[];
  passAccuracy: number;
}

export interface ReverseTutorPayload {
  petName: string;
  petPrompt: string;
  conceptToTeach: string;
  comprehensionChecks: string[];
}

export interface StoryMissionPayload {
  title: string;
  narrative: string[];
  embeddedChecks: QuestionItem[];
}

export type RegulationActivity = 'breathing' | 'movement' | 'silly_simon';

export interface RegulationPayload {
  activity: RegulationActivity;
  durationSeconds: number;
  script: string[];
}

export type ContentPayload =
  | QuestionPayload
  | VideoPayload
  | GamePayload
  | ChatTutorPayload
  | TracePayload
  | SpeakPracticePayload
  | ReverseTutorPayload
  | StoryMissionPayload
  | RegulationPayload;

interface ContentBlockBase {
  id: string;
  source: BlockSource;
}

export type ContentBlock = ContentBlockBase &
  (
    | { method: 'question'; payload: QuestionPayload }
    | { method: 'video'; payload: VideoPayload }
    | { method: 'game_3d'; payload: GamePayload }
    | { method: 'chat_tutor'; payload: ChatTutorPayload }
    | { method: 'trace'; payload: TracePayload }
    | { method: 'speak_practice'; payload: SpeakPracticePayload }
    | { method: 'reverse_tutor'; payload: ReverseTutorPayload }
    | { method: 'story_mission'; payload: StoryMissionPayload }
    | { method: 'regulation'; payload: RegulationPayload }
  );

export interface PathNode {
  id: string;
  title: string;
  skill: string;
  order: number;
  /** e.g. 0.8 — fraction of recent attempts that must be correct to complete the node. */
  requiredAccuracy: number;
  blocks: ContentBlock[];
}

export interface SubjectPath {
  grade: GradeBand;
  subject: Subject;
  nodes: PathNode[];
}

export function pathKey(grade: GradeBand, subject: Subject): string {
  return `${grade}-${subject}`;
}
