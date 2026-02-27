export type SkinType = 'oily' | 'dry' | 'sensitive' | 'normal';

export type Concern =
  | 'acne'
  | 'rosacea'
  | 'couperose'
  | 'pigmentation'
  | 'aging'
  | 'dehydration'
  | 'enlarged_pores'
  | 'dullness'
  | 'dark_circles';

export type Preference =
  | 'looking_for_retinol'
  | 'looking_for_acids'
  | 'looking_for_peptides'
  | 'looking_for_vitamin_c'
  | 'looking_for_niacinamide'
  | 'looking_for_spf'
  | 'no_alcohol'
  | 'no_silicones'
  | 'no_essential_oils'
  | 'no_parabens'
  | 'no_sls'
  | 'no_fragrance'
  | 'vegan'
  | 'cruelty_free';

export interface UserProfile {
  skinTypes: SkinType[];
  concerns: Concern[];
  preferences: Preference[];
  isOnboarded: boolean;
}

export type IngredientColor = 'green' | 'yellow' | 'red' | 'gray';

export type IngredientCategory =
  | 'humectant'
  | 'emollient'
  | 'active'
  | 'emulsifier'
  | 'preservative'
  | 'fragrance'
  | 'colorant'
  | 'surfactant'
  | 'thickener'
  | 'solvent'
  | 'antioxidant'
  | 'sunscreen'
  | 'ph_adjuster'
  | 'chelating'
  | 'film_former'
  | 'occlusive'
  | 'exfoliant'
  | 'soothing'
  | 'base'
  | 'unknown';

export interface IngredientData {
  name: string;
  nameRu: string;
  category: IngredientCategory;
  categoryRu: string;
  comedogenicity: number;
  irritation: number;
  allergenicity: boolean;
  effectiveness: 'high' | 'medium' | 'low' | 'marketing' | 'neutral';
  tags: string[];
  descriptionRu: string;
  warningsRu: string[];
  color: IngredientColor;
}

export interface AnalyzedIngredient {
  name: string;
  nameRu: string;
  category: IngredientCategory;
  categoryRu: string;
  comedogenicity: number;
  irritation: number;
  allergenicity: boolean;
  effectiveness: 'high' | 'medium' | 'low' | 'marketing' | 'neutral';
  tags: string[];
  descriptionRu: string;
  warningsRu: string[];
  color: IngredientColor;
  personalWarnings: string[];
  isUnknown: boolean;
}

export type OverallRating = 'green' | 'yellow' | 'red' | 'gray';

export interface AnalysisResult {
  id: string;
  date: string;
  productName: string;
  barcode?: string;
  rawIngredients: string;
  ingredients: AnalyzedIngredient[];
  overallRating: OverallRating;
  overallText: string;
  actives: AnalyzedIngredient[];
  warnings: string[];
  personalWarnings: string[];
  recommendations: string[];
}

export interface HistoryItem {
  id: string;
  date: string;
  productName: string;
  overallRating: OverallRating;
  analysis: AnalysisResult;
}

export interface ExportData {
  version: string;
  exportDate: string;
  profile: UserProfile;
  history: HistoryItem[];
}

export interface MissingIngredient {
  name: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  products: string[];
}
