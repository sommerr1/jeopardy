import React from 'react';

interface EndScreenProps {
  playerName: string;
  score: number;
  level: number;
  onRestart: () => void;
}

export function EndScreen({ playerName, score, level, onRestart }: EndScreenProps) {
  return (
    <div className="min-h-screen bg-green-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-6 text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Поздравляем!</h1>
        <p className="text-xl mb-2">Вы успешно прошли все вопросы!</p>
        <p className="text-xl mb-2"><strong>Игрок:</strong> {playerName}</p>
        <p className="text-xl mb-2"><strong>Уровень:</strong> {level}</p>
        <p className="text-xl mb-4"><strong>Очки:</strong> {score}</p>
        <button
          onClick={onRestart}
          className="mt-6 bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition"
        >
          Сыграть еще раз
        </button>
      </div>
    </div>
  );
} 