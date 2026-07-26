import { node, phrase, speakBlock, subjectPath } from './helpers';

export const g4Speaking = subjectPath('4', 'speaking', [
  node('g4-speaking-formal-presentations', 0, 'Formal Presentations', 'formal-presentations', 0.7, [
    speakBlock('g4-speaking-formal-presentations-speak', 'Practice a formal opening, body line, and closing.', [
      phrase('g4-speaking-formal-presentations-p1', 'Good afternoon, honored guests and classmates.'),
      phrase('g4-speaking-formal-presentations-p2', 'Today, I will be presenting my research on renewable energy.'),
      phrase('g4-speaking-formal-presentations-p3', 'In conclusion, solar power is a promising solution for our future.'),
    ]),
  ]),
  node('g4-speaking-persuasive-argument', 1, 'Persuasive Argument', 'persuasive-argument', 0.7, [
    speakBlock('g4-speaking-persuasive-argument-speak', 'Speak with conviction — you are trying to win people over.', [
      phrase('g4-speaking-persuasive-argument-p1', 'Our school should start a recycling program because it protects the environment.'),
      phrase('g4-speaking-persuasive-argument-p2', 'Recycling reduces waste and saves natural resources.'),
      phrase('g4-speaking-persuasive-argument-p3', 'I urge you to support this important change.'),
    ]),
  ]),
  node('g4-speaking-debate-rebuttal', 2, 'Debate & Rebuttal', 'debate-and-rebuttal', 0.7, [
    speakBlock('g4-speaking-debate-rebuttal-speak', 'Practice responding to the other side calmly and clearly.', [
      phrase('g4-speaking-debate-rebuttal-p1', 'I understand your point, but the evidence suggests otherwise.'),
      phrase('g4-speaking-debate-rebuttal-p2', 'While that may be true, we must also consider the long-term effects.'),
      phrase('g4-speaking-debate-rebuttal-p3', "In rebuttal, I'd like to point out that our facts come from a reliable source."),
    ]),
  ]),
  node('g4-speaking-poetry-recitation', 3, 'Poetry Recitation', 'poetry-recitation', 0.7, [
    speakBlock('g4-speaking-poetry-recitation-speak', 'Recite each line with feeling and the right pace.', [
      phrase('g4-speaking-poetry-recitation-p1', 'Two roads diverged in a wood, and I— I took the one less traveled by.'),
      phrase('g4-speaking-poetry-recitation-p2', 'Hope is the thing with feathers, that perches in the soul.'),
      phrase('g4-speaking-poetry-recitation-p3', 'Whose woods these are I think I know.'),
    ]),
  ]),
  node('g4-speaking-research-presentation', 4, 'Research Presentation', 'research-presentation', 0.7, [
    speakBlock('g4-speaking-research-presentation-speak', 'Present your findings clearly, one point at a time.', [
      phrase('g4-speaking-research-presentation-p1', 'My research question was: how do bees help our ecosystem?'),
      phrase('g4-speaking-research-presentation-p2', 'According to my sources, bees pollinate one third of the food we eat.'),
      phrase('g4-speaking-research-presentation-p3', 'This matters because without bees, many crops would disappear.'),
    ]),
  ]),
]);
