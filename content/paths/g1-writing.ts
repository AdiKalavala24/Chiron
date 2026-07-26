import { chatTutorBlock, glyph, mcq, node, questionBlock, subjectPath, traceBlock } from './helpers';

/**
 * Flagship path — exercises trace, question, and chat_tutor with real
 * content.
 */
export const g1Writing = subjectPath('1', 'writing', [
  node('g1-writing-sentence-writing', 0, 'Sentence Writing', 'sentence-writing', 0.7, [
    traceBlock('g1-writing-sentence-writing-trace', 'These letters trip people up — trace them, then we will build a sentence.', [
      glyph('g1-writing-sentence-writing-I', 'I', 'dotted'),
      glyph('g1-writing-sentence-writing-t', 't', 'dotted'),
      glyph('g1-writing-sentence-writing-e', 'e', 'dotted'),
    ]),
  ]),
  node('g1-writing-capitalization', 1, 'Capitalization & Punctuation', 'capitalization-punctuation', 0.8, [
    questionBlock('g1-writing-capitalization-q1', 'Spot the correct sentence.', [
      mcq('g1-writing-capitalization-i1', 'Which sentence uses capitalization correctly?', ['my dog is brown.', 'My dog is brown.', 'MY DOG is brown.'], 1, 'Only the first letter of a sentence should be capitalized.'),
      mcq('g1-writing-capitalization-i2', 'Which punctuation mark ends a question?', ['.', '?', '!'], 1, 'A question mark tells the reader you asked something.'),
    ]),
  ]),
  node('g1-writing-descriptive-words', 2, 'Descriptive Words', 'descriptive-words', 0.8, [
    questionBlock('g1-writing-descriptive-words-q1', 'Pick the word that paints a picture.', [
      mcq('g1-writing-descriptive-words-i1', 'Which word best describes how a lemon tastes?', ['sour', 'soft', 'loud'], 0, 'Lemons are known for their sour taste.'),
      mcq('g1-writing-descriptive-words-i2', 'Which sentence uses a describing word?', ['The dog ran.', 'The fluffy dog ran.', 'Dog ran the.'], 1, "'Fluffy' describes what the dog is like."),
    ]),
  ]),
  node('g1-writing-short-story', 3, 'Short Story Writing', 'short-story-writing', 0.7, [
    chatTutorBlock('g1-writing-short-story-chat', {
      persona: 'Story Sprout',
      openingLine: "Let's grow a tiny story together! Who is your main character going to be?",
      objective: 'Guide the kid through choosing a character, a problem, and an ending for a short story.',
      maxTurns: 5,
      sampleProbes: ['What does your character want?', 'What problem do they run into?', 'How does the story end?'],
    }),
  ]),
  node('g1-writing-journal-entry', 4, 'Journal Entry', 'journal-entry', 0.8, [
    questionBlock('g1-writing-journal-entry-q1', 'Think about what journals are for.', [
      mcq('g1-writing-journal-entry-i1', 'A journal entry usually starts with:', ['Once upon a time in a far away land', "Dear Diary or today's date", 'The End'], 1, 'Journal entries usually open with a date or a greeting like "Dear Diary".'),
      mcq('g1-writing-journal-entry-i2', 'Journal entries are usually written about:', ['Made-up dragons only', 'Your own day or feelings', 'Math homework answers'], 1, 'A journal is a personal record of your own thoughts and days.'),
    ]),
  ]),
]);
