import { Page, expect } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) {}

  async waitForAppLoad() {
    // Ждем загрузки приложения
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async selectSheet(sheetName?: string) {
    const sheetSelect = this.page.locator('select').first();
    
    if (sheetName) {
      await sheetSelect.selectOption(sheetName);
    } else {
      // Выбираем первый доступный лист
      const options = await sheetSelect.locator('option').all();
      if (options.length > 1) {
        await sheetSelect.selectOption({ index: 1 });
      }
    }
  }

  async createNewPlayer(playerName: string) {
    await this.page.locator('input[placeholder="Имя нового игрока"]').first().fill(playerName);
    await this.page.locator('button:has-text("Начать игру")').first().click();
  }

  async expectWelcomeScreen() {
    await expect(this.page.locator('h1').first()).toContainText('Jeopardy!');
    await expect(this.page.locator('p:has-text("Выберите лист для игры")').first()).toBeVisible();
  }

  async expectGameStarted() {
    // Проверяем, что мы больше не на приветственном экране
    await expect(this.page.locator('h1:has-text("Jeopardy!")').first()).not.toBeVisible();
  }
} 