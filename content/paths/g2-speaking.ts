import { node, phrase, speakBlock, subjectPath } from './helpers';

export const g2Speaking = subjectPath('2', 'speaking', [
  node('g2-speaking-clear-pronunciation', 0, 'Clear Pronunciation', 'clear-pronunciation', 0.65, [
    speakBlock('g2-speaking-clear-pronunciation-speak', 'Sound out each tricky word slowly, then say it at normal speed.', [
      phrase('g2-speaking-clear-pronunciation-p1', 'Thermometer', 'ther-MOM-eh-ter'),
      phrase('g2-speaking-clear-pronunciation-p2', 'Library', 'LY-brer-ee'),
      phrase('g2-speaking-clear-pronunciation-p3', 'February', 'FEB-roo-air-ee'),
    ]),
  ]),
  node('g2-speaking-retell-with-detail', 1, 'Retell with Detail', 'retell-with-detail', 0.65, [
    speakBlock('g2-speaking-retell-with-detail-speak', 'Add detail as you retell each part.', [
      phrase('g2-speaking-retell-with-detail-p1', 'The main character was a young girl named Mia.'),
      phrase('g2-speaking-retell-with-detail-p2', 'She discovered a hidden door in her garden.'),
      phrase('g2-speaking-retell-with-detail-p3', 'Behind the door was a tiny, glowing forest.'),
    ]),
  ]),
  node('g2-speaking-opinion-sharing', 2, 'Opinion Sharing', 'opinion-sharing', 0.65, [
    speakBlock('g2-speaking-opinion-sharing-speak', 'Say your opinion and your reason clearly.', [
      phrase('g2-speaking-opinion-sharing-p1', 'I think recess should be longer because we need exercise.'),
      phrase('g2-speaking-opinion-sharing-p2', 'My favorite subject is science because experiments are fun.'),
      phrase('g2-speaking-opinion-sharing-p3', 'I believe dogs make great pets because they are loyal.'),
    ]),
  ]),
  node('g2-speaking-presentation-basics', 3, 'Presentation Basics', 'presentation-basics', 0.65, [
    speakBlock('g2-speaking-presentation-basics-speak', 'Practice a mini presentation opening, body, and closing.', [
      phrase('g2-speaking-presentation-basics-p1', 'Good morning, everyone. Today I will talk about volcanoes.'),
      phrase('g2-speaking-presentation-basics-p2', 'First, let me explain what a volcano is.'),
      phrase('g2-speaking-presentation-basics-p3', 'Thank you for listening to my presentation.'),
    ]),
  ]),
  node('g2-speaking-conversation-turns', 4, 'Conversation Turns', 'conversation-turns', 0.65, [
    speakBlock('g2-speaking-conversation-turns-speak', 'Practice keeping a conversation going.', [
      phrase('g2-speaking-conversation-turns-p1', "That's interesting! Can you tell me more?"),
      phrase('g2-speaking-conversation-turns-p2', 'I agree with you, and I also think...'),
      phrase('g2-speaking-conversation-turns-p3', 'It was nice talking with you!'),
    ]),
  ]),
]);
