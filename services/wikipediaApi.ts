import { getCached, setCache } from './apiCache';
import { IngredientData, IngredientCategory, IngredientColor } from '@/types';
import { translateDescriptionToRu } from './translationService';

const WIKI_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const TIMEOUT = 5000;

const categoryKeywords: Record<string, { category: IngredientCategory; categoryRu: string }> = {
  'surfactant': { category: 'surfactant', categoryRu: 'ПАВ' },
  'detergent': { category: 'surfactant', categoryRu: 'ПАВ' },
  'emulsif': { category: 'emulsifier', categoryRu: 'Эмульгатор' },
  'preserv': { category: 'preservative', categoryRu: 'Консервант' },
  'antimicrobial': { category: 'preservative', categoryRu: 'Консервант' },
  'moistur': { category: 'humectant', categoryRu: 'Увлажнитель' },
  'humectant': { category: 'humectant', categoryRu: 'Увлажнитель' },
  'hydrat': { category: 'humectant', categoryRu: 'Увлажнитель' },
  'emollient': { category: 'emollient', categoryRu: 'Эмолент' },
  'soften': { category: 'emollient', categoryRu: 'Эмолент' },
  'antioxidant': { category: 'antioxidant', categoryRu: 'Антиоксидант' },
  'sunscreen': { category: 'sunscreen', categoryRu: 'Солнцезащитный' },
  'uv filter': { category: 'sunscreen', categoryRu: 'Солнцезащитный' },
  'uv absorb': { category: 'sunscreen', categoryRu: 'Солнцезащитный' },
  'photoprotect': { category: 'sunscreen', categoryRu: 'Солнцезащитный' },
  'fragrance': { category: 'fragrance', categoryRu: 'Отдушка' },
  'perfume': { category: 'fragrance', categoryRu: 'Отдушка' },
  'aroma': { category: 'fragrance', categoryRu: 'Отдушка' },
  'scent': { category: 'fragrance', categoryRu: 'Отдушка' },
  'colorant': { category: 'colorant', categoryRu: 'Краситель' },
  'pigment': { category: 'colorant', categoryRu: 'Краситель' },
  'dye': { category: 'colorant', categoryRu: 'Краситель' },
  'thicken': { category: 'thickener', categoryRu: 'Загуститель' },
  'viscosity': { category: 'thickener', categoryRu: 'Загуститель' },
  'gelling': { category: 'thickener', categoryRu: 'Загуститель' },
  'solvent': { category: 'solvent', categoryRu: 'Растворитель' },
  'exfoli': { category: 'exfoliant', categoryRu: 'Эксфолиант' },
  'peel': { category: 'exfoliant', categoryRu: 'Эксфолиант' },
  'sooth': { category: 'soothing', categoryRu: 'Успокаивающий' },
  'anti-inflam': { category: 'soothing', categoryRu: 'Успокаивающий' },
  'calm': { category: 'soothing', categoryRu: 'Успокаивающий' },
  'chelat': { category: 'chelating', categoryRu: 'Хелатирующий агент' },
  'film': { category: 'film_former', categoryRu: 'Плёнкообразователь' },
  'occlusi': { category: 'occlusive', categoryRu: 'Окклюзив' },
  'barrier': { category: 'occlusive', categoryRu: 'Окклюзив' },
  'ph adjust': { category: 'ph_adjuster', categoryRu: 'Регулятор pH' },
  'buffer': { category: 'ph_adjuster', categoryRu: 'Регулятор pH' },
  'extract': { category: 'active', categoryRu: 'Экстракт' },
  'botanical': { category: 'active', categoryRu: 'Растительный компонент' },
  'herb': { category: 'active', categoryRu: 'Растительный компонент' },
  'plant': { category: 'active', categoryRu: 'Растительный компонент' },
  'skin care': { category: 'active', categoryRu: 'Актив' },
  'skincare': { category: 'active', categoryRu: 'Актив' },
  'condition': { category: 'emollient', categoryRu: 'Кондиционер' },
  'lubric': { category: 'emollient', categoryRu: 'Эмолент' },
  'fatty acid': { category: 'emollient', categoryRu: 'Жирная кислота' },
  'fatty alcohol': { category: 'emollient', categoryRu: 'Жирный спирт' },
  'wax': { category: 'occlusive', categoryRu: 'Воск' },
  'silicone': { category: 'emollient', categoryRu: 'Силикон' },
  'polymer': { category: 'thickener', categoryRu: 'Полимер' },
  'amino acid': { category: 'active', categoryRu: 'Аминокислота' },
  'peptide': { category: 'active', categoryRu: 'Пептид' },
  'vitamin': { category: 'active', categoryRu: 'Витамин' },
  'essential oil': { category: 'fragrance', categoryRu: 'Эфирное масло' },
};

const safetyKeywords = {
  dangerous: ['toxic', 'carcinogen', 'mutagen', 'banned', 'prohibited', 'hazardous', 'harmful', 'poison'],
  caution: ['irritat', 'sensitiz', 'allergen', 'controversial', 'concern', 'restrict', 'side effect', 'adverse'],
  beneficial: ['beneficial', 'protective', 'healing', 'therapeutic', 'medicin', 'treat', 'anti-aging', 'anti-wrinkle', 'wound heal', 'regenerat', 'nourish', 'repair'],
};

function detectCategory(text: string): { category: IngredientCategory; categoryRu: string } {
  const lower = text.toLowerCase();
  for (const [keyword, cat] of Object.entries(categoryKeywords)) {
    if (lower.includes(keyword)) {
      return cat;
    }
  }
  return { category: 'unknown', categoryRu: 'Компонент' };
}

function detectSafety(text: string, category: IngredientCategory): { color: IngredientColor; warnings: string[] } {
  const lower = text.toLowerCase();
  const warnings: string[] = [];

  for (const word of safetyKeywords.dangerous) {
    if (lower.includes(word)) {
      warnings.push('Потенциально опасный компонент');
      return { color: 'red', warnings };
    }
  }

  let hasCaution = false;
  for (const word of safetyKeywords.caution) {
    if (lower.includes(word)) {
      hasCaution = true;
      if (lower.includes('irritat')) warnings.push('Может вызвать раздражение');
      if (lower.includes('allergen') || lower.includes('sensitiz')) warnings.push('Потенциальный аллерген');
      if (lower.includes('restrict')) warnings.push('Имеет ограничения по использованию');
      if (lower.includes('side effect') || lower.includes('adverse')) warnings.push('Возможны побочные эффекты');
    }
  }

  if (hasCaution) {
    if (warnings.length === 0) warnings.push('Требует осторожности');
    return { color: 'yellow', warnings };
  }

  let hasBenefit = false;
  for (const word of safetyKeywords.beneficial) {
    if (lower.includes(word)) {
      hasBenefit = true;
      break;
    }
  }

  if (hasBenefit || category === 'active' || category === 'antioxidant' || category === 'humectant' || category === 'soothing') {
    return { color: 'green', warnings };
  }

  if (category === 'fragrance') {
    warnings.push('Отдушка — может вызвать реакцию у чувствительной кожи');
    return { color: 'yellow', warnings };
  }

  if (category !== 'unknown') {
    return { color: 'green', warnings };
  }

  return { color: 'gray', warnings };
}

function truncateText(text: string, maxSentences: number = 2): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, maxSentences).join(' ');
}

function buildWikiDescription(shortText: string, categoryRu: string, fullExtract: string): string {
  const lower = fullExtract.toLowerCase();

  const benefitPhrases: string[] = [];

  if (lower.includes('anti-aging') || lower.includes('anti-wrinkle')) benefitPhrases.push('антивозрастное действие');
  if (lower.includes('antioxidant')) benefitPhrases.push('антиоксидантная защита');
  if (lower.includes('moistur') || lower.includes('hydrat') || lower.includes('humectant')) benefitPhrases.push('увлажнение');
  if (lower.includes('anti-inflam') || lower.includes('sooth') || lower.includes('calm')) benefitPhrases.push('успокаивающее действие');
  if (lower.includes('brighten') || lower.includes('whiten') || lower.includes('lighten')) benefitPhrases.push('осветление кожи');
  if (lower.includes('wound heal') || lower.includes('regenerat') || lower.includes('repair')) benefitPhrases.push('восстановление кожи');
  if (lower.includes('antibacter') || lower.includes('antimicrob')) benefitPhrases.push('антибактериальное действие');
  if (lower.includes('collagen')) benefitPhrases.push('поддержка выработки коллагена');
  if (lower.includes('protect')) benefitPhrases.push('защита кожи');
  if (lower.includes('nourish')) benefitPhrases.push('питание кожи');
  if (lower.includes('firm') || lower.includes('elastic')) benefitPhrases.push('повышение упругости');
  if (lower.includes('cleansing') || lower.includes('cleanser')) benefitPhrases.push('очищение');
  if (lower.includes('exfoli')) benefitPhrases.push('отшелушивание');
  if (lower.includes('emollient') || lower.includes('soften') || lower.includes('smooth')) benefitPhrases.push('смягчение кожи');
  if (lower.includes('stabiliz') || lower.includes('stabilise')) benefitPhrases.push('стабилизация состава');
  if (lower.includes('foaming') || lower.includes('lather')) benefitPhrases.push('пенообразование');
  if (lower.includes('condition')) benefitPhrases.push('кондиционирование');
  if (lower.includes('thicken') || lower.includes('viscosity')) benefitPhrases.push('загущение состава');

  if (benefitPhrases.length > 0) {
    const uniqueBenefits = [...new Set(benefitPhrases)].slice(0, 3);
    return `${categoryRu} — ${uniqueBenefits.join(', ')}`;
  }

  const translated = translateDescriptionToRu(shortText, categoryRu);

  if (translated.includes('используется в косметических средствах') && categoryRu !== 'Компонент') {
    return `${categoryRu} — компонент косметических средств`;
  }

  if (categoryRu && categoryRu !== 'Компонент' && translated === 'Косметический компонент') {
    return `${categoryRu} — компонент косметических средств`;
  }

  return translated;
}

export async function lookupIngredientWikipedia(name: string): Promise<IngredientData | null> {
  const cacheKey = `wiki_${name.toLowerCase().replace(/\s+/g, '_')}`;
  const cached = await getCached<IngredientData>(cacheKey);
  if (cached) {
    console.log('[Wiki] Cache hit for:', name);
    return cached;
  }

  try {
    const encoded = encodeURIComponent(name.replace(/\s+/g, '_'));
    const url = `${WIKI_BASE}/${encoded}`;
    console.log('[Wiki] Fetching:', url);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CosmeticScanner/1.0' },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.log('[Wiki] Not found:', res.status);
      return null;
    }

    const data = await res.json();
    if (data.type === 'disambiguation' || data.type === 'not_found') {
      console.log('[Wiki] Disambiguation or not found');
      return null;
    }

    const extract = data.extract || '';
    if (extract.length < 20) {
      console.log('[Wiki] Extract too short');
      return null;
    }

    const { category, categoryRu } = detectCategory(extract);
    const { color, warnings } = detectSafety(extract, category);
    const shortEnglish = truncateText(extract);
    const descriptionRu = buildWikiDescription(shortEnglish, categoryRu, extract);

    const result: IngredientData = {
      name,
      nameRu: name,
      category,
      categoryRu,
      comedogenicity: 0,
      irritation: color === 'red' ? 2 : color === 'yellow' ? 1 : 0,
      allergenicity: warnings.some(w => w.includes('аллерген')),
      effectiveness: 'neutral',
      tags: [],
      descriptionRu,
      warningsRu: warnings,
      color,
    };

    console.log('[Wiki] Found:', name, '→', categoryRu, color);
    await setCache(cacheKey, result);
    return result;
  } catch (e) {
    console.log('[Wiki] Error:', e);
    return null;
  }
}
