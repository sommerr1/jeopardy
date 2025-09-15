import type { Question } from "../types";
import { getApiUrl, ENVIRONMENT } from "./environment";

export async function fetchSheetsList(): Promise<{id: number, name: string}[]> {
  const url = getApiUrl('questions', { getsheets: '1' });
  
  if (ENVIRONMENT.isDevelopment) {
    console.log('📋 Fetching sheets list from:', url);
  }
  
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Error fetching sheets list:', errorText);
    throw new Error(`Ошибка загрузки списка листов: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchQuestionsFromSheet(sheetName: string): Promise<Question[]> {
  const url = getApiUrl('questions', { name: sheetName });
  
  if (ENVIRONMENT.isDevelopment) {
    console.log('❓ Fetching questions from sheet:', sheetName, 'URL:', url);
  }
  
  const res = await fetch(url);
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
}
