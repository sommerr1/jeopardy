import type { Question } from "../types";

/** Уникальный ключ вопроса для answered-состояния */
export function getQuestionKey(q: Question): string {
  return `${q.category}|${q.difficulty}|${q.question}`;
}

/** Ключ ячейки доски (категория + сложность) */
export function getCellKey(q: Question): string {
  return `${q.category}|${q.difficulty}`;
}

/**
 * Вопросы как на доске: по одному на ячейку category+difficulty.
 * При дубликатах берётся первый (как questions.find в GameBoard).
 */
export function getBoardQuestions(questions: Question[], categories?: string[]): Question[] {
  const filtered = categories
    ? questions.filter((q) => categories.includes(q.category))
    : questions;

  const seen = new Set<string>();
  const result: Question[] = [];
  for (const q of filtered) {
    const cellKey = getCellKey(q);
    if (!seen.has(cellKey)) {
      seen.add(cellKey);
      result.push(q);
    }
  }
  return result;
}

/** Был ли дан неверный ответ на этот вопрос (логика как в GameBoard) */
export function isQuestionWrongInLevel(q: Question, wrongAnswersStr: string): boolean {
  if (!wrongAnswersStr) return false;
  const wrongAnswers = wrongAnswersStr.split(", ");
  for (const wrongAnswer of wrongAnswers) {
    if (wrongAnswer.includes(`(${q.correct})`)) {
      const wrongPart = wrongAnswer.split(" (")[0];
      if (q.options.includes(wrongPart) && wrongPart !== q.correct) {
        return true;
      }
    }
  }
  return false;
}
