import React, { useEffect, useRef, useState } from "react";
import { Question } from "../types";

type Props = {
  questions: Question[];
  answered: { [key: string]: boolean };
  onSelect: (q: Question) => void;
  wronganswersstr?: string;
  started: boolean;
};

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

  const renderWrongAnswers = (str: string): React.ReactNode => {
    const regex = /([^,]+?) \(([^)]+)\)/g;
    const elements: React.ReactNode[] = [];
    let match;
    let idx = 0;
    while ((match = regex.exec(str)) !== null) {
      const [full, wrong, right] = match;
      elements.push(
        <span key={idx}>
          <span style={{ color: 'red', textDecoration: 'line-through' }}>{wrong.trim()}</span>
          <span style={{ color: 'green' }}> ({right})</span>
          {regex.lastIndex < str.length ? ', ' : ''}
        </span>
      );
      idx++;
    }
    return elements;
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
              // Проверяем, был ли этот вопрос отвечен неверно через wronganswersstr
              let isWrong = false;
              if (q && wronganswersstr) {
                // ищем любую пару wrong (correct) из вариантов, кроме правильного
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
                <button
                  key={diff}
                  style={{ width: q && (!answered[q.question] || isWrong) ? '72%' : '60%' }}
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
          {wronganswersstr && renderWrongAnswers(wronganswersstr)}
        </div>
      </div>
    </div>
  );
}