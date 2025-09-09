import React from 'react';
import { RendererType } from '../types';

interface TopBarProps {
  showDebug: boolean;
  onDebug: () => void;
  onLogout: () => void;
  onBackToGameType?: () => void;
  availableRenderers?: RendererType[];
  currentRenderer?: RendererType;
  onRendererChange?: (renderer: RendererType) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  showDebug, 
  onDebug, 
  onLogout, 
  onBackToGameType,
  availableRenderers = [],
  currentRenderer,
  onRendererChange
}) => (
  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2" data-testid="top-bar">
    {showDebug && (
      <button
        onClick={onDebug}
        className="btn-main py-1 px-2 text-xs font-bold"
      >
        Ответить на все, кроме 1
      </button>
    )}
    
    {onBackToGameType && (
      <button
        onClick={onBackToGameType}
        className="btn-secondary"
      >
        Сменить тип игры
      </button>
    )}
    
    {availableRenderers.length > 0 && currentRenderer && onRendererChange && (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Рендерер:</label>
        <select 
          value={currentRenderer}
          onChange={(e) => onRendererChange(e.target.value as RendererType)}
          className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"
          data-testid="renderer-select"
        >
          {availableRenderers.map(type => (
            <option key={type} value={type}>
              {type === 'classic' ? 'Классический' :
               type === 'minimal' ? 'Минимальный' :
               type === 'animated' ? 'Анимированный' :
               type === 'dark' ? 'Темный' :
               type === 'mobile' ? 'Мобильный' :
               type === 'automata' ? 'Автоматы' :
               type}
            </option>
          ))}
        </select>
      </div>
    )}
    
    <button
      onClick={onLogout}
      className="btn-danger"
    >
      Сменить игрока
    </button>
  </div>
); 