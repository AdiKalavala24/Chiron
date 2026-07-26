import { chatTutorBlock, gameBlock, mcq, node, phrase, speakBlock, subjectPath } from './helpers';

/**
 * Flagship path — exercises speak_practice, chat_tutor, and game_3d
 * (Echo Tower) with real content.
 */
export const g3Speaking = subjectPath('3', 'speaking', [
  node('g3-speaking-public-speaking-basics', 0, 'Public Speaking Basics', 'public-speaking-basics', 0.65, [
    speakBlock('g3-speaking-public-speaking-basics-speak', 'Stand tall, speak slowly, and practice each line.', [
      phrase('g3-speaking-public-speaking-basics-p1', 'Hello everyone, my name is Alex.'),
      phrase('g3-speaking-public-speaking-basics-p2', 'Today I want to share something exciting with you.'),
      phrase('g3-speaking-public-speaking-basics-p3', 'Thank you for your attention.'),
    ]),
  ]),
  node('g3-speaking-persuasive-speaking', 1, 'Persuasive Speaking', 'persuasive-speaking', 0.65, [
    chatTutorBlock('g3-speaking-persuasive-speaking-chat', {
      persona: 'Debate Duck',
      openingLine: "Quack! I heard you have an opinion about something — what's a rule at school you'd want to change, and why?",
      objective: 'Practice building a short persuasive argument with a claim and a reason, spoken aloud.',
      maxTurns: 5,
      sampleProbes: ["What's your main reason?", 'Can you think of one more reason?', 'How would you convince someone who disagrees?'],
    }),
  ]),
  node('g3-speaking-storytelling-aloud', 2, 'Storytelling Aloud', 'storytelling-aloud', 0.65, [
    speakBlock('g3-speaking-storytelling-aloud-speak', 'Tell the story with your best story-voice.', [
      phrase('g3-speaking-storytelling-aloud-p1', 'Once upon a time, in a village by the sea...'),
      phrase('g3-speaking-storytelling-aloud-p2', 'The hero faced a giant wave that blocked the only path home.'),
      phrase('g3-speaking-storytelling-aloud-p3', 'With courage and a clever plan, the hero found a way through.'),
    ]),
  ]),
  node('g3-speaking-debate-basics', 3, 'Debate Basics', 'debate-basics', 0.65, [
    chatTutorBlock('g3-speaking-debate-basics-chat', {
      persona: 'Debate Duck',
      openingLine: "Let's practice debating! Should students have homework on weekends? What do you think?",
      objective: 'Practice stating a position out loud and defending it with a reason and a rebuttal.',
      maxTurns: 5,
      sampleProbes: ["What's the other side's best argument?", 'How would you respond to that?'],
    }),
  ]),
  node('g3-speaking-presentation-practice', 4, 'Presentation Practice', 'presentation-practice', 0.65, [
    gameBlock(
      'g3-speaking-presentation-practice-game',
      'echo_tower',
      'Clear Speech',
      3,
      'Speak each magic phrase clearly to add a block to your tower.',
      [
        mcq(
          'g3-speaking-presentation-practice-g-check',
          'Which delivery builds the strongest tower block?',
          ['Mumbling quietly', 'Speaking clearly at a steady pace', 'Speaking as fast as possible'],
          1,
          'Echo Tower rewards clear, steady speech — the clearer you are, the stronger the block.',
        ),
      ],
      [
        phrase('g3-speaking-presentation-practice-sp1', 'Rise, tower, rise!'),
        phrase('g3-speaking-presentation-practice-sp2', 'Stone by stone, my voice is strong.'),
        phrase('g3-speaking-presentation-practice-sp3', 'Clear and steady wins the tower.'),
      ],
    ),
  ]),
]);
