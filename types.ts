export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  timestamp: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  note?: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: Meal[];
}

export interface GeminiAnalysisResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  servingSize?: string;
}
