import { node, phrase, speakBlock, subjectPath } from './helpers';

export const kSpeaking = subjectPath('K', 'speaking', [
  node('k-speaking-letter-sounds-aloud', 0, 'Letter Sounds Aloud', 'letter-sounds-aloud', 0.6, [
    speakBlock(
      'k-speaking-letter-sounds-aloud-speak',
      'Say each letter sound out loud, nice and clear.',
      [
        phrase('k-speaking-letter-sounds-aloud-p1', '/A/ as in apple'),
        phrase('k-speaking-letter-sounds-aloud-p2', '/B/ as in ball'),
        phrase('k-speaking-letter-sounds-aloud-p3', '/C/ as in cat'),
      ],
      0.6,
    ),
  ]),
  node('k-speaking-greetings', 1, 'Greetings & Show and Tell', 'greetings-show-and-tell', 0.6, [
    speakBlock(
      'k-speaking-greetings-speak',
      "Practice saying these out loud like you're meeting a new friend.",
      [
        phrase('k-speaking-greetings-p1', 'Hello, my name is Chiron.'),
        phrase('k-speaking-greetings-p2', 'This is my favorite toy.'),
        phrase('k-speaking-greetings-p3', 'Nice to meet you!'),
      ],
      0.6,
    ),
  ]),
  node('k-speaking-following-directions', 2, 'Following Directions', 'following-directions', 0.6, [
    speakBlock(
      'k-speaking-following-directions-speak',
      'Say each polite direction clearly.',
      [
        phrase('k-speaking-following-directions-p1', 'Please stand up.'),
        phrase('k-speaking-following-directions-p2', 'May I have the ball?'),
        phrase('k-speaking-following-directions-p3', 'Thank you very much.'),
      ],
      0.6,
    ),
  ]),
  node('k-speaking-rhyme-time', 3, 'Rhyme Time Aloud', 'rhyme-time-aloud', 0.6, [
    speakBlock(
      'k-speaking-rhyme-time-speak',
      'Say each rhyming pair out loud.',
      [
        phrase('k-speaking-rhyme-time-p1', 'Cat and hat rhyme.'),
        phrase('k-speaking-rhyme-time-p2', 'Sun and fun rhyme.'),
        phrase('k-speaking-rhyme-time-p3', 'Dog and log rhyme.'),
      ],
      0.6,
    ),
  ]),
  node('k-speaking-story-retelling', 4, 'Story Retelling', 'story-retelling', 0.6, [
    speakBlock(
      'k-speaking-story-retelling-speak',
      'Practice retelling the story out loud, one sentence at a time.',
      [
        phrase('k-speaking-story-retelling-p1', 'First, the bear woke up.'),
        phrase('k-speaking-story-retelling-p2', 'Then, the bear ate breakfast.'),
        phrase('k-speaking-story-retelling-p3', 'Finally, the bear went for a walk.'),
      ],
      0.6,
    ),
  ]),
]);
