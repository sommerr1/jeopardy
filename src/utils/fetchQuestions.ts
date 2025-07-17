import type { Question } from "../App";
import { SPREADSHEET_API_URL } from "./spreadsheetApiUrl";

const LOCAL_PROXY_URL = "http://localhost:3001/api/questions";

// Можно сделать выбор источника через переменную окружения или параметр
const USE_PROXY = true;

// export async function fetchQuestions(): Promise<Question[]> {
//   const url = USE_PROXY ? LOCAL_PROXY_URL : SPREADSHEET_API_URL;
//   const res = await fetch(url);
//   return await res.json();

// }

export async function fetchQuestions(): Promise<Question[]> {
  const url = USE_PROXY ? LOCAL_PROXY_URL : SPREADSHEET_API_URL;
  const res = await fetch(url);
  const data = await res.json();
  // Маппинг: если поле называется 'рейт' — копируем его в 'rate'
  return data.map((q: any) => ({
    ...q,
    rate: (q.rate === 1 || q["рейт"] === 1) ? 10 : (q.rate || q["рейт"] || ""),
  }));
}
