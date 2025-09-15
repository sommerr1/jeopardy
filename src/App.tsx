import React, { useState, useEffect, useRef } from "react";
import { fetchQuestionsFromSheet } from "./utils/fetchQuestions";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { GameBoard } from "./components/GameBoard";
import { QuestionModal } from "./components/QuestionModal";
import { ScoreBoard } from "./components/ScoreBoard";
import { Player, Question, GameType, RendererType } from "./types";
import { EndScreen } from "./components/EndScreen";
import { useQuestions } from "./hooks/useQuestions";
import { useScore } from "./hooks/useScore";
import { renderWrongAnswers } from './utils/renderWrongAnswers';
import { TopBar } from './components/TopBar';
import { LevelImage } from './components/LevelImage';
import { GameOverScreen } from './components/GameOverScreen';
import { GameTypeSelector } from './components/GameTypeSelector';
import { RendererFactory } from './renderers';
import ModelTest from './components/ModelTest';

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
  // --- SCORE HOOK ---
  const {
    players,
    setPlayers,
    currentPlayerName,
    setCurrentPlayerName,
    level,
    setLevel,
    totalCoins,
    setTotalCoins,
    hp,
    setHp,
    consecutiveCorrectLevels,
    setConsecutiveCorrectLevels,
    totalCorrectAnswers,
    setTotalCorrectAnswers,
    totalQuestionsAsked,
    setTotalQuestionsAsked,
    login,
    addPlayer,
    logout,
    restart,
  } = useScore();

  // --- ВОПРОСЫ ---
  const [selected, setSelected] = useState<Question | null>(null);
  const [answered, setAnswered] = useState<{ [key: string]: boolean }>({});
  const [score, setScore] = useState(0);
  const [showCoin, setShowCoin] = useState(0);
  const [coinOrigin, setCoinOrigin] = useState<{ x: number; y: number } | null>(null);
  const [wronganswersstr, setWronganswersstr] = useState("");

  // Функция для получения имени куки с неправильными ответами для текущего игрока
  const getWrongAnswersCookieName = () => {
    return currentPlayerName ? `jeopardy_wronganswersstr_${currentPlayerName}` : 'jeopardy_wronganswersstr';
  };

  // Функция для очистки старых куки (без имени игрока)
  const clearOldWrongAnswersCookie = () => {
    const oldCookieName = 'jeopardy_wronganswersstr';
    const oldCookie = getCookie(oldCookieName);
    if (oldCookie) {
      removeCookie(oldCookieName);
      console.log('Очищена старая куки с неправильными ответами:', oldCookieName);
    }
  };
  const [wronganswersCurrentLevel, setWronganswersCurrentLevel] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);
  const [pendingScore, setPendingScore] = useState(0);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  
  // --- РЕНДЕРЕРЫ ---
  const [selectedRenderer, setSelectedRenderer] = useState<RendererType>('classic');
  const [showModelTest, setShowModelTest] = useState(false);

  // Очищаем старые куки при инициализации приложения
  useEffect(() => {
    clearOldWrongAnswersCookie();
  }, []);

  // Автоматически переключаемся на рендерер автоматов для типа игры automata
  useEffect(() => {
    if (selectedGameType === 'automata') {
      setSelectedRenderer('automata');
    }
  }, [selectedGameType]);

  // Предзагрузка отключена - используется только в WelcomeScreen для избежания конфликтов

  // Новый хук для работы с вопросами
  const {
    questions,
    currentRows,
    usedRows,
    setUsedRows,
    setCurrentRows,
    getCurrentQuestions,
    getAvailableCategories,
    nextQuestions,
    resetQuestions,
    setQuestions,
  } = useQuestions(selectedSheet, currentPlayerName);

  // --- REMOVE redundant player/score state and cookie logic ---
  // (all such logic is now handled by useScore)

  // --- HANDLERS ---
  const handleLogout = () => {
    logout();
    setSelectedGameType(null);
    // Статистика вопросов сбрасывается автоматически в хуке useScore
  };

  const resetGameSession = () => {
    setAnswered({});
    setWronganswersstr("");
    removeCookie(getWrongAnswersCookieName());
    setUsedRows(new Set());
    setCurrentRows([]);
    // Статистика вопросов сохраняется в хуке useScore
  };

  // --- DEBUG HANDLER ---
  const handleDebugAllButOne = () => {
    const questionsToAnswer = questions.filter(
      (q) => currentRows.includes(q.category) && !answered[q.question]
    );
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
    
    // Обновляем общую статистику вопросов для отладочных ответов
    setTotalQuestionsAsked(prev => prev + questionsToProcess.length);
    setTotalCorrectAnswers(prev => prev + questionsToProcess.length);
  };

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

  // Сохраняем неправильные ответы в куки при каждом изменении
  useEffect(() => {
    if (wronganswersstr) {
      setCookie(getWrongAnswersCookieName(), wronganswersstr);
    } else {
      removeCookie(getWrongAnswersCookieName());
    }
  }, [wronganswersstr, currentPlayerName]);

  // Загружаем неправильные ответы из куки при смене игрока
  useEffect(() => {
    if (currentPlayerName) {
      const savedWrongAnswers = getCookie(getWrongAnswersCookieName());
      setWronganswersstr(savedWrongAnswers || ""); // Сбрасываем на пустую строку, если куки нет
    } else {
      setWronganswersstr(""); // Сбрасываем при выходе из игры
    }
  }, [currentPlayerName]);


  const handleSelect = (q: Question) => setSelected(q);
  let anyWrong : boolean = false;
  const handleAnswer = (answer: string) => {
    if (!selected) return;
    const isCorrect = answer === selected.correct;
    setAnswered((prev: { [key: string]: boolean }) => ({ ...prev, [selected.question]: true }));
    setScore((s: number) => s + (isCorrect ? 1 : 0));
    
    // Обновляем общую статистику вопросов
    setTotalQuestionsAsked(prev => prev + 1);
    if (isCorrect) {
      setTotalCorrectAnswers(prev => prev + 1);
    }
    
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
      setWronganswersstr((prev: string) => prev ? `${prev}, ${answer} (${selected.correct})` : `${answer} (${selected.correct})`);
      setWronganswersCurrentLevel((prev: string) => prev ? `${prev}, ${answer} (${selected.correct})` : `${answer} (${selected.correct})`);
      setConsecutiveCorrectLevels(0);
    }
    // Проверяем, все ли вопросы из текущих 2 строк отвечены
    const currentQuestions = getCurrentQuestions();
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
  const currentQuestions = getCurrentQuestions();
  
  // Все ли текущие вопросы отвечены
  const allCurrentAnswered = currentQuestions.length > 0 && currentQuestions.every(q => answered[q.question]);

  // Есть ли неверный ответ в текущем наборе
  const anyWrongInCurrent = currentQuestions.some(q => wronganswersCurrentLevel.includes(`${q.question} (${q.correct})`));

  // Проверяем, остались ли ещё категории для новых вопросов
  const availableCategories = getAvailableCategories();
  const hasMoreQuestions = availableCategories.length > 0;

  // Условие показа кнопки
  const canShowNextButton = (allCurrentAnswered || anyWrongInCurrent) && hasMoreQuestions;
  
  // --- ФУНКЦИЯ handleNextQuestions ---
  const handleNextQuestions = () => {
    nextQuestions(anyWrongInCurrent);
    setWronganswersCurrentLevel("");
    setAnswered({});
  };

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
      return match ? `/images/${match}` : `/images/${availableImages[0]}`;
    }
    // For level 53 and above, use the last image as fallback
    return `/images/${availableImages[availableImages.length - 1]}`;
  };

  // --- ОБРАБОТЧИКИ ДЛЯ WELCOME SCREEN ---
  const handleSelectPlayer = (name: string) => {
    login(name);
    // Sheet logic
    const player = players.find(p => p.name === name);
    if (player) {
      let needsUpdate = false;
      let updatedPlayer = { ...player };
      
      if (selectedSheet && player.nameOfSheet !== selectedSheet) {
        updatedPlayer.nameOfSheet = selectedSheet;
        needsUpdate = true;
      }
      
      if (selectedGameType && player.gameType !== selectedGameType) {
        updatedPlayer.gameType = selectedGameType;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        const updatedPlayers = players.map(p =>
          p.name === name ? updatedPlayer : p
        );
        setPlayers(updatedPlayers);
        // Cookie update handled by useScore
      }
    }
  };

  const handleAddNewPlayer = (name: string) => {
    if (selectedSheet && selectedGameType) {
      addPlayer(name, selectedSheet, selectedGameType);
    }
  };
  // --- КОНЕЦ ОБРАБОТЧИКОВ ---

  const handleRestart = () => {
    restart();
    resetGameSession();
    setSelectedGameType(null);
    // Статистика вопросов сбрасывается автоматически в хуке useScore
  };

  // --- Новый обработчик для рестарта только вопросов ---
  const handleRestartQuestions = () => {
    // НЕ сбрасываем отвеченные вопросы - оставляем прогресс
    // setAnswered({});
    
    // НЕ очищаем неправильные ответы - сохраняем историю ошибок
    // setWronganswersstr("");
    
    // НЕ удаляем куки - сохраняем неправильные ответы
    // removeCookie(getWrongAnswersCookieName());
    
    resetQuestions(); // Сбрасываем только вопросы
    // НЕ сбрасываем тип игры - продолжаем с тем же типом
    // setSelectedGameType(null);
    // Статистика вопросов сохраняется в хуке useScore
  };

  // Сначала показываем экран выбора типа игры
  if (!selectedGameType) {
    return (
      <GameTypeSelector 
        onSelectGameType={(gameType) => {
          setSelectedGameType(gameType as GameType);
        }}
      />
    );
  }

  // Затем показываем экран выбора игрока и листа
  if (!currentPlayerName) {
    return (
      <WelcomeScreen 
        players={players} 
        onSelectPlayer={handleSelectPlayer} 
        onAddNewPlayer={handleAddNewPlayer} 
        onSelectSheet={(sheetName) => {
          console.log('Выбран лист:', sheetName);
          console.log('Игроки до:', players);
          setSelectedSheet(sheetName);
          setQuestions([]);
          // (здесь можно обновлять nameOfSheet у игроков)
          // setPlayers(players => players.map(p => ({ ...p, nameOfSheet: sheetName })));
          setTimeout(() => {
            console.log('Игроки после:', players);
          }, 0);
        }}
        gameType={selectedGameType}
        onBackToGameType={() => setSelectedGameType(null)}
      />
    );
  }

  // --- В рендере Game Over и для отображения ошибок ---
  const currentPlayer = players.find(p => p.name === currentPlayerName);

  // --- Новый экран: все вопросы пройдены ---
  if (currentRows.length === 0 && questions.length > 0 && usedRows.size === new Set(questions.map(q => q.category)).size) {
    if (!currentPlayer) return null;
    return (
      <EndScreen
        player={currentPlayer}
        onRestart={handleRestartQuestions}
      />
    );
  }

  if (hp <= 0) {
    return (
      <GameOverScreen
        playerName={currentPlayerName}
        level={level}
        totalCoins={totalCoins}
        wronganswersstr={wronganswersstr}
        onRestart={handleRestart}
      />
    );
  }

  // Получаем текущий рендерер
  const currentRenderer = RendererFactory.get(selectedRenderer);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center relative">
      <TopBar
        showDebug={SHOW_DEBUG_BUTTONS}
        onDebug={handleDebugAllButOne}
        onLogout={handleLogout}
        onBackToGameType={() => setSelectedGameType(null)}
        availableRenderers={RendererFactory.getAvailableTypes()}
        currentRenderer={selectedRenderer}
        onRendererChange={setSelectedRenderer}
      />
      
      {/* Временная кнопка для тестирования модели - только для автомата */}
      {SHOW_DEBUG_BUTTONS && selectedGameType === 'automata' && (
        <div className="absolute top-20 right-4 z-50">
          <button
            onClick={() => setShowModelTest(!showModelTest)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {showModelTest ? 'Скрыть' : 'Показать'} Тест Модели
          </button>
        </div>
      )}
      
      {showModelTest && <ModelTest />}
      <LevelImage src={getLevelImage()} alt={`Level ${level}`} />
      
      {currentPlayer && currentRenderer.renderScore(
        currentPlayer,
        totalCorrectAnswers,
        totalQuestionsAsked,
        showCoin,
        handleCoinAnimationEnd,
        coinOrigin,
        totalCoins
      )}
      
      {currentRenderer.renderBoard(
        currentQuestions,
        answered,
        handleSelect,
        wronganswersstr
      )}
      
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
      
      {selected && currentRenderer.renderQuestion(
        selected,
        handleAnswer,
        answered[selected.question],
        handleCloseModal,
        modalRef as React.RefObject<HTMLDivElement>
      )}
    </div>
  );
} 