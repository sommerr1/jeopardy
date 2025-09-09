import { chromium, FullConfig } from '@playwright/test';
import { TestConfig } from './config/test-config';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  // Check if dev server is running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log(`📡 Checking if dev server is available at ${TestConfig.BASE_URL}...`);
    await page.goto(TestConfig.BASE_URL, { timeout: TestConfig.TIMEOUTS.LONG });
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Verify the app is working
    const title = await page.title();
    if (title.includes('Jeopardy')) {
      console.log('✅ Dev server is running and app is accessible');
    } else {
      console.warn('⚠️  Dev server is running but app title is unexpected:', title);
    }
    
  } catch (error) {
    console.error('❌ Dev server is not accessible:', error);
    throw new Error('Dev server must be running before starting tests');
  } finally {
    await browser.close();
  }
  
  // Additional setup tasks can be added here
  console.log('📋 Setting up test environment...');
  
  // Create test data directories if needed
  // await fs.mkdir('test-results', { recursive: true });
  
  console.log('✅ Global setup completed successfully');
}

export default globalSetup; 