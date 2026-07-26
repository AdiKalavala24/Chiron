import { mcq, node, questionBlock, subjectPath } from './helpers';

export const g4Math = subjectPath('4', 'math', [
  node('g4-math-multi-digit-mult', 0, 'Multi-Digit Multiplication', 'multi-digit-multiplication', 0.8, [
    questionBlock('g4-math-multi-digit-mult-q1', 'Break it into tens and ones.', [
      mcq('g4-math-multi-digit-mult-i1', '23 × 4 = ?', ['82', '92', '88'], 1, '20 × 4 = 80, and 3 × 4 = 12. 80 + 12 = 92.'),
      mcq('g4-math-multi-digit-mult-i2', '16 × 12 = ?', ['182', '192', '172'], 1, '16 × 10 = 160, and 16 × 2 = 32. 160 + 32 = 192.'),
    ]),
  ]),
  node('g4-math-long-division', 1, 'Long Division', 'long-division', 0.8, [
    questionBlock('g4-math-long-division-q1', 'Divide step by step.', [
      mcq('g4-math-long-division-i1', '96 ÷ 8 = ?', ['11', '12', '13'], 1, '8 × 12 = 96.'),
      mcq('g4-math-long-division-i2', '144 ÷ 12 = ?', ['12', '14', '10'], 0, '12 × 12 = 144.'),
    ]),
  ]),
  node('g4-math-fraction-equivalence', 2, 'Fraction Equivalence', 'fraction-equivalence', 0.8, [
    questionBlock('g4-math-fraction-equivalence-q1', 'Find the matching fraction.', [
      mcq('g4-math-fraction-equivalence-i1', 'Which fraction equals 1/2?', ['2/4', '3/8', '1/3'], 0, '2/4 simplifies to 1/2 when you divide top and bottom by 2.'),
      mcq('g4-math-fraction-equivalence-i2', 'Which fraction equals 2/3?', ['3/6', '4/6', '5/6'], 1, '4/6 simplifies to 2/3 when you divide top and bottom by 2.'),
    ]),
  ]),
  node('g4-math-decimals', 3, 'Decimals', 'decimals', 0.8, [
    questionBlock('g4-math-decimals-q1', 'Compare and convert.', [
      mcq('g4-math-decimals-i1', 'Which decimal equals 1/2?', ['0.5', '0.2', '0.12'], 0, '1/2 written as a decimal is 0.5.'),
      mcq('g4-math-decimals-i2', 'Which is bigger, 0.7 or 0.65?', ['0.7', '0.65', 'Equal'], 0, 'Compare the tenths place first: 0.70 is more than 0.65.'),
    ]),
  ]),
  node('g4-math-word-problems', 4, 'Word Problems', 'word-problems', 0.8, [
    questionBlock('g4-math-word-problems-q1', 'Read carefully, then solve.', [
      mcq('g4-math-word-problems-i1', 'A baker makes 24 muffins per tray and bakes 7 trays. How many muffins total?', ['168', '158', '178'], 0, 'Multiply: 24 × 7 = 168.'),
      mcq('g4-math-word-problems-i2', '128 stickers are shared equally among 8 kids. How many does each kid get?', ['14', '16', '18'], 1, 'Divide: 128 ÷ 8 = 16.'),
    ]),
  ]),
]);
