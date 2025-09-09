import { Page, expect } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) {}

  async waitForAppLoad() {
    // Ждем загрузки приложения
    await this.page.waitForLoadState('networkidle');
    
    // Ждем завершения загрузки данных
    await this.page.waitForSelector('div:has-text("Загрузка...")', { state: 'hidden', timeout: 10000 });
    
    // Ждем появления основных элементов
    await this.page.waitForSelector('h1:has-text("Jeopardy!")', { timeout: 10000 });
    
    // Ждем появления селекта (может быть изначально скрыт)
    await this.page.waitForSelector('select', { timeout: 10000 });
    
    await this.page.waitForTimeout(1000);
  }

  async selectSheet(sheetName?: string) {
    // Ждем завершения загрузки данных
    await this.page.waitForSelector('div:has-text("Загрузка...")', { state: 'hidden', timeout: 10000 });
    
    // Ждем появления селекта (может быть изначально скрыт)
    await this.page.waitForSelector('select', { timeout: 10000 });
    
    // Ждем, что селект стал активным
    await this.page.waitForSelector('select:not([disabled])', { timeout: 15000 });
    
    // Ждем загрузки опций (проверяем, что есть опции с значениями)
    await this.page.waitForFunction(() => {
      const select = document.querySelector('select');
      if (!select) return false;
      const options = Array.from(select.options);
      return options.some(option => option.value && option.value !== '');
    }, { timeout: 15000 });
    
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
    
    // Ждем, что поле ввода стало активным после выбора листа
    await this.page.waitForSelector('input[placeholder="Имя нового игрока"]:not([disabled])', { timeout: 10000 });
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

  async selectFirstQuestion() {
    // Ждем появления игровой доски с поддержкой разных рендереров
    await this.page.waitForSelector('.cell-btn:not([disabled]), button:not([disabled])[class*="p-3"], button:not([disabled])[class*="rounded"]', { timeout: 10000 });
    
    // Сначала пробуем найти классические ячейки
    const classicCells = this.page.locator('.cell-btn:not([disabled])');
    if (await classicCells.count() > 0) {
      try {
        await classicCells.first().click();
      } catch (error) {
        // If click fails due to interception, try force click
        await classicCells.first().click({ force: true });
      }
      return;
    }
    
    // Fallback для других рендереров
    const fallbackCells = this.page.locator('button:not([disabled])[class*="p-3"], button:not([disabled])[class*="rounded"]');
    if (await fallbackCells.count() > 0) {
      try {
        await fallbackCells.first().click();
      } catch (error) {
        // If click fails due to interception, try force click
        await fallbackCells.first().click({ force: true });
      }
      return;
    }
    
    throw new Error('No available question cells found');
  }

  async answerQuestion(correctAnswer: boolean = true) {
    // Ждем появления модального окна с вопросом
    await this.page.waitForSelector('h2, h3', { timeout: 5000 });
    
    // Ждем появления кнопок с вариантами ответов (внутри модального окна) с поддержкой разных рендереров
    await this.page.waitForSelector('.bg-white button:not([disabled]), .bg-gray-900 button:not([disabled])', { timeout: 5000 });
    
    // Выбираем первый доступный ответ (внутри модального окна) с поддержкой разных рендереров
    const answerButtons = this.page.locator('.bg-white button:not([disabled]), .bg-gray-900 button:not([disabled])');
    const firstButton = answerButtons.first();
    await firstButton.click();
    
    // Ждем появления объяснения (либо "Верно!", либо "Неверно!")
    try {
      await this.page.waitForSelector('p:has-text("Верно!")', { timeout: 3000 });
    } catch {
      await this.page.waitForSelector('p:has-text("Неверно!")', { timeout: 3000 });
    }
    
    // Ждем появления текста "Кликните вне окна, чтобы продолжить"
    await this.page.waitForSelector('p:has-text("Кликните вне окна, чтобы продолжить")', { timeout: 3000 });
    
    // Закрываем модальное окно, кликнув на оверлей (не на модальное окно)
    const overlay = this.page.locator('.fixed.inset-0');
    await overlay.click({ position: { x: 10, y: 10 } });
    
    // Ждем исчезновения модального окна
    await this.page.waitForSelector('.fixed.inset-0', { state: 'hidden', timeout: 10000 });
  }

  async waitForGameBoard() {
    // Ждем появления игровой доски с поддержкой разных рендереров
    await this.page.waitForSelector('.cell-btn, .grid.grid-cols-1.sm\\:grid-cols-5, .w-full.max-w-4xl', { timeout: 10000 });
  }

  async getAvailableQuestionsCount() {
    // Подсчитываем количество доступных (не отвеченных) вопросов с поддержкой разных рендереров
    const classicCards = await this.page.locator('.cell-btn:not([disabled])').count();
    if (classicCards > 0) {
      return classicCards;
    }
    
    // Fallback для других рендереров
    const fallbackCards = await this.page.locator('button:not([disabled])[class*="p-3"], button:not([disabled])[class*="rounded"]').count();
    return fallbackCards;
  }

  async playFullGame(maxQuestions: number = 10) {
    // Играем до тех пор, пока не ответим на maxQuestions вопросов или не закончатся вопросы
    let questionsAnswered = 0;
    
    while (questionsAnswered < maxQuestions) {
      const availableQuestions = await this.getAvailableQuestionsCount();
      
      if (availableQuestions === 0) {
        console.log('No more questions available');
        break;
      }
      
      try {
        // Выбираем вопрос
        await this.selectFirstQuestion();
        
        // Отвечаем на вопрос
        await this.answerQuestion();
        
        questionsAnswered++;
        console.log(`Answered question ${questionsAnswered}/${maxQuestions}`);
        
        // Небольшая пауза между вопросами
        await this.page.waitForTimeout(1000);
        
      } catch (error) {
        console.log('Error during gameplay:', error);
        break;
      }
    }
    
    return questionsAnswered;
  }

  async waitForGameEnd() {
    // Ждем появления экрана окончания игры или game over
    try {
      await this.page.waitForSelector('text=Игра окончена', { timeout: 5000 });
      return 'game_completed';
    } catch {
      try {
        await this.page.waitForSelector('text=Game Over', { timeout: 5000 });
        return 'game_over';
      } catch {
        return 'still_playing';
      }
    }
  }
} 