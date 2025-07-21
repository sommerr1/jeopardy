import React, { useState, useEffect, useRef } from "react";
import { fetchQuestionsFromSheet } from "./utils/fetchQuestions";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { GameBoard } from "./components/GameBoard";
import { QuestionModal } from "./components/QuestionModal";
import { ScoreBoard } from "./components/ScoreBoard";
import { Player, Question } from "./types";
import { EndScreen } from "./components/EndScreen";

// --- ФУНКЦИИ ДЛЯ РАБОТЫ С COOKIE (теперь для JSON) ---
function setCookie(name: string, value: any, days = 365) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const valueToStore = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${name}=${valueToStore}; expires=${expires}; path=/`;
}

function getCookie(name: string): any | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch (e) {
      return null;
    }
  }
  return null;
}

function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
// --- КОНЕЦ ФУНКЦИЙ COOKIE ---

// Флаг для включения/отключения отладочных кнопок
const SHOW_DEBUG_BUTTONS = true;

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Состояния для игроков
  const initialPlayers = useRef(getCookie('jeopardy_players') || []);
  const [players, setPlayers] = useState<Player[]>(initialPlayers.current);
  const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(null);
  
  // Состояния для текущей игры
  const [level, setLevel] = useState(1);
  const [totalCoins, setTotalCoins] = useState(0);
  const [hp, setHp] = useState(5);
  const [consecutiveCorrectLevels, setConsecutiveCorrectLevels] = useState(0);
  
  // Удаляем старый стейт 'started', он больше не нужен
  // const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState<Question | null>(null);
  const [answered, setAnswered] = useState<{ [key: string]: boolean }>({});
  const [score, setScore] = useState(0);
  const [showCoin, setShowCoin] = useState(0);
  const [coinOrigin, setCoinOrigin] = useState<{ x: number; y: number } | null>(null);
  const [wronganswersstr, setWronganswersstr] = useState("");
  // Добавляем отдельное состояние для ошибок текущего уровня
  const [wronganswersCurrentLevel, setWronganswersCurrentLevel] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);
  const [pendingScore, setPendingScore] = useState(0);
  const [currentRows, setCurrentRows] = useState<string[]>([]);
  const [usedRows, setUsedRows] = useState<Set<string>>(new Set());
  
  // Удаляем 'firstRound', т.к. логика теперь другая
  // const [firstRound, setFirstRound] = useState(true);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSheet) {
      fetchQuestionsFromSheet(selectedSheet).then(setQuestions);
    }
  }, [selectedSheet]);

  // 2. ЕДИНЫЙ useEffect для выбора категорий
  // Он заменяет три старых, дублирующих друг друга
  useEffect(() => {
    // Не запускаем, если нет вопросов или игрока
    if (questions.length === 0 || !currentPlayerName) {
      return;
    }

    const allCategories = Array.from(new Set(questions.map(q => q.category)));
    const available = allCategories.filter(cat => !usedRows.has(cat));

    if (available.length === 0) {
      setCurrentRows([]); // Больше нет доступных категорий
      return;
    }

    let selected: string[] = [];
    const count = Math.min(available.length, 2); // Берем 2 или меньше, если осталось мало

    while (selected.length < count) {
      const idx = Math.floor(Math.random() * available.length);
      const cat = available[idx];
      if (!selected.includes(cat)) {
        selected.push(cat);
      }
    }
    setCurrentRows(selected);
    // Запускается при смене игрока или когда меняется набор использованных рядов
  }, [currentPlayerName, usedRows, questions]);


  // Сохранение прогресса текущего игрока
  useEffect(() => {
    if (currentPlayerName) {
      const player = players.find(p => p.name === currentPlayerName);
      if (player) {
        setLevel(player.level);
        setTotalCoins(player.score);
        setHp(player.hp);
        setConsecutiveCorrectLevels(player.consecutiveCorrectLevels || 0);
      }
    }
  }, [currentPlayerName, players]);

  // Сохранение прогресса текущего игрока
  useEffect(() => {
    if (currentPlayerName) {
      const updatedPlayers = players.map(p => 
        p.name === currentPlayerName ? { ...p, level, score: totalCoins, hp, consecutiveCorrectLevels, nameOfSheet: selectedSheet || p.nameOfSheet || '' } : p
      );
      // Проверяем, действительно ли что-то изменилось, чтобы не перезаписывать куки без надобности
      if (JSON.stringify(updatedPlayers) !== JSON.stringify(players)) {
        setPlayers(updatedPlayers);
        setCookie('jeopardy_players', updatedPlayers);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, totalCoins, hp, consecutiveCorrectLevels, selectedSheet]);

  const handleLogout = () => {
    setCurrentPlayerName(null);
  };

  const resetGameSession = () => {
    setAnswered({});
    setWronganswersstr("");
    setUsedRows(new Set());
    setCurrentRows([]);
  };

  // --- ОТЛАДОЧНЫЙ ОБРАБОТЧИК ---
  const handleDebugAllButOne = () => {
    const questionsToAnswer = questions.filter(
      (q) => currentRows.includes(q.category) && !answered[q.question]
    );

    // Отвечаем на все вопросы, кроме последнего
    const questionsToProcess = questionsToAnswer.slice(0, -1);

    if (questionsToProcess.length === 0) return;

    const newAnswered = { ...answered };
    let scoreToAdd = 0;

    questionsToProcess.forEach((q) => {
      newAnswered[q.question] = true;
      scoreToAdd += q.rate || 0;
    });

    setAnswered(newAnswered);
    setTotalCoins((prev) => prev + scoreToAdd);
  };
  // --- КОНЕЦ ОТЛАДОЧНОГО ОБРАБОТЧИКА ---

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

  // Сохраняем уровень в куки при каждом изменении
  useEffect(() => {
    setCookie('jeopardy_level', String(level));
  }, [level]);


  const handleSelect = (q: Question) => setSelected(q);
  let anyWrong : boolean = false;
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
      setHp(h => h - 1);
      anyWrong = true; 
      // Формируем строку: неправильный (правильный)
      setWronganswersstr(prev => prev ? `${prev}, ${answer} (${selected.correct})` : `${answer} (${selected.correct})`);
      setWronganswersCurrentLevel(prev => prev ? `${prev}, ${answer} (${selected.correct})` : `${answer} (${selected.correct})`);
      setConsecutiveCorrectLevels(0);
    }
    // Проверяем, все ли вопросы из текущих 2 строк отвечены
    const currentQuestions = questions.filter(q => currentRows.includes(q.category));
    const allAnswered = currentQuestions.every(q => answered[q.question] || (q.question === selected.question));
    if (allAnswered) {
      // Проверяем, были ли ошибки на этом уровне (только по wronganswersCurrentLevel)
      //const anyWrong = currentQuestions.some(q => wronganswersCurrentLevel.includes(`${q.question} (${q.correct})`));
      console.log('anyWrong:', anyWrong, 'wronganswersCurrentLevel:', wronganswersCurrentLevel);
      if (!anyWrong) {
        setLevel(l => l + 1);
        const newConsecutiveLevels = consecutiveCorrectLevels + 1;
        setConsecutiveCorrectLevels(newConsecutiveLevels);
        if (newConsecutiveLevels === 3) {
          setHp(h => h + 1);
          setConsecutiveCorrectLevels(0);
        }
      }else{
        anyWrong = false;
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

  // --- ЛОГИКА ДЛЯ КНОПКИ "СЛЕДУЮЩИЕ ВОПРОСЫ" ---

  // Текущие вопросы на доске
  const currentQuestions = questions.filter(q => currentRows.includes(q.category));
  
  // Все ли текущие вопросы отвечены
  const allCurrentAnswered = currentQuestions.length > 0 && currentQuestions.every(q => answered[q.question]);

  // Есть ли неверный ответ в текущем наборе
  const anyWrongInCurrent = currentQuestions.some(q => wronganswersCurrentLevel.includes(`${q.question} (${q.correct})`));

  // Проверяем, остались ли ещё категории для новых вопросов
  const availableCategories = questions.length > 0
    ? Array.from(new Set(questions.map(q => q.category))).filter(cat => !usedRows.has(cat))
    : [];
  const hasMoreQuestions = availableCategories.length > 0;

  // Условие показа кнопки
  const canShowNextButton = (allCurrentAnswered || anyWrongInCurrent) && hasMoreQuestions;
  
  // --- ФУНКЦИЯ handleNextQuestions ---
  const handleNextQuestions = () => {
    setUsedRows(prev => {
      const next = new Set(prev);
      if (anyWrongInCurrent) {
        currentRows.forEach(cat => next.delete(cat));
      } else {
        currentRows.forEach(cat => next.add(cat));
      }
      return next;
    });
    // Сброс ошибок текущего уровня при переходе к новым вопросам
    setWronganswersCurrentLevel("");
    // Выбираем новые категории
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
  };
  // --- КОНЕЦ ЛОГИКИ ДЛЯ КНОПКИ ---

  // Этот useEffect заменен ручной кнопкой
  // useEffect(() => {
  //   if (allCurrentAnswered && hasMoreQuestions) {
  //     handleNextQuestions();
  //   }
  // }, [allCurrentAnswered, hasMoreQuestions]);

  // Эта функция больше не используется и, похоже, содержит баги
  // const handleNextQuestions = () => {
  //   setQuestions([]); // Сбросить вопросы, чтобы useEffect загрузил новые
  //   if (questions.length > 0) {
  //     const allCategories = Array.from(new Set(questions.map(q => q.category)));
  //     const available = allCategories.filter(cat => !usedRows.has(cat));
  //     let selected: string[] = [];
  //     if (available.length <= 2) {
  //       selected = available;
  //     } else {
  //       while (selected.length < 2) {
  //         const idx = Math.floor(Math.random() * available.length);
  //         const cat = available[idx];
  //         if (!selected.includes(cat)) selected.push(cat);
  //       }
  //     }
  //     setCurrentRows(selected);
  //     setAnswered({});
  //     setWrongAnswers([]);
  //   }
  // };

  // Кнопка активна если все отвечены ИЛИ если новых вопросов больше нет
  const canShowNext = allCurrentAnswered || !hasMoreQuestions;

  // Helper to get image name for current level
  const getLevelImage = () => {
    // Full list of images in the folder for levels 1-52
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
      'minecraft_tropicalfish_23.png',
      'minecraft_Allay_24.png',
      'minecraft_axolotl_25.png',
      'minecraft_cat_26.png',
      'minecraft_wolf_27.png',
      'minecraft_frog_28.png',
      'minecraft_zombie_29.png',
      'minecraft_skeleton_30.png',
      'minecraft_cavespider_31.png',
      'minecraft_spider_32.png',
      'minecraft_slime_33.png',
      'minecraft_magmacube_34.png',
      'minecraft_drowned_35.png',
      'minecraft_piglin_36.png',
      'minecraft_hoglin_37.png',
      'minecraft_zoglin_38.png',
      'minecraft_kreeper_39.png',
      'minecraft_vindicator_40.png',
      'minecraft_enderman_41.png',
      'minecraft_evoker_43.png',
      'minecraft_blaze_44.png',
      'minecraft_shulker_45.png',
      'minecraft_phantom_46.png',
      'minecraft_irongolem_47.png',
      'minecraft_elderguardian_48.png',
      'minecraft_ravager_49.png',
      'minecraft_warden_50.png',
      'minecraft_wither_51.png',
      'minecraft_enderdragon_52.png',
    ];
    // For levels 1-52, match by number after second underscore
    if (level <= 52) {
      const match = availableImages.find(name => {
        const parts = name.split('_');
        if (parts.length < 3) return false;
        const levelPart = parts[parts.length - 1].split('.')[0];
        return Number(levelPart) === level;
      });
      return match ? `/src/images/${match}` : `/src/images/${availableImages[0]}`;
    }
    // For level 53 and above, use the last image as fallback
    return `/src/images/${availableImages[availableImages.length - 1]}`;
  };

  // --- ОБРАБОТЧИКИ ДЛЯ WELCOME SCREEN ---
  const handleSelectPlayer = (name: string) => {
    setCurrentPlayerName(name);
    const player = players.find(p => p.name === name);
    if (player) {
      setLevel(player.level);
      setTotalCoins(player.score);
      setHp(player.hp);
      setConsecutiveCorrectLevels(player.consecutiveCorrectLevels || 0);
      // Если выбран лист, обновить nameOfSheet
      if (selectedSheet && player.nameOfSheet !== selectedSheet) {
        const updatedPlayers = players.map(p =>
          p.name === name ? { ...p, nameOfSheet: selectedSheet } : p
        );
        setPlayers(updatedPlayers);
        setCookie('jeopardy_players', updatedPlayers);
      }
    } else {
      setLevel(1);
      setTotalCoins(0);
      setHp(5);
      setConsecutiveCorrectLevels(0);
    }
  };
  
  const handleAddNewPlayer = (name: string) => {
    const existingPlayer = players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existingPlayer && existingPlayer.hp > 0) {
      handleSelectPlayer(existingPlayer.name);
    } else {
      const newPlayer: Player = { name, level: 1, score: 0, hp: 5, consecutiveCorrectLevels: 0, nameOfSheet: selectedSheet || '' };
      const updatedPlayers = players.filter(p => p.name.toLowerCase() !== name.toLowerCase());
      setPlayers([...updatedPlayers, newPlayer]);
      setCookie('jeopardy_players', [...updatedPlayers, newPlayer]);
      handleSelectPlayer(name);
    }
  };
  // --- КОНЕЦ ОБРАБОТЧИКОВ ---

  const handleRestart = () => {
    const updatedPlayers = players.map(p => 
      p.name === currentPlayerName ? { ...p, level: 1, score: 0, hp: 5, consecutiveCorrectLevels: 0 } : p
    );
    setPlayers(updatedPlayers);
    setCookie('jeopardy_players', updatedPlayers);
    
    setLevel(1);
    setTotalCoins(0);
    setHp(5);
    setConsecutiveCorrectLevels(0);
    resetGameSession();
  };

  // --- Новый обработчик для рестарта только вопросов ---
  const handleRestartQuestions = () => {
    setAnswered({});
    setWronganswersstr("");
    setUsedRows(new Set());
    setCurrentRows([]);
  };

  // Теперь `started` определяется наличием currentPlayerName
  if (!currentPlayerName) {
    return (
      <WelcomeScreen 
        players={players} 
        onSelectPlayer={handleSelectPlayer} 
        onAddNewPlayer={handleAddNewPlayer} 
        onSelectSheet={(sheetName) => {
          setSelectedSheet(sheetName);
          setQuestions([]);
        }}
      />
    );
  }

  // --- В рендере Game Over и для отображения ошибок ---
  const currentPlayer = players.find(p => p.name === currentPlayerName);

  // --- Новый экран: все вопросы пройдены ---
  if (currentRows.length === 0 && questions.length > 0 && usedRows.size === new Set(questions.map(q => q.category)).size) {
    return (
      <EndScreen
        playerName={currentPlayerName || ''}
        score={totalCoins}
        level={level}
        onRestart={handleRestartQuestions}
      />
    );
  }

  // Функция для рендера строки ошибок (аналогична GameBoard)
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

  if (hp <= 0) {
    return (
      <div className="min-h-screen bg-red-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-6 text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Игра окончена!</h1>
          <p className="text-xl mb-2"><strong>Игрок:</strong> {currentPlayerName}</p>
          <p className="text-xl mb-2"><strong>Уровень:</strong> {level}</p>
          <p className="text-xl mb-4"><strong>Очки:</strong> {totalCoins}</p>
          
          {wronganswersstr && (
            <div className="text-left mt-6">
              <h2 className="text-2xl font-semibold mb-2">Ошибки:</h2>
              <div className="bg-gray-50 p-4 rounded-md text-lg">
                {renderWrongAnswers(wronganswersstr)}
              </div>
            </div>
          )}
          
          <button
            onClick={handleRestart}
            className="mt-6 bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition"
          >
            Начать сначала
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center relative">
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {SHOW_DEBUG_BUTTONS && (
          <button
            onClick={handleDebugAllButOne}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Ответить на все, кроме 1
          </button>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
        >
          Сменить игрока
        </button>
      </div>

      {/* Top-right image and label for current level */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center' }}>
        {/* Removed Level label, only image remains */}
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
        hp={hp}
        playerName={currentPlayerName || ''}
      />
      <GameBoard
        questions={questions.filter(q => currentRows.includes(q.category))}
        answered={answered}
        onSelect={handleSelect}
        wronganswersstr={wronganswersstr}
        started={false}
      />
      {canShowNextButton && (
        <div className="mt-4">
          <button
            onClick={handleNextQuestions}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Следующие вопросы
          </button>
        </div>
      )}
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