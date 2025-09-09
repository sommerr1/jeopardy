import React from 'react';
import { GameRenderer, Question, Player } from '../types';

export class MinimalRenderer implements GameRenderer {
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
          <div className="font-bold text-center">Категория</div>
          {difficulties.map(d => (
            <div key={d} className="font-bold text-center text-sm">{d}</div>
          ))}
        </div>
        
        {categories.map(cat => (
          <div key={cat} className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-2">
            <div className="font-medium text-sm">{cat}</div>
            {difficulties.map(diff => {
              const q = questions.find(q => q.category === cat && q.difficulty === diff);
              const isAnswered = q && answered[q.question];
              
              return (
                <button
                  key={diff}
                  onClick={() => q && onSelect(q)}
                  disabled={!q || isAnswered}
                  className={`
                    p-2 text-sm rounded border
                    ${!q || isAnswered 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400'
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div 
          ref={modalRef}
          className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
        >
          <h3 className="text-lg font-bold mb-4">{question.question}</h3>
          
          <div className="space-y-2 mb-4">
            {question.options.map(option => (
              <button
                key={option}
                onClick={() => onAnswer(option)}
                disabled={answered}
                className="w-full p-3 text-left border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                {option}
              </button>
            ))}
          </div>
          
          <button
            onClick={onClose}
            className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300"
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
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">{player.name}</h2>
          <div className="text-sm text-gray-600">
            Уровень: {player.level} | Очки: {coins}
          </div>
          <div className="text-sm text-gray-600">
            Правильных: {score}/{total}
          </div>
          <div className="text-sm text-gray-600">
            Жизни: {'❤️'.repeat(player.hp)}
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
          <span className="text-red-500 line-through">{wrong.trim()}</span>
          <span className="text-green-500"> ({right})</span>
          {regex.lastIndex < wrongAnswers.length ? <span>, </span> : null}
        </span>
      );
      idx++;
    }
    
    return (
      <div className="mt-4 p-3 bg-gray-100 rounded">
        <div className="text-sm font-medium mb-2">Неправильные ответы:</div>
        <div>{elements}</div>
      </div>
    );
  }
} 