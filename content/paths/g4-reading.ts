import { mcq, node, questionBlock, subjectPath } from './helpers';

export const g4Reading = subjectPath('4', 'reading', [
  node('g4-reading-figurative-language', 0, 'Figurative Language', 'figurative-language', 0.8, [
    questionBlock('g4-reading-figurative-language-q1', 'Spot the figure of speech.', [
      mcq('g4-reading-figurative-language-i1', "'The wind whispered through the trees' is an example of:", ['Personification', 'A fact', 'A rhyme'], 0, 'Giving the wind a human ability (whispering) is personification.'),
      mcq('g4-reading-figurative-language-i2', "'Her smile was as bright as the sun' is an example of:", ['Metaphor', 'Simile', 'Onomatopoeia'], 1, "A simile compares two things using 'like' or 'as'."),
    ]),
  ]),
  node('g4-reading-comprehension-analysis', 1, 'Comprehension Analysis', 'comprehension-analysis', 0.8, [
    questionBlock('g4-reading-comprehension-analysis-q1', 'Analyze the character.', [
      mcq('g4-reading-comprehension-analysis-i1', 'If a character shares his lunch with a hungry classmate, this shows he is:', ['Selfish', 'Kind', 'Lazy'], 1, 'Sharing with someone in need is a sign of kindness.'),
      mcq('g4-reading-comprehension-analysis-i2', 'A character who studies every night before a test is most likely:', ['Careless', 'Responsible', 'Rude'], 1, 'Studying regularly is a sign of a responsible character.'),
    ]),
  ]),
  node('g4-reading-nonfiction-features', 2, 'Nonfiction Text Features', 'nonfiction-text-features', 0.8, [
    questionBlock('g4-reading-nonfiction-features-q1', 'Find your way around the page.', [
      mcq('g4-reading-nonfiction-features-i1', 'Where would you look to quickly find a topic in a nonfiction book?', ['The index', 'The cover', 'The last page'], 0, 'The index lists topics alphabetically with page numbers.'),
      mcq('g4-reading-nonfiction-features-i2', 'Bold words in a textbook usually mean:', ['The word is unimportant', 'The word is a key term', 'The word is spelled wrong'], 1, 'Bold text usually highlights an important vocabulary word.'),
    ]),
  ]),
  node('g4-reading-theme', 3, 'Theme Identification', 'theme-identification', 0.8, [
    questionBlock('g4-reading-theme-q1', 'Find the lesson.', [
      mcq('g4-reading-theme-i1', 'A story where a slow turtle beats a fast rabbit in a race most likely teaches:', ['Speed always wins', 'Slow and steady wins the race', 'Rabbits are lazy'], 1, 'The classic lesson of this story is that persistence beats overconfidence.'),
      mcq('g4-reading-theme-i2', 'A story about a girl who keeps trying after failing many times teaches a theme about:', ['Giving up', 'Perseverance', 'Being afraid'], 1, 'Continuing to try despite failure is the definition of perseverance.'),
    ]),
  ]),
  node('g4-reading-authors-purpose', 4, "Author's Purpose", 'authors-purpose', 0.8, [
    questionBlock('g4-reading-authors-purpose-q1', 'Why did the author write this?', [
      mcq('g4-reading-authors-purpose-i1', 'A text that teaches you how to bake cookies was written to:', ['Persuade', 'Inform/Instruct', 'Entertain'], 1, 'Step-by-step instructions are meant to inform or instruct the reader.'),
      mcq('g4-reading-authors-purpose-i2', 'A silly poem about a dancing dinosaur was written to:', ['Persuade', 'Entertain', 'Inform'], 1, 'A silly, playful poem is meant to entertain.'),
    ]),
  ]),
]);
