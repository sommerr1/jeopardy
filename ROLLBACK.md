# Откат фикса «Следующие вопросы»

## Ветка
`fix/next-questions-stuck` — все изменения только здесь.

## Быстрый откат
```powershell
git checkout main
git branch -D fix/next-questions-stuck
```

## Откат с сохранением ветки
```powershell
git checkout main
```

## Что изменено
| Файл | Суть |
|------|------|
| `src/utils/questionUtils.ts` | **новый** — ключ вопроса, дедуп доски, проверка ошибок |
| `src/hooks/useQuestions.ts` | `getCurrentQuestions` = 1 вопрос на ячейку |
| `src/App.tsx` | новый ключ `answered`, фикс `anyWrongInCurrent`, сброс при смене игрока |
| `src/components/GameBoard.tsx` | `getQuestionKey` + `isQuestionWrongInLevel` |
| `src/renderers/*.tsx` | то же для альтернативных рендереров |

## План фикса (KB)
1. **Дедуп** — считать текущие вопросы как на доске (category+difficulty)
2. **Ключ answered** — `category|difficulty|question` вместо только `question`
3. **Ошибки** — `anyWrongInCurrent` через `isQuestionWrongInLevel` (как GameBoard)
4. **Сброс** — `answered` и `wronganswersCurrentLevel` при смене игрока
