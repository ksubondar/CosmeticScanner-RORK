const ruToEnDict: Record<string, string> = {
  'вода': 'Water',
  'вода очищенная': 'Water',
  'глицерин': 'Glycerin',
  'ретинол': 'Retinol',
  'ретиналь': 'Retinal',
  'ретинил пальмитат': 'Retinyl Palmitate',
  'ниацинамид': 'Niacinamide',
  'пантенол': 'Panthenol',
  'аллантоин': 'Allantoin',
  'мочевина': 'Urea',
  'кофеин': 'Caffeine',
  'коллаген': 'Collagen',
  'эластин': 'Elastin',
  'сера': 'Sulfur',
  'спирт': 'Alcohol',
  'сквалан': 'Squalane',
  'бисаболол': 'Bisabolol',
  'бакучиол': 'Bakuchiol',
  'бетаин': 'Betaine',
  'ресвератрол': 'Resveratrol',
  'трегалоза': 'Trehalose',
  'арбутин': 'Arbutin',
  'альфа-арбутин': 'Alpha-Arbutin',
  'бензоилпероксид': 'Benzoyl Peroxide',
  'адапален': 'Adapalene',
  'гиалуроновая кислота': 'Hyaluronic Acid',
  'гиалуронат натрия': 'Sodium Hyaluronate',
  'салициловая кислота': 'Salicylic Acid',
  'гликолевая кислота': 'Glycolic Acid',
  'молочная кислота': 'Lactic Acid',
  'миндальная кислота': 'Mandelic Acid',
  'азелаиновая кислота': 'Azelaic Acid',
  'койевая кислота': 'Kojic Acid',
  'транексамовая кислота': 'Tranexamic Acid',
  'феруловая кислота': 'Ferulic Acid',
  'лимонная кислота': 'Citric Acid',
  'аскорбиновая кислота': 'Ascorbic Acid',
  'стеариновая кислота': 'Stearic Acid',
  'пальмитиновая кислота': 'Palmitic Acid',
  'лактобионовая кислота': 'Lactobionic Acid',
  'полигидроксикислота': 'Polyhydroxy Acid',
  'витамин с': 'Ascorbic Acid',
  'витамин с (аскорбиновая кислота)': 'Ascorbic Acid',
  'витамин е': 'Tocopherol',
  'витамин а': 'Retinol',
  'витамин b3': 'Niacinamide',
  'витамин b5': 'Panthenol',
  'токоферол': 'Tocopherol',
  'токоферил ацетат': 'Tocopheryl Acetate',
  'диметикон': 'Dimethicone',
  'циклопентасилоксан': 'Cyclopentasiloxane',
  'циклогексасилоксан': 'Cyclohexasiloxane',
  'парфюмерная композиция': 'Parfum',
  'отдушка': 'Fragrance',
  'ароматизатор': 'Fragrance',
  'линалоол': 'Linalool',
  'лимонен': 'Limonene',
  'цитронеллол': 'Citronellol',
  'гераниол': 'Geraniol',
  'феноксиэтанол': 'Phenoxyethanol',
  'этилгексилглицерин': 'Ethylhexylglycerin',
  'метилпарабен': 'Methylparaben',
  'пропилпарабен': 'Propylparaben',
  'бутилпарабен': 'Butylparaben',
  'лаурилсульфат натрия': 'Sodium Lauryl Sulfate',
  'лауретсульфат натрия': 'Sodium Laureth Sulfate',
  'кокамидопропил бетаин': 'Cocamidopropyl Betaine',
  'коко-глюкозид': 'Coco-Glucoside',
  'денатурированный спирт': 'Alcohol Denat',
  'изопропиловый спирт': 'Isopropyl Alcohol',
  'цетиловый спирт': 'Cetyl Alcohol',
  'цетеариловый спирт': 'Cetearyl Alcohol',
  'стеариловый спирт': 'Stearyl Alcohol',
  'изопропилмиристат': 'Isopropyl Myristate',
  'изопропилпальмитат': 'Isopropyl Palmitate',
  'кокосовое масло': 'Coconut Oil',
  'масло кокоса': 'Cocos Nucifera Oil',
  'масло жожоба': 'Jojoba Oil',
  'аргановое масло': 'Argan Oil',
  'масло арганы': 'Argania Spinosa Kernel Oil',
  'масло ши': 'Shea Butter',
  'масло ши (карите)': 'Butyrospermum Parkii Butter',
  'масло шиповника': 'Rosehip Oil',
  'масло чайного дерева': 'Tea Tree Oil',
  'масло лаванды': 'Lavandula Angustifolia Oil',
  'масло эвкалипта': 'Eucalyptus Oil',
  'касторовое масло': 'Ricinus Communis Seed Oil',
  'подсолнечное масло': 'Helianthus Annuus Seed Oil',
  'оливковое масло': 'Olea Europaea Fruit Oil',
  'минеральное масло': 'Mineral Oil',
  'жидкий парафин': 'Paraffinum Liquidum',
  'вазелин': 'Petrolatum',
  'ланолин': 'Lanolin',
  'пропиленгликоль': 'Propylene Glycol',
  'бутиленгликоль': 'Butylene Glycol',
  'карбомер': 'Carbomer',
  'ксантановая камедь': 'Xanthan Gum',
  'гидроксид натрия': 'Sodium Hydroxide',
  'триэтаноламин': 'Triethanolamine',
  'динатрий эдта': 'Disodium EDTA',
  'бентонит': 'Bentonite',
  'каолин': 'Kaolin',
  'оксид цинка': 'Zinc Oxide',
  'диоксид титана': 'Titanium Dioxide',
  'авобензон': 'Avobenzone',
  'октиноксат': 'Octinoxate',
  'экстракт зелёного чая': 'Camellia Sinensis Leaf Extract',
  'экстракт зеленого чая': 'Camellia Sinensis Leaf Extract',
  'экстракт алоэ вера': 'Aloe Barbadensis Leaf Extract',
  'сок алоэ вера': 'Aloe Barbadensis Leaf Juice',
  'алоэ вера': 'Aloe Barbadensis Leaf Juice',
  'экстракт центеллы азиатской': 'Centella Asiatica Extract',
  'центелла азиатская': 'Centella Asiatica Extract',
  'мадекассозид': 'Madecassoside',
  'экстракт корня солодки': 'Glycyrrhiza Glabra Root Extract',
  'муцин улитки': 'Snail Secretion Filtrate',
  'гамамелис': 'Witch Hazel',
  'гидрохинон': 'Hydroquinone',
  'пчелиный воск': 'Cera Alba',
  'бензоат натрия': 'Sodium Benzoate',
  'сорбат калия': 'Potassium Sorbate',
  'хлорид натрия': 'Sodium Chloride',
  'керамид np': 'Ceramide NP',
  'керамид ap': 'Ceramide AP',
  'керамид eop': 'Ceramide EOP',
  'полисорбат 20': 'Polysorbate 20',
  'полисорбат 80': 'Polysorbate 80',
  'глицерил стеарат': 'Glyceryl Stearate',
  'глюконолактон': 'Gluconolactone',
  'медный трипептид-1': 'Copper Tripeptide-1',
  'гидролат гамамелиса': 'Hamamelis Virginiana Water',
  'пкн натрия': 'Sodium PCA',
};

const enToRuTerms: Record<string, string> = {
  'moisturizer': 'увлажнитель',
  'moisturizing': 'увлажняющий',
  'humectant': 'увлажнитель',
  'emollient': 'смягчающий компонент',
  'surfactant': 'поверхностно-активное вещество',
  'preservative': 'консервант',
  'antioxidant': 'антиоксидант',
  'anti-aging': 'антивозрастной',
  'anti-inflammatory': 'противовоспалительный',
  'sunscreen': 'солнцезащитный',
  'uv filter': 'УФ-фильтр',
  'fragrance': 'отдушка',
  'colorant': 'краситель',
  'thickener': 'загуститель',
  'emulsifier': 'эмульгатор',
  'solvent': 'растворитель',
  'chelating agent': 'хелатирующий агент',
  'skin conditioning': 'кондиционирование кожи',
  'skin conditioner': 'кондиционер для кожи',
  'skin protectant': 'защита кожи',
  'hair conditioning': 'кондиционирование волос',
  'viscosity controlling': 'контроль вязкости',
  'ph adjuster': 'регулятор pH',
  'buffering': 'буфер',
  'cleansing': 'очищающий',
  'exfoliant': 'эксфолиант',
  'soothing': 'успокаивающий',
  'antibacterial': 'антибактериальный',
  'antimicrobial': 'антимикробный',
  'irritant': 'раздражитель',
  'allergen': 'аллерген',
  'toxic': 'токсичный',
  'carcinogen': 'канцероген',
  'banned': 'запрещённый',
  'restricted': 'ограниченный',
  'safe': 'безопасный',
  'used in cosmetics': 'используется в косметике',
  'cosmetic ingredient': 'косметический ингредиент',
  'chemical compound': 'химическое соединение',
  'organic compound': 'органическое соединение',
  'synthetic': 'синтетический',
  'natural': 'натуральный',
  'plant extract': 'растительный экстракт',
  'essential oil': 'эфирное масло',
  'fatty acid': 'жирная кислота',
  'amino acid': 'аминокислота',
  'peptide': 'пептид',
  'protein': 'белок',
  'vitamin': 'витамин',
  'mineral': 'минерал',
  'silicone': 'силикон',
  'polymer': 'полимер',
  'wax': 'воск',
  'oil': 'масло',
  'alcohol': 'спирт',
  'acid': 'кислота',
  'ester': 'эфир',
  'clay': 'глина',
};

export function isCyrillic(text: string): boolean {
  return /[а-яА-ЯёЁ]/.test(text);
}

export function translateIngredientToEn(name: string): string {
  const trimmed = name.trim();
  if (!isCyrillic(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase().replace(/ё/g, 'е');

  const direct = ruToEnDict[lower];
  if (direct) {
    console.log('[Translation] RU→EN:', trimmed, '→', direct);
    return direct;
  }

  for (const [ru, en] of Object.entries(ruToEnDict)) {
    const normalizedRu = ru.replace(/ё/g, 'е');
    if (lower === normalizedRu) {
      console.log('[Translation] RU→EN (normalized):', trimmed, '→', en);
      return en;
    }
  }

  for (const [ru, en] of Object.entries(ruToEnDict)) {
    const normalizedRu = ru.replace(/ё/g, 'е');
    if (lower.includes(normalizedRu) || normalizedRu.includes(lower)) {
      console.log('[Translation] RU→EN (partial):', trimmed, '→', en);
      return en;
    }
  }

  console.log('[Translation] No translation found for:', trimmed);
  return trimmed;
}

function containsSignificantEnglish(text: string): boolean {
  const words = text.split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return false;
  const englishWords = words.filter(w => /^[a-zA-Z]+$/.test(w.replace(/[.,;:!?\-()[\]]/g, '')));
  return englishWords.length / words.length > 0.4;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function translateDescriptionToRu(englishText: string, categoryRu?: string): string {
  if (!englishText || englishText.length < 10) {
    return categoryRu ? `${categoryRu} — компонент косметических средств` : 'Компонент косметических средств';
  }

  let result = englishText;

  const sortedTerms = Object.entries(enToRuTerms).sort((a, b) => b[0].length - a[0].length);

  for (const [en, ru] of sortedTerms) {
    const escaped = escapeRegExp(en);
    const regex = new RegExp('\\b' + escaped + '\\b', 'gi');
    result = result.replace(regex, ru);
  }

  const sentences = result.split(/(?<=[.!?])\s+/);
  const translated = sentences.slice(0, 2).join(' ');

  if (containsSignificantEnglish(translated)) {
    if (categoryRu && categoryRu !== 'Компонент') {
      return `${categoryRu} — компонент косметических средств`;
    }
    return 'Косметический компонент';
  }

  if (translated === englishText && categoryRu) {
    return `${categoryRu} — компонент косметических средств`;
  }

  return translated;
}

export function hasRussianIngredients(rawText: string): boolean {
  const parts = rawText.split(/[,;\/\n]+/);
  const cyrillicCount = parts.filter(p => isCyrillic(p.trim())).length;
  return cyrillicCount > parts.length * 0.3;
}

export function translateCompositionToEn(rawText: string): string {
  if (!hasRussianIngredients(rawText)) return rawText;

  console.log('[Translation] Detected Russian composition, translating...');
  const parts = rawText.split(/[,;\/\n]+/).map(p => p.trim()).filter(p => p.length > 0);
  const translated = parts.map(part => {
    if (isCyrillic(part)) {
      return translateIngredientToEn(part);
    }
    return part;
  });

  return translated.join(', ');
}
