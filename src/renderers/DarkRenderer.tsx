import React from 'react';
import { GameRenderer, Question, Player } from '../types';

export class DarkRenderer implements GameRenderer {
  renderBoard(
    questions: Question[], 
    answered: { [key: string]: boolean }, 
    onSelect: (q: Question) => void,
    wronganswersstr?: string
  ): React.ReactNode {
    const categories = Array.from(new Set(questions.map(q => q.category)));
    const difficulties = Array.from(new Set(questions.map(q => q.difficulty)));

    return (
      <div className="w-full max-w-4xl mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
          <div className="font-bold text-center text-gray-300">Категория</div>
          {difficulties.map(d => (
            <div key={d} className="font-bold text-center text-sm text-gray-300">{d}</div>
          ))}
        </div>
        
        {categories.map(cat => (
          <div key={cat} className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-2">
            <div className="font-medium text-sm text-gray-300">{cat}</div>
            {difficulties.map(diff => {
              const q = questions.find(q => q.category === cat && q.difficulty === diff);
              const isAnswered = q && answered[q.question];
              
              return (
                <button
                  key={diff}
                  onClick={() => q && onSelect(q)}
                  disabled={!q || isAnswered}
                  className={`
                    p-3 text-sm rounded border-2 transition-all duration-200
                    ${!q || isAnswered 
                      ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' 
                      : 'bg-gray-900 hover:bg-gray-800 border-gray-600 hover:border-purple-500 text-gray-200 hover:text-white'
                    }
                  `}
                >
                  {q ? (isAnswered ? '✓' : q.rate || '?') : '-'}
                </button>
              );
            })}
          </div>
        ))}
      </div>
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
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div 
          ref={modalRef}
          className="bg-gray-900 p-8 rounded-lg max-w-lg w-full mx-4 border border-gray-700"
        >
          <h3 className="text-xl font-bold mb-6 text-white">{question.question}</h3>
          
          <div className="space-y-3 mb-6">
            {question.options.map(option => (
              <button
                key={option}
                onClick={() => onAnswer(option)}
                disabled={answered}
                className="w-full p-4 text-left border-2 border-gray-600 rounded-lg hover:bg-gray-800 hover:border-purple-500 disabled:opacity-50 text-gray-200 hover:text-white transition-all duration-200"
              >
                {option}
              </button>
            ))}
          </div>
          
          <button
            onClick={onClose}
            className="w-full p-3 bg-gray-700 rounded-lg hover:bg-gray-600 text-white transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
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
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 mb-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{player.name}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-300">
              <span className="text-purple-400">Уровень:</span> {player.level}
            </div>
            <div className="text-gray-300">
              <span className="text-yellow-400">Очки:</span> {coins}
            </div>
            <div className="text-gray-300">
              <span className="text-green-400">Правильных:</span> {score}/{total}
            </div>
            <div className="text-gray-300">
              <span className="text-red-400">Жизни:</span> {'❤️'.repeat(player.hp)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderWrongAnswers(wrongAnswers: string): React.ReactNode {
    if (!wrongAnswers) return null;
    
    const regex = /([^,]+?) \(([^)]+)\)/g;
    const elements: React.ReactNode[] = [];
    let match;
    let idx = 0;
    
    while ((match = regex.exec(wrongAnswers)) !== null) {
      const [full, wrong, right] = match;
      elements.push(
        <span key={idx} className="text-sm">
          <span className="text-red-400 line-through">{wrong.trim()}</span>
          <span className="text-green-400"> ({right})</span>
          {regex.lastIndex < wrongAnswers.length ? <span className="text-gray-400">, </span> : null}
        </span>
      );
      idx++;
    }
    
    return (
      <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-sm font-medium mb-2 text-gray-300">Неправильные ответы:</div>
        <div className="text-gray-400">{elements}</div>
      </div>
    );
  }
} 