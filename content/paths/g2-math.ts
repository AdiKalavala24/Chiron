import { mcq, node, questionBlock, subjectPath } from './helpers';

export const g2Math = subjectPath('2', 'math', [
  node('g2-math-add-100', 0, 'Adding within 100', 'add-within-100', 0.8, [
    questionBlock('g2-math-add-100-q1', 'Regroup if you need to.', [
      mcq('g2-math-add-100-i1', '24 + 19 = ?', ['43', '33', '53'], 0, 'Add ones: 4 + 9 = 13 (write 3, carry 1). Add tens: 2 + 1 + 1 = 4. Answer: 43.'),
      mcq('g2-math-add-100-i2', '58 + 27 = ?', ['75', '85', '95'], 1, 'Add ones: 8 + 7 = 15 (write 5, carry 1). Add tens: 5 + 2 + 1 = 8. Answer: 85.'),
    ]),
  ]),
  node('g2-math-subtract-100', 1, 'Subtracting within 100', 'subtract-within-100', 0.8, [
    questionBlock('g2-math-subtract-100-q1', 'Borrow if you need to.', [
      mcq('g2-math-subtract-100-i1', '82 − 45 = ?', ['37', '47', '27'], 0, 'Regroup a ten: 82 − 45 = 37.'),
      mcq('g2-math-subtract-100-i2', '90 − 56 = ?', ['44', '34', '36'], 1, 'Regroup a ten: 90 − 56 = 34.'),
    ]),
  ]),
  node('g2-math-place-value-hundreds', 2, 'Place Value: Hundreds', 'place-value-hundreds', 0.8, [
    questionBlock('g2-math-place-value-hundreds-q1', 'Find the value of each digit.', [
      mcq('g2-math-place-value-hundreds-i1', 'In 356, how many hundreds?', ['3', '5', '6'], 0, 'The 3 sits in the hundreds place, meaning 300.'),
      mcq('g2-math-place-value-hundreds-i2', 'What is the value of the 4 in 471?', ['4', '40', '400'], 2, 'The 4 sits in the hundreds place, so it is worth 400.'),
    ]),
  ]),
  node('g2-math-money-time', 3, 'Money & Time', 'money-time', 0.8, [
    questionBlock('g2-math-money-time-q1', 'Count coins and clocks.', [
      mcq('g2-math-money-time-i1', 'How many cents are in a quarter?', ['10', '25', '50'], 1, 'A quarter is worth 25 cents.'),
      mcq('g2-math-money-time-i2', 'How many minutes are in an hour?', ['30', '60', '100'], 1, 'One hour equals 60 minutes.'),
    ]),
  ]),
  node('g2-math-word-problems', 4, 'Word Problems', 'word-problems', 0.8, [
    questionBlock('g2-math-word-problems-q1', 'Read carefully, then solve.', [
      mcq('g2-math-word-problems-i1', 'A book costs 45 cents and a pencil costs 30 cents. How much for both?', ['65', '75', '85'], 1, 'Add the two prices: 45 + 30 = 75 cents.'),
      mcq('g2-math-word-problems-i2', 'There are 64 students. 28 go on a field trip. How many stay behind?', ['36', '46', '26'], 0, 'Subtract: 64 − 28 = 36.'),
    ]),
  ]),
]);
