import React from "react";
import { Question } from "../App";

type Props = {
  questions: Question[];
  answered: { [key: string]: boolean };
  onSelect: (q: Question) => void;
  wrongAnswers?: Question[];
};

export function GameBoard({ questions, answered, onSelect, wrongAnswers = [] }: Props) {
  console.log("GameBoard questions:", questions);
  // Группируем по категориям и сложности
  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const difficulties = Array.from(new Set(questions.map((q) => q.difficulty)));

  return (
    <div className="w-full max-w-3xl mt-8 flex">
      <div className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-0">
          <div></div>
          {difficulties.map((d) => (
            <div key={d} className="text-center font-bold">{d}</div>
          ))}
        </div>
        {categories.map((cat) => (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-0 mt-2" key={cat}>
            <div className="font-semibold">{cat}</div>
            {difficulties.map((diff) => {
              const q = questions.find(
                (q) => q.category === cat && q.difficulty === diff
              );
              return (
                <button
                  key={diff}
                  style={{ width: "60%" }}
                  className={`h-16 rounded-lg border flex flex-col items-center justify-center text-lg font-bold transition
                    ${q && !answered[q.question] ? "bg-white hover:bg-blue-100" : "bg-gray-200 cursor-not-allowed"}
                  `}
                  disabled={!q || answered[q.question]}
                  onClick={() => q && onSelect(q)}
                >
                  {q && q.rate && !answered[q.question] ? (
                    <span className="text-xl text-blue-700 mt-1">{q.rate}</span>
                  ) : (
                    q ? "?" : "-"
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="w-72 ml-6 flex flex-col items-start">
        <h3 className="text-lg font-bold mb-2">Ошибки</h3>
        <div className="text-sm text-red-700">
          {wrongAnswers.length > 0
            ? wrongAnswers.map((q) => `${q.options.find(opt => opt !== q.correct && !q.options.every(o => o === q.correct)) || '?'}(${q.correct})`).join(', ')
            : 'Нет ошибок'}
        </div>
      </div>
    </div>
  );
} 