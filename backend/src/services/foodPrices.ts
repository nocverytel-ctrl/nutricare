// Precios estimados COP — cocina colombiana casera 2024
// Fuente: DANE, Corabastos, plazas de mercado.
// Estrategia: keyword matching sobre el nombre del plato → precio por porción.

interface PriceRule {
  keywords: string[]
  bajo: number
  medio: number
  alto: number
}

const PRICE_RULES: PriceRule[] = [
  // ── Desayunos baratos ───────────────────────────────────────────────────────
  { keywords: ['avena', 'mazamorra', 'changua', 'caldo de papa'],           bajo: 2800, medio: 4200, alto: 6500 },
  { keywords: ['arepa', 'pandebono', 'pan integral', 'pan de centeno'],     bajo: 2500, medio: 3800, alto: 5500 },
  { keywords: ['batido', 'smoothie', 'bowl de açaí', 'bowl de frutas'],     bajo: 3200, medio: 5000, alto: 8000 },
  { keywords: ['yogur', 'kumis'],                                            bajo: 3000, medio: 4500, alto: 6500 },
  { keywords: ['huevo', 'huevos', 'calentao', 'tamal', 'pancakes', 'panqueques'], bajo: 3500, medio: 5500, alto: 8500 },
  { keywords: ['tostada', 'tostadas'],                                       bajo: 3000, medio: 5000, alto: 7500 },

  // ── Meriendas ───────────────────────────────────────────────────────────────
  { keywords: ['banano', 'guayaba', 'fruta de temporada', 'manzana verde', 'manzana'],      bajo: 1200, medio: 1800, alto: 2800 },
  { keywords: ['nueces', 'almendras', 'frutos secos', 'frutos rojos'],      bajo: 2500, medio: 3800, alto: 6000 },
  { keywords: ['barra energética', 'barra de cereal', 'maíz pira', 'maíz tostado', 'palomitas'], bajo: 1500, medio: 2500, alto: 4000 },
  { keywords: ['bocadillo', 'dátiles', 'higos'],                            bajo: 1800, medio: 2800, alto: 4500 },
  { keywords: ['hummus', 'guacamole', 'edamame', 'rollitos de nori'],       bajo: 2800, medio: 4200, alto: 6500 },

  // ── Almuerzos económicos ────────────────────────────────────────────────────
  { keywords: ['sopa de frijoles', 'sopa de papa', 'sopa de fideos', 'sopa de lentejas', 'sopa de verduras', 'sopa de pasta'], bajo: 4500, medio: 6500, alto: 9500 },
  { keywords: ['arroz con huevo', 'arroz con lentejas'],                    bajo: 4000, medio: 5800, alto: 8000 },
  { keywords: ['frijoles con arroz', 'mazamorra con hogao', 'lentejas guisadas'], bajo: 4500, medio: 6500, alto: 9000 },
  { keywords: ['caldo de costilla', 'sancocho de pollo', 'sancocho de gallina'], bajo: 6000, medio: 9000, alto: 13000 },

  // ── Almuerzos medios ────────────────────────────────────────────────────────
  { keywords: ['bandeja paisa', 'bandeja sencilla'],                        bajo: 8500, medio: 12000, alto: 18000 },
  { keywords: ['arroz con pollo'],                                           bajo: 6500, medio: 9500, alto: 14000 },
  { keywords: ['pollo a la plancha', 'pechuga a la plancha', 'pechuga rellena', 'pechuga de pavo', 'pollo grillado'], bajo: 7500, medio: 11000, alto: 16000 },
  { keywords: ['pasta', 'lasaña'],                                           bajo: 5500, medio: 8500, alto: 13000 },
  { keywords: ['tacos de frijoles', 'tacos de vegetales', 'burrito', 'wrap'], bajo: 5000, medio: 7500, alto: 11500 },
  { keywords: ['curry', 'stir fry', 'wok'],                                 bajo: 6500, medio: 10000, alto: 15000 },
  { keywords: ['bowl de lentejas', 'bowl de quinoa', 'ensalada de garbanzos', 'guiso de garbanzos'], bajo: 5500, medio: 8000, alto: 12000 },
  { keywords: ['tilapia', 'filete de tilapia', 'merluza', 'filete de merluza', 'cazuela de mariscos'], bajo: 7000, medio: 10500, alto: 16000 },
  { keywords: ['filete de res', 'estofado de res', 'carne asada'],          bajo: 9000, medio: 13500, alto: 20000 },

  // ── Cenas ───────────────────────────────────────────────────────────────────
  { keywords: ['crema de', 'sopa de miso'],                                 bajo: 3500, medio: 5500, alto: 8500 },
  { keywords: ['ensalada de pollo', 'ensalada tibia', 'ensalada templada'], bajo: 4500, medio: 7000, alto: 10500 },
  { keywords: ['revuelto', 'tortilla de', 'tortilla española', 'quiche'],   bajo: 3800, medio: 5800, alto: 8500 },
  { keywords: ['salmón', 'salmon'],                                          bajo: 10000, medio: 15000, alto: 22000 },
  { keywords: ['wrap de lechuga', 'wrap de pollo', 'wrap integral', 'wrap de nori'], bajo: 4000, medio: 6000, alto: 9500 },
  { keywords: ['tacos de pollo', 'tacos de coliflor', 'tacos de atún'],    bajo: 5000, medio: 7500, alto: 11500 },
  { keywords: ['pizza de coliflor'],                                         bajo: 5500, medio: 8500, alto: 13000 },
  { keywords: ['tempeh', 'tofu'],                                            bajo: 6000, medio: 9000, alto: 14000 },
]

type BudgetTier = 'bajo' | 'medio' | 'alto'

function normalizeBudget(budget: string): BudgetTier {
  const b = budget.toLowerCase()
  if (b.includes('alto')) return 'alto'
  if (b.includes('bajo')) return 'bajo'
  return 'medio'
}

// Precio base por tipo de comida cuando ninguna regla aplica
const MEAL_TYPE_FALLBACK: Record<string, Record<BudgetTier, number>> = {
  breakfast: { bajo: 3500, medio: 5500, alto: 8500 },
  snack:     { bajo: 2000, medio: 3200, alto: 5000 },
  lunch:     { bajo: 6000, medio: 9500, alto: 14000 },
  dinner:    { bajo: 4500, medio: 7000, alto: 11000 },
}

export function getPriceForItem(itemName: string, budget = 'medio', mealType = 'lunch'): number {
  const tier = normalizeBudget(budget)
  const normalized = itemName.toLowerCase()

  for (const rule of PRICE_RULES) {
    if (rule.keywords.some(kw => normalized.includes(kw.toLowerCase()))) {
      return rule[tier]
    }
  }

  // Fallback por tipo de comida
  const fallbacks = MEAL_TYPE_FALLBACK[mealType] ?? MEAL_TYPE_FALLBACK.lunch
  return fallbacks[tier]
}

export function getMealCost(items: string[], budget = 'medio', mealType = 'lunch'): number {
  if (items.length === 0) return 0
  // Con 1 ítem por comida, el costo es directo
  return items.reduce((sum, item) => sum + getPriceForItem(item, budget, mealType), 0)
}

export function getMealCostBreakdown(items: string[], budget = 'medio', mealType = 'lunch'): { item: string; price: number }[] {
  return items.map(item => ({ item, price: getPriceForItem(item, budget, mealType) }))
}
