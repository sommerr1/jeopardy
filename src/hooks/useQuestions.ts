import { useState, useEffect, useCallback, useRef } from "react";
import type { Question } from "../types";
import { fetchQuestionsFromSheet } from "../utils/fetchQuestions";

export function useQuestions(selectedSheet: string | null, currentPlayerName: string | null) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentRows, setCurrentRows] = useState<string[]>([]);
  const [usedRows, setUsedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref для отслеживания текущего запроса
  const currentRequestRef = useRef<AbortController | null>(null);
  const lastFetchedSheetRef = useRef<string | null>(null);

  // Загрузка вопросов при смене листа
  useEffect(() => {
    // Отменяем предыдущий запрос, если он есть
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
      currentRequestRef.current = null;
    }

    if (selectedSheet && selectedSheet !== lastFetchedSheetRef.current) {
      console.log('🔄 Loading questions for sheet:', selectedSheet);
      setLoading(true);
      setError(null);
      
      // Создаем новый AbortController для этого запроса
      const controller = new AbortController();
      currentRequestRef.current = controller;
      lastFetchedSheetRef.current = selectedSheet;

      fetchQuestionsFromSheet(selectedSheet, controller.signal)
        .then((data) => {
          // Проверяем, не был ли запрос отменен
          if (!controller.signal.aborted) {
            console.log('✅ Questions loaded successfully:', data.length);
            setQuestions(data);
            setError(null);
          } else {
            console.log('🚫 Request was aborted, ignoring response');
          }
        })
        .catch((err) => {
          // Проверяем, не был ли запрос отменен
          if (!controller.signal.aborted) {
            console.error('❌ Error fetching questions:', err);
            setError(err instanceof Error ? err.message : 'Ошибка загрузки вопросов');
            setQuestions([]);
          } else {
            console.log('🚫 Request was aborted, ignoring error');
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    } else if (!selectedSheet) {
      console.log('🔄 No sheet selected, clearing questions');
      setQuestions([]);
      setError(null);
      setLoading(false);
      lastFetchedSheetRef.current = null;
    }

    // Cleanup функция
    return () => {
      if (currentRequestRef.current) {
        console.log('🧹 Cleaning up request controller');
        currentRequestRef.current.abort();
        currentRequestRef.current = null;
      }
    };
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
    loading,
    error,
  };
} 