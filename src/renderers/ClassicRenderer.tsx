import React from 'react';
import { GameRenderer, Question, Player } from '../types';
import { GameBoard } from '../components/GameBoard';
import { QuestionModal } from '../components/QuestionModal';
import { ScoreBoard } from '../components/ScoreBoard';
import { renderWrongAnswers } from '../utils/renderWrongAnswers';

export class ClassicRenderer implements GameRenderer {
  renderBoard(
    questions: Question[], 
    answered: { [key: string]: boolean }, 
    onSelect: (q: Question) => void,
    wronganswersstr?: string
  ): React.ReactNode {
    return (
      <GameBoard
        questions={questions}
        answered={answered}
        onSelect={onSelect}
        wronganswersstr={wronganswersstr || ""}
        started={false}
      />
    );
  }

  renderQuestion(
    question: Question, 
    onAnswer: (answer: string) => void,
    answered: boolean,
    onClose: () => void,
    modalRef?: React.RefObject<HTMLDivElement>
  ): React.ReactNode {
    return (
      <QuestionModal
        question={question}
        onAnswer={onAnswer}
        answered={answered}
        onClose={onClose}
        modalRef={modalRef}
      />
    );
  }

  renderScore(
    player: Player, 
    score: number, 
    total: number,
    showCoin: number,
    onCoinAnimationEnd: () => void,
    coinOrigin: { x: number; y: number } | null,
    coins: number
  ): React.ReactNode {
    return (
      <ScoreBoard
        player={player}
        score={score}
        total={total}
        showCoin={showCoin}
        onCoinAnimationEnd={onCoinAnimationEnd}
        coinOrigin={coinOrigin}
        coins={coins}
      />
    );
  }

  renderWrongAnswers(wrongAnswers: string): React.ReactNode {
    return renderWrongAnswers(wrongAnswers);
  }
} 