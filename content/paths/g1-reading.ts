import { mcq, node, questionBlock, subjectPath } from './helpers';

export const g1Reading = subjectPath('1', 'reading', [
  node('g1-reading-digraphs', 0, 'Phonics Digraphs', 'phonics-digraphs', 0.8, [
    questionBlock('g1-reading-digraphs-q1', 'Two letters, one sound.', [
      mcq('g1-reading-digraphs-i1', "Which word starts with the 'sh' sound?", ['ship', 'sip', 'tip'], 0, "'Sh' makes one sound together, like in 'ship'."),
      mcq('g1-reading-digraphs-i2', "Which word has the 'ch' sound?", ['chip', 'tip', 'zip'], 0, "'Ch' makes a sound like in 'chip' or 'chair'."),
    ]),
  ]),
  node('g1-reading-sight-words', 1, 'Sight Words', 'sight-words', 0.8, [
    questionBlock('g1-reading-sight-words-q1', 'Spot the word.', [
      mcq('g1-reading-sight-words-i1', "Which word is 'they'?", ['they', 'them', 'then'], 0, "'They' is used to talk about a group of people."),
      mcq('g1-reading-sight-words-i2', "Which word is 'was'?", ['saw', 'was', 'wax'], 1, "'Was' tells us something happened in the past."),
    ]),
  ]),
  node('g1-reading-sentence-reading', 2, 'Sentence Reading', 'sentence-reading', 0.8, [
    questionBlock('g1-reading-sentence-reading-q1', 'Read closely.', [
      mcq('g1-reading-sentence-reading-i1', "Read: 'The dog runs fast.' What is running?", ['The dog', 'A cat', 'A bird'], 0, "The subject of the sentence, 'the dog', is doing the running."),
      mcq('g1-reading-sentence-reading-i2', "Read: 'Mia likes red apples.' What color are the apples?", ['Green', 'Red', 'Yellow'], 1, "The sentence tells us the apples are red."),
    ]),
  ]),
  node('g1-reading-story-sequencing', 3, 'Story Sequencing', 'story-sequencing', 0.8, [
    questionBlock('g1-reading-story-sequencing-q1', 'What happens first?', [
      mcq('g1-reading-story-sequencing-i1', 'First you wake up, then you brush your teeth. What comes first?', ['Brush teeth', 'Wake up', 'Eat lunch'], 1, "'Wake up' happens before 'brush your teeth' in the order of events."),
      mcq('g1-reading-story-sequencing-i2', 'First plant a seed, then it grows into a flower. What happens first?', ['Plant the seed', 'The flower blooms', 'Pick the flower'], 0, 'Planting the seed always comes before it can grow.'),
    ]),
  ]),
  node('g1-reading-comprehension', 4, 'Simple Comprehension', 'simple-comprehension', 0.8, [
    questionBlock('g1-reading-comprehension-q1', 'Think about the story.', [
      mcq('g1-reading-comprehension-i1', "In a story about a dog who loses his ball, what is the dog's problem?", ['He is hungry', 'He lost his ball', 'He wants a nap'], 1, 'The problem is stated right in the story: he lost his ball.'),
      mcq('g1-reading-comprehension-i2', 'A story is about a girl who plants a garden. What is she most likely doing?', ['Baking a cake', 'Growing plants', 'Painting a wall'], 1, 'Planting a garden means she is growing plants.'),
    ]),
  ]),
]);
