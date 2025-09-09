import React, { useState, useRef, useEffect, Suspense } from 'react';
import { GameRenderer, Question, Player } from '../types';
import { renderWrongAnswers } from '../utils/renderWrongAnswers';
import { FullScreenModelRenderer, BottomModelRenderer } from './SimpleModelRenderer';

// Компонент для 3D элемента
const ThreeDElement: React.FC<{ position?: [number, number, number] }> = ({ 
  position = [0, 0, 0] 
}) => {
  return (
    <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-center h-full text-white text-2xl">
        🤖
      </div>
    </div>
  );
};

// Простые компоненты для отображения иконок
const SimpleRobot: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full text-white text-2xl">
      🤖
    </div>
  );
};

const SimpleQuestionBot: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full text-white text-2xl">
      ❓
    </div>
  );
};

// Компонент игровой доски для автоматов
const AutomataGameBoard: React.FC<{
  questions: Question[];
  answered: { [key: string]: boolean };
  onSelect: (q: Question) => void;
  wronganswersstr?: string;
}> = ({ questions, answered, onSelect, wronganswersstr = "" }) => {
  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const difficulties = Array.from(new Set(questions.map((q) => q.difficulty)));
  const [modelScale, setModelScale] = useState(1.0);

  return (
    <div className="w-full max-w-6xl mt-8 relative">
      {/* 3D модель на весь экран */}
      <FullScreenModelRenderer scale={modelScale} />
      
      {/* Панель управления размером модели */}
      <div className="fixed top-4 right-4 z-30 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-purple-200">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-semibold text-purple-800 whitespace-nowrap">
            Размер модели:
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={modelScale}
            onChange={(e) => setModelScale(parseFloat(e.target.value))}
            className="w-24 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm font-mono text-purple-600 min-w-[3rem]">
            {modelScale.toFixed(1)}x
          </span>
        </div>
        <div className="flex justify-between text-xs text-purple-500 mt-1">
          <span>0.1x</span>
          <span>5x</span>
        </div>
      </div>
      
      {/* 3D модель снизу экрана */}
      <BottomModelRenderer scale={0.5} />
      
      {/* 3D элементы вокруг доски */}
      <div className="flex justify-between mb-6">
        <ThreeDElement position={[-2, 0, 0]} />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-purple-800 mb-2">🤖 Автоматы 🤖</h2>
          <p className="text-purple-600">Выберите вопрос для автоматической обработки</p>
        </div>
        <ThreeDElement position={[2, 0, 0]} />
      </div>

      {/* Игровая доска с автоматическим стилем */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-6 shadow-xl border-2 border-purple-200">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
          <div className="font-bold text-purple-800 text-lg">Категория</div>
          {difficulties.map((d) => (
            <div key={d} className="flex justify-center font-bold text-purple-700 items-center h-12 bg-purple-200 rounded-lg">
              {d}
            </div>
          ))}
        </div>
        
        {categories.map((cat) => (
          <div key={cat} className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
            <div className="font-semibold text-purple-800 bg-purple-100 p-3 rounded-lg flex items-center">
              <span className="mr-2">⚙️</span>
              {cat}
            </div>
            {difficulties.map((diff) => {
              const q = questions.find(
                (q) => q.category === cat && q.difficulty === diff
              );
              let isWrong = false;
              if (q && wronganswersstr) {
                // Проверяем, был ли дан неправильный ответ именно для этого вопроса
                // Ищем паттерн, который содержит неправильный ответ для этого конкретного вопроса
                const wrongAnswers = wronganswersstr.split(', ');
                for (const wrongAnswer of wrongAnswers) {
                  if (wrongAnswer.includes(`(${q.correct})`)) {
                    // Проверяем, что это действительно неправильный ответ для этого вопроса
                    const wrongPart = wrongAnswer.split(' (')[0];
                    if (q.options.includes(wrongPart) && wrongPart !== q.correct) {
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
                  className={`h-16 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    !q || answered[q.question]
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  } ${
                    isWrong ? 'border-4 border-red-500 bg-red-200' : ''
                  } ${
                    isCorrect ? 'border-4 border-green-500 bg-green-200' : ''
                  }`}
                  disabled={!q || answered[q.question]}
                  onClick={() => q && onSelect(q)}
                >
                  {q && !answered[q.question] ? (
                    <div className="flex flex-col items-center">
                      <span className="text-2xl">⚡</span>
                      <span className="text-sm">{q.rate || '?'}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-xl">{q?.rate || '-'}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Панель неправильных ответов */}
      {wronganswersstr && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-bold mb-2">❌ Ошибки автоматизации:</h3>
          {renderWrongAnswers(wronganswersstr)}
        </div>
      )}
      
      {/* Отступ для 3D модели снизу */}
      <div className="h-48"></div>
    </div>
  );
};

// Компонент модального окна вопроса для автоматов
const AutomataQuestionModal: React.FC<{
  question: Question;
  onAnswer: (answer: string) => void;
  answered: boolean;
  onClose: () => void;
  modalRef?: React.RefObject<HTMLDivElement>;
}> = ({ question, onAnswer, answered, onClose, modalRef }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleClick = (answer: string) => {
    if (selected) return;
    setSelected(answer);
    setShowExplanation(true);
    onAnswer(answer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8 shadow-2xl w-full max-w-2xl border-2 border-purple-300"
        onClick={e => e.stopPropagation()}
      >
        {/* 3D элемент в заголовке */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg overflow-hidden">
            <SimpleQuestionBot />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-purple-800 text-center">
          🤖 Автоматический вопрос 🤖
        </h2>
        
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{question.question}</h3>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            {question.options.map((opt) => (
              <button
                key={opt}
                className={`py-4 px-6 rounded-xl border-2 font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                  selected
                    ? opt === question.correct
                      ? "bg-green-300 border-green-500 text-green-800"
                      : opt === selected
                      ? "bg-red-300 border-red-500 text-red-800"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                    : "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200 hover:border-purple-400"
                }`}
                disabled={!!selected}
                onClick={() => handleClick(opt)}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  <span className="text-2xl">
                    {selected
                      ? opt === question.correct
                        ? "✅"
                        : opt === selected
                        ? "❌"
                        : "⚪"
                      : "🤖"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {showExplanation && selected && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center mb-4">
              <h4 className={`text-2xl font-bold mb-2 ${
                selected === question.correct ? "text-green-600" : "text-red-600"
              }`}>
                {selected === question.correct ? "✅ Автоматизация успешна!" : "❌ Ошибка автоматизации!"}
              </h4>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed">{question.explanation}</p>
            
            {question.rate && (
              <div className="bg-purple-100 rounded-lg p-3 mb-4">
                <p className="text-purple-800 font-semibold">
                  ⚡ Автоматический рейтинг: {question.rate}
                </p>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                🤖 Нажмите вне окна для продолжения автоматизации
              </p>
              <button
                onClick={onClose}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Продолжить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Компонент счета для автоматов
const AutomataScoreBoard: React.FC<{
  player: Player;
  score: number;
  total: number;
  showCoin: number;
  onCoinAnimationEnd: () => void;
  coinOrigin: { x: number; y: number } | null;
  coins: number;
}> = ({ player, score, total, showCoin, onCoinAnimationEnd, coinOrigin, coins }) => {
  const [modelScale, setModelScale] = useState(1.0);
  
  return (
    <div className="w-full max-w-4xl mx-auto mt-4 relative">
      {/* 3D модель на весь экран */}
      <FullScreenModelRenderer scale={modelScale} />
      
      {/* Панель управления размером модели */}
      <div className="fixed top-4 right-4 z-30 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-purple-200">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-semibold text-purple-800 whitespace-nowrap">
            Размер модели:
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={modelScale}
            onChange={(e) => setModelScale(parseFloat(e.target.value))}
            className="w-24 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm font-mono text-purple-600 min-w-[3rem]">
            {modelScale.toFixed(1)}x
          </span>
        </div>
        <div className="flex justify-between text-xs text-purple-500 mt-1">
          <span>0.1x</span>
          <span>5x</span>
        </div>
      </div>
      
      {/* 3D модель снизу экрана */}
      <BottomModelRenderer scale={0.5} />
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🤖</div>
            <div>
              <h2 className="text-2xl font-bold">{player.name}</h2>
              <p className="text-purple-200">Автоматический режим</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold">❤️ {player.hp}</div>
              <div className="text-sm text-purple-200">Жизни</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold">⚡ {player.level}</div>
              <div className="text-sm text-purple-200">Уровень</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold">🎯 {score}/{total}</div>
              <div className="text-sm text-purple-200">Правильно</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold">💰 {coins}</div>
              <div className="text-sm text-purple-200">Монеты</div>
            </div>
          </div>
        </div>
        
        {/* Прогресс-бар автоматизации */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-purple-200 mb-1">
            <span>Прогресс автоматизации</span>
            <span>{Math.round((score / Math.max(total, 1)) * 100)}%</span>
          </div>
          <div className="w-full bg-purple-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(score / Math.max(total, 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Анимация монет */}
      {showCoin > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div
            className="absolute text-4xl animate-bounce"
            style={{
              left: coinOrigin?.x || 0,
              top: coinOrigin?.y || 0,
            }}
            onAnimationEnd={onCoinAnimationEnd}
          >
            💰
          </div>
        </div>
      )}
      
      {/* Отступ для 3D модели снизу */}
      <div className="h-48"></div>
    </div>
  );
};

export class AutomataRenderer implements GameRenderer {
  renderBoard(
    questions: Question[], 
    answered: { [key: string]: boolean }, 
    onSelect: (q: Question) => void,
    wronganswersstr?: string
  ): React.ReactNode {
    return (
      <AutomataGameBoard
        questions={questions}
        answered={answered}
        onSelect={onSelect}
        wronganswersstr={wronganswersstr}
      />
    );
  }

  renderQuestion(
    question: Question, 
    onAnswer: (answer: string) => void,
    answered: boolean,
    onClose: () => void,
    modalRef?: React.RefObject<HTMLDivElement>
  ): React.ReactNode {
    return (
      <AutomataQuestionModal
        question={question}
        onAnswer={onAnswer}
        answered={answered}
        onClose={onClose}
        modalRef={modalRef}
      />
    );
  }

  renderScore(
    player: Player, 
    score: number, 
    total: number,
    showCoin: number,
    onCoinAnimationEnd: () => void,
    coinOrigin: { x: number; y: number } | null,
    coins: number
  ): React.ReactNode {
    return (
      <AutomataScoreBoard
        player={player}
        score={score}
        total={total}
        showCoin={showCoin}
        onCoinAnimationEnd={onCoinAnimationEnd}
        coinOrigin={coinOrigin}
        coins={coins}
      />
    );
  }

  renderWrongAnswers(wrongAnswers: string): React.ReactNode {
    return renderWrongAnswers(wrongAnswers);
  }
} 