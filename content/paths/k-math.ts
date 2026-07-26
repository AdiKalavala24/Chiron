import { chatTutorBlock, gameBlock, mcq, node, questionBlock, subjectPath } from './helpers';

/**
 * Flagship path — exercises question, chat_tutor, and game_3d (Number
 * Garden) with real content, so the full method-switching architecture
 * has at least one grade×subject combo to prove itself against end to
 * end.
 */
export const kMath = subjectPath('K', 'math', [
  node('k-math-count-to-10', 0, 'Counting to 10', 'count-to-10', 0.8, [
    questionBlock('k-math-count-to-10-q1', 'Tap the answer that fits best.', [
      mcq('k-math-count-to-10-i1', 'Which number comes right after 4?', ['3', '5', '6'], 1, 'After 4 comes 5 — count with me: 1, 2, 3, 4, 5!'),
      mcq('k-math-count-to-10-i2', 'How many stars? ⭐⭐⭐', ['2', '3', '4'], 1, 'Count each star one at a time: 1, 2, 3!'),
      mcq('k-math-count-to-10-i3', 'Which one is the number 7?', ['7', '1', '9'], 0, '7 has a flag on top and a slanted line down.'),
    ]),
    chatTutorBlock('k-math-count-to-10-chat', {
      persona: 'Counting Cat',
      openingLine: "Hi, I'm Counting Cat! Let's count together — can you count from 1 all the way to 10 with me?",
      objective: 'Practice reciting 1-10 in order and naming what comes next.',
      maxTurns: 4,
      sampleProbes: ['What comes after 6?', 'Can you count backwards from 5 to 1?', 'What number is one less than 10?'],
    }),
  ]),
  node('k-math-shapes-sorting', 1, 'Shapes & Sorting', 'shapes-sorting', 0.8, [
    questionBlock('k-math-shapes-sorting-q1', 'Pick the shape that matches.', [
      mcq('k-math-shapes-sorting-i1', 'Which shape has exactly 3 sides?', ['Circle', 'Triangle', 'Square'], 1, 'A triangle always has 3 straight sides.'),
      mcq('k-math-shapes-sorting-i2', 'Which shape is round like a ball?', ['Square', 'Circle', 'Triangle'], 1, 'A circle has no corners at all — it just curves around.'),
      mcq('k-math-shapes-sorting-i3', 'How many sides does a square have?', ['3', '4', '5'], 1, 'A square has 4 sides that are all the same length.'),
    ]),
  ]),
  node('k-math-add-within-5', 2, 'Adding within 5', 'add-within-5', 0.8, [
    questionBlock('k-math-add-within-5-q1', "Add 'em up!", [
      mcq('k-math-add-within-5-i1', '2 + 2 = ?', ['3', '4', '5'], 1, 'Two fingers plus two more fingers makes four.'),
      mcq('k-math-add-within-5-i2', '1 + 3 = ?', ['4', '5', '3'], 0, 'Start at 1 and count on 3 more: 2, 3, 4.'),
      mcq('k-math-add-within-5-i3', '3 + 1 = ?', ['3', '4', '5'], 1, 'Adding 1 just means the next number after 3.'),
    ]),
    chatTutorBlock('k-math-add-within-5-chat', {
      persona: 'Counting Cat',
      openingLine: 'If you have 2 apples and I give you 2 more, how many apples do you have now?',
      objective: 'Build number sense for addition within 5 using objects the kid can picture.',
      maxTurns: 4,
      sampleProbes: ['What is 3 plus 1?', 'Can you show me 4 fingers plus 1 more finger?'],
    }),
  ]),
  node('k-math-subtract-within-5', 3, 'Subtracting within 5', 'subtract-within-5', 0.8, [
    questionBlock('k-math-subtract-within-5-q1', 'Take some away.', [
      mcq('k-math-subtract-within-5-i1', '5 − 2 = ?', ['2', '3', '4'], 1, 'Start at 5 and count back 2: 4, 3.'),
      mcq('k-math-subtract-within-5-i2', '4 − 1 = ?', ['3', '2', '4'], 0, 'One less than 4 is 3.'),
      mcq('k-math-subtract-within-5-i3', '3 − 3 = ?', ['0', '1', '3'], 0, 'Taking away all 3 leaves nothing — zero!'),
    ]),
  ]),
  node('k-math-compare-numbers', 4, 'Comparing Numbers', 'compare-numbers', 0.8, [
    questionBlock('k-math-compare-numbers-q1', 'Which number wins?', [
      mcq('k-math-compare-numbers-i1', 'Which number is bigger: 6 or 4?', ['4', '6', "They're equal"], 1, '6 comes after 4 when we count, so 6 is bigger.'),
      mcq('k-math-compare-numbers-i2', 'Which number is smaller: 2 or 8?', ['2', '8', "They're equal"], 0, '2 comes first when we count, so 2 is smaller.'),
      mcq('k-math-compare-numbers-i3', "Which sign means 'greater than'?", ['>', '<', '='], 0, "The wide-open side of > always faces the bigger number."),
    ]),
    gameBlock(
      'k-math-compare-numbers-game',
      'number_garden',
      'Compare Numbers',
      2,
      'Grow the tallest sunflower by picking the bigger number each round.',
      [
        mcq('k-math-compare-numbers-g1', 'Water the bigger number: 5 or 3?', ['5', '3'], 0, '5 is more than 3, so that flower grows taller!'),
        mcq('k-math-compare-numbers-g2', 'Water the bigger number: 2 or 9?', ['2', '9'], 1, '9 is much more than 2 — big growth!'),
      ],
    ),
  ]),
]);
