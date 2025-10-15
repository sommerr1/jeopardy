import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { Player } from '../types';
import { Hearts } from './Hearts';

type Props = {
  player: Player;
  score: number;
  total: number;
  showCoin?: number;
  onCoinAnimationEnd?: () => void;
  coinOrigin?: { x: number; y: number } | null;
  coins: number;
};

export function ScoreBoard({ player, score, total, showCoin = 0, onCoinAnimationEnd, coinOrigin, coins }: Props) {
  const { level, hp, name: playerName } = player;
  const [showPlusOne, setShowPlusOne] = useState(false);
  const prevHpRef = useRef(hp);

  useEffect(() => {
    if (hp > prevHpRef.current) {
      setShowPlusOne(true);
      const timer = setTimeout(() => setShowPlusOne(false), 1000); // Animation duration
      return () => clearTimeout(timer);
    }
    prevHpRef.current = hp;
  }, [hp]);

  // Получаем позицию области очков
  const scoreRef = React.useRef<HTMLSpanElement>(null);
  const [target, setTarget] = React.useState<{ x: number; y: number; w: number; h: number } | null>(null);

  React.useEffect(() => {
    if (scoreRef.current) {
      const rect = scoreRef.current.getBoundingClientRect();
      setTarget({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
    }
  }, [scoreRef.current]);

  return (
    <div className="relative mt-3 mb-2 font-semibold flex flex-col items-center justify-center min-h-[40px] text-base sm:text-lg" data-testid="score-board">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
        <span className="text-green-700 font-bold">Имя: {playerName}</span>
        <span className="text-blue-700 font-bold">Уровень: {level}</span>
        <span>
          Вопросы: {score} / {total}
        </span>
      </div>
      <AnimatePresence>
        {Array.from({ length: showCoin }).map((_, i) => {
          // fallback если нет координат
          const from = coinOrigin || { x: 100, y: 300 };
          // Центрируем монету относительно центра области очков
          const to = target
            ? {
                x: target.x + target.w / 2 - 16, // 16 = половина финального размера монеты (w-8 = 32px, scale 0.5)
                y: target.y + target.h / 2 - 116, // Летим выше (на 100px вверх)
              }
            : { x: 0, y: 0 };
          return (
            <motion.div
              key={i}
              initial={{
                position: "fixed",
                left: from.x,
                top: from.y,
                scale: 2,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                left: to.x,
                top: to.y,
                scale: 0.5,
                opacity: 0.7,
                rotate: 720,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut", delay: i * 0.1 }}
              style={{ zIndex: 1000, pointerEvents: "none" }}
              onAnimationComplete={onCoinAnimationEnd}
            >
              <span
                className="block w-16 h-16 text-4xl bg-yellow-300 rounded-full border-4 border-yellow-400 shadow-lg flex items-center justify-center text-yellow-800 font-bold"
                style={{
                  boxShadow: "0 0 10px 2px #facc15, 0 0 0 2px #fbbf24 inset",
                }}
              >
                10
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div className="flex items-center justify-center gap-4 mt-1">
        <span ref={scoreRef} className="" data-testid="player-score">Очки: {coins}</span>
        <Hearts hp={hp} showPlusOne={showPlusOne} />
      </div>
    </div>
  );
} 