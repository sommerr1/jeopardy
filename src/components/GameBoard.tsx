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
      style={{ width: q && (!answered || isWrong) ? '72%' : '60%' }}
      className={`cell-btn ${q && !answered ? "bg-white hover:bg-blue-100" : "bg-gray-200 cursor-not-allowed"} ${isWrong ? "border-4 border-red-500" : isCorrect ? "border-4 border-green-500" : ""}`}
      disabled={!q || answered}
      onClick={() => q && onSelect(q)}
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
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-0 mt-2" key={cat}>
      <div className="font-semibold">{cat}</div>
      {difficulties.map((diff) => {
        const q = questions.find(
          (q) => q.category === cat && q.difficulty === diff
        );
        let isWrong = false;
        if (q && wronganswersstr) {
          for (const opt of q.options) {
            if (opt !== q.correct) {
              const pattern = `${opt} (${q.correct})`;
              if (wronganswersstr.includes(pattern)) {
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
    <div className="w-full max-w-3xl mt-8 flex">
      <div className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-0">
          <div></div>
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
      <div className="w-72 ml-6 flex flex-col items-start">
        <div className="text-sm">
          {wronganswersstr && renderWrongAnswers(wronganswersstr)}
        </div>
      </div>
    </div>
  );
}