export const TestConfig = {
  // URLs
  BASE_URL: 'http://localhost:5173',
  
  // Timeouts
  TIMEOUTS: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 10000,
    VERY_LONG: 30000,
  },
  
  // Test data
  TEST_PLAYERS: {
    DEFAULT: 'Test Player',
    LONG_NAME: 'Very Long Player Name That Exceeds Normal Limits',
    SPECIAL_CHARS: 'Player@#$%^&*()',
    NUMBERS: 'Player123',
    UNICODE: 'Игрок с кириллицей',
  },
  
  // Game settings
  GAME: {
    MAX_QUESTIONS_PER_TEST: 10,
    MIN_QUESTIONS_TO_TEST: 3,
    RAPID_GAME_QUESTIONS: 5,
  },
  
  // Renderers
  RENDERERS: {
    CLASSIC: 'classic',
    MINIMAL: 'minimal',
    DARK: 'dark',
  },
  
  // Viewport sizes for responsive testing
  VIEWPORTS: {
    MOBILE: { width: 375, height: 667 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP: { width: 1920, height: 1080 },
  },
  
  // Selectors (centralized for easier maintenance)
  SELECTORS: {
    // Home page
    TITLE: 'h1',
    SHEET_SELECT: 'select',
    PLAYER_INPUT: 'input[placeholder="Имя нового игрока"]',
    START_BUTTON: 'button:has-text("Начать игру")',
    LOADING: 'div:has-text("Загрузка...")',
    WELCOME_TEXT: 'p:has-text("Выберите лист для игры")',
    INSTRUCTION_TEXT: 'p:has-text("Введите имя, чтобы создать нового игрока, или выберите из списка")',
    
    // Game page
    GAME_BOARD: '.cell-btn',
    SCORE_BOARD: '[data-testid="score-board"]',
    TOP_BAR: '[data-testid="top-bar"]',
    QUESTION_MODAL: '.fixed.inset-0',
    QUESTION_TEXT: 'h2, h3',
    ANSWER_BUTTONS: '.bg-white button:not([disabled]), .bg-gray-900 button:not([disabled])',
    CLOSE_BUTTON: 'button:has-text("Закрыть")',
    RENDERER_SELECT: '[data-testid="renderer-select"]',
    
    // Game states
    GAME_OVER: 'text=Game Over',
    GAME_COMPLETED: 'text=Игра окончена',
    
    // Styling classes for renderer testing
    CLASSIC_BG: '.bg-blue-100',
    MINIMAL_BG: '.bg-white',
    DARK_BG: '.bg-gray-900',
  },
  
  // Test categories
  TEST_CATEGORIES: {
    SMOKE: 'smoke',
    REGRESSION: 'regression',
    PERFORMANCE: 'performance',
    ACCESSIBILITY: 'accessibility',
    RENDERER: 'renderer',
  },
  
  // Browser configurations
  BROWSERS: {
    CHROMIUM: 'chromium',
    FIREFOX: 'firefox',
    WEBKIT: 'webkit',
  },
  
  // Environment settings
  ENVIRONMENT: {
    DEV: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
  },
};

export const TestUtils = {
  // Helper functions for common test operations
  async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = TestConfig.TIMEOUTS.MEDIUM,
    interval: number = 100
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    return false;
  },
  
  generateRandomPlayerName(): string {
    const adjectives = ['Quick', 'Smart', 'Fast', 'Bright', 'Clever', 'Wise'];
    const nouns = ['Player', 'Gamer', 'Champion', 'Hero', 'Master', 'Expert'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  },
  
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  },
  
  validatePlayerName(name: string): boolean {
    return name.length > 0 && name.length <= 50 && /^[a-zA-Zа-яА-Я0-9\s@#$%^&*()]+$/.test(name);
  },
  
  getTestData(category: string) {
    const testData = {
      validPlayerNames: [
        'Test Player',
        'Игрок Тест',
        'Player123',
        'Test@Player',
        'A'.repeat(50), // Maximum length
      ],
      invalidPlayerNames: [
        '',
        'A'.repeat(51), // Too long
        '   ', // Only spaces
        '🎮', // Emoji
      ],
      sheetNames: [
        'Test Sheet',
        'Another Sheet',
        'Sheet with Numbers 123',
      ],
    };
    
    return testData[category as keyof typeof testData] || [];
  },
}; 