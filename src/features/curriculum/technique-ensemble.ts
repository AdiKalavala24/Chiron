/**
 * Guarantees that every node, in every subject, K-4, can be taught five
 * different ways.
 *
 * Hand-authored paths only carry one or two methods per node (see
 * content/paths/*), which left the adaptive controller with nowhere to
 * send a struggling kid and made every visit to a lesson look identical.
 * This module closes that gap *deterministically* — it derives the
 * missing techniques from the node's own content, so a derived block
 * always drills the same skill the node is about.
 *
 * Rules it holds to:
 *  - Authored content always wins. A derived block is only ever a
 *    stand-in for a technique the node doesn't already have.
 *  - Derivation is pure and stable: same node in, same blocks out, with
 *    the same ids every time. Nothing here reads the clock or randomizes
 *    (the *choice* of which technique to open with is randomized by the
 *    caller — see `pickStartingTechnique`).
 *  - `video` is never derived. A video block needs a real YouTube id, and
 *    inventing one would produce a lesson that simply doesn't play.
 */
import { shuffle } from '@/lib/random';
import { wordForLetter, LETTERS } from './letter-words';
import type {
  ContentBlock,
  GameId,
  PathNode,
  QuestionItem,
  SpeakPhrase,
  Subject,
  TeachingMethod,
  TraceGlyph,
} from './types';

/**
 * The five techniques each subject rotates through. Ordering is
 * intentional — the first entry is the subject's "home" modality (the one
 * the skill is actually assessed in), and the rest fan out across
 * playing, listening, talking, and teaching-back so consecutive
 * techniques never feel like the same activity twice.
 */
export const SUBJECT_TECHNIQUES: Record<Subject, readonly TeachingMethod[]> = {
  reading: ['question', 'game_3d', 'story_mission', 'reverse_tutor', 'chat_tutor'],
  writing: ['trace', 'game_3d', 'question', 'story_mission', 'chat_tutor'],
  math: ['question', 'game_3d', 'chat_tutor', 'reverse_tutor', 'story_mission'],
  speaking: ['speak_practice', 'game_3d', 'chat_tutor', 'reverse_tutor', 'question'],
};

/** Each subject's flagship game — the one `game_3d` resolves to. */
export const SUBJECT_GAME: Record<Subject, GameId> = {
  reading: 'phonics_monster',
  writing: 'magic_canvas',
  math: 'block_tower',
  speaking: 'echo_alien',
};

export const TECHNIQUE_LABEL: Record<TeachingMethod, string> = {
  question: 'Questions',
  video: 'Video',
  game_3d: 'Game',
  chat_tutor: 'Voice Tutor',
  trace: 'Trace',
  speak_practice: 'Speaking',
  reverse_tutor: 'Teach the Pet',
  story_mission: 'Story',
  regulation: 'Reset',
};

const GAME_NAME: Record<GameId, string> = {
  phonics_monster: 'Phonics Monster Feast',
  magic_canvas: 'Magic Canvas Tracing',
  block_tower: 'Block Tower Builder',
  echo_alien: 'Echo the Space Alien',
  number_garden: 'Number Garden',
  word_quest: 'Word Quest',
  ink_trail: 'Ink Trail',
  echo_tower: 'Echo Tower',
};

const SUBJECT_PERSONA: Record<Subject, { tutor: string; pet: string }> = {
  reading: { tutor: 'Page the Book Owl', pet: 'Pip the Page Pup' },
  writing: { tutor: 'Inky the Pen Fox', pet: 'Smudge the Ink Cat' },
  math: { tutor: 'Counting Cat', pet: 'Digit the Number Duck' },
  speaking: { tutor: 'Echo the Space Alien', pet: 'Mumble the Moon Mouse' },
};

/** "letter-formation-uppercase" -> "letter formation uppercase" */
function skillPhrase(node: PathNode): string {
  return node.skill.replace(/-/g, ' ');
}

/* ------------------------------------------------------------------ *
 * Content pools — everything derivable is pulled out of the node once
 * ------------------------------------------------------------------ */

interface NodePools {
  items: QuestionItem[];
  glyphs: TraceGlyph[];
  phrases: SpeakPhrase[];
}

function collectPools(node: PathNode): NodePools {
  const items: QuestionItem[] = [];
  const glyphs: TraceGlyph[] = [];
  const phrases: SpeakPhrase[] = [];

  for (const block of node.blocks) {
    switch (block.method) {
      case 'question':
        items.push(...block.payload.items);
        break;
      case 'video':
        items.push(...block.payload.checkQuestions);
        break;
      case 'story_mission':
        items.push(...block.payload.embeddedChecks);
        break;
      case 'game_3d':
        items.push(...block.payload.items);
        if (block.payload.speakPhrases) phrases.push(...block.payload.speakPhrases);
        if (block.payload.traceGlyphs) glyphs.push(...block.payload.traceGlyphs);
        break;
      case 'trace':
        glyphs.push(...block.payload.glyphs);
        break;
      case 'speak_practice':
        phrases.push(...block.payload.targetPhrases);
        break;
      default:
        break;
    }
  }

  return { items, glyphs, phrases };
}

/** The correct answer of an item as plain text, when it has one. */
function correctAnswerText(item: QuestionItem): string | undefined {
  if (item.kind === 'fill_blank') return item.blankAnswer;
  return item.choices?.find((c) => c.id === item.correctChoiceId)?.label;
}

/* ------------------------------------------------------------------ *
 * Derivations
 * ------------------------------------------------------------------ */

/**
 * Letters to trace, in priority order: what the node already traces, then
 * the letters of a short answer word the node teaches (so tracing "cat"
 * follows a lesson whose answer was "cat"), then the initials of the node
 * title as a last resort.
 */
function deriveGlyphs(node: PathNode, pools: NodePools): TraceGlyph[] {
  if (pools.glyphs.length > 0) return pools.glyphs;

  const answerWord = pools.items
    .map(correctAnswerText)
    .find((text): text is string => !!text && /^[a-zA-Z]{2,6}$/.test(text.trim()));

  const letters = answerWord
    ? answerWord.trim().split('')
    : node.title
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z]/g, '').charAt(0))
        .filter(Boolean)
        .slice(0, 4);

  // Deduped, because a title like "Multi-Digit Multiplication" otherwise
  // yields the same letter twice and the kid traces "M" then "M".
  const deduped = Array.from(new Set(letters.filter(Boolean)));
  const chosen = deduped.length > 0 ? deduped : ['A', 'B', 'C'];
  return chosen.slice(0, 5).map((letter, i) => ({
    id: `${node.id}-derived-glyph-${i}`,
    glyph: letter,
    guideMode: 'dotted' as const,
  }));
}

/**
 * The most substantial word in a phrase — used when a question has to be
 * asked *about* a phrase. Naively taking the first word turns a phonics
 * target like "/A/ as in apple" into the tautology "which letter does 'A'
 * start with?"; the longest word gives "apple", which is a real question.
 */
function contentWord(text: string): string {
  const words = text
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  if (words.length === 0) return text.replace(/[^a-zA-Z]/g, '') || text;
  return words.reduce((longest, w) => (w.length > longest.length ? w : longest));
}

/**
 * Phrases to read aloud: what the node already speaks, then its answer
 * words (short target words are exactly right for K-4 speaking practice),
 * then a sentence about the skill itself.
 */
function derivePhrases(node: PathNode, pools: NodePools): SpeakPhrase[] {
  if (pools.phrases.length > 0) return pools.phrases;

  const answers = pools.items
    .map(correctAnswerText)
    .filter((text): text is string => !!text && /^[a-zA-Z][a-zA-Z '-]{1,23}$/.test(text.trim()))
    .map((text) => text.trim());

  const unique = Array.from(new Set(answers)).slice(0, 5);
  if (unique.length > 0) {
    return unique.map((text, i) => ({ id: `${node.id}-derived-phrase-${i}`, text }));
  }

  return [
    { id: `${node.id}-derived-phrase-0`, text: `I am practicing ${skillPhrase(node)}.` },
    { id: `${node.id}-derived-phrase-1`, text: node.title },
  ];
}

/**
 * Questions: the node's own items when it has them, otherwise real
 * phonics items built from whatever the node *does* have — "which word
 * starts with B?" from its trace letters, or "which letter does 'cat'
 * start with?" from its speaking phrases.
 */
function deriveItems(node: PathNode, pools: NodePools): QuestionItem[] {
  if (pools.items.length > 0) return pools.items;

  if (pools.glyphs.length > 0) {
    return pools.glyphs.slice(0, 5).map((glyph, i) => {
      const letter = glyph.glyph.trim().charAt(0).toUpperCase();
      const answer = wordForLetter(letter);
      const distractors = LETTERS.filter((l) => l !== letter)
        .slice(0, 12)
        .map(wordForLetter)
        .filter((w) => w !== answer)
        .slice(0, 2);
      return buildChoiceItem(
        `${node.id}-derived-item-${i}`,
        `Which word starts with the letter ${glyph.glyph}?`,
        answer,
        distractors,
        `${glyph.glyph} is for ${answer} — listen for that first sound.`,
      );
    });
  }

  if (pools.phrases.length > 0) {
    return pools.phrases.slice(0, 5).map((phrase, i) => {
      const word = contentWord(phrase.text);
      const letter = word.charAt(0).toUpperCase();
      const distractors = LETTERS.filter((l) => l !== letter).slice(0, 2);
      return buildChoiceItem(
        `${node.id}-derived-item-${i}`,
        `Which letter does "${word}" start with?`,
        letter,
        distractors,
        `Say "${word}" slowly — the very first sound is ${letter}.`,
      );
    });
  }

  return [
    buildChoiceItem(
      `${node.id}-derived-item-0`,
      `What are we practicing in "${node.title}"?`,
      skillPhrase(node),
      ['Something else entirely', 'Nothing at all'],
      `This whole skill is about ${skillPhrase(node)}.`,
    ),
  ];
}

/**
 * Builds a multiple-choice item with the answer shuffled into a stable
 * position. The shuffle is seeded off the id rather than `Math.random`
 * so the same node always produces the same quiz — derived content that
 * reshuffled on every render would fight QuestionCard's own shuffling.
 */
function buildChoiceItem(id: string, prompt: string, answer: string, distractors: string[], coachingTip: string): QuestionItem {
  const labels = [answer, ...distractors];
  const offset = stableIndex(id, labels.length);
  const rotated = [...labels.slice(offset), ...labels.slice(0, offset)];
  const answerIndex = rotated.indexOf(answer);

  return {
    id,
    prompt,
    kind: 'multiple_choice',
    choices: rotated.map((label, i) => ({ id: `${id}-c${i}`, label })),
    correctChoiceId: `${id}-c${answerIndex}`,
    coachingTip,
  };
}

function stableIndex(seed: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(hash) % Math.max(modulo, 1);
}

function deriveBlock(method: TeachingMethod, node: PathNode, subject: Subject, pools: NodePools): ContentBlock | undefined {
  const id = `${node.id}-derived-${method}`;
  const skill = skillPhrase(node);
  const persona = SUBJECT_PERSONA[subject];

  switch (method) {
    case 'question':
      return {
        id,
        source: 'hardcoded',
        method: 'question',
        payload: { instructions: `Let's check what you know about ${skill}.`, items: deriveItems(node, pools) },
      };

    case 'game_3d': {
      const gameId = SUBJECT_GAME[subject];
      return {
        id,
        source: 'hardcoded',
        method: 'game_3d',
        payload: {
          gameId,
          skillChip: node.title,
          // Difficulty tracks position in the path — later nodes play harder.
          difficulty: Math.min(5, Math.max(1, node.order + 1)),
          roundGoal: gameGoal(gameId, skill),
          items: deriveItems(node, pools),
          speakPhrases: derivePhrases(node, pools),
          traceGlyphs: deriveGlyphs(node, pools),
        },
      };
    }

    case 'trace':
      return {
        id,
        source: 'hardcoded',
        method: 'trace',
        payload: {
          instructions: 'Trace each one — lift your finger between strokes and take your time.',
          glyphs: deriveGlyphs(node, pools),
          passAccuracy: 0.62,
        },
      };

    case 'speak_practice':
      return {
        id,
        source: 'hardcoded',
        method: 'speak_practice',
        payload: {
          instructions: 'Say each one out loud, nice and clear.',
          targetPhrases: derivePhrases(node, pools),
          passAccuracy: 0.6,
        },
      };

    case 'chat_tutor':
      return {
        id,
        source: 'hardcoded',
        method: 'chat_tutor',
        payload: {
          persona: persona.tutor,
          openingLine: `Hi! I'm ${persona.tutor}. Let's talk about ${skill} — what do you already know about it?`,
          objective: `Talk through ${skill} conversationally and check the kid can explain it in their own words.`,
          maxTurns: 4,
          // Real probes: the node's own question prompts, asked out loud.
          sampleProbes: probesFrom(node, pools, skill),
        },
      };

    case 'reverse_tutor':
      return {
        id,
        source: 'hardcoded',
        method: 'reverse_tutor',
        payload: {
          petName: persona.pet,
          petPrompt: `I never learned ${skill}. Can you teach me how it works?`,
          conceptToTeach: skill,
          comprehensionChecks: probesFrom(node, pools, skill),
        },
      };

    case 'story_mission':
      return {
        id,
        source: 'hardcoded',
        method: 'story_mission',
        payload: {
          title: `The ${node.title} Mission`,
          narrative: [
            `Your ship lands on a planet where everyone has forgotten ${skill}.`,
            `The town keeper says, "Only someone who really understands ${skill} can help us."`,
            `Work through the checks below and you'll teach the whole town.`,
          ],
          embeddedChecks: deriveItems(node, pools).slice(0, 3),
        },
      };

    // Deliberately underivable: `video` needs a real YouTube id, and
    // `regulation` is presented as its own full screen, never as a node block.
    case 'video':
    case 'regulation':
    default:
      return undefined;
  }
}

function gameGoal(gameId: GameId, skill: string): string {
  switch (gameId) {
    case 'phonics_monster':
      return `Feed the monster the right answer to practice ${skill}.`;
    case 'magic_canvas':
      return `Trace each letter to turn it into something magic.`;
    case 'block_tower':
      return `Build the tower to the star to show ${skill}.`;
    case 'echo_alien':
      return `Say each one clearly to power up Echo's rocket.`;
    default:
      return `Play through ${skill}. (${GAME_NAME[gameId]})`;
  }
}

/** Up to three probe questions taken from the node's real item prompts. */
function probesFrom(node: PathNode, pools: NodePools, skill: string): string[] {
  const prompts = pools.items.map((item) => item.prompt).filter(Boolean).slice(0, 3);
  return prompts.length > 0 ? prompts : [`Can you explain ${skill} in your own words?`, `Can you show me an example?`];
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

export interface TechniqueOption {
  method: TeachingMethod;
  block: ContentBlock;
  /** False when the block was derived here rather than hand-authored in content/paths. */
  authored: boolean;
}

/**
 * The five techniques this node can be taught with, in the subject's
 * canonical order. Authored blocks are used as-is; the rest are derived
 * from the node's own content.
 *
 * Any *extra* authored methods the node has beyond the canonical five
 * (a hand-written `video`, say) are appended, so adding richer content to
 * a path always widens what the kid and the adaptive controller can reach
 * rather than being shadowed by a derived stand-in.
 */
export function buildTechniqueEnsemble(subject: Subject, node: PathNode): TechniqueOption[] {
  const pools = collectPools(node);
  const options: TechniqueOption[] = [];
  const covered = new Set<TeachingMethod>();

  for (const method of SUBJECT_TECHNIQUES[subject]) {
    const authored = node.blocks.find((b) => b.method === method);
    if (authored) {
      options.push({ method, block: authored, authored: true });
      covered.add(method);
      continue;
    }
    const derived = deriveBlock(method, node, subject, pools);
    if (derived) {
      options.push({ method, block: derived, authored: false });
      covered.add(method);
    }
  }

  for (const block of node.blocks) {
    if (covered.has(block.method) || block.method === 'regulation') continue;
    options.push({ method: block.method, block, authored: true });
    covered.add(block.method);
  }

  return options;
}

/**
 * Which technique a lesson opens with — random on every entry, so the
 * same node genuinely feels different each visit instead of always
 * leading with whichever block happened to be authored first.
 */
export function pickStartingTechnique(options: readonly TechniqueOption[]): TeachingMethod | undefined {
  if (options.length === 0) return undefined;
  return shuffle(options)[0].method;
}
