import { lookupIngredient } from '@/constants/ingredientsDB';
import { personalizationRules, getRecommendations } from '@/constants/healthRules';
import { lookupIngredientWikipedia } from '@/services/wikipediaApi';
import { lookupIngredientOBF } from '@/services/openBeautyFacts';
import { translateIngredientToEn, translateCompositionToEn, isCyrillic } from '@/services/translationService';
import { addMissingIngredient } from '@/services/missingIngredients';
import {
  UserProfile,
  AnalyzedIngredient,
  AnalysisResult,
  OverallRating,
  IngredientData,
} from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

function parseIngredients(raw: string): string[] {
  return raw
    .split(/[,;\/\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 200)
    .map(s => s.replace(/^\d+[\.\)]\s*/, ''))
    .map(s => s.replace(/[\(\)]/g, '').trim())
    .filter(s => s.length > 1);
}

function buildAnalyzedIngredient(
  originalName: string,
  data: IngredientData,
  profile: UserProfile
): AnalyzedIngredient {
  const analyzed: AnalyzedIngredient = {
    ...data,
    name: originalName,
    personalWarnings: [],
    isUnknown: false,
  };

  personalizationRules.forEach(rule => {
    if (rule.condition(profile, analyzed)) {
      analyzed.personalWarnings.push(rule.warning(analyzed));
    }
  });

  if (analyzed.personalWarnings.length > 0 && analyzed.color === 'green') {
    analyzed.color = 'yellow';
  }

  return analyzed;
}

function buildUnknownIngredient(name: string): AnalyzedIngredient {
  return {
    name,
    nameRu: name,
    category: 'unknown',
    categoryRu: 'Неизвестный',
    comedogenicity: 0,
    irritation: 0,
    allergenicity: false,
    effectiveness: 'neutral',
    tags: [],
    descriptionRu: 'Компонент не найден в базе данных',
    warningsRu: [],
    color: 'gray',
    personalWarnings: [],
    isUnknown: true,
  };
}

async function lookupExternalSources(name: string): Promise<IngredientData | null> {
  try {
    const obfResult = await lookupIngredientOBF(name);
    if (obfResult && obfResult.category !== 'unknown') {
      console.log('[Analyzer] Found in OBF:', name);
      return obfResult;
    }

    const wikiResult = await lookupIngredientWikipedia(name);
    if (wikiResult) {
      console.log('[Analyzer] Found in Wikipedia:', name);
      return wikiResult;
    }

    if (obfResult) {
      console.log('[Analyzer] Using basic OBF data for:', name);
      return obfResult;
    }
  } catch (e) {
    console.log('[Analyzer] External lookup failed for:', name, e);
  }

  return null;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateOverallRating(ingredients: AnalyzedIngredient[]): { rating: OverallRating; text: string } {
  const total = ingredients.length;
  const unknownCount = ingredients.filter(i => i.isUnknown).length;
  const known = ingredients.filter(i => !i.isUnknown);

  if (known.length === 0) {
    return { rating: 'gray', text: 'Недостаточно данных' };
  }

  const unknownRatio = unknownCount / total;
  if (unknownRatio > 0.6) {
    return { rating: 'gray', text: 'Неизвестно' };
  }

  const redCount = known.filter(i => i.color === 'red').length;
  const yellowCount = known.filter(i => i.color === 'yellow').length;
  const greenCount = known.filter(i => i.color === 'green').length;
  const grayCount = known.filter(i => i.color === 'gray').length;
  const totalPersonalWarnings = known.reduce((sum, i) => sum + i.personalWarnings.length, 0);

  const hasHighComedogenic = known.some(i => i.comedogenicity >= 4);
  const hasFormaldehyde = known.some(i => i.tags.includes('formaldehyde_releaser'));
  const hasRestricted = known.some(i => i.tags.includes('restricted'));

  if (hasFormaldehyde || hasRestricted || redCount >= 3) {
    return { rating: 'red', text: 'Не рекомендуется' };
  }

  if (hasHighComedogenic || redCount >= 2 || totalPersonalWarnings >= 5) {
    return { rating: 'red', text: 'Не рекомендуется' };
  }

  if (redCount >= 1 || yellowCount >= 3 || totalPersonalWarnings >= 3) {
    return { rating: 'yellow', text: 'С осторожностью' };
  }

  const knownRatio = known.length / total;
  if (knownRatio < 0.4) {
    return { rating: 'gray', text: 'Недостаточно данных' };
  }

  if (grayCount > greenCount && unknownCount <= total * 0.3) {
    return { rating: 'gray', text: 'Неэффективно' };
  }

  return { rating: 'green', text: 'Рекомендуется' };
}

function buildResult(
  rawIngredients: string,
  ingredients: AnalyzedIngredient[],
  profile: UserProfile,
  productName?: string
): AnalysisResult {
  const actives = ingredients.filter(
    i => !i.isUnknown && (
      i.category === 'active' ||
      i.category === 'exfoliant' ||
      i.category === 'antioxidant' ||
      i.effectiveness === 'high' ||
      i.effectiveness === 'medium'
    )
  );

  const allWarnings = new Set<string>();
  ingredients.forEach(i => {
    i.warningsRu.forEach(w => allWarnings.add(w));
  });

  const allPersonalWarnings = new Set<string>();
  ingredients.forEach(i => {
    i.personalWarnings.forEach(w => allPersonalWarnings.add(w));
  });

  const recommendations = getRecommendations(ingredients, profile);
  const { rating, text } = calculateOverallRating(ingredients);

  return {
    id: generateId(),
    date: new Date().toISOString(),
    productName: productName || '',
    rawIngredients,
    ingredients,
    overallRating: rating,
    overallText: text,
    actives,
    warnings: Array.from(allWarnings),
    personalWarnings: Array.from(allPersonalWarnings),
    recommendations,
  };
}

export function analyzeComposition(
  rawIngredients: string,
  profile: UserProfile,
  productName?: string
): AnalysisResult {
  console.log('[Analyzer] Sync analysis for:', productName || 'unnamed');
  const translated = translateCompositionToEn(rawIngredients);
  const ingredientNames = parseIngredients(translated);
  const ingredients = ingredientNames.map(name => {
    const englishName = translateIngredientToEn(name);
    const data = lookupIngredient(englishName) || lookupIngredient(name);
    if (data) return buildAnalyzedIngredient(name, data, profile);
    return buildUnknownIngredient(name);
  });
  const result = buildResult(rawIngredients, ingredients, profile, productName);
  console.log('[Analyzer] Sync complete. Rating:', result.overallRating);
  return result;
}

export async function analyzeCompositionAsync(
  rawIngredients: string,
  profile: UserProfile,
  productName?: string,
  onProgress?: (current: number, total: number) => void
): Promise<AnalysisResult> {
  console.log('[Analyzer] Async analysis for:', productName || 'unnamed');

  const translated = translateCompositionToEn(rawIngredients);
  console.log('[Analyzer] After translation:', translated.substring(0, 100) + '...');

  const ingredientNames = parseIngredients(translated);
  const rawParts = parseIngredients(rawIngredients);
  const totalCount = ingredientNames.length;
  console.log('[Analyzer] Parsed ingredients:', totalCount);

  const unknownIndices: number[] = [];
  const ingredients: AnalyzedIngredient[] = [];
  const originalNames: string[] = [];

  for (let i = 0; i < ingredientNames.length; i++) {
    const name = ingredientNames[i];
    const original = rawParts[i] || name;
    originalNames.push(original);

    const englishName = isCyrillic(name) ? translateIngredientToEn(name) : name;

    const localData = lookupIngredient(englishName) || (englishName !== name ? lookupIngredient(name) : null);
    if (localData) {
      const analyzed = buildAnalyzedIngredient(original, localData, profile);
      ingredients.push(analyzed);
    } else {
      ingredients.push(buildUnknownIngredient(original));
      unknownIndices.push(i);
    }

    if (onProgress) {
      onProgress(i + 1, totalCount);
      await delay(25);
    }
  }

  console.log('[Analyzer] Local DB found:', ingredientNames.length - unknownIndices.length, '/', totalCount);
  console.log('[Analyzer] Unknown locally:', unknownIndices.length);

  if (unknownIndices.length > 0) {
    for (let i = 0; i < unknownIndices.length; i++) {
      const idx = unknownIndices[i];
      const name = ingredientNames[idx];
      const englishName = isCyrillic(name) ? translateIngredientToEn(name) : name;

      try {
        const externalData = await lookupExternalSources(englishName);
        if (externalData) {
          const original = originalNames[idx];
          ingredients[idx] = buildAnalyzedIngredient(original, externalData, profile);
        }
      } catch (e) {
        console.log('[Analyzer] External lookup error for:', name, e);
      }

      if (onProgress) {
        const localFound = ingredientNames.length - unknownIndices.length;
        onProgress(localFound + i + 1, totalCount);
        await delay(25);
      }
    }

    const stillUnknown = unknownIndices.filter(idx => ingredients[idx].isUnknown);
    const genericDescription = unknownIndices.filter(
      idx => !ingredients[idx].isUnknown && (
        ingredients[idx].descriptionRu === 'Косметический компонент' ||
        ingredients[idx].descriptionRu.endsWith('— компонент косметических средств') ||
        ingredients[idx].category === 'unknown'
      )
    );
    console.log('[Analyzer] Still unknown after external lookup:', stillUnknown.length);
    console.log('[Analyzer] Generic description (no useful info):', genericDescription.length);

    const toCollect = [...stillUnknown, ...genericDescription];
    if (toCollect.length > 0) {
      for (const idx of toCollect) {
        const name = ingredientNames[idx];
        addMissingIngredient(name, productName).catch(() => {});
      }
      console.log('[Analyzer] Added', toCollect.length, 'missing/generic ingredients to collector');
    }
  }

  if (onProgress) {
    onProgress(totalCount, totalCount);
  }

  const result = buildResult(rawIngredients, ingredients, profile, productName);
  console.log('[Analyzer] Async complete. Rating:', result.overallRating, result.overallText);
  console.log('[Analyzer] Actives:', result.actives.length, 'Warnings:', result.warnings.length);
  return result;
}
