import { motion } from "framer-motion";

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-300 to-purple-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h1
        className="text-4xl font-bold mb-4"
        initial={{ y: -40 }}
        animate={{ y: 0 }}
      >
        Language Jeopardy!
      </motion.h1>
      <p className="mb-8 text-lg">Выберите ячейку, ответьте на вопросы и учите слова!</p>
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        onClick={onStart}
      >
        Начать игру
      </button>
    </motion.div>
  );
} 