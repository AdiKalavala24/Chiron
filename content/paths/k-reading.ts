import { mcq, node, questionBlock, subjectPath } from './helpers';

export const kReading = subjectPath('K', 'reading', [
  node('k-reading-letter-recognition', 0, 'Letter Recognition', 'letter-recognition', 0.8, [
    questionBlock('k-reading-letter-recognition-q1', 'Find the letter.', [
      mcq('k-reading-letter-recognition-i1', "Which letter is 'B'?", ['B', 'D', 'P'], 0, 'B has two bumps that both point to the right.'),
      mcq('k-reading-letter-recognition-i2', 'Which letter comes first in the alphabet: A or C?', ['A', 'C', 'Neither'], 0, 'A is the very first letter of the alphabet.'),
    ]),
  ]),
  node('k-reading-letter-sounds', 1, 'Letter Sounds', 'letter-sounds', 0.8, [
    questionBlock('k-reading-letter-sounds-q1', 'Match the sound.', [
      mcq('k-reading-letter-sounds-i1', "What sound does the letter 'S' make?", ['/s/ like snake', '/m/ like moon', '/t/ like top'], 0, 'S makes a hissing /s/ sound, just like a snake.'),
      mcq('k-reading-letter-sounds-i2', 'Which letter makes the /m/ sound?', ['M', 'N', 'W'], 0, "M makes the /m/ sound, like 'mmm' when something's yummy."),
    ]),
  ]),
  node('k-reading-rhyming-words', 2, 'Rhyming Words', 'rhyming-words', 0.8, [
    questionBlock('k-reading-rhyming-words-q1', 'Listen for the matching sound.', [
      mcq('k-reading-rhyming-words-i1', "Which word rhymes with 'cat'?", ['dog', 'hat', 'sun'], 1, "'Cat' and 'hat' both end with the -at sound."),
      mcq('k-reading-rhyming-words-i2', "Which word rhymes with 'sun'?", ['fun', 'cup', 'tree'], 0, "'Sun' and 'fun' both end with the -un sound."),
    ]),
  ]),
  node('k-reading-sight-words', 3, 'Sight Words', 'sight-words', 0.8, [
    questionBlock('k-reading-sight-words-q1', 'Spot the word.', [
      mcq('k-reading-sight-words-i1', "Which word is 'the'?", ['the', 'she', 'he'], 0, "'The' is a word you'll see on almost every page."),
      mcq('k-reading-sight-words-i2', "Which word is 'and'?", ['end', 'and', 'ant'], 1, "'And' connects two ideas together."),
    ]),
  ]),
  node('k-reading-blending-cvc', 4, 'Blending CVC Words', 'blending-cvc-words', 0.8, [
    questionBlock('k-reading-blending-cvc-q1', 'Blend the sounds together.', [
      mcq('k-reading-blending-cvc-i1', 'Blend the sounds /c/ /a/ /t/. What word is it?', ['cat', 'cut', 'cot'], 0, '/c/ /a/ /t/ blends together to make "cat".'),
      mcq('k-reading-blending-cvc-i2', 'Blend the sounds /d/ /o/ /g/. What word is it?', ['dig', 'dug', 'dog'], 2, '/d/ /o/ /g/ blends together to make "dog".'),
    ]),
  ]),
]);
