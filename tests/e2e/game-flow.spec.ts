import { test, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

test.describe('Language Jeopardy - Game Flow Tests', () => {
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    testUtils = new TestUtils(page);
    await testUtils.waitForAppLoad();
  });

  test('should complete full game setup flow', async ({ page }) => {
    // Проверяем начальное состояние
    await testUtils.expectWelcomeScreen();
    
    // Выбираем лист
    await testUtils.selectSheet();
    
    // Создаем нового игрока
    await testUtils.createNewPlayer('E2E Test Player');
    
    // Проверяем, что игра началась
    await testUtils.expectGameStarted();
  });

  test('should handle multiple player creation', async ({ page }) => {
    await testUtils.selectSheet();
    
    // Создаем первого игрока
    await testUtils.createNewPlayer('Player 1');
    await testUtils.expectGameStarted();
    
    // Возвращаемся на главную страницу (если есть такая возможность)
    await page.goto('http://localhost:5173');
    await testUtils.waitForAppLoad();
    
    // Создаем второго игрока
    await testUtils.selectSheet();
    await testUtils.createNewPlayer('Player 2');
    await testUtils.expectGameStarted();
  });
}); 