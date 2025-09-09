export type Question = {
  category: string;
  difficulty: string;
  question: string;
  correct: string;
  options: string[];
  explanation: string;
  rate?: number;
};

export type Player = {
  name: string;
  level: number;
  score: number;
  hp: number;
  consecutiveCorrectLevels: number;
  nameOfSheet: string;
  gameType?: string; // Добавляем тип игры
  totalCorrectAnswers?: number; // Общее количество правильно отвеченных вопросов
  totalQuestionsAsked?: number; // Общее количество заданных вопросов
};

import React from 'react';

export type GameType = 'classic' | 'time-attack' | 'survival' | 'team' | 'automata';

// Новые типы для системы рендереров
export type RendererType = 'classic' | 'minimal' | 'animated' | 'dark' | 'mobile' | 'automata';

export interface GameRenderer {
  renderBoard(
    questions: Question[], 
    answered: { [key: string]: boolean }, 
    onSelect: (q: Question) => void,
    wronganswersstr?: string
  ): React.ReactNode;
  
  renderQuestion(
    question: Question, 
    onAnswer: (answer: string) => void,
    answered: boolean,
    onClose: () => void,
    modalRef?: React.RefObject<HTMLDivElement>
  ): React.ReactNode;
  
  renderScore(
    player: Player, 
    score: number, 
    total: number,
    showCoin: number,
    onCoinAnimationEnd: () => void,
    coinOrigin: { x: number; y: number } | null,
    coins: number
  ): React.ReactNode;
  
  renderWrongAnswers(wrongAnswers: string): React.ReactNode;
}