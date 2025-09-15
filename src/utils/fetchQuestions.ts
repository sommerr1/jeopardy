import type { Question } from "../types";
import { getApiUrl, ENVIRONMENT } from "./environment";

// Кэш для списка листов
const SHEETS_CACHE_KEY = 'jeopardy_sheets_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// Флаги для предотвращения одновременных запросов
let isFetchingSheets = false;
const activeRequests = new Map<string, AbortController>();

interface CachedSheets {
  data: {id: number, name: string}[];
  timestamp: number;
}

function getCachedSheets(): {id: number, name: string}[] | null {
  try {
    const cached = localStorage.getItem(SHEETS_CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CachedSheets = JSON.parse(cached);
    const now = Date.now();
    
    // Проверяем, не устарел ли кэш
    if (now - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(SHEETS_CACHE_KEY);
      return null;
    }
    
    return parsed.data;
  } catch (error) {
    console.warn('⚠️ Failed to read sheets cache:', error);
    localStorage.removeItem(SHEETS_CACHE_KEY);
    return null;
  }
}

function setCachedSheets(sheets: {id: number, name: string}[]): void {
  try {
    const cache: CachedSheets = {
      data: sheets,
      timestamp: Date.now()
    };
    localStorage.setItem(SHEETS_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('⚠️ Failed to cache sheets:', error);
  }
}

export async function fetchSheetsList(useCache: boolean = true): Promise<{id: number, name: string}[]> {
  // Проверяем кэш
  if (useCache) {
    const cached = getCachedSheets();
    if (cached) {
      if (ENVIRONMENT.isDevelopment) {
        console.log('📋 Using cached sheets list:', cached.length, 'sheets');
      }
      return cached;
    }
  }

  // Предотвращаем одновременные запросы
  if (isFetchingSheets) {
    if (ENVIRONMENT.isDevelopment) {
      console.log('📋 Sheets request already in progress, waiting...');
    }
    // Ждем завершения текущего запроса
    while (isFetchingSheets) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    // После завершения проверяем кэш еще раз
    const cached = getCachedSheets();
    if (cached) {
      return cached;
    }
  }

  isFetchingSheets = true;
  
  const url = getApiUrl('questions', { getsheets: '1' });
  
  if (ENVIRONMENT.isDevelopment) {
    console.log('📋 Fetching sheets list from:', url);
    console.log('🔧 Environment info:', {
      isDevelopment: ENVIRONMENT.isDevelopment,
      isLocalhost: ENVIRONMENT.isLocalhost,
      hostname: ENVIRONMENT.hostname,
      useProxy: true
    });
    console.log('🌐 Full request details:', {
      url,
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд timeout
  
  try {
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error fetching sheets list:', errorText);
      throw new Error(`Ошибка загрузки списка листов: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Кэшируем результат
    setCachedSheets(data);
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (ENVIRONMENT.isDevelopment) {
      console.error('❌ Detailed error info:', {
        error,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        url,
        timestamp: new Date().toISOString()
      });
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Превышено время ожидания загрузки списка листов');
    }
    
    throw error;
  } finally {
    isFetchingSheets = false;
  }
}

export async function fetchQuestionsFromSheet(sheetName: string, signal?: AbortSignal): Promise<Question[]> {
  const url = getApiUrl('questions', { name: sheetName });
  
  // Проверяем, есть ли уже активный запрос для этого листа
  const existingRequest = activeRequests.get(sheetName);
  if (existingRequest) {
    if (ENVIRONMENT.isDevelopment) {
      console.log('❓ Request already in progress for sheet:', sheetName, 'cancelling previous request');
    }
    existingRequest.abort();
  }
  
  if (ENVIRONMENT.isDevelopment) {
    console.log('❓ Fetching questions from sheet:', sheetName, 'URL:', url);
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд timeout
  
  // Сохраняем контроллер для этого листа
  activeRequests.set(sheetName, controller);
  
  // Объединяем сигналы
  const combinedSignal = signal ? 
    (() => {
      const combined = new AbortController();
      const abort = () => {
        controller.abort();
        combined.abort();
      };
      signal.addEventListener('abort', abort);
      controller.signal.addEventListener('abort', abort);
      return combined.signal;
    })() : 
    controller.signal;
  
  try {
    const res = await fetch(url, { 
      signal: combinedSignal,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error fetching questions:', errorText);
      throw new Error(`Ошибка загрузки вопросов: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.map((q: any) => ({
      ...q,
      rate: (q.rate === 1 || q["рейт"] === 1) ? 10 : (q.rate || q["рейт"] || ""),
    }));
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (ENVIRONMENT.isDevelopment) {
      console.error('❌ Detailed error info for questions:', {
        error,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        url,
        sheetName,
        timestamp: new Date().toISOString()
      });
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Превышено время ожидания загрузки вопросов');
    }
    
    throw error;
  } finally {
    // Удаляем контроллер из активных запросов
    activeRequests.delete(sheetName);
  }
}
