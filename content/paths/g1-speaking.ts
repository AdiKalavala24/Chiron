import { node, phrase, speakBlock, subjectPath } from './helpers';

export const g1Speaking = subjectPath('1', 'speaking', [
  node('g1-speaking-sentence-speaking', 0, 'Sentence Speaking', 'sentence-speaking', 0.65, [
    speakBlock('g1-speaking-sentence-speaking-speak', 'Say each full sentence clearly.', [
      phrase('g1-speaking-sentence-speaking-p1', 'I like to play outside.'),
      phrase('g1-speaking-sentence-speaking-p2', 'My favorite color is green.'),
      phrase('g1-speaking-sentence-speaking-p3', 'I have two sisters.'),
    ]),
  ]),
  node('g1-speaking-question-asking', 1, 'Question Asking', 'question-asking', 0.65, [
    speakBlock('g1-speaking-question-asking-speak', 'Say each question with a rising tone at the end.', [
      phrase('g1-speaking-question-asking-p1', 'What is your name?'),
      phrase('g1-speaking-question-asking-p2', 'Can I play with you?'),
      phrase('g1-speaking-question-asking-p3', 'Where is the library?'),
    ]),
  ]),
  node('g1-speaking-retelling-stories', 2, 'Retelling Stories', 'retelling-stories', 0.65, [
    speakBlock('g1-speaking-retelling-stories-speak', 'Retell the story, one part at a time.', [
      phrase('g1-speaking-retelling-stories-p1', 'The fox saw a grape.'),
      phrase('g1-speaking-retelling-stories-p2', 'The fox tried to jump for it.'),
      phrase('g1-speaking-retelling-stories-p3', 'The fox gave up and walked away.'),
    ]),
  ]),
  node('g1-speaking-vocabulary-aloud', 3, 'Vocabulary Aloud', 'vocabulary-aloud', 0.65, [
    speakBlock('g1-speaking-vocabulary-aloud-speak', 'Say each word and its meaning out loud.', [
      phrase('g1-speaking-vocabulary-aloud-p1', 'Enormous means very big.'),
      phrase('g1-speaking-vocabulary-aloud-p2', 'Exhausted means very tired.'),
      phrase('g1-speaking-vocabulary-aloud-p3', 'Delighted means very happy.'),
    ]),
  ]),
  node('g1-speaking-listening-responding', 4, 'Listening & Responding', 'listening-and-responding', 0.65, [
    speakBlock('g1-speaking-listening-responding-speak', 'Practice these responses out loud.', [
      phrase('g1-speaking-listening-responding-p1', 'Yes, I understand.'),
      phrase('g1-speaking-listening-responding-p2', 'Can you say that again, please?'),
      phrase('g1-speaking-listening-responding-p3', 'That makes sense to me.'),
    ]),
  ]),
]);
