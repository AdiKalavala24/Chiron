import { mcq, node, questionBlock, subjectPath } from './helpers';

export const g3Reading = subjectPath('3', 'reading', [
  node('g3-reading-vocabulary', 0, 'Vocabulary Building', 'vocabulary-building', 0.8, [
    questionBlock('g3-reading-vocabulary-q1', 'Choose the meaning.', [
      mcq('g3-reading-vocabulary-i1', "What does 'enormous' mean?", ['Very small', 'Very large', 'Very fast'], 1, "'Enormous' means extremely large."),
      mcq('g3-reading-vocabulary-i2', "What does 'exhausted' mean?", ['Very tired', 'Very happy', 'Very hungry'], 0, "'Exhausted' means extremely tired."),
    ]),
  ]),
  node('g3-reading-inference', 1, 'Inference', 'inference', 0.8, [
    questionBlock('g3-reading-inference-q1', 'Read between the lines.', [
      mcq('g3-reading-inference-i1', 'Maya grabbed her umbrella before leaving the house. What can you infer?', ['She thinks it will rain', 'She is going swimming', 'She lost her keys'], 0, 'Grabbing an umbrella suggests she expects rain, even though the story never says so directly.'),
      mcq('g3-reading-inference-i2', "Jake's stomach growled loudly during class. What can you infer?", ['He is scared', 'He is hungry', 'He is tired'], 1, 'A growling stomach is a clue that someone is hungry.'),
    ]),
  ]),
  node('g3-reading-main-idea', 2, 'Main Idea & Details', 'main-idea-details', 0.8, [
    questionBlock('g3-reading-main-idea-q1', 'Find the big idea.', [
      mcq('g3-reading-main-idea-i1', 'A paragraph describes three kinds of bird nests. What is likely the main idea?', ['Birds build many kinds of nests', 'Birds can fly', 'Nests are made of mud'], 0, 'The main idea covers what the whole paragraph is about, not just one detail.'),
      mcq('g3-reading-main-idea-i2', 'Which sentence is a supporting detail, not a main idea?', ['Some birds build nests in trees', 'Birds are the topic of this paragraph', 'This paragraph is about nests'], 0, 'A supporting detail gives one specific example that backs up the main idea.'),
    ]),
  ]),
  node('g3-reading-text-structure', 3, 'Text Structure', 'text-structure', 0.8, [
    questionBlock('g3-reading-text-structure-q1', 'How is the text organized?', [
      mcq('g3-reading-text-structure-i1', 'A text that explains events in the order they happened uses which structure?', ['Sequence', 'Compare and contrast', 'Cause and effect'], 0, 'Sequence structure tells events in the order they occur.'),
      mcq('g3-reading-text-structure-i2', 'A text that explains why something happened uses which structure?', ['Sequence', 'Cause and effect', 'Description'], 1, 'Cause and effect explains why something happened and what resulted.'),
    ]),
  ]),
  node('g3-reading-summarizing', 4, 'Summarizing', 'summarizing', 0.8, [
    questionBlock('g3-reading-summarizing-q1', 'Say it in fewer words.', [
      mcq('g3-reading-summarizing-i1', 'A good summary should include:', ['Every single detail', 'Only the most important ideas', 'Your opinion about the story'], 1, 'A summary keeps just the most important ideas, not every detail.'),
      mcq(
        'g3-reading-summarizing-i2',
        'Which is the best one-sentence summary of a story about a boy who practices for weeks and finally learns to ride his bike?',
        ['A boy has a bike.', 'A boy practices and finally learns to ride his bike.', 'A boy likes the color blue.'],
        1,
        'The best summary captures the main event of the story in one sentence.',
      ),
    ]),
  ]),
]);
