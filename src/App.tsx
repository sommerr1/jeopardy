import React, { useState, useEffect, useRef } from "react";
import { fetchQuestions } from "./utils/fetchQuestions";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { GameBoard } from "./components/GameBoard";
import { QuestionModal } from "./components/QuestionModal";
import { ScoreBoard } from "./components/ScoreBoard";

export type Question = {
  category: string;
  difficulty: string;
  question: string;
  correct: string;
  options: string[];
  explanation: string;
  rate?: number; // Добавлено поле рейт (может быть undefined)
};

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState<Question | null>(null);
  const [answered, setAnswered] = useState<{ [key: string]: boolean }>({});
  const [score, setScore] = useState(0);
  const [showCoin, setShowCoin] = useState(0);
  const [coinOrigin, setCoinOrigin] = useState<{ x: number; y: number } | null>(null);
  const [totalCoins, setTotalCoins] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<Question[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchQuestions().then(setQuestions);
  }, []);

  useEffect(() => {
    console.log("ANSWERED STATE:", answered);
  }, [answered]);

  const handleStart = () => setStarted(true);

  const handleSelect = (q: Question) => setSelected(q);

  const handleAnswer = (answer: string) => {
    if (!selected) return;
    const isCorrect = answer === selected.correct;
    setAnswered((prev: { [key: string]: boolean }) => ({ ...prev, [selected.question]: true }));
    setScore((s: number) => s + (isCorrect ? 1 : 0));
    if (isCorrect) {
      // Получаем координаты центра модалки
      if (modalRef.current) {
        const rect = modalRef.current.getBoundingClientRect();
        setCoinOrigin({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
      if (typeof selected?.rate === 'number' && !isNaN(selected.rate)) {
        setShowCoin((c: number) => c + Math.floor(selected.rate! / 10));
        setTotalCoins((prev) => prev + selected.rate!);
      }
    } else {
      setWrongAnswers((prev) => [...prev, selected]);
    }
  };

  const handleCloseModal = () => {
    setSelected(null);
  };

  const handleCoinAnimationEnd = () => {
    setShowCoin((c: number) => Math.max(0, c - 1));
  };

  if (!started) return <WelcomeScreen onStart={handleStart} />;

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center">
      <ScoreBoard
        score={score}
        total={Object.keys(answered).length}
        showCoin={showCoin}
        onCoinAnimationEnd={handleCoinAnimationEnd}
        coinOrigin={coinOrigin}
        coins={totalCoins}
      />
      <GameBoard
        questions={questions}
        answered={answered}
        onSelect={handleSelect}
        wrongAnswers={wrongAnswers}
      />
      {selected && (
        <QuestionModal
          question={selected}
          onAnswer={handleAnswer}
          answered={answered[selected.question]}
          onClose={handleCloseModal}
          modalRef={modalRef}
        />
      )}
    </div>
  );
} 