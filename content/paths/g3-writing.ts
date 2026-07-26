import { mcq, node, questionBlock, subjectPath } from './helpers';

export const g3Writing = subjectPath('3', 'writing', [
  node('g3-writing-narrative', 0, 'Narrative Writing', 'narrative-writing', 0.8, [
    questionBlock('g3-writing-narrative-q1', 'Tell a story.', [
      mcq('g3-writing-narrative-i1', 'A narrative is best described as:', ['A story with characters and events', 'A list of facts', 'A set of directions'], 0, 'Narratives tell a story with characters, a setting, and events.'),
      mcq('g3-writing-narrative-i2', 'Narratives usually have a beginning, middle, and:', ['End', 'Title only', 'Index'], 0, 'Every story needs an ending to feel complete.'),
    ]),
  ]),
  node('g3-writing-persuasive', 1, 'Persuasive Writing', 'persuasive-writing', 0.8, [
    questionBlock('g3-writing-persuasive-q1', 'Convince the reader.', [
      mcq('g3-writing-persuasive-i1', 'Persuasive writing tries to:', ['Convince the reader of something', 'Just tell a story', 'List random facts'], 0, 'Persuasive writing aims to change the reader’s mind or convince them to act.'),
      mcq('g3-writing-persuasive-i2', 'Which sentence is persuasive?', ['The park has 3 benches.', "Everyone should visit the park because it's amazing!", 'The park opened in 1990.'], 1, 'This sentence urges the reader to do something and gives a reason.'),
    ]),
  ]),
  node('g3-writing-transitions', 2, 'Paragraph Transitions', 'paragraph-transitions', 0.8, [
    questionBlock('g3-writing-transitions-q1', 'Connect your ideas smoothly.', [
      mcq('g3-writing-transitions-i1', 'Which word helps transition to a new idea?', ['However', 'Dog', 'Purple'], 0, "'However' signals a shift or contrast between ideas."),
      mcq('g3-writing-transitions-i2', 'Transition words help readers understand:', ['How ideas connect', 'The color of the page', 'Nothing important'], 0, 'Transitions show the reader how one idea leads to the next.'),
    ]),
  ]),
  node('g3-writing-parts-of-speech', 3, 'Grammar: Parts of Speech', 'grammar-parts-of-speech', 0.8, [
    questionBlock('g3-writing-parts-of-speech-q1', 'Identify the job each word does.', [
      mcq('g3-writing-parts-of-speech-i1', "In 'The quick fox jumps,' which word is the verb?", ['quick', 'fox', 'jumps'], 2, 'A verb shows action — "jumps" is the action word here.'),
      mcq('g3-writing-parts-of-speech-i2', "Which word is a noun in 'The dog barked loudly'?", ['dog', 'barked', 'loudly'], 0, 'A noun names a person, place, animal, or thing — "dog" is the noun.'),
    ]),
  ]),
  node('g3-writing-edit-revise', 4, 'Edit & Revise', 'edit-and-revise', 0.8, [
    questionBlock('g3-writing-edit-revise-q1', 'Fix it up.', [
      mcq('g3-writing-edit-revise-i1', 'Which sentence is grammatically correct?', ['She go to school.', 'She goes to school.', 'She goed to school.'], 1, "'Goes' is the correct verb form for 'she' in the present tense."),
      mcq('g3-writing-edit-revise-i2', 'Editing mainly focuses on fixing:', ['Spelling, grammar, and punctuation', "The story's characters", 'The illustrations'], 0, 'Editing is a technical pass — fixing mechanics, not rewriting the story.'),
    ]),
  ]),
]);
