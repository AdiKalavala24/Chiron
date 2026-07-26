import { mcq, node, questionBlock, subjectPath } from './helpers';

export const g1Math = subjectPath('1', 'math', [
  node('g1-math-add-20', 0, 'Adding within 20', 'add-within-20', 0.8, [
    questionBlock('g1-math-add-20-q1', 'Add it up.', [
      mcq('g1-math-add-20-i1', '8 + 6 = ?', ['13', '14', '15'], 1, 'Count on from 8: 9, 10, 11, 12, 13, 14.'),
      mcq('g1-math-add-20-i2', '9 + 9 = ?', ['16', '18', '17'], 1, '9 + 9 is double 9, which is 18.'),
    ]),
  ]),
  node('g1-math-subtract-20', 1, 'Subtracting within 20', 'subtract-within-20', 0.8, [
    questionBlock('g1-math-subtract-20-q1', 'Take some away.', [
      mcq('g1-math-subtract-20-i1', '15 − 7 = ?', ['7', '8', '9'], 1, 'Think: 7 + 8 = 15, so 15 − 7 = 8.'),
      mcq('g1-math-subtract-20-i2', '12 − 5 = ?', ['6', '7', '8'], 1, 'Count back from 12 five times: 11, 10, 9, 8, 7.'),
    ]),
  ]),
  node('g1-math-place-value', 2, 'Place Value: Tens & Ones', 'place-value-tens-ones', 0.8, [
    questionBlock('g1-math-place-value-q1', 'Break the number apart.', [
      mcq('g1-math-place-value-i1', 'In the number 34, how many tens?', ['3', '4', '7'], 0, 'The digit in the tens spot is 3, meaning 3 tens (30).'),
      mcq('g1-math-place-value-i2', 'In the number 52, how many ones?', ['5', '2', '7'], 1, 'The digit in the ones spot is 2.'),
    ]),
  ]),
  node('g1-math-measurement-time', 3, 'Measurement & Time', 'measurement-time', 0.8, [
    questionBlock('g1-math-measurement-time-q1', 'Measure and tell time.', [
      mcq('g1-math-measurement-time-i1', 'What tool measures how long something is?', ['Clock', 'Ruler', 'Scale'], 1, 'A ruler measures length.'),
      mcq('g1-math-measurement-time-i2', 'The short hand on a clock shows the ___.', ['Hour', 'Minute', 'Second'], 0, 'The short hand points to the hour.'),
    ]),
  ]),
  node('g1-math-word-problems', 4, 'Word Problems', 'word-problems', 0.8, [
    questionBlock('g1-math-word-problems-q1', 'Read carefully, then solve.', [
      mcq('g1-math-word-problems-i1', 'Sam has 7 apples. He gets 5 more. How many apples now?', ['11', '12', '13'], 1, 'Add the two amounts together: 7 + 5 = 12.'),
      mcq('g1-math-word-problems-i2', 'There are 10 birds. 4 fly away. How many are left?', ['6', '5', '7'], 0, 'Subtract the birds that left: 10 − 4 = 6.'),
    ]),
  ]),
]);
