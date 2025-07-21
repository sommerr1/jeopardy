import React from 'react';
import { renderWrongAnswers } from '../utils/renderWrongAnswers';

interface GameOverScreenProps {
  playerName: string;
  level: number;
  totalCoins: number;
  wronganswersstr: string;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ playerName, level, totalCoins, wronganswersstr, onRestart }) => (
  <div className="min-h-screen bg-red-100 flex flex-col justify-center items-center p-4">
    <div className="w-full max-w-lg modal-shadow text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Игра окончена!</h1>
      <p className="text-xl mb-2"><strong>Игрок:</strong> {playerName}</p>
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
        onClick={onRestart}
        className="mt-6 btn-main"
      >
        Начать сначала
      </button>
    </div>
  </div>
); 