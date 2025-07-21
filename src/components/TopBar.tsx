import React from 'react';

interface TopBarProps {
  showDebug: boolean;
  onDebug: () => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ showDebug, onDebug, onLogout }) => (
  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
    {showDebug && (
      <button
        onClick={onDebug}
        className="btn-main py-1 px-2 text-xs font-bold"
      >
        Ответить на все, кроме 1
      </button>
    )}
    <button
      onClick={onLogout}
      className="btn-danger"
    >
      Сменить игрока
    </button>
  </div>
); 