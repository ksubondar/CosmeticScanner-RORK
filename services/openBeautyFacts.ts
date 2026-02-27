import { getCached, setCache } from './apiCache';
import { IngredientData, IngredientCategory, IngredientColor } from '@/types';

const OBF_BASE = 'https://world.openbeautyfacts.org/api/v0';
const OBF_INGREDIENT_BASE = 'https://world.openbeautyfacts.org/ingredient';
const TIMEOUT = 8000;
const INGREDIENT_TIMEOUT = 5000;

export interface ProductResult {
  name: string;
  brand?: string;
  ingredients: string;
  barcode: string;
  imageUrl?: string;
}

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CosmeticScanner/1.0' },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function extractIngredients(product: Record<string, unknown>): string {
  if (typeof product.ingredients_text === 'string' && product.ingredients_text.length > 3) {
    return product.ingredients_text;
  }
  if (typeof product.ingredients_text_en === 'string' && product.ingredients_text_en.length > 3) {
    return product.ingredients_text_en;
  }
  if (typeof product.ingredients_text_fr === 'string' && product.ingredients_text_fr.length > 3) {
    return product.ingredients_text_fr;
  }
  if (Array.isArray(product.ingredients) && product.ingredients.length > 0) {
    return product.ingredients
      .map((i: Record<string, unknown>) => (typeof i.text === 'string' ? i.text : ''))
      .filter((t: string) => t.length > 0)
      .join(', ');
  }
  return '';
}

function extractName(product: Record<string, unknown>): string {
  if (typeof product.product_name === 'string' && product.product_name.length > 0) {
    return product.product_name;
  }
  if (typeof product.product_name_en === 'string' && product.product_name_en.length > 0) {
    return product.product_name_en;
  }
  if (typeof product.product_name_fr === 'string' && product.product_name_fr.length > 0) {
    return product.product_name_fr;
  }
  return '';
}

async function tryFetchProduct(baseUrl: string, barcode: string): Promise<ProductResult | null> {
  try {
    const url = `${baseUrl}/product/${barcode}.json`;
    console.log('[OBF] Fetching:', url);
    const res = await fetchWithTimeout(url, TIMEOUT);
    if (!res.ok) {
      console.log('[OBF] Response not ok:', res.status);
      return null;
    }
    const data = await res.json();
    if (data.status !== 1 || !data.product) {
      console.log('[OBF] Product not found in response');
      return null;
    }

    const product = data.product as Record<string, unknown>;
    const name = extractName(product);
    const ingredients = extractIngredients(product);
    const brand = typeof product.brands === 'string' ? product.brands : undefined;
    const imageUrl = typeof product.image_url === 'string' ? product.image_url : undefined;

    if (!ingredients) {
      console.log('[OBF] Product found but no ingredients');
      return name ? { name: brand ? `${brand} — ${name}` : name, ingredients: '', barcode, imageUrl } : null;
    }

    const fullName = brand && !name.includes(brand) ? `${brand} — ${name}` : name;

    return {
      name: fullName || 'Неизвестный продукт',
      brand,
      ingredients,
      barcode,
      imageUrl,
    };
  } catch (e) {
    console.log('[OBF] Fetch error:', e);
    return null;
  }
}

export async function lookupBarcode(barcode: string): Promise<ProductResult | null> {
  const cacheKey = `barcode_${barcode}`;
  const cached = await getCached<ProductResult>(cacheKey);
  if (cached) {
    console.log('[OBF] Barcode found in cache:', barcode);
    return cached;
  }

  console.log('[OBF] Looking up barcode:', barcode);

  const result = await tryFetchProduct(OBF_BASE, barcode);
  if (result && result.ingredients) {
    console.log('[OBF] Found in Open Beauty Facts:', result.name);
    await setCache(cacheKey, result);
    return result;
  }

  if (result && result.name) {
    console.log('[OBF] Found name but no ingredients:', result.name);
    return result;
  }

  console.log('[OBF] Barcode not found:', barcode);
  return null;
}

const obfCategoryMap: Record<string, { category: IngredientCategory; categoryRu: string }> = {
  'emollient': { category: 'emollient', categoryRu: 'Эмолент' },
  'humectant': { category: 'humectant', categoryRu: 'Увлажнитель' },
  'surfactant': { category: 'surfactant', categoryRu: 'ПАВ' },
  'preservative': { category: 'preservative', categoryRu: 'Консервант' },
  'fragrance': { category: 'fragrance', categoryRu: 'Отдушка' },
  'colorant': { category: 'colorant', categoryRu: 'Краситель' },
  'uv filter': { category: 'sunscreen', categoryRu: 'Солнцезащитный' },
  'uv absorber': { category: 'sunscreen', categoryRu: 'Солнцезащитный' },
  'antioxidant': { category: 'antioxidant', categoryRu: 'Антиоксидант' },
  'chelating': { category: 'chelating', categoryRu: 'Хелатирующий агент' },
  'viscosity': { category: 'thickener', categoryRu: 'Загуститель' },
  'solvent': { category: 'solvent', categoryRu: 'Растворитель' },
  'skin conditioning': { category: 'emollient', categoryRu: 'Кондиционер для кожи' },
  'hair conditioning': { category: 'emollient', categoryRu: 'Кондиционер для волос' },
  'emulsif': { category: 'emulsifier', categoryRu: 'Эмульгатор' },
  'film forming': { category: 'film_former', categoryRu: 'Плёнкообразователь' },
  'buffering': { category: 'ph_adjuster', categoryRu: 'Регулятор pH' },
  'masking': { category: 'fragrance', categoryRu: 'Маскирующий агент' },
};

export async function lookupIngredientOBF(name: string): Promise<IngredientData | null> {
  const cacheKey = `obf_ing_${name.toLowerCase().replace(/\s+/g, '_')}`;
  const cached = await getCached<IngredientData>(cacheKey);
  if (cached) {
    console.log('[OBF] Ingredient cache hit:', name);
    return cached;
  }

  try {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const url = `${OBF_INGREDIENT_BASE}/${encodeURIComponent(slug)}.json`;
    console.log('[OBF] Looking up ingredient:', url);

    const res = await fetchWithTimeout(url, INGREDIENT_TIMEOUT);
    if (!res.ok) {
      console.log('[OBF] Ingredient not found:', res.status);
      return null;
    }

    const data = await res.json();

    if (!data || typeof data.count !== 'number' || data.count === 0) {
      console.log('[OBF] No products with this ingredient');
      return null;
    }

    let detectedCategory: IngredientCategory = 'unknown';
    let detectedCategoryRu = 'Компонент';

    const tag = (data.tag || '') as string;
    const tagLower = tag.toLowerCase();

    for (const [keyword, cat] of Object.entries(obfCategoryMap)) {
      if (tagLower.includes(keyword)) {
        detectedCategory = cat.category;
        detectedCategoryRu = cat.categoryRu;
        break;
      }
    }

    const color: IngredientColor = 'gray';

    let descriptionRu: string;
    if (detectedCategory !== 'unknown') {
      descriptionRu = `${detectedCategoryRu} — компонент косметических средств`;
    } else {
      descriptionRu = 'Косметический компонент';
    }

    const result: IngredientData = {
      name,
      nameRu: name,
      category: detectedCategory,
      categoryRu: detectedCategoryRu,
      comedogenicity: 0,
      irritation: 0,
      allergenicity: false,
      effectiveness: 'neutral',
      tags: [],
      descriptionRu,
      warningsRu: [],
      color,
    };

    console.log('[OBF] Ingredient found:', name, '→', detectedCategoryRu, `(${data.count} products)`);
    await setCache(cacheKey, result);
    return result;
  } catch (e) {
    console.log('[OBF] Ingredient lookup error:', e);
    return null;
  }
}
