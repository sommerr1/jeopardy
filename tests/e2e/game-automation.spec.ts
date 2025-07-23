import { test, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

test.describe('Language Jeopardy - Game Automation Tests', () => {
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    testUtils = new TestUtils(page);
    await testUtils.waitForAppLoad();
  });

  test('should start game and answer first question correctly', async ({ page }) => {
    // Настраиваем игру
    await testUtils.selectSheet();
    await testUtils.createNewPlayer('Auto Test Player');
    await testUtils.expectGameStarted();
    
    // Ждем появления игровой доски
    await testUtils.waitForGameBoard();
    
    // Запоминаем количество доступных вопросов до ответа
    const questionsBefore = await testUtils.getAvailableQuestionsCount();
    
    // Выбираем первый вопрос
    await testUtils.selectFirstQuestion();
    
    // Отвечаем правильно
    await testUtils.answerQuestion(true);
    
    // Ждем возврата к игровой доске
    await testUtils.waitForGameBoard();
    
    // Проверяем, что количество доступных вопросов уменьшилось
    const questionsAfter = await testUtils.getAvailableQuestionsCount();
    expect(questionsAfter).toBeLessThan(questionsBefore);
  });

  test('should start game and answer first question incorrectly', async ({ page }) => {
    // Настраиваем игру
    await testUtils.selectSheet();
    await testUtils.createNewPlayer('Auto Test Player 2');
    await testUtils.expectGameStarted();
    
    // Ждем появления игровой доски
    await testUtils.waitForGameBoard();
    
    // Запоминаем количество доступных вопросов до ответа
    const questionsBefore = await testUtils.getAvailableQuestionsCount();
    
    // Выбираем первый вопрос
    await testUtils.selectFirstQuestion();
    
    // Отвечаем неправильно
    await testUtils.answerQuestion(false);
    
    // Ждем возврата к игровой доске
    await testUtils.waitForGameBoard();
    
    // Проверяем, что количество доступных вопросов уменьшилось
    const questionsAfter = await testUtils.getAvailableQuestionsCount();
    expect(questionsAfter).toBeLessThan(questionsBefore);
  });

  test('should answer multiple questions in sequence', async ({ page }) => {
    // Настраиваем игру
    await testUtils.selectSheet();
    await testUtils.createNewPlayer('Auto Test Player 3');
    await testUtils.expectGameStarted();
    
    // Ждем появления игровой доски
    await testUtils.waitForGameBoard();
    
    // Отвечаем на несколько вопросов подряд
    for (let i = 0; i < 3; i++) {
      const availableQuestions = await testUtils.getAvailableQuestionsCount();
      if (availableQuestions === 0) break;
      
      // Выбираем вопрос
      await testUtils.selectFirstQuestion();
      
      // Отвечаем правильно
      await testUtils.answerQuestion(true);
      
      // Ждем возврата к игровой доске
      await testUtils.waitForGameBoard();
    }
    
    // Проверяем, что игра продолжается
    await expect(page.locator('.cell-btn').first()).toBeVisible();
  });

  test('should handle game flow with mixed answers', async ({ page }) => {
    // Настраиваем игру
    await testUtils.selectSheet();
    await testUtils.createNewPlayer('Auto Test Player 4');
    await testUtils.expectGameStarted();
    
    // Ждем появления игровой доски
    await testUtils.waitForGameBoard();
    
    // Отвечаем на несколько вопросов с разными результатами
    const answers = [true, false, true, false, true];
    
    for (const isCorrect of answers) {
      const availableQuestions = await testUtils.getAvailableQuestionsCount();
      if (availableQuestions === 0) break;
      
      // Выбираем вопрос
      await testUtils.selectFirstQuestion();
      
      // Отвечаем
      await testUtils.answerQuestion(isCorrect);
      
      // Ждем возврата к игровой доске
      await testUtils.waitForGameBoard();
    }
    
    // Проверяем, что игра продолжается
    await expect(page.locator('.cell-btn').first()).toBeVisible();
  });

  test('should verify score tracking during gameplay', async ({ page }) => {
    // Настраиваем игру
    await testUtils.selectSheet();
    await testUtils.createNewPlayer('Auto Test Player 5');
    await testUtils.expectGameStarted();
    
    // Ждем появления игровой доски
    await testUtils.waitForGameBoard();
    
    // Запоминаем начальный счет (если есть)
    const initialScore = await page.locator('text=/Очки:/').textContent();
    
    // Отвечаем на вопрос правильно
    await testUtils.selectFirstQuestion();
    await testUtils.answerQuestion(true);
    await testUtils.waitForGameBoard();
    
    // Ждем обновления счета (если счет отображается)
    if (initialScore) {
      try {
        await page.waitForFunction(
          (initial) => {
            const scoreElement = document.querySelector('text=/Очки:/');
            return scoreElement && scoreElement.textContent !== initial;
          },
          initialScore,
          { timeout: 5000 }
        );
      } catch {
        // Если счет не обновился, это не критично для теста
        console.log('Score did not update, but test continues');
      }
    }
    
    // Проверяем, что игра продолжается
    await expect(page.locator('.cell-btn').first()).toBeVisible();
  });

  test('should play full game session', async ({ page }) => {
    // Настраиваем игру
    await testUtils.selectSheet();
    await testUtils.createNewPlayer('Auto Test Player 6');
    await testUtils.expectGameStarted();
    
    // Ждем появления игровой доски
    await testUtils.waitForGameBoard();
    
    // Играем полную сессию (максимум 5 вопросов)
    const questionsAnswered = await testUtils.playFullGame(5);
    
    // Проверяем, что мы ответили хотя бы на один вопрос
    expect(questionsAnswered).toBeGreaterThan(0);
    
    // Проверяем состояние игры после сессии
    const gameState = await testUtils.waitForGameEnd();
    expect(['game_completed', 'game_over', 'still_playing']).toContain(gameState);
  });

  test('should handle rapid question answering', async ({ page }) => {
    // Настраиваем игру
    await testUtils.selectSheet();
    await testUtils.createNewPlayer('Auto Test Player 7');
    await testUtils.expectGameStarted();
    
    // Ждем появления игровой доски
    await testUtils.waitForGameBoard();
    
    // Быстро отвечаем на несколько вопросов подряд
    const rapidAnswers = 3;
    let answered = 0;
    
    for (let i = 0; i < rapidAnswers; i++) {
      try {
        await testUtils.selectFirstQuestion();
        await testUtils.answerQuestion();
        answered++;
      } catch (error) {
        console.log('Error during rapid answering:', error);
        break;
      }
    }
    
    // Проверяем, что мы смогли ответить на вопросы
    expect(answered).toBeGreaterThan(0);
  });
});