import { mcq, node, questionBlock, subjectPath } from './helpers';

export const g2Writing = subjectPath('2', 'writing', [
  node('g2-writing-paragraph-structure', 0, 'Paragraph Structure', 'paragraph-structure', 0.8, [
    questionBlock('g2-writing-paragraph-structure-q1', 'Build a paragraph piece by piece.', [
      mcq('g2-writing-paragraph-structure-i1', 'What is the first sentence of a paragraph called?', ['Topic sentence', 'Ending sentence', 'Random sentence'], 0, 'The topic sentence tells the reader what the paragraph is about.'),
      mcq('g2-writing-paragraph-structure-i2', 'Supporting details in a paragraph should:', ['Support the topic sentence', 'Talk about something else', 'Be left out'], 0, 'Supporting details give more information about the topic sentence.'),
    ]),
  ]),
  node('g2-writing-sequencing-events', 1, 'Sequencing Events', 'sequencing-events', 0.8, [
    questionBlock('g2-writing-sequencing-events-q1', 'Put events in order.', [
      mcq('g2-writing-sequencing-events-i1', 'Which word signals what happens first?', ['First', 'Finally', 'Meanwhile'], 0, "'First' signals the start of a sequence of events."),
      mcq('g2-writing-sequencing-events-i2', 'Which word signals the last event?', ['First', 'Next', 'Finally'], 2, "'Finally' signals the last event in a sequence."),
    ]),
  ]),
  node('g2-writing-opinion-writing', 2, 'Opinion Writing', 'opinion-writing', 0.8, [
    questionBlock('g2-writing-opinion-writing-q1', 'Tell us what you think — and why.', [
      mcq('g2-writing-opinion-writing-i1', 'An opinion sentence should include:', ['Only facts', 'What you think and why', 'A math equation'], 1, 'A strong opinion sentence states what you believe and gives a reason.'),
      mcq('g2-writing-opinion-writing-i2', 'Which sentence shows an opinion?', ['The sky is blue.', 'I think puppies are the best pets.', 'Water boils at 100°C.'], 1, "'I think' signals that this is an opinion, not a fact."),
    ]),
  ]),
  node('g2-writing-descriptive-writing', 3, 'Descriptive Writing', 'descriptive-writing', 0.8, [
    questionBlock('g2-writing-descriptive-writing-q1', 'Paint a picture with words.', [
      mcq('g2-writing-descriptive-writing-i1', 'Which sentence uses the most descriptive detail?', ['The dog ran.', 'The fluffy brown dog raced across the yard.', 'A dog was there.'], 1, 'This sentence adds color, texture, and action to paint a picture.'),
      mcq('g2-writing-descriptive-writing-i2', 'Descriptive writing uses words that appeal to:', ['The five senses', 'Only numbers', 'Only colors'], 0, 'Good descriptive writing helps readers see, hear, smell, taste, and feel the scene.'),
    ]),
  ]),
  node('g2-writing-edit-revise', 4, 'Edit & Revise', 'edit-and-revise', 0.8, [
    questionBlock('g2-writing-edit-revise-q1', 'Make it shine.', [
      mcq('g2-writing-edit-revise-i1', 'What should you check for when editing a sentence?', ['Spelling and punctuation', "Nothing, it's already perfect", 'The title only'], 0, 'Editing means checking for spelling, grammar, and punctuation mistakes.'),
      mcq('g2-writing-edit-revise-i2', "'Revising' mostly means:", ['Making your writing clearer and better', 'Erasing everything', "Copying someone else's work"], 0, 'Revising is about improving your ideas and wording, not starting over.'),
    ]),
  ]),
]);
