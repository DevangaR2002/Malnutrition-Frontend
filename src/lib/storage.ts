import { PredictionResponse } from "./types";

const LAST_RESULT_KEY = "mr_last_result";
const HISTORY_KEY = "mr_history";

export function saveLastResult(result: PredictionResponse) {
  localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
}

export function loadLastResult(): PredictionResponse | null {
  const raw = localStorage.getItem(LAST_RESULT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function addToHistory(result: PredictionResponse) {
  const raw = localStorage.getItem(HISTORY_KEY);
  const history: PredictionResponse[] = raw ? JSON.parse(raw) : [];
  history.unshift(result);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export function loadHistory(): PredictionResponse[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
