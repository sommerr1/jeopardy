import React, { useState, forwardRef } from "react";
import { motion } from "framer-motion";
import { Question } from "../types";

type Props = {
  question: Question;
  onAnswer: (answer: string) => void;
  answered: boolean;
  onClose?: () => void;
  modalRef?: React.Ref<HTMLDivElement>;
};

export function QuestionModal({ question, onAnswer, answered, onClose, modalRef }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleClick = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    onAnswer(opt);
    setShowExplanation(true);
  };

  // Клик по оверлею закрывает модалку, если объяснение показано
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showExplanation && e.target === e.currentTarget) {
      setShowExplanation(false);
      setSelected(null);
      if (onClose) onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleOverlayClick}
    >
      <motion.div
        ref={modalRef}
        className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">{question.question}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {question.options.map((opt) => (
            <button
              key={opt}
              className={`py-2 px-4 rounded-lg border font-semibold transition
                ${
                  selected
                    ? opt === question.correct
                      ? "bg-green-300"
                      : opt === selected
                      ? "bg-red-300"
                      : "bg-gray-100"
                    : "bg-blue-100 hover:bg-blue-200"
                }
              `}
              disabled={!!selected}
              onClick={() => handleClick(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        {showExplanation && selected && (
          <div>
            <p className="font-bold mb-2">
              {selected === question.correct ? "Верно!" : "Неверно!"}
            </p>
            <p className="text-gray-600">{question.explanation}</p>
            {question.rate && (
              <p className="text-sm text-blue-700 mt-2">Рейт: {question.rate}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">Кликните вне окна, чтобы продолжить</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
} 