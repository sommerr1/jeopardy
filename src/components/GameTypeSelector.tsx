import React from 'react';

type GameType = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

type Props = {
  onSelectGameType: (type: string) => void;
};

export function GameTypeSelector({ onSelectGameType }: Props) {
  const gameTypes: GameType[] = [
    {
      id: 'classic',
      name: 'Классическая игра',
      description: 'Стандартные правила Jeopardy с системой очков и жизней',
      icon: '🎯',
      color: 'blue'
    },
    {
      id: 'time-attack',
      name: 'Игра на время',
      description: 'Ограниченное время на ответы, быстрые решения',
      icon: '⏰',
      color: 'orange'
    },
    {
      id: 'survival',
      name: 'Режим выживания',
      description: 'Одна жизнь, без права на ошибку - максимальная сложность',
      icon: '💀',
      color: 'red'
    },
    {
      id: 'team',
      name: 'Командная игра',
      description: 'Игра в командах с общим счетом и стратегией',
      icon: '👥',
      color: 'green'
    },
    {
      id: 'automata',
      name: 'Автоматы',
      description: 'Режим игры с автоматами, пистолетами и автоматическими пистолетами',
      icon: '🤖',
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-800',
      orange: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-800',
      red: 'border-red-200 hover:border-red-400 hover:bg-red-50 text-red-800',
      green: 'border-green-200 hover:border-green-400 hover:bg-green-50 text-green-800',
      purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-800'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎮 Jeopardy!</h1>
          <p className="text-xl text-gray-600">Выберите тип игры для начала</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gameTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelectGameType(type.id)}
              className={`p-6 border-2 rounded-xl hover:scale-105 transition-all duration-300 text-left group ${getColorClasses(type.color)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{type.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            💡 Совет: Начните с классической игры, чтобы освоить правила
          </p>
        </div>
      </div>
    </div>
  );
} 