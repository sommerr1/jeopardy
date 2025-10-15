import React, { useEffect, useRef, useState } from "react";
import { Question } from "../types";
import { renderWrongAnswers } from '../utils/renderWrongAnswers';

type Props = {
  questions: Question[];
  answered: { [key: string]: boolean };
  onSelect: (q: Question) => void;
  wronganswersstr?: string;
  started: boolean;
};

// Компонент для отдельной ячейки
function GameCell({ q, answered, isWrong, isCorrect, onSelect }: {
  q: Question | undefined;
  answered: boolean;
  isWrong: boolean;
  isCorrect: boolean;
  onSelect: (q: Question) => void;
}) {
  return (
    <button
      className={`w-full cell-btn ${q && !answered ? "bg-white hover:bg-blue-100" : "bg-gray-200 cursor-not-allowed"} ${isWrong ? "border-4 border-red-500" : isCorrect ? "border-4 border-green-500" : ""}`}
      disabled={!q || answered}
      onClick={() => q && onSelect(q)}
      data-testid={q ? "question-cell" : "empty-cell"}
    >
      {q && !answered ? (
        q.rate ? <span className="text-xl text-blue-700 mt-1">{q.rate}</span> : "?"
      ) : (
        q && q.rate ? <span className="text-xl text-gray-400 mt-1">{q.rate}</span> : q ? "-" : "-"
      )}
    </button>
  );
}

// Компонент для строки категории
function CategoryRow({ cat, difficulties, questions, answered, wronganswersstr, onSelect }: {
  cat: string;
  difficulties: string[];
  questions: Question[];
  answered: { [key: string]: boolean };
  wronganswersstr: string;
  onSelect: (q: Question) => void;
}) {
  return (
    <div
      className="grid gap-0 mt-2"
      key={cat}
      style={{ gridTemplateColumns: `minmax(56px, max-content) repeat(${difficulties.length}, minmax(48px, 1fr))` }}
    >
      <div className="font-semibold pr-3">{cat}</div>
      {difficulties.map((diff) => {
        const q = questions.find(
          (q) => q.category === cat && q.difficulty === diff
        );
        let isWrong = false;
        if (q && wronganswersstr) {
          // Проверяем, был ли дан неправильный ответ именно для этого вопроса
          // Ищем паттерн, который содержит неправильный ответ для этого конкретного вопроса
          const wrongAnswers = wronganswersstr.split(', ');
          for (const wrongAnswer of wrongAnswers) {
            if (wrongAnswer.includes(`(${q.correct})`)) {
              // Проверяем, что это действительно неправильный ответ для этого вопроса
              const wrongPart = wrongAnswer.split(' (')[0];
              if (q.options.includes(wrongPart) && wrongPart !== q.correct) {
                isWrong = true;
                break;
              }
            }
          }
        }
        const isCorrect = q && answered[q.question] && !isWrong;
        return (
          <GameCell
            key={diff}
            q={q}
            answered={!!(q && answered[q.question])}
            isWrong={isWrong}
            isCorrect={!!isCorrect}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}

export function GameBoard({ questions, answered, onSelect, wronganswersstr = "", started }: Props) {
  console.log("GameBoard questions:", questions);
  // Категории только из переданных вопросов (максимум 5)
  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const difficulties = Array.from(new Set(questions.map((q) => q.difficulty)));

  const [totalCoins, setTotalCoins] = useState(0);
  const pendingScoreRef = useRef(0);
  const [showCoin, setShowCoin] = useState(0);

  useEffect(() => {
    if (!started || questions.length === 0) return;
    if (showCoin === 0 && pendingScoreRef.current > 0) {
      setTotalCoins((prev) => prev + pendingScoreRef.current);
      pendingScoreRef.current = 0;
    }
  }, [questions, started, showCoin]);

  const handleCoinAnimationEnd = () => {
    setShowCoin((c) => Math.max(0, c - 1));
  };

  return (
    <div className="w-full max-w-3xl mt-4 flex flex-col md:flex-row px-2" data-testid="game-board">
      <div className="flex-1">
        <div className="overflow-x-auto">
          <div
            className="grid gap-0 min-w-[420px] sm:min-w-0"
            style={{ gridTemplateColumns: `minmax(56px, max-content) repeat(${difficulties.length}, minmax(48px, 1fr))` }}
          >
            <div className="pr-3"></div>
            {difficulties.map((d) => (
              <div key={d} className="flex justify-center font-bold items-center h-12">{d}</div>
            ))}
          </div>
          {categories.map((cat) => (
            <CategoryRow
              key={cat}
              cat={cat}
              difficulties={difficulties}
              questions={questions}
              answered={answered}
              wronganswersstr={wronganswersstr}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
      <div className="w-full md:w-72 md:ml-6 mt-4 md:mt-0 flex flex-col items-start">
        <div className="text-sm w-full">
          {wronganswersstr && renderWrongAnswers(wronganswersstr)}
        </div>
      </div>
    </div>
  );
}