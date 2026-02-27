import AsyncStorage from '@react-native-async-storage/async-storage';

const MISSING_KEY = 'cosmetic_scanner_missing_ingredients';

export interface MissingIngredient {
  name: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  products: string[];
}

let memoryCache: MissingIngredient[] | null = null;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

async function loadMissing(): Promise<MissingIngredient[]> {
  if (memoryCache !== null) return memoryCache;
  try {
    const raw = await AsyncStorage.getItem(MISSING_KEY);
    memoryCache = raw ? JSON.parse(raw) : [];
    return memoryCache!;
  } catch {
    memoryCache = [];
    return [];
  }
}

function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    if (memoryCache) {
      try {
        await AsyncStorage.setItem(MISSING_KEY, JSON.stringify(memoryCache));
        console.log('[MissingIngredients] Saved', memoryCache.length, 'items');
      } catch (e) {
        console.log('[MissingIngredients] Save error:', e);
      }
    }
  }, 2000);
}

export async function addMissingIngredient(ingredientName: string, productName?: string): Promise<void> {
  const list = await loadMissing();
  const normalized = ingredientName.trim();
  if (normalized.length < 2) return;

  const existing = list.find(
    item => item.name.toLowerCase() === normalized.toLowerCase()
  );

  if (existing) {
    existing.count += 1;
    existing.lastSeen = new Date().toISOString();
    if (productName && !existing.products.includes(productName)) {
      existing.products.push(productName);
      if (existing.products.length > 10) {
        existing.products = existing.products.slice(-10);
      }
    }
  } else {
    list.push({
      name: normalized,
      count: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      products: productName ? [productName] : [],
    });
  }

  memoryCache = list;
  scheduleSave();
}

export async function getMissingIngredients(): Promise<MissingIngredient[]> {
  const list = await loadMissing();
  return [...list].sort((a, b) => b.count - a.count);
}

export async function getMissingCount(): Promise<number> {
  const list = await loadMissing();
  return list.length;
}

export async function clearMissingIngredients(): Promise<void> {
  memoryCache = [];
  try {
    await AsyncStorage.removeItem(MISSING_KEY);
    console.log('[MissingIngredients] Cleared');
  } catch (e) {
    console.log('[MissingIngredients] Clear error:', e);
  }
}

export async function exportMissingIngredients(): Promise<string> {
  const list = await getMissingIngredients();
  return JSON.stringify(list, null, 2);
}
