import { mcq, node, questionBlock, subjectPath } from './helpers';

export const g4Writing = subjectPath('4', 'writing', [
  node('g4-writing-multi-paragraph-essays', 0, 'Multi-Paragraph Essays', 'multi-paragraph-essays', 0.8, [
    questionBlock('g4-writing-multi-paragraph-essays-q1', 'Structure a full essay.', [
      mcq('g4-writing-multi-paragraph-essays-i1', 'A 5-paragraph essay typically includes an introduction, three body paragraphs, and a:', ['Conclusion', 'Glossary', 'Cover page'], 0, 'The conclusion wraps up the essay and restates the main idea.'),
      mcq('g4-writing-multi-paragraph-essays-i2', 'The introduction paragraph should include:', ['A thesis or main idea', 'Random unrelated facts', 'Only the ending'], 0, 'The introduction sets up the main idea, or thesis, of the whole essay.'),
    ]),
  ]),
  node('g4-writing-research', 1, 'Research Writing', 'research-writing', 0.8, [
    questionBlock('g4-writing-research-q1', 'Gather your facts first.', [
      mcq('g4-writing-research-i1', 'Before writing a research piece, you should first:', ['Gather information from reliable sources', 'Make up any facts', 'Skip planning'], 0, 'Good research writing starts with gathering accurate information.'),
      mcq('g4-writing-research-i2', 'Why do writers cite their sources?', ['To give credit and show where facts came from', 'To make the essay longer', "It's not necessary"], 0, 'Citing sources gives credit to the original author and shows your facts are reliable.'),
    ]),
  ]),
  node('g4-writing-compare-contrast', 2, 'Compare & Contrast Writing', 'compare-contrast-writing', 0.8, [
    questionBlock('g4-writing-compare-contrast-q1', 'Look for likenesses and differences.', [
      mcq('g4-writing-compare-contrast-i1', 'Compare and contrast writing focuses on:', ['Similarities and differences', 'Only similarities', 'Only differences'], 0, 'Compare and contrast writing looks at both how things are alike and how they differ.'),
      mcq('g4-writing-compare-contrast-i2', 'Which word signals a contrast?', ['Similarly', 'However', 'Also'], 1, "'However' signals that a difference is coming next."),
    ]),
  ]),
  node('g4-writing-complex-sentences', 3, 'Grammar: Complex Sentences', 'grammar-complex-sentences', 0.8, [
    questionBlock('g4-writing-complex-sentences-q1', 'Combine your ideas.', [
      mcq('g4-writing-complex-sentences-i1', 'Which is a complex sentence?', ['I ran.', 'Although it rained, we played outside.', 'Dogs bark.'], 1, 'This sentence joins a dependent clause ("Although it rained") with an independent one.'),
      mcq('g4-writing-complex-sentences-i2', 'A complex sentence contains an independent clause and a(n):', ['Dependent clause', 'Extra period', 'Nothing else'], 0, 'The dependent clause adds extra information but can’t stand alone as a sentence.'),
    ]),
  ]),
  node('g4-writing-creative-story', 4, 'Creative Story Writing', 'creative-story-writing', 0.8, [
    questionBlock('g4-writing-creative-story-q1', 'Hook your reader.', [
      mcq('g4-writing-creative-story-i1', 'A strong story character usually has:', ['A clear goal or problem to solve', 'No personality', 'The same traits as every other character'], 0, 'Characters feel real when they want something or face a problem.'),
      mcq('g4-writing-creative-story-i2', 'Which is a strong story opening?', ['It was a day.', 'The floor trembled seconds before the lights went out.', 'This is my story.'], 1, 'A strong opening drops the reader into action or tension right away.'),
    ]),
  ]),
]);
