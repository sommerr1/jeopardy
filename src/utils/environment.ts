// Определение окружения и конфигурация API
import { SPREADSHEET_API_URL } from "./spreadsheetApiUrl";

// Определение окружения
export const ENVIRONMENT = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isNetlify: window.location.hostname.includes('netlify.app') || 
             window.location.hostname.includes('netlify.com'),
  isLocalhost: window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1',
  mode: import.meta.env.MODE,
  hostname: window.location.hostname
} as const;

// Настройки API в зависимости от окружения
export const API_CONFIG = {
  useProxy: ENVIRONMENT.isLocalhost && ENVIRONMENT.isDevelopment,
  useNetlifyFunctions: ENVIRONMENT.isNetlify || (!ENVIRONMENT.isLocalhost && ENVIRONMENT.isProduction),
  useDirectApi: false // Google Sheets API не поддерживает CORS
} as const;

// URL для API запросов
export const getApiUrl = (endpoint: string, params?: Record<string, string>) => {
  const searchParams = new URLSearchParams(params);
  const queryString = searchParams.toString();
  
  if (API_CONFIG.useProxy) {
    // Локальная разработка с прокси
    return `http://localhost:3001/api/${endpoint}${queryString ? '?' + queryString : ''}`;
  } else if (API_CONFIG.useNetlifyFunctions) {
    // Netlify Functions
    return `/.netlify/functions/${endpoint}${queryString ? '?' + queryString : ''}`;
  } else {
    // Fallback на прямые запросы (может не работать из-за CORS)
    return `${SPREADSHEET_API_URL}${queryString ? '?' + queryString : ''}`;
  }
};

// Логирование для отладки
if (ENVIRONMENT.isDevelopment) {
  console.log('🔧 Environment Detection:', {
    hostname: ENVIRONMENT.hostname,
    isNetlify: ENVIRONMENT.isNetlify,
    isLocalhost: ENVIRONMENT.isLocalhost,
    isDevelopment: ENVIRONMENT.isDevelopment,
    isProduction: ENVIRONMENT.isProduction,
    mode: ENVIRONMENT.mode,
    apiConfig: API_CONFIG
  });
}
