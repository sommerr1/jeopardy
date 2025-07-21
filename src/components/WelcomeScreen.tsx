import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { fetchSheetsList } from '../utils/fetchQuestions';

type Props = {
  players: Player[];
  onSelectPlayer: (name: string) => void;
  onAddNewPlayer: (name: string) => void;
  onSelectSheet: (sheetName: string) => void;
};

export function WelcomeScreen({ players, onSelectPlayer, onAddNewPlayer, onSelectSheet }: Props) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [sheets, setSheets] = useState<{id: number, name: string}[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSheetsList()
      .then(setSheets)
      .catch(e => setError('Ошибка загрузки списка листов'))
      .finally(() => setLoading(false));
  }, []);

  const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSheet(e.target.value);
    if (e.target.value) {
      onSelectSheet(e.target.value);
    }
  };

  const handleAddClick = () => {
    if (newPlayerName.trim()) {
      onAddNewPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };
  
  // Сортируем и фильтруем игроков только для выбранного листа
  const filteredPlayers = players.filter(p => p.nameOfSheet === selectedSheet);
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.level - a.level;
  });

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Jeopardy!</h1>
        <p className="text-center text-gray-600 mb-6">Выберите лист для игры.</p>
        {loading ? (
          <div className="text-center text-gray-500 mb-4">Загрузка...</div>
        ) : error ? (
          <div className="text-center text-red-500 mb-4">{error}</div>
        ) : (
          <div className="flex gap-2 mb-4">
            <select
              value={selectedSheet}
              onChange={handleSheetChange}
              className="flex-1 p-2 border border-gray-300 rounded-md"
            >
              <option value="">Выберите лист</option>
              {sheets.map((sh) => (
                <option key={sh.id} value={sh.name}>{sh.name}</option>
              ))}
            </select>
          </div>
        )}
        <p className="text-center text-gray-600 mb-6">Введите имя, чтобы создать нового игрока, или выберите из списка.</p>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Имя нового игрока"
            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={!selectedSheet}
          />
          <button
            onClick={handleAddClick}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
            disabled={!selectedSheet}
          >
            Начать игру
          </button>
        </div>
        {sortedPlayers.length > 0 && (
          <div className={selectedSheet ? '' : 'opacity-50 pointer-events-none'}>
            <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">Таблица лидеров</h2>
            <div className="overflow-y-auto max-h-60 border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">❤️</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Уровень</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Очки</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPlayers.map((player) => (
                    <tr 
                      key={player.name} 
                      onClick={() => player.hp > 0 && selectedSheet && onSelectPlayer(player.name)}
                      className={`cursor-pointer transition ${
                        player.hp > 0 ? 'hover:bg-gray-100' : 'bg-red-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{player.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{player.hp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{player.level}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{player.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 