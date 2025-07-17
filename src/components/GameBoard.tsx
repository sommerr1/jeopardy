import React, { useEffect, useRef, useState } from "react";
import { Question } from "../App";

type Props = {
  questions: Question[];
  answered: { [key: string]: boolean };
  onSelect: (q: Question) => void;
  wrongAnswers?: Question[];
  started: boolean;
};

export function GameBoard({ questions, answered, onSelect, wrongAnswers = [], started }: Props) {
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
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-0 mt-2" key={cat}>
            <div className="font-semibold">{cat}</div>
            {difficulties.map((diff) => {
              const q = questions.find(
                (q) => q.category === cat && q.difficulty === diff
              );
              // Проверяем, был ли этот вопрос отвечен неверно
              const isWrong = q && wrongAnswers.some(w => w.question === q.question);
              const isCorrect = q && answered[q.question] && !isWrong;
              return (
                <button
                  key={diff}
                  style={{ width: "60%" }}
                  className={`h-16 rounded-lg border flex flex-col items-center justify-center text-lg font-bold transition
                    ${q && !answered[q.question] ? "bg-white hover:bg-blue-100" : "bg-gray-200 cursor-not-allowed"}
                    ${isWrong ? "border-4 border-red-500" : isCorrect ? "border-4 border-green-500" : ""}`}
                  disabled={!q || answered[q.question]}
                  onClick={() => q && onSelect(q)}
                >
                  {q && !answered[q.question] ? (
                    q.rate ? <span className="text-xl text-blue-700 mt-1">{q.rate}</span> : "?"
                  ) : (
                    q && q.rate ? <span className="text-xl text-gray-400 mt-1">{q.rate}</span> : q ? "-" : "-"
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="w-72 ml-6 flex flex-col items-start">
        <div className="text-sm">
          {wrongAnswers.length > 0
            ? wrongAnswers.map((q, idx) => {
                const wrong = q.options.find(opt => opt !== q.correct && !q.options.every(o => o === q.correct)) || '?';
                return (
                  <span key={wrong + q.correct}>
                    <span className="text-red-700"><s>{wrong}</s></span> (<span className="text-green-700">{q.correct}</span>){idx < wrongAnswers.length - 1 ? ', ' : ''}
                  </span>
                );
              })
            : null}
        </div>
      </div>
    </div>
  );
}