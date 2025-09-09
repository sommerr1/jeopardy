import { Page, Locator, expect } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  readonly gameBoard: Locator;
  readonly scoreBoard: Locator;
  readonly topBar: Locator;
  readonly questionModal: Locator;
  readonly questionText: Locator;
  readonly answerButtons: Locator;
  readonly closeButton: Locator;
  readonly modalOverlay: Locator;
  readonly gameOverScreen: Locator;
  readonly endScreen: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gameBoard = page.locator('[data-testid="game-board"]').first();
    this.scoreBoard = page.locator('[data-testid="score-board"]').first();
    this.topBar = page.locator('[data-testid="top-bar"]').first();
    this.questionModal = page.locator('.fixed.inset-0').first();
    this.questionText = page.locator('h2, h3').first();
    this.answerButtons = page.locator('.bg-white button:not([disabled]), .bg-gray-900 button:not([disabled])');
    this.closeButton = page.locator('button:has-text("Закрыть")').first();
    this.modalOverlay = page.locator('.fixed.inset-0').first();
    this.gameOverScreen = page.locator('text=Game Over').first();
    this.endScreen = page.locator('text=Игра окончена').first();
  }

  async waitForGameBoard() {
    // Wait for any game board structure to appear
    await this.page.waitForSelector('[data-testid="game-board"], .grid.grid-cols-1.sm\\:grid-cols-5, .w-full.max-w-4xl', { timeout: 10000 });
  }

  async selectQuestion() {
    // Wait for any available question cell to appear
    await this.page.waitForSelector('[data-testid="question-cell"]:not([disabled]), button:not([disabled])[class*="p-3"], button:not([disabled])[class*="rounded"]', { timeout: 10000 });
    
    // Try to find classic renderer question cells first
    const classicCells = this.page.locator('[data-testid="question-cell"]:not([disabled])');
    if (await classicCells.count() > 0) {
      // Try to click with force if element is intercepted
      try {
        await classicCells.first().click();
      } catch (error) {
        // If click fails due to interception, try force click
        await classicCells.first().click({ force: true });
      }
      return;
    }
    
    // Fallback to any clickable button that looks like a question cell
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

  async answerQuestion(answerIndex: number = 0) {
    // Ждем появления модального окна с вопросом
    await this.page.waitForSelector('h2, h3', { timeout: 5000 });
    
    // Ждем появления кнопок с вариантами ответов
    await this.page.waitForSelector('.bg-white button:not([disabled]), .bg-gray-900 button:not([disabled])', { timeout: 5000 });
    
    // Выбираем ответ по индексу
    const buttons = this.page.locator('.bg-white button:not([disabled]), .bg-gray-900 button:not([disabled])');
    const selectedButton = buttons.nth(answerIndex);
    await selectedButton.click();
    
    // Ждем появления результата
    try {
      await this.page.waitForSelector('p:has-text("Верно!")', { timeout: 3000 });
    } catch {
      await this.page.waitForSelector('p:has-text("Неверно!")', { timeout: 3000 });
    }
    
    // Ждем появления текста для закрытия
    await this.page.waitForSelector('p:has-text("Кликните вне окна, чтобы продолжить")', { timeout: 3000 });
    
    // Закрываем модальное окно
    await this.modalOverlay.click({ position: { x: 10, y: 10 } });
    
    // Ждем исчезновения модального окна
    await this.page.waitForSelector('.fixed.inset-0', { state: 'hidden', timeout: 10000 });
  }

  async getAvailableQuestionsCount() {
    // Count classic renderer question cells
    const classicCards = await this.page.locator('[data-testid="question-cell"]:not([disabled])').count();
    if (classicCards > 0) {
      return classicCards;
    }
    
    // Count fallback question cells (for other renderers)
    const fallbackCards = await this.page.locator('button:not([disabled])[class*="p-3"], button:not([disabled])[class*="rounded"]').count();
    return fallbackCards;
  }

  async playGame(maxQuestions: number = 10) {
    let questionsAnswered = 0;
    
    while (questionsAnswered < maxQuestions) {
      const availableQuestions = await this.getAvailableQuestionsCount();
      
      if (availableQuestions === 0) {
        console.log('No more questions available');
        break;
      }
      
      try {
        await this.selectQuestion();
        await this.answerQuestion();
        questionsAnswered++;
        console.log(`Answered question ${questionsAnswered}/${maxQuestions}`);
        await this.page.waitForTimeout(1000);
      } catch (error) {
        console.log('Error during gameplay:', error);
        break;
      }
    }
    
    return questionsAnswered;
  }

  async waitForGameEnd() {
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

  async expectGameStarted() {
    // Check if game elements are visible (more reliable than checking for hidden welcome screen)
    const classicBoardExists = await this.page.locator('[data-testid="game-board"]').count() > 0;
    const darkBoardExists = await this.page.locator('.grid.grid-cols-1.sm\\:grid-cols-5').count() > 0;
    const minimalBoardExists = await this.page.locator('.w-full.max-w-4xl').count() > 0;
    const scoreBoardExists = await this.page.locator('[data-testid="score-board"]').count() > 0;
    
    if (!classicBoardExists && !darkBoardExists && !minimalBoardExists && !scoreBoardExists) {
      throw new Error('Game has not started - neither game board nor score board are visible');
    }
  }

  async expectGameBoardVisible() {
    // Try different selectors for game board depending on renderer
    try {
      await expect(this.gameBoard).toBeVisible();
    } catch {
      // Fallback: look for any game board structure
      // Check for classic renderer structure
      const classicBoard = this.page.locator('[data-testid="game-board"]').first();
      if (await classicBoard.isVisible()) {
        await expect(classicBoard).toBeVisible();
        return;
      }
      
      // Check for dark renderer structure (grid with buttons)
      const darkBoard = this.page.locator('.grid.grid-cols-1.sm\\:grid-cols-5').first();
      if (await darkBoard.isVisible()) {
        await expect(darkBoard).toBeVisible();
        return;
      }
      
      // Check for minimal renderer structure
      const minimalBoard = this.page.locator('.w-full.max-w-4xl').first();
      if (await minimalBoard.isVisible()) {
        await expect(minimalBoard).toBeVisible();
        return;
      }
      
      // Final fallback: any button that looks like a game cell
      const gameBoardFallback = this.page.locator('.cell-btn, button[class*="p-3"], button[class*="rounded"]').first();
      await expect(gameBoardFallback).toBeVisible();
    }
  }

  async expectScoreBoardVisible() {
    await expect(this.scoreBoard).toBeVisible();
  }

  async getPlayerScore() {
    const scoreElement = this.page.locator('[data-testid="player-score"]').first();
    const scoreText = await scoreElement.textContent();
    return parseInt(scoreText || '0', 10);
  }

  async getPlayerLives() {
    const livesElement = this.page.locator('[data-testid="player-lives"]').first();
    const livesText = await livesElement.textContent();
    return parseInt(livesText || '0', 10);
  }

  async switchRenderer(rendererType: string) {
    const rendererSelect = this.page.locator('[data-testid="renderer-select"]').first();
    await rendererSelect.selectOption(rendererType);
  }

  async expectRendererApplied(rendererType: string) {
    // Проверяем, что выбранный рендерер применен
    const rendererSelect = this.page.locator('[data-testid="renderer-select"]').first();
    await expect(rendererSelect).toHaveValue(rendererType);
  }
} 