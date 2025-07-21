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
}; 