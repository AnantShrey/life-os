export async function searchFood(query: string) {
  if (!query.trim()) return [];
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=id,product_name,brands,nutriments,serving_size`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).filter((p: any) => p.product_name);
  } catch {
    return [];
  }
}

export function mapFoodItem(item: any, servingGrams = 100) {
  const n = item.nutriments || {};
  const scale = servingGrams / 100;
  return {
    food_name: item.product_name || "Unknown food",
    food_api_id: item.id || item._id,
    serving_size: `${servingGrams}g`,
    calories: Math.round((n["energy-kcal_100g"] || n["energy-kcal"] || 0) * scale),
    protein_g: Math.round(((n.proteins_100g || 0) * scale) * 10) / 10,
    carbs_g: Math.round(((n.carbohydrates_100g || 0) * scale) * 10) / 10,
    fat_g: Math.round(((n.fat_100g || 0) * scale) * 10) / 10,
    fiber_g: Math.round(((n.fiber_100g || 0) * scale) * 10) / 10,
    sugar_g: Math.round(((n.sugars_100g || 0) * scale) * 10) / 10,
    sodium_mg: Math.round(((n.sodium_100g || 0) * scale * 1000) * 10) / 10,
  };
}
