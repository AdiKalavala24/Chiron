import { glyph, mcq, node, questionBlock, subjectPath, traceBlock } from './helpers';

export const kWriting = subjectPath('K', 'writing', [
  node('k-writing-uppercase', 0, 'Letter Formation: Uppercase', 'letter-formation-uppercase', 0.7, [
    traceBlock('k-writing-uppercase-trace', 'Trace each big letter from top to bottom.', [
      glyph('k-writing-uppercase-a', 'A', 'dotted'),
      glyph('k-writing-uppercase-b', 'B', 'dotted'),
      glyph('k-writing-uppercase-c', 'C', 'dotted'),
    ]),
  ]),
  node('k-writing-lowercase', 1, 'Letter Formation: Lowercase', 'letter-formation-lowercase', 0.7, [
    traceBlock('k-writing-lowercase-trace', 'Trace each small letter carefully.', [
      glyph('k-writing-lowercase-a', 'a', 'dotted'),
      glyph('k-writing-lowercase-b', 'b', 'dotted'),
      glyph('k-writing-lowercase-c', 'c', 'dotted'),
    ]),
  ]),
  node('k-writing-name-words', 2, 'Name & Simple Words', 'name-and-simple-words', 0.7, [
    traceBlock('k-writing-name-words-trace', 'Trace the letters in the word CAT.', [
      glyph('k-writing-name-words-c', 'c', 'outline'),
      glyph('k-writing-name-words-a', 'a', 'outline'),
      glyph('k-writing-name-words-t', 't', 'outline'),
    ]),
  ]),
  node('k-writing-picture-labeling', 3, 'Picture Labeling', 'picture-labeling', 0.8, [
    questionBlock('k-writing-picture-labeling-q1', 'Match the word to the picture.', [
      mcq('k-writing-picture-labeling-i1', 'Which word matches a picture of the sun?', ['sun', 'fun', 'run'], 0, "'Sun' starts with the /s/ sound, just like the picture."),
      mcq('k-writing-picture-labeling-i2', 'Which word matches a picture of a cat?', ['cat', 'hat', 'bat'], 0, "'Cat' starts with the /c/ sound."),
    ]),
  ]),
  node('k-writing-simple-sentences', 4, 'Simple Sentences', 'simple-sentences', 0.8, [
    questionBlock('k-writing-simple-sentences-q1', 'Look for capital letters and end marks.', [
      mcq('k-writing-simple-sentences-i1', 'Which sentence is written correctly?', ['i see a dog.', 'I see a dog.', 'I See A Dog'], 1, 'Sentences start with one capital letter and end with a period.'),
      mcq('k-writing-simple-sentences-i2', 'Which one is a complete sentence?', ['The big red', 'The big red ball rolled.', 'Rolled ball red'], 1, 'A complete sentence has a subject and tells a full idea.'),
    ]),
  ]),
]);
