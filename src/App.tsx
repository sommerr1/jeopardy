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
  const [pendingScore, setPendingScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentRows, setCurrentRows] = useState<string[]>([]); // категории текущего уровня
  const [usedRows, setUsedRows] = useState<Set<string>>(new Set()); // уже использованные категории
  // Track if it's the first round after game start
  const [firstRound, setFirstRound] = useState(true);

  useEffect(() => {
    fetchQuestions().then(setQuestions);
  }, []);

  useEffect(() => {
    console.log("ANSWERED STATE:", answered);
  }, [answered]);

  useEffect(() => {
    console.log("showCoin:", showCoin);
  }, [showCoin]);

  useEffect(() => {
    console.log("totalCoins:", totalCoins);
  }, [totalCoins]);

  useEffect(() => {
    console.log("pendingScore:", pendingScore);
  }, [pendingScore]);

  // Set currentRows only once when questions are first loaded
  useEffect(() => {
    if (questions.length > 0) {
      const allCategories = Array.from(new Set(questions.map(q => q.category)));
      const available = allCategories.filter(cat => !usedRows.has(cat));
      let selected: string[] = [];
      if (available.length <= 2) {
        selected = available;
      } else {
        while (selected.length < 2) {
          const idx = Math.floor(Math.random() * available.length);
          const cat = available[idx];
          if (!selected.includes(cat)) selected.push(cat);
        }
      }
      setCurrentRows(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  // Update currentRows on level or usedRows change, but not on initial questions load
  useEffect(() => {
    if (questions.length > 0 && (level > 1 || usedRows.size > 0)) {
      const allCategories = Array.from(new Set(questions.map(q => q.category)));
      const available = allCategories.filter(cat => !usedRows.has(cat));
      let selected: string[] = [];
      if (available.length <= 2) {
        selected = available;
      } else {
        while (selected.length < 2) {
          const idx = Math.floor(Math.random() * available.length);
          const cat = available[idx];
          if (!selected.includes(cat)) selected.push(cat);
        }
      }
      setCurrentRows(selected);
    }
  }, [level, usedRows, questions.length]);

  // Set currentRows when questions are loaded and game is started (first round)
  useEffect(() => {
    if (started && questions.length > 0 && firstRound) {
      const allCategories = Array.from(new Set(questions.map(q => q.category)));
      let selected: string[] = [];
      if (allCategories.length <= 2) {
        selected = allCategories;
      } else {
        while (selected.length < 2) {
          const idx = Math.floor(Math.random() * allCategories.length);
          const cat = allCategories[idx];
          if (!selected.includes(cat)) selected.push(cat);
        }
      }
      setCurrentRows(selected);
      setFirstRound(false);
    }
  }, [started, questions, firstRound]);

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
        // 1. Сразу начисляем очки
        setTotalCoins((prev) => prev + selected.rate!);
        // 2. Запускаем анимацию монет
        const coinsToAnimate = Math.floor(selected.rate! / 10);
        console.log('selected.rate:', selected.rate, 'coinsToAnimate:', coinsToAnimate);
        if (coinsToAnimate > 0) {
          setShowCoin((c) => c + coinsToAnimate);
        }
      } else {
        console.log('selected.rate is not a valid number:', selected?.rate);
      }
    } else {
      setWrongAnswers((prev) => [...prev, selected]);
    }
    // Проверяем, все ли вопросы из текущих 5 строк отвечены
    const currentQuestions = questions.filter(q => currentRows.includes(q.category));
    const allAnswered = currentQuestions.every(q => answered[q.question] || (q.question === selected.question));
    if (allAnswered) {
      // Проверяем, были ли ошибки на этом уровне
      const anyWrong = currentQuestions.some(q => wrongAnswers.some(w => w.question === q.question) || (!isCorrect && q.question === selected.question));
      setUsedRows(prev => {
        const next = new Set(prev);
        currentRows.forEach(cat => next.add(cat));
        return next;
      });
      if (!anyWrong) {
        setLevel(l => l + 1);
      }
    }
  };

  const handleCloseModal = () => {
    setSelected(null);
  };

  const handleCoinAnimationEnd = () => {
    console.log('handleCoinAnimationEnd called, showCoin:', showCoin);
    setShowCoin((c) => Math.max(0, c - 1));
  };

  // Helper to check if all current questions are answered
  const allCurrentAnswered = questions.length > 0 && currentRows.length > 0 && questions.filter(q => currentRows.includes(q.category)).every(q => answered[q.question]);

  // Проверяем, остались ли ещё категории для новых вопросов
  const availableCategories = questions.length > 0
    ? Array.from(new Set(questions.map(q => q.category))).filter(cat => !usedRows.has(cat))
    : [];
  const hasMoreQuestions = availableCategories.length > 0;

  // Automatically go to next questions when all active cards are answered
  useEffect(() => {
    if (allCurrentAnswered && hasMoreQuestions) {
      handleNextQuestions();
    }
  }, [allCurrentAnswered, hasMoreQuestions]);

  // Handler for Next Questions button (subsequent rounds)
  const handleNextQuestions = () => {
    if (questions.length > 0) {
      const allCategories = Array.from(new Set(questions.map(q => q.category)));
      const available = allCategories.filter(cat => !usedRows.has(cat));
      let selected: string[] = [];
      if (available.length <= 2) {
        selected = available;
      } else {
        while (selected.length < 2) {
          const idx = Math.floor(Math.random() * available.length);
          const cat = available[idx];
          if (!selected.includes(cat)) selected.push(cat);
        }
      }
      setCurrentRows(selected);
      setAnswered({});
      setWrongAnswers([]);
    }
  };

  // Кнопка активна если все отвечены ИЛИ если новых вопросов больше нет
  const canShowNext = allCurrentAnswered || !hasMoreQuestions;

  // Helper to get image name for current level
  const getLevelImage = () => {
    // Full list of images in the folder for levels 1-22
    const availableImages = [
      'minecraft_bat_1.png',
      'minecraft_chicken_2.png',
      'minecraft_cod_3.png',
      'minecraft_cow_4.png',
      'minecraft_dolphin_5.png',
      'minecraft_glowsquid_6.png',
      'minecraft_horse_7.png',
      'minecraft_llama_8.png',
      'minecraft_muchroom_9.png',
      'minecraft_ocelot_10.png',
      'minecraft_parrot_11.png',
      'minecraft_pig_12.png',
      'minecraft_rabbit_13.png',
      'minecraft_salmon_14.png',
      'minecraft_sheep_15.png',
      'minecraft_snowgolem_16.png',
      'minecraft_squid_17.png',
      'minecraft_strider_18.png',
      'minecraft_turtle_19.png',
      'minecraft_villager_20.png',
      'minecraft_WanderingTrader_21.png',
      'minecraft_bee_22.png',
    ];
    // For levels 1-22, match by number after second underscore
    if (level <= 22) {
      const match = availableImages.find(name => {
        const parts = name.split('_');
        if (parts.length < 3) return false;
        const levelPart = parts[2].split('.')[0];
        return Number(levelPart) === level;
      });
      return match ? `/src/images/${match}` : `/src/images/${availableImages[0]}`;
    }
    // For level 23 and above, use the last image as fallback
    return `/src/images/${availableImages[availableImages.length - 1]}`;
  };

  if (!started) return <WelcomeScreen onStart={() => { setStarted(true); setFirstRound(true); }} />;

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center relative">
      {/* Top-right image and label for current level */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center' }}>
        <span className="mr-3 text-blue-700 font-bold" style={{ fontSize: 22 }}>Level: {level}</span>
        <img
          src={getLevelImage()}
          alt={`Level ${level}`}
          style={{ width: 360, height: 360, objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      <ScoreBoard
        score={score}
        total={Object.keys(answered).length}
        showCoin={showCoin}
        onCoinAnimationEnd={handleCoinAnimationEnd}
        coinOrigin={coinOrigin}
        coins={totalCoins}
        level={level}
      />
      <GameBoard
        questions={questions.filter(q => currentRows.includes(q.category))}
        answered={answered}
        onSelect={handleSelect}
        wrongAnswers={wrongAnswers}
        started={started}
      />
      {/* Следующие вопросы button removed, now handled automatically */}
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