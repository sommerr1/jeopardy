import { useState, useEffect, useRef } from "react";
import { Player } from "../types";

// --- COOKIE UTILS ---
function setCookie(name: string, value: any, days = 365) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const valueToStore = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${name}=${valueToStore}; expires=${expires}; path=/`;
}

function getCookie(name: string): any | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function useScore() {
  // Players state
  const initialPlayers = useRef(getCookie('jeopardy_players') || []);
  const [players, setPlayers] = useState<Player[]>(initialPlayers.current);
  const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(null);

  // Current player state
  const [level, setLevel] = useState(1);
  const [totalCoins, setTotalCoins] = useState(0);
  const [hp, setHp] = useState(5);
  const [consecutiveCorrectLevels, setConsecutiveCorrectLevels] = useState(0);
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);
  const [totalQuestionsAsked, setTotalQuestionsAsked] = useState(0);

  // Load player progress on login
  useEffect(() => {
    if (currentPlayerName) {
      const player = players.find(p => p.name === currentPlayerName);
      if (player) {
        setLevel(player.level);
        setTotalCoins(player.score);
        setHp(player.hp);
        setConsecutiveCorrectLevels(player.consecutiveCorrectLevels || 0);
        setTotalCorrectAnswers(player.totalCorrectAnswers || 0);
        setTotalQuestionsAsked(player.totalQuestionsAsked || 0);
      }
    }
  }, [currentPlayerName, players]);

  // Save player progress on change
  useEffect(() => {
    if (currentPlayerName) {
      const updatedPlayers = players.map(p =>
        p.name === currentPlayerName ? { 
          ...p, 
          level, 
          score: totalCoins, 
          hp, 
          consecutiveCorrectLevels,
          totalCorrectAnswers,
          totalQuestionsAsked
        } : p
      );
      if (JSON.stringify(updatedPlayers) !== JSON.stringify(players)) {
        setPlayers(updatedPlayers);
        setCookie('jeopardy_players', updatedPlayers);
      }
    }
  }, [level, totalCoins, hp, consecutiveCorrectLevels, totalCorrectAnswers, totalQuestionsAsked]);

  // Player management
  const login = (name: string) => {
    setCurrentPlayerName(name);
    const player = players.find(p => p.name === name);
    if (player) {
      setLevel(player.level);
      setTotalCoins(player.score);
      setHp(player.hp);
      setConsecutiveCorrectLevels(player.consecutiveCorrectLevels || 0);
      setTotalCorrectAnswers(player.totalCorrectAnswers || 0);
      setTotalQuestionsAsked(player.totalQuestionsAsked || 0);
    } else {
      setLevel(1);
      setTotalCoins(0);
      setHp(5);
      setConsecutiveCorrectLevels(0);
      setTotalCorrectAnswers(0);
      setTotalQuestionsAsked(0);
    }
  };

  const addPlayer = (name: string, sheet: string, gameType?: string) => {
    const existingPlayer = players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existingPlayer && existingPlayer.hp > 0) {
      login(existingPlayer.name);
    } else {
      const newPlayer: Player = { 
        name, 
        level: 1, 
        score: 0, 
        hp: 5, 
        consecutiveCorrectLevels: 0, 
        nameOfSheet: sheet,
        gameType: gameType || 'classic',
        totalCorrectAnswers: 0,
        totalQuestionsAsked: 0
      };
      const updatedPlayers = players.filter(p => p.name.toLowerCase() !== name.toLowerCase());
      setPlayers([...updatedPlayers, newPlayer]);
      setCookie('jeopardy_players', [...updatedPlayers, newPlayer]);
      login(name);
    }
  };

  const logout = () => {
    setCurrentPlayerName(null);
  };

  const restart = () => {
    if (!currentPlayerName) return;
    const updatedPlayers = players.map(p =>
      p.name === currentPlayerName ? { 
        ...p, 
        level: 1, 
        score: 0, 
        hp: 5, 
        consecutiveCorrectLevels: 0,
        totalCorrectAnswers: 0,
        totalQuestionsAsked: 0
      } : p
    );
    setPlayers(updatedPlayers);
    setCookie('jeopardy_players', updatedPlayers);
    setLevel(1);
    setTotalCoins(0);
    setHp(5);
    setConsecutiveCorrectLevels(0);
    setTotalCorrectAnswers(0);
    setTotalQuestionsAsked(0);
  };

  // Direct setters for game logic
  return {
    players,
    setPlayers,
    currentPlayerName,
    setCurrentPlayerName,
    level,
    setLevel,
    totalCoins,
    setTotalCoins,
    hp,
    setHp,
    consecutiveCorrectLevels,
    setConsecutiveCorrectLevels,
    totalCorrectAnswers,
    setTotalCorrectAnswers,
    totalQuestionsAsked,
    setTotalQuestionsAsked,
    login,
    addPlayer,
    logout,
    restart,
  };
} 