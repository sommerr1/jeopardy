import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";

type Props = {
  score: number;
  total: number;
  showCoin?: number;
  onCoinAnimationEnd?: () => void;
  coinOrigin?: { x: number; y: number } | null;
  coins: number;
  level: number;
  hp: number;
  playerName: string;
};

export function ScoreBoard({ score, total, showCoin = 0, onCoinAnimationEnd, coinOrigin, coins, level, hp, playerName }: Props) {
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

  const renderHearts = () => {
    return (
      <span className="ml-4 flex items-center relative">
        {Array.from({ length: hp }).map((_, i) => (
          <span key={i} className="text-2xl text-red-500">
            ❤️
          </span>
        ))}
        <AnimatePresence>
          {showPlusOne && (
            <motion.div
              initial={{ opacity: 1, x: '-50%', y: '-50%', scale: 1, position: 'fixed', top: '50%', left: '50%' }}
              animate={{ opacity: 0, x: '100%', y: '-150%', scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="text-red-500 font-bold text-7xl"
              style={{ zIndex: 2000 }}
            >
              + ❤️
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    );
  };

  return (
    <div className="relative mt-4 mb-2 text-lg font-semibold flex items-center justify-center min-h-[40px]">
      <span className="mr-8 text-green-700 font-bold">Имя: {playerName}</span>
      {/* Removed image to the left of Level */}
      <span className="mr-8 text-blue-700 font-bold">Уровень: {level}</span>
      <AnimatePresence>
        {Array.from({ length: showCoin }).map((_, i) => {
          // fallback если нет координат
          const from = coinOrigin || { x: 100, y: 300 };
          // Центрируем монету относительно центра области очков
          const to = target
            ? {
                x: target.x + target.w / 2 - 16, // 16 = половина финального размера монеты (w-8 = 32px, scale 0.5)
                y: target.y + target.h / 2 - 16,
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
              transition={{ duration: 0.3, ease: "easeInOut", delay: i * 0.1 }}
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
      <span ref={scoreRef}>
        Вопросы: {score} / {total}
        {" "}
        <span className="ml-4">Очки: {coins}</span>
      </span>
      {renderHearts()}
    </div>
  );
} 