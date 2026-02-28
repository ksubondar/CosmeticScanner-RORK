import { UserProfile, AnalyzedIngredient } from '@/types';

export interface PersonalizationRule {
  condition: (profile: UserProfile, ingredient: AnalyzedIngredient) => boolean;
  warning: (ingredient: AnalyzedIngredient) => string;
}

export const personalizationRules: PersonalizationRule[] = [
  {
    condition: (p, i) => p.skinTypes.includes('oily') && i.comedogenicity >= 3,
    warning: (i) => `У вас жирная кожа — ${i.name} имеет высокую комедогенность (${i.comedogenicity}/5)`,
  },
  {
    condition: (p, i) => p.skinTypes.includes('oily') && i.tags.includes('occlusive') && i.comedogenicity >= 2,
    warning: () => 'Тяжёлые окклюзивы могут забивать поры при жирной коже',
  },
  {
    condition: (p, i) => p.skinTypes.includes('sensitive') && i.irritation >= 2,
    warning: (i) => `У вас чувствительная кожа — ${i.name} может вызвать раздражение`,
  },
  {
    condition: (p, i) => p.skinTypes.includes('sensitive') && i.tags.includes('fragrance'),
    warning: (i) => `Чувствительная кожа: ${i.name} — отдушка, может раздражать`,
  },
  {
    condition: (p, i) => p.skinTypes.includes('sensitive') && i.tags.includes('essential_oils'),
    warning: (i) => `Чувствительная кожа: ${i.name} — эфирное масло, потенциальный раздражитель`,
  },
  {
    condition: (p, i) => p.skinTypes.includes('sensitive') && i.tags.includes('alcohol') && !i.tags.includes('fatty_alcohol'),
    warning: () => 'Чувствительная кожа: спирт может сушить и раздражать',
  },
  {
    condition: (p, i) => p.skinTypes.includes('dry') && i.tags.includes('alcohol') && !i.tags.includes('fatty_alcohol'),
    warning: () => 'Сухая кожа: спирт будет дополнительно сушить',
  },
  {
    condition: (p, i) => p.skinTypes.includes('dry') && i.tags.includes('drying'),
    warning: (i) => `Сухая кожа: ${i.name} может сушить кожу`,
  },
  {
    condition: (p, i) => p.concerns.includes('acne') && i.comedogenicity >= 3,
    warning: (i) => `Склонность к акне: ${i.name} может забивать поры (комедогенность ${i.comedogenicity}/5)`,
  },
  {
    condition: (p, i) => p.concerns.includes('acne') && i.irritation >= 2,
    warning: (i) => `Склонность к акне: ${i.name} может усилить воспаления`,
  },
  {
    condition: (p, i) => p.concerns.includes('rosacea') && i.tags.includes('essential_oils'),
    warning: (i) => `Розацеа: ${i.name} — эфирное масло может усилить покраснение`,
  },
  {
    condition: (p, i) => p.concerns.includes('rosacea') && i.tags.includes('alcohol') && !i.tags.includes('fatty_alcohol'),
    warning: () => 'Розацеа: спирт может вызвать обострение',
  },
  {
    condition: (p, i) => p.concerns.includes('rosacea') && i.tags.includes('fragrance'),
    warning: () => 'Розацеа: отдушки могут вызвать обострение',
  },
  {
    condition: (p, i) => p.concerns.includes('couperose') && i.irritation >= 2,
    warning: (i) => `Купероз: ${i.name} может усилить покраснение`,
  },
  {
    condition: (p, i) => p.preferences.includes('no_alcohol') && i.tags.includes('alcohol') && !i.tags.includes('fatty_alcohol'),
    warning: (i) => `Вы избегаете спирта — ${i.name} содержит спирт`,
  },
  {
    condition: (p, i) => p.preferences.includes('no_silicones') && i.tags.includes('silicones'),
    warning: (i) => `Вы избегаете силиконов — ${i.name} является силиконом`,
  },
  {
    condition: (p, i) => p.preferences.includes('no_essential_oils') && i.tags.includes('essential_oils'),
    warning: (i) => `Вы избегаете эфирных масел — ${i.name}`,
  },
  {
    condition: (p, i) => p.preferences.includes('no_parabens') && i.tags.includes('parabens'),
    warning: (i) => `Вы избегаете парабенов — ${i.name} является парабеном`,
  },
  {
    condition: (p, i) => p.preferences.includes('no_sls') && (i.tags.includes('sls') || i.tags.includes('sles')),
    warning: (i) => `Вы избегаете SLS/SLES — ${i.name}`,
  },
  {
    condition: (p, i) => p.preferences.includes('no_fragrance') && i.tags.includes('fragrance'),
    warning: (i) => `Вы избегаете отдушек — ${i.name}`,
  },
  {
    condition: (p, i) => p.preferences.includes('vegan') && i.tags.includes('allergen') && i.name.toLowerCase().includes('lanolin'),
    warning: () => 'Вы предпочитаете веганские продукты — ланолин имеет животное происхождение',
  },
];

export function getRecommendations(ingredients: AnalyzedIngredient[], profile: UserProfile): string[] {
  const recs: string[] = [];
  const tags = new Set<string>();
  ingredients.forEach(i => i.tags.forEach(t => tags.add(t)));

  if (tags.has('retinol') || tags.has('acids') || tags.has('aha') || tags.has('bha')) {
    recs.push('Средство содержит ретинол или кислоты — обязательно наносите SPF 30+ утром');
  }

  if (tags.has('retinol') && (tags.has('aha') || tags.has('bha'))) {
    recs.push('В составе есть ретинол и кислоты одновременно — используйте с осторожностью, чередуйте');
  }

  if (tags.has('vitamin_c') && tags.has('retinol')) {
    recs.push('Витамин C и ретинол лучше использовать в разное время (утро/вечер)');
  }

  if (tags.has('brightening')) {
    recs.push('Средство с осветляющими компонентами — используйте SPF для лучшего результата');
  }

  if (profile.concerns.includes('acne') && tags.has('acne_fighter')) {
    recs.push('Средство содержит компоненты для борьбы с акне — хороший выбор для вашей кожи');
  }

  if (profile.concerns.includes('aging') && tags.has('anti_aging')) {
    recs.push('Средство содержит антивозрастные компоненты — подходит для вашего профиля');
  }

  if (profile.concerns.includes('pigmentation') && tags.has('anti_pigmentation')) {
    recs.push('Средство содержит осветляющие компоненты — подходит при пигментации');
  }

  if (profile.preferences.includes('looking_for_retinol') && tags.has('retinol')) {
    recs.push('Вы искали ретинол — он найден в составе');
  }

  if (profile.preferences.includes('looking_for_acids') && (tags.has('aha') || tags.has('bha') || tags.has('pha'))) {
    recs.push('Вы искали кислоты — они найдены в составе');
  }

  if (profile.preferences.includes('looking_for_peptides') && tags.has('peptides')) {
    recs.push('Вы искали пептиды — они найдены в составе');
  }

  if (profile.preferences.includes('looking_for_vitamin_c') && tags.has('vitamin_c')) {
    recs.push('Вы искали витамин C — он найден в составе');
  }

  if (profile.preferences.includes('looking_for_niacinamide') && tags.has('niacinamide')) {
    recs.push('Вы искали ниацинамид — он найден в составе');
  }

  if (profile.preferences.includes('looking_for_spf') && tags.has('spf')) {
    recs.push('Вы искали SPF — солнцезащитные фильтры найдены');
  }

  return recs;
}

export const skinTypeLabels: Record<string, string> = {
  oily: 'Жирная/проблемная',
  dry: 'Сухая',
  sensitive: 'Чувствительная',
  normal: 'Нормальная',
};

export const concernLabels: Record<string, string> = {
  acne: 'Акне',
  rosacea: 'Розацеа',
  couperose: 'Купероз',
  pigmentation: 'Пигментация',
  aging: 'Возрастные изменения',
  dehydration: 'Обезвоженность',
  enlarged_pores: 'Расширенные поры',
  dullness: 'Тусклость',
  dark_circles: 'Тёмные круги',
};

export const preferenceLabels: Record<string, string> = {
  looking_for_retinol: 'Ищу ретинол',
  looking_for_acids: 'Ищу кислоты',
  looking_for_peptides: 'Ищу пептиды',
  looking_for_vitamin_c: 'Ищу витамин C',
  looking_for_niacinamide: 'Ищу ниацинамид',
  looking_for_spf: 'Ищу SPF',
  no_alcohol: 'Без спирта',
  no_silicones: 'Без силиконов',
  no_essential_oils: 'Без эфирных масел',
  no_parabens: 'Без парабенов',
  no_sls: 'Без SLS/SLES',
  no_fragrance: 'Без отдушек',
  vegan: 'Веган',
  cruelty_free: 'Не тестируется на животных',
};
