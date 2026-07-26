export interface BehaviorSignal {
  /** Wrong answers in a row on the current node. Resets on a correct answer or a new node. */
  consecutiveWrong: number;
  /** How long the kid has been sitting on the current item. */
  msOnCurrentItem: number;
  /** Answers submitted implausibly fast — a sign of guessing rather than reading. */
  rapidGuessCount: number;
}

export const INITIAL_BEHAVIOR_SIGNAL: BehaviorSignal = {
  consecutiveWrong: 0,
  msOnCurrentItem: 0,
  rapidGuessCount: 0,
};
