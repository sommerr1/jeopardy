import React from "react";
import { Question } from "../App";

type Props = {
  questions: Question[];
  answered: { [key: string]: boolean };
  onSelect: (q: Question) => void;
};

export function GameBoard({ questions, answered, onSelect }: Props) {
  console.log("GameBoard questions:", questions);
  // Группируем по категориям и сложности
  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const difficulties = Array.from(new Set(questions.map((q) => q.difficulty)));

  return (
    <div className="w-full max-w-3xl mt-8">
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
                className={`h-16 rounded-lg border flex items-center justify-center text-lg font-bold transition
                  ${q && !answered[q.question] ? "bg-white hover:bg-blue-100" : "bg-gray-200 cursor-not-allowed"}
                `}
                disabled={!q || answered[q.question]}
                onClick={() => q && onSelect(q)}
              >
                {q ? "?" : "-"}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
} 