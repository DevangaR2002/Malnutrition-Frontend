export type Gender = "Male" | "Female";
export type WealthIndex = "Low" | "Middle" | "High";

export type PredictionRequest = {
  age_months: number;
  gender: Gender;
  mother_education: string;
  household_wealth_index: WealthIndex;
  height_cm: number;
  weight_kg: number;
  has_diarrhea: boolean;
  has_malaria: boolean;
  has_tb: boolean;
};

export type Recommendation = {
  category: string;
  recommendation: string;
  source: string;
};

export type XAIFactor = {
  feature: string;
  impact: number;
};

export type XAIBlock = {
  top_factors: XAIFactor[];
};

export type PredictionResponse = {
  id: number;
  prediction: number;
  risk_level: string;
  risk_probability: number;
  confidence: string;
  recommendations: Recommendation[];
  input_summary?: {
    age_months: number;
    gender: string;
    height_cm: number;
    weight_kg: number;
  };
  xai: XAIBlock | null; 
  xai_text: string | null;
  created_at: string;
};
