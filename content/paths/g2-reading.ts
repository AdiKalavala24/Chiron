import { mcq, node, questionBlock, reverseTutorBlock, storyMissionBlock, subjectPath, videoBlock } from './helpers';

/**
 * Flagship path — exercises question, video, story_mission, and
 * reverse_tutor with real content.
 */
export const g2Reading = subjectPath('2', 'reading', [
  node('g2-reading-phonics-blends', 0, 'Phonics Blends', 'phonics-blends', 0.8, [
    questionBlock('g2-reading-phonics-blends-q1', 'Listen for two consonants blending.', [
      mcq('g2-reading-phonics-blends-i1', 'Which word starts with a consonant blend?', ['cat', 'stop', 'dog'], 1, "'St' in 'stop' blends two consonant sounds together."),
      mcq('g2-reading-phonics-blends-i2', "Which word has the 'gr' blend?", ['grow', 'cow', 'toe'], 0, "'Gr' blends together at the start of 'grow'."),
    ]),
  ]),
  node('g2-reading-fluency', 1, 'Fluency Practice', 'fluency-practice', 0.75, [
    videoBlock(
      'g2-reading-fluency-video',
      'Reading with Expression',
      'chiron-placeholder-fluency', // TODO: replace with a curated, licensed YouTube video id before shipping
      180,
      [
        mcq(
          'g2-reading-fluency-check1',
          "What makes reading 'with expression' different from reading in a flat voice?",
          ['Using your voice to show feeling', 'Reading as fast as possible', 'Whispering the whole time'],
          0,
          'Expression means changing your voice to match excitement, sadness, or surprise in the story.',
        ),
      ],
    ),
  ]),
  node('g2-reading-context-clues', 2, 'Context Clues', 'context-clues', 0.8, [
    questionBlock('g2-reading-context-clues-q1', 'Use the sentence around the tricky word.', [
      mcq(
        'g2-reading-context-clues-i1',
        "'It was so frigid outside that the lake froze solid.' What clue tells you 'frigid' means very cold?",
        ["'the lake froze solid'", "'outside'", "'It was so'"],
        0,
        'The lake freezing is a clue that it must be extremely cold — that is a context clue.',
      ),
      mcq(
        'g2-reading-context-clues-i2',
        "'The famished dog gobbled up its food in seconds.' What does 'famished' most likely mean?",
        ['Very sleepy', 'Very hungry', 'Very sick'],
        1,
        'Gobbling up food fast is a clue that the dog was very hungry.',
      ),
    ]),
  ]),
  node('g2-reading-comprehension-details', 3, 'Comprehension: Details', 'comprehension-details', 0.7, [
    reverseTutorBlock(
      'g2-reading-comprehension-details-reverse',
      'Pip the Puppy',
      "Woof! I napped through story time and missed everything. Can you tell me what happened?",
      'Recalling specific details from a short passage in order',
      [
        'Does the explanation name the main character?',
        'Does it recall at least one key event in the right order?',
        'Does it explain how the story ended?',
      ],
    ),
  ]),
  node('g2-reading-story-elements', 4, 'Story Elements', 'story-elements', 0.75, [
    storyMissionBlock(
      'g2-reading-story-elements-mission',
      'The Mystery of Maple Street',
      [
        'You and your neighbor Jordan notice muddy paw prints leading up to the old treehouse.',
        'Inside, you find a torn blanket and a half-eaten sandwich.',
        "Jordan thinks it's a raccoon, but you're not so sure...",
      ],
      [
        mcq('g2-reading-story-elements-c1', 'Who are the characters in this mission so far?', ['You and Jordan', 'A raccoon and a wizard', 'Just a treehouse'], 0, 'Characters are the people (or animals) in a story — here, that is you and Jordan.'),
        mcq('g2-reading-story-elements-c2', 'Where does most of this mission take place?', ['A treehouse', 'A spaceship', 'A classroom'], 0, 'The setting so far is the old treehouse.'),
      ],
    ),
  ]),
]);
