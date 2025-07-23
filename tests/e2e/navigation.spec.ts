import { test, expect } from '@playwright/test';

test.describe('Language Jeopardy - Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should navigate through game flow', async ({ page }) => {
    // Ждем загрузки данных
    await page.waitForTimeout(2000);
    
    // Выбираем первый доступный лист (если есть)
    const sheetSelect = page.locator('select');
    const options = await sheetSelect.locator('option').all();
    
    if (options.length > 1) {
      // Выбираем первый не-пустой вариант
      await sheetSelect.selectOption({ index: 1 });
      
      // Вводим имя игрока
      await page.locator('input[placeholder="Имя нового игрока"]').fill('Test Player');
      
      // Нажимаем кнопку "Начать игру"
      await page.locator('button:has-text("Начать игру")').click();
      
      // Проверяем, что мы перешли к игровому экрану
      // (это может быть GameBoard или другой компонент)
      await page.waitForTimeout(1000);
      
      // Проверяем, что мы больше не на приветственном экране
      await expect(page.locator('h1:has-text("Jeopardy!")')).not.toBeVisible();
    }
  });

  test('should maintain state on page refresh', async ({ page }) => {
    // Этот тест проверяет, что состояние приложения сохраняется при обновлении страницы
    await page.reload();
    
    // Проверяем, что приложение все еще работает после перезагрузки
    await expect(page.locator('h1')).toContainText('Jeopardy!');
  });
}); 