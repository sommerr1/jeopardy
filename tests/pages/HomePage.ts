import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly title: Locator;
  readonly sheetSelect: Locator;
  readonly playerNameInput: Locator;
  readonly startGameButton: Locator;
  readonly loadingIndicator: Locator;
  readonly welcomeText: Locator;
  readonly instructionText: Locator;
  readonly mainContainer: Locator;
  readonly cardContainer: Locator;
  readonly gameTypeSelectorText: Locator;
  readonly classicGameButton: Locator;
  readonly rendererSelector: Locator;
  readonly availableRenderers: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1').first();
    this.sheetSelect = page.locator('select').first();
    this.playerNameInput = page.locator('input[placeholder="Имя нового игрока"]').first();
    this.startGameButton = page.locator('button:has-text("Начать игру")').first();
    this.loadingIndicator = page.locator('div:has-text("Загрузка...")').first();
    this.welcomeText = page.locator('p:has-text("Выберите лист для игры")').first();
    this.instructionText = page.locator('p:has-text("Введите имя, чтобы создать нового игрока, или выберите из списка")').first();
    this.mainContainer = page.locator('.min-h-screen').first();
    this.cardContainer = page.locator('.w-full.max-w-md.bg-white.rounded-lg.shadow-xl, .w-full.max-w-4xl.bg-white.rounded-2xl.shadow-2xl').first();
    
    // New locators for GameTypeSelector
    this.gameTypeSelectorText = page.locator('p:has-text("Выберите тип игры для начала")').first();
    this.classicGameButton = page.locator('button:has-text("Классическая игра")').first();
    
    // Renderer selector locators
    this.rendererSelector = page.locator('select').filter({ hasText: 'Классический' }).first();
    this.availableRenderers = page.locator('select option');
  }

  async goto() {
    try {
      await this.page.goto('http://localhost:5173');
    } catch (error) {
      // If localhost fails, try with explicit IP
      if (error.message.includes('NS_ERROR_CONNECTION_REFUSED') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        console.log('Localhost connection failed, trying with 127.0.0.1...');
        await this.page.goto('http://127.0.0.1:5173');
      } else {
        throw error;
      }
    }
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async waitForLoadingToComplete() {
    await this.page.waitForSelector('div:has-text("Загрузка...")', { state: 'hidden', timeout: 10000 });
  }

  async selectSheet(sheetName?: string) {
    // Wait for sheet select to be visible and enabled
    await this.page.waitForSelector('select:not([disabled])', { timeout: 10000 });
    
    // Wait for options to be loaded (check if there are options with values)
    await this.page.waitForFunction(() => {
      const select = document.querySelector('select');
      if (!select) return false;
      const options = Array.from(select.options);
      return options.some(option => option.value && option.value !== '');
    }, { timeout: 10000 });
    
    if (sheetName) {
      await this.sheetSelect.selectOption(sheetName);
    } else {
      const options = await this.sheetSelect.locator('option').all();
      if (options.length > 1) {
        await this.sheetSelect.selectOption({ index: 1 });
      }
    }
    
    // Wait for the selection to take effect and input to become enabled
    await this.page.waitForSelector('input[placeholder="Имя нового игрока"]:not([disabled])', { timeout: 10000 });
  }

  async createPlayer(playerName: string) {
    await this.playerNameInput.fill(playerName);
    await this.startGameButton.click();
  }

  async expectWelcomeScreen() {
    await expect(this.title).toContainText('Jeopardy!');
    await expect(this.gameTypeSelectorText).toBeVisible();
  }

  async selectGameType() {
    await this.classicGameButton.click();
  }

  async expectWelcomeScreenAfterGameType() {
    await expect(this.welcomeText).toBeVisible();
    await expect(this.instructionText).toBeVisible();
  }

  async switchRenderer(rendererType: string) {
    // Wait for renderer selector to be visible
    await this.page.waitForSelector('select', { timeout: 5000 });
    
    // Find the renderer selector by looking for the one with renderer options
    const rendererSelect = this.page.locator('select').filter({ hasText: 'Классический' }).first();
    
    if (await rendererSelect.isVisible()) {
      await rendererSelect.selectOption(rendererType);
      await this.page.waitForTimeout(500); // Wait for renderer to apply
    }
  }

  async expectRendererAvailable(rendererType: string) {
    const rendererSelect = this.page.locator('select').filter({ hasText: 'Классический' }).first();
    if (await rendererSelect.isVisible()) {
      // Check if the option exists in the select element
      const rendererOption = rendererSelect.locator(`option:has-text("${rendererType}")`).first();
      await expect(rendererOption).toHaveCount(1);
    }
  }

  async getCurrentRenderer() {
    const rendererSelect = this.page.locator('select').filter({ hasText: 'Классический' }).first();
    if (await rendererSelect.isVisible()) {
      return await rendererSelect.inputValue();
    }
    return null;
  }

  async expectFormElements() {
    await expect(this.sheetSelect).toBeVisible();
    await expect(this.playerNameInput).toBeVisible();
    await expect(this.startGameButton).toBeVisible();
  }

  async expectInitialState() {
    await expect(this.startGameButton).toBeDisabled();
    await expect(this.playerNameInput).toBeDisabled();
  }

  async expectActiveState() {
    await expect(this.playerNameInput).toBeEnabled();
    await expect(this.startGameButton).toBeEnabled();
  }

  async expectProperLayout() {
    await expect(this.mainContainer).toBeVisible();
    await expect(this.cardContainer).toBeVisible();
  }

  getSheetOptions() {
    return this.sheetSelect.locator('option');
  }

  async getSelectedSheetValue() {
    return await this.sheetSelect.inputValue();
  }
} 