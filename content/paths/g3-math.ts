import { mcq, node, questionBlock, subjectPath } from './helpers';

export const g3Math = subjectPath('3', 'math', [
  node('g3-math-multiplication', 0, 'Multiplication Facts', 'multiplication-facts', 0.8, [
    questionBlock('g3-math-multiplication-q1', 'Find the product.', [
      mcq('g3-math-multiplication-i1', '6 × 7 = ?', ['42', '36', '48'], 0, '6 groups of 7 (or 7 groups of 6) makes 42.'),
      mcq('g3-math-multiplication-i2', '8 × 4 = ?', ['24', '32', '36'], 1, '8 groups of 4 makes 32.'),
    ]),
  ]),
  node('g3-math-division', 1, 'Division Facts', 'division-facts', 0.8, [
    questionBlock('g3-math-division-q1', 'Split it evenly.', [
      mcq('g3-math-division-i1', '36 ÷ 6 = ?', ['6', '7', '5'], 0, '6 groups of 6 make 36.'),
      mcq('g3-math-division-i2', '45 ÷ 9 = ?', ['4', '5', '6'], 1, '9 groups of 5 make 45.'),
    ]),
  ]),
  node('g3-math-fractions', 2, 'Fractions as Parts', 'fractions-as-parts', 0.8, [
    questionBlock('g3-math-fractions-q1', 'Think in equal parts.', [
      mcq('g3-math-fractions-i1', 'A shape has 4 equal parts and 1 is shaded. What fraction is shaded?', ['1/4', '1/2', '4/1'], 0, '1 part out of 4 total equal parts is 1/4.'),
      mcq('g3-math-fractions-i2', 'Which fraction is bigger, 1/2 or 1/4?', ['1/2', '1/4', 'Equal'], 0, 'Half of something is more than a quarter of it.'),
    ]),
  ]),
  node('g3-math-area-perimeter', 3, 'Area & Perimeter', 'area-perimeter', 0.8, [
    questionBlock('g3-math-area-perimeter-q1', 'Measure the shape.', [
      mcq('g3-math-area-perimeter-i1', 'A rectangle is 4 units long and 3 units wide. What is its area?', ['7', '12', '14'], 1, 'Area = length × width = 4 × 3 = 12.'),
      mcq('g3-math-area-perimeter-i2', 'A square has sides of 5 units. What is its perimeter?', ['20', '25', '10'], 0, 'Perimeter = add all 4 sides: 5 + 5 + 5 + 5 = 20.'),
    ]),
  ]),
  node('g3-math-word-problems', 4, 'Word Problems', 'word-problems', 0.8, [
    questionBlock('g3-math-word-problems-q1', 'Read carefully, then solve.', [
      mcq('g3-math-word-problems-i1', 'A pack has 8 crayons. You buy 5 packs. How many crayons total?', ['35', '40', '45'], 1, 'Multiply: 8 × 5 = 40.'),
      mcq('g3-math-word-problems-i2', '24 cookies are shared equally among 6 friends. How many does each friend get?', ['3', '4', '5'], 1, 'Divide: 24 ÷ 6 = 4.'),
    ]),
  ]),
]);
