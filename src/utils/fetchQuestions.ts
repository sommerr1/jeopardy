import type { Question } from "../App";

const LOCAL_PROXY_URL = "http://localhost:3001/api/questions";
const SPREADSHEET_API_URL = "https://script.google.com/macros/s/AKfycbyvKRMoyi-9f3ZqTPR1HvVqAM6q2liuTSRJpqruKP0dxf7twTG7PIRAxs-ZrUWE8Ztd0w/exec";

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
  console.log("QUESTIONS FROM API:", data); // <-- debug log
  return data;
}
