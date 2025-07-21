import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeartsProps {
  hp: number;
  showPlusOne: boolean;
}

export const Hearts: React.FC<HeartsProps> = ({ hp, showPlusOne }) => (
  <span className="ml-4 flex items-center relative">
    {Array.from({ length: hp }).map((_, i) => (
      <span key={i} className="text-2xl text-red-500">
        {'❤️'}
      </span>
    ))}
    <AnimatePresence>
      {showPlusOne && (
        <motion.div
          initial={{ opacity: 1, x: '-50%', y: '-50%', scale: 1, position: 'fixed', top: '50%', left: '50%' }}
          animate={{ opacity: 0, x: '100%', y: '-350%', scale: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3 }}
          className="text-red-500 font-bold text-7xl"
          style={{ zIndex: 2000 }}
        >
          + {'❤️'}
        </motion.div>
      )}
    </AnimatePresence>
  </span>
); 