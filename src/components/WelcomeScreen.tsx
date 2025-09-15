import React, { useState, useEffect } from 'react';
import { Player, GameType } from '../types';
import { fetchSheetsList } from '../utils/fetchQuestions';

type Props = {
  players: Player[];
  onSelectPlayer: (name: string) => void;
  onAddNewPlayer: (name: string) => void;
  onSelectSheet: (sheetName: string) => void;
  gameType: GameType;
  onBackToGameType?: () => void;
};

export function WelcomeScreen({ players, onSelectPlayer, onAddNewPlayer, onSelectSheet, gameType, onBackToGameType }: Props) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [sheets, setSheets] = useState<{id: number, name: string}[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadSheets = async (useCache: boolean = true) => {
    try {
      setError(null);
      const sheetsData = await fetchSheetsList(useCache);
      setSheets(sheetsData);
      setRetryCount(0);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ошибка загрузки списка листов';
      
      // Если есть кэшированные данные, не показываем ошибку
      if (sheets.length > 0) {
        console.warn('⚠️ Failed to refresh sheets, using cached data:', e);
        return; // Не устанавливаем ошибку, если есть кэшированные данные
      }
      
      setError(errorMessage);
      console.error('Failed to load sheets:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    // При повторной попытке не используем кэш
    loadSheets(false);
  };

  useEffect(() => {
    loadSheets();
  }, []);

  // (удалён useEffect с авто-выбором первого листа)

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

  const getGameTypeInfo = (type: GameType) => {
    const gameTypeMap = {
      'classic': { name: 'Классическая игра', icon: '🎯', color: 'text-blue-600' },
      'time-attack': { name: 'Игра на время', icon: '⏰', color: 'text-orange-600' },
      'survival': { name: 'Режим выживания', icon: '💀', color: 'text-red-600' },
      'team': { name: 'Командная игра', icon: '👥', color: 'text-green-600' },
      'automata': { name: 'Автоматы', icon: '🤖', color: 'text-purple-600' }
    };
    return gameTypeMap[type];
  };

  const gameTypeInfo = getGameTypeInfo(gameType);

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 relative">
        {onBackToGameType && (
          <button
            onClick={onBackToGameType}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition-colors"
            title="Вернуться к выбору типа игры"
          >
            ← Назад
          </button>
        )}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Jeopardy!</h1>
        <div className="text-center mb-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 ${gameTypeInfo.color}`}>
            <span className="text-lg">{gameTypeInfo.icon}</span>
            <span className="font-semibold text-sm">{gameTypeInfo.name}</span>
          </div>
        </div>
        <p className="text-center text-gray-600 mb-6">Выберите лист для игры.</p>
        {loading ? (
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Загрузка списка листов...
            </div>
            {retryCount > 0 && (
              <div className="text-sm text-gray-400 mt-1">
                Попытка {retryCount + 1}...
              </div>
            )}
          </div>
        ) : error ? (
          <div className="text-center mb-4">
            <div className="text-red-500 mb-2">{error}</div>
            <button
              onClick={handleRetry}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mb-4">
            <select
              value={selectedSheet}
              onChange={handleSheetChange}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Выберите лист</option>
              {sheets.map((sh) => (
                <option key={sh.id} value={sh.name}>{sh.name}</option>
              ))}
            </select>
            <button
              onClick={() => loadSheets(false)}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              title="Обновить список листов"
            >
              🔄
            </button>
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