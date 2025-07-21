import { useState, useEffect, useCallback } from "react";
import type { Question } from "../types";
import { fetchQuestionsFromSheet } from "../utils/fetchQuestions";

export function useQuestions(selectedSheet: string | null, currentPlayerName: string | null) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentRows, setCurrentRows] = useState<string[]>([]);
  const [usedRows, setUsedRows] = useState<Set<string>>(new Set());

  // Загрузка вопросов при смене листа
  useEffect(() => {
    if (selectedSheet) {
      fetchQuestionsFromSheet(selectedSheet).then(setQuestions);
    } else {
      setQuestions([]);
    }
  }, [selectedSheet]);

  // Выбор категорий при смене игрока, вопросов или использованных рядов
  useEffect(() => {
    if (questions.length === 0 || !currentPlayerName) {
      setCurrentRows([]);
      return;
    }
    const allCategories = Array.from(new Set(questions.map(q => q.category)));
    const available = allCategories.filter(cat => !usedRows.has(cat));
    if (available.length === 0) {
      setCurrentRows([]);
      return;
    }
    let selected: string[] = [];
    const count = Math.min(available.length, 2);
    while (selected.length < count) {
      const idx = Math.floor(Math.random() * available.length);
      const cat = available[idx];
      if (!selected.includes(cat)) {
        selected.push(cat);
      }
    }
    setCurrentRows(selected);
  }, [currentPlayerName, usedRows, questions]);

  // Получить вопросы текущих категорий
  const getCurrentQuestions = useCallback(() => {
    return questions.filter(q => currentRows.includes(q.category));
  }, [questions, currentRows]);

  // Получить все доступные категории
  const getAvailableCategories = useCallback(() => {
    return questions.length > 0
      ? Array.from(new Set(questions.map(q => q.category))).filter(cat => !usedRows.has(cat))
      : [];
  }, [questions, usedRows]);

  // Перейти к следующим вопросам (категориям)
  const nextQuestions = useCallback((anyWrongInCurrent: boolean) => {
    setUsedRows(prev => {
      const next = new Set(prev);
      if (anyWrongInCurrent) {
        currentRows.forEach(cat => next.delete(cat));
      } else {
        currentRows.forEach(cat => next.add(cat));
      }
      return next;
    });
  }, [currentRows]);

  // Сбросить прогресс по вопросам
  const resetQuestions = useCallback(() => {
    setUsedRows(new Set());
    setCurrentRows([]);
  }, []);

  return {
    questions,
    currentRows,
    usedRows,
    setUsedRows,
    setCurrentRows,
    getCurrentQuestions,
    getAvailableCategories,
    nextQuestions,
    resetQuestions,
    setQuestions, // на случай, если потребуется ручная установка
  };
} 