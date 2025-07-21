import type { Question } from "../types";
import { SPREADSHEET_API_URL } from "./spreadsheetApiUrl";

const LOCAL_PROXY_URL = "http://localhost:3001/api/questions";
const USE_PROXY = false; // теперь работаем только с Google API

export async function fetchSheetsList(): Promise<{id: number, name: string}[]> {
  const url = `${SPREADSHEET_API_URL}?getsheets=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка загрузки списка листов');
  return await res.json();
}

export async function fetchQuestionsFromSheet(sheetName: string): Promise<Question[]> {
  const url = `${SPREADSHEET_API_URL}?name=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка загрузки вопросов');
  const data = await res.json();
  return data.map((q: any) => ({
    ...q,
    rate: (q.rate === 1 || q["рейт"] === 1) ? 10 : (q.rate || q["рейт"] || ""),
  }));
}
