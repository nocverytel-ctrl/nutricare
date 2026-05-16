import { Response } from 'express'
import { DailyMenu } from '../models/menu'
import { Profile } from '../models/profile'
import pool from '../config/database'
import { AuthenticatedRequest } from '../types/authenticated-request'
import { getMealCost } from '../services/foodPrices'

// ─── Budget utilities ────────────────────────────────────────────────────────

function parseBudgetCOP(budget: string): number {
  const cleaned = budget.replace(/[.\s]/g, '').replace(',', '.')
  const match = cleaned.match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

function getDailyBudget(budget: string): number {
  return Math.round(parseBudgetCOP(budget) / 30)
}

/** muy_bajo < 10k/day | bajo < 20k | medio < 40k | alto 40k+ */
function getBudgetTier(budget: string): 'muy_bajo' | 'bajo' | 'medio' | 'alto' {
  const daily = getDailyBudget(budget)
  if (daily < 10000) return 'muy_bajo'
  if (daily < 20000) return 'bajo'
  if (daily < 40000) return 'medio'
  return 'alto'
}

// ─── Pools de opciones ───────────────────────────────────────────────────────

const MEAL_POOL = {
  omnivorous: {
    breakfast: [
      'Huevos pericos con tomate y cebolla',
      'Avena con frutas de temporada y miel',
      'Tostadas integrales con aguacate y huevo pochado',
      'Changua con huevo y cilantro',
      'Arepas de maíz con queso blanco y café',
      'Yogur natural con granola y fresas',
      'Calentao de frijoles con arroz y huevo frito',
      'Batido de banano con leche y avena',
      'Pandebono con kumis y fruta fresca',
      'Tamal de pipián con chocolate caliente',
    ],
    snack: [
      'Yogur natural con semillas de chía',
      'Frutos rojos con nueces',
      'Manzana con mantequilla de maní',
      'Palitos de zanahoria y apio con hummus',
      'Mazapán y jugo de maracuyá natural',
      'Arepa pequeña con cuajada',
      'Almendras y arándanos secos',
      'Banano con mantequilla de almendras',
      'Queso fresco con tomates cherry',
      'Galletas integrales con aguacate',
    ],
    lunch: [
      'Bandeja paisa ligera: frijoles, arroz, carne asada, tajada y aguacate',
      'Pollo a la plancha con quinoa, brócoli y zanahoria',
      'Sancocho de pollo con papa, yuca y mazorca',
      'Arroz integral con lentejas, carne molida y ensalada',
      'Filete de tilapia al limón con patacones y ensalada verde',
      'Sopa de verduras con pollo desmenuzado y papa',
      'Pechuga rellena de espinaca con puré de papa y arveja',
      'Arroz con pollo estilo colombiano y ensalada de pepino',
      'Estofado de res con papa criolla, zanahoria y mazorca',
      'Bowl de arroz integral, pollo grillado, aguacate y maíz',
    ],
    dinner: [
      'Salmón al horno con brócoli al vapor y papa dulce',
      'Sopa de lentejas con verduras y arepa pequeña',
      'Ensalada de pollo a la plancha con garbanzos y tomate',
      'Tortilla de espinaca y queso con ensalada de remolacha',
      'Crema de ahuyama con crutones integrales',
      'Filete de merluza al vapor con espárragos',
      'Tacos de pollo en tortilla integral con guacamole',
      'Wrap de lechuga con atún, maíz y tomate',
      'Revuelto de vegetales y huevo con tostada integral',
      'Pechuga de pavo al horno con camote asado',
    ],
  },

  vegetarian: {
    breakfast: [
      'Smoothie verde con espinaca, banano y leche de avena',
      'Pan integral con hummus, tomate y rúcula',
      'Avena cocida con manzana rallada y canela',
      'Tostadas con aguacate, huevo pochado y semillas',
      'Yogur natural con mango, granola y linaza',
      'Arepas de maíz con queso y guacamole',
      'Batido de mora con leche de almendras y chía',
      'Changua vegetariana con arepa y queso',
      'Bowl de frutas de temporada con yogur y miel',
      'Pancakes de avena con fresas y sirope de agave',
    ],
    snack: [
      'Palitos de apio y zanahoria con guacamole',
      'Manzana verde con mantequilla de almendras',
      'Nueces mixtas y pasas',
      'Yogur con frutos rojos y semillas de girasol',
      'Galletas de arroz con queso fresco',
      'Edamame con limón y sal de mar',
      'Dátiles rellenos de mantequilla de maní',
      'Hummus con bastones de pepino',
      'Rodajas de mango biche con sal y limón',
      'Arepa pequeña con cuajada',
    ],
    lunch: [
      'Bowl de lentejas rojas con arroz integral y vegetales asados',
      'Ensalada de garbanzos, aguacate, tomate y queso feta',
      'Curry de vegetales con leche de coco y arroz basmati',
      'Sopa de verduras con albóndigas de quinoa',
      'Tacos de frijoles negros con pico de gallo y guacamole',
      'Pasta integral con salsa de tomate, albahaca y aceitunas',
      'Bowl de quinoa con tofu marinado y verduras al wok',
      'Lasaña de vegetales con espinaca, berenjena y queso mozzarella',
      'Guiso de garbanzos con papa criolla y espinaca',
      'Arroz con frijoles, plátano maduro y ensalada de repollo',
    ],
    dinner: [
      'Crema de calabaza con jengibre y crutones integrales',
      'Tacos de vegetales asados con crema de aguacate',
      'Tortilla española de vegetales con ensalada de tomate',
      'Sopa de miso con tofu, alga y champiñones',
      'Bowl de arroz integral con edamame, zanahoria y salsa de soya',
      'Revuelto de espinaca, champiñones y huevo con tostada',
      'Pizza de coliflor con mozzarella y vegetales',
      'Ensalada tibia de lentejas con pimentón asado',
      'Wrap integral con hummus, pepino y remolacha',
      'Crema de brócoli con almendras tostadas',
    ],
  },

  vegan: {
    breakfast: [
      'Avena con leche de almendras, nueces y arándanos',
      'Batido de frutos rojos con leche de avena y chía',
      'Tostadas con aguacate, tomate cherry y semillas de cáñamo',
      'Bowl de açaí con granola vegana y frutas tropicales',
      'Smoothie de espinaca, mango y leche de coco',
      'Arepas de maíz con guacamole y tomate',
      'Papaya con limón y granola de quinoa',
      'Panqueques de banano y avena con arándanos',
      'Yogur de coco con mango y cacao en polvo',
      'Tostada de pan de centeno con crema de cacahuete y banano',
    ],
    snack: [
      'Hummus con bastones de pepino y zanahoria',
      'Nueces mixtas con cacao y pasas',
      'Rodajas de manzana con mantequilla de almendras',
      'Edamame con limón y sal de mar',
      'Dátiles con mantequilla de maní',
      'Chips de kale al horno con levadura nutricional',
      'Smoothie de plátano y leche de avena',
      'Higos frescos con nueces',
      'Rollitos de nori con aguacate y pepino',
      'Barra energética de avena y frutas secas casera',
    ],
    lunch: [
      'Bowl de quinoa con tofu ahumado, edamame y verduras al wok',
      'Curry de garbanzos con leche de coco, espinaca y arroz basmati',
      'Tacos de frijoles negros con mango, cilantro y pico de gallo',
      'Stir fry de tofu con brócoli, zanahoria y salsa de soya',
      'Ensalada de kale con garbanzos tostados, aguacate y tahini',
      'Bowl de lentejas beluga con remolacha asada y nueces',
      'Pasta integral con pesto de albahaca y nueces',
      'Sopa de verduras con fideos de arroz y tofu',
      'Burrito vegano de frijoles, arroz, maíz y guacamole',
      'Guiso de champiñones portobello con papa y pimentón',
    ],
    dinner: [
      'Crema de zanahoria con jengibre y leche de coco',
      'Stir fry de vegetales y tempeh con salsa teriyaki',
      'Ensalada templada de lentejas con rúcula y vinagreta de mostaza',
      'Sopa de miso con tofu, alga wakame y cebolla verde',
      'Bowl de arroz integral con edamame, pepino y salsa miso',
      'Tacos de coliflor asada con crema de cashews y cilantro',
      'Pasta de arroz con salsa de cacahuetes y brócoli',
      'Curry rojo de berenjena con leche de coco y quinoa',
      'Wrap de nori con aguacate, pepino y zanahoria',
      'Crema de champiñones con tomillo y tostada de centeno',
    ],
  },

  noRestriction: {
    breakfast: [
      'Huevos revueltos con verduras y tostada integral',
      'Avena con frutas de temporada y miel',
      'Arepas con queso blanco y café con leche',
      'Yogur griego con granola y banano',
      'Changua con huevo y arepa',
      'Batido de frutas con leche y avena',
      'Tostadas con mantequilla de maní y fresas',
      'Calentao de arroz con huevo frito',
      'Pan integral con queso y jugo de naranja natural',
      'Tamal con chocolate caliente',
    ],
    snack: [
      'Fruta de temporada con yogur',
      'Nueces y almendras',
      'Galletas integrales con queso',
      'Yogur natural con miel y canela',
      'Banano con mantequilla de maní',
      'Barra de cereal casera',
      'Manzana verde en rodajas',
      'Maíz tostado con queso costeño',
      'Arepa pequeña con cuajada',
      'Palomitas de maíz sin mantequilla',
    ],
    lunch: [
      'Arroz con pollo, ensalada y tajada de plátano',
      'Sopa de pasta con pollo y verduras',
      'Bandeja sencilla: frijoles, arroz, carne y aguacate',
      'Sancocho de gallina con papa y yuca',
      'Pechuga a la plancha con quinoa y zanahoria',
      'Tilapia al limón con arroz integral y ensalada',
      'Pasta con salsa boloñesa y ensalada verde',
      'Lentejas guisadas con arroz y plátano maduro',
      'Filete de res con papa criolla y brócoli',
      'Cazuela de mariscos con arroz de coco',
    ],
    dinner: [
      'Sopa de verduras con arepa pequeña',
      'Ensalada de pollo con lechuga, tomate y aguacate',
      'Crema de ahuyama con pan integral',
      'Revuelto de vegetales y huevo',
      'Tortilla de papa y cebolla con ensalada',
      'Salmón al vapor con espinaca',
      'Tacos de atún con guacamole y limón',
      'Sopa de lentejas con verduras',
      'Wrap de pollo con lechuga y tomate',
      'Quiche de verduras con ensalada de remolacha',
    ],
  },
}

// Pool adicional para presupuesto muy bajo (<10k/día)
const MUY_BAJO_POOL = {
  breakfast: [
    'Caldo de papa con arepa',
    'Arepa con huevo revuelto',
    'Mazamorra de maíz con bocadillo',
    'Chocolate caliente con arepa y queso',
    'Changua con huevo y cilantro',
    'Calentao de frijoles con arroz y huevo frito',
    'Calentao de arroz con huevo frito',
    'Arepas de maíz con queso blanco y café',
  ],
  snack: [
    'Banano maduro',
    'Guayaba con sal',
    'Maíz pira casero',
    'Bocadillo con queso',
    'Manzana verde en rodajas',
    'Palomitas de maíz sin mantequilla',
    'Fruta de temporada con yogur',
  ],
  lunch: [
    'Sopa de frijoles con arroz y arepa',
    'Arroz con huevo frito y ensalada de repollo',
    'Frijoles con arroz y plátano maduro',
    'Mazamorra con hogao y arroz',
    'Sopa de papa con cilantro y arepa',
    'Arroz con lentejas y plátano',
    'Caldo de costilla con papa y arroz',
    'Lentejas guisadas con arroz y plátano maduro',
    'Sopa de verduras con pollo desmenuzado y papa',
    'Sancocho de pollo con papa, yuca y mazorca',
  ],
  dinner: [
    'Sopa de fideos con papa y cilantro',
    'Arroz con huevo y ensalada de pepino',
    'Caldo con yuca y papa',
    'Arepa con hogao y queso',
    'Sopa de verduras con arroz',
    'Sopa de lentejas con verduras',
    'Sopa de verduras con arepa pequeña',
    'Sopa de frijoles con arroz y arepa',
  ],
}

// ─── Condiciones y metas ─────────────────────────────────────────────────────

const CONDITION_NOTES: Record<string, string> = {
  'Diabetes tipo 2': 'Controla las porciones de carbohidratos y evita azúcares añadidos. Prefiere alimentos integrales y de bajo índice glucémico.',
  'Hipertensión arterial': 'Reduce la sal al mínimo. Usa limón, ajo y hierbas aromáticas como aliño. Evita embutidos y enlatados.',
  'Obesidad y sobrepeso': 'Prioriza proteínas magras y vegetales en cada comida. Come despacio y respeta las señales de saciedad.',
  'Colesterol y triglicéridos altos': 'Evita grasas saturadas. Prefiere aceite de oliva, aguacate, pescado azul y fibra soluble.',
  'Gastritis y salud digestiva': 'Come en horarios regulares, mastica bien y evita condimentos fuertes, frituras y bebidas gaseosas.',
}

const GOAL_NOTES: Record<string, string> = {
  'Perder peso': 'Mantén un déficit calórico moderado. Prioriza proteínas y fibra para mayor saciedad.',
  'Ganar masa muscular': 'Aumenta la ingesta proteica. Incluye una fuente de proteína en cada comida principal.',
  'Tener más energía': 'Distribuye los carbohidratos complejos a lo largo del día. No saltes comidas.',
  'Controlar glucemia': 'Combina siempre carbohidratos con proteína o grasa para evitar picos de glucosa.',
  'Mejorar control de mi enfermedad': 'Sigue las indicaciones de tu médico y nutricionista. La constancia es clave.',
  'Reducir medicamentos': 'Consúltalo con tu médico. Una alimentación adecuada puede complementar el tratamiento.',
  'Aprender a comer mejor': 'Explora nuevos alimentos saludables gradualmente. Pequeños cambios sostenidos son más efectivos.',
  'Mantener mis resultados actuales': 'La clave es la consistencia. Planifica tus comidas con anticipación.',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

function normalizeDiet(diet: string) {
  if (diet.toLowerCase().includes('vegana')) return 'vegan'
  if (diet.toLowerCase().includes('vegetariana')) return 'vegetarian'
  if (diet.toLowerCase().includes('omnívora')) return 'omnivorous'
  return 'noRestriction'
}

function buildMenu(profile: Profile): DailyMenu {
  const dietKey = normalizeDiet(profile.diet)
  const tier = getBudgetTier(profile.budget ?? '')

  const basePool = tier === 'muy_bajo'
    ? MUY_BAJO_POOL
    : MEAL_POOL[dietKey as keyof typeof MEAL_POOL] ?? MEAL_POOL.noRestriction

  const isActive = /activ|intenso/i.test(profile.activityLevel ?? '')

  const breakfast = pickRandom(basePool.breakfast, 1)
  const snack     = pickRandom(basePool.snack,     1)
  const lunch     = pickRandom(basePool.lunch,     1)
  const dinner    = pickRandom(basePool.dinner,    1)

  const notes: string[] = []

  for (const condition of profile.conditions ?? []) {
    if (CONDITION_NOTES[condition]) notes.push(CONDITION_NOTES[condition])
  }
  for (const goal of profile.goals ?? []) {
    if (GOAL_NOTES[goal]) notes.push(GOAL_NOTES[goal])
  }

  if (tier === 'muy_bajo') {
    const daily = getDailyBudget(profile.budget ?? '0')
    notes.push(`Con presupuesto diario de $${daily.toLocaleString('es-CO')} COP, el menú prioriza preparaciones caseras económicas y nutritivas.`)
  }

  if (profile.reminders && profile.mealTimes) {
    notes.push(`Horarios sugeridos: desayuno ${profile.mealTimes.breakfast}, almuerzo ${profile.mealTimes.lunch}, cena ${profile.mealTimes.dinner}.`)
  }
  if (profile.dailyTips) {
    notes.push('Hidratación: mínimo 8 vasos de agua al día, preferiblemente entre comidas.')
  }

  if (notes.length === 0) {
    notes.push('Menú equilibrado ajustado a tus preferencias. Combina colores en el plato para mayor variedad nutricional.')
  }

  return {
    breakfast,
    snack,
    lunch,
    dinner,
    notes: notes.join(' '),
    generatedAt: new Date().toISOString(),
  }
}

// ─── Handlers ────────────────────────────────────────────────────────────────

export async function saveMenu(email: string, profile: Profile): Promise<DailyMenu> {
  const menu = buildMenu(profile)

  await pool.query(`
    INSERT INTO menus (email, breakfast, snack, lunch, dinner, notes, generated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [email, menu.breakfast, menu.snack, menu.lunch, menu.dinner, menu.notes, menu.generatedAt])

  return menu
}

export async function regenerateDailyMenu(req: AuthenticatedRequest, res: Response) {
  const email = req.userEmail
  if (!email) return res.status(401).json({ error: 'Usuario no autenticado.' })

  try {
    const profileResult = await pool.query('SELECT * FROM profiles WHERE email = $1', [email])
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado. Completa el onboarding.' })
    }
    const row = profileResult.rows[0]
    const profile: Profile = {
      name: row.name, age: row.age, biologicalSex: row.biological_sex,
      weight: parseFloat(row.weight), height: row.height,
      activityLevel: row.activity_level, conditions: row.conditions,
      diet: row.diet, dislikes: row.dislikes, budget: row.budget,
      goals: row.goals, reminders: row.reminders, mealTimes: row.meal_times,
      dailyTips: row.daily_tips, updatedAt: row.updated_at.toISOString(),
    }
    const menu = await saveMenu(email, profile)
    const prices = {
      breakfast: getMealCost(menu.breakfast, row.budget, 'breakfast'),
      snack:     getMealCost(menu.snack,     row.budget, 'snack'),
      lunch:     getMealCost(menu.lunch,     row.budget, 'lunch'),
      dinner:    getMealCost(menu.dinner,    row.budget, 'dinner'),
    }
    return res.status(200).json({ profile, menu, prices, dailyBudget: getDailyBudget(row.budget) })
  } catch (error) {
    console.error('Error regenerando menú:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

export async function getMenuHistory(req: AuthenticatedRequest, res: Response) {
  const email = req.userEmail
  if (!email) return res.status(401).json({ error: 'Usuario no autenticado.' })
  try {
    const result = await pool.query(`
      SELECT breakfast, snack, lunch, dinner, notes, generated_at FROM menus
      WHERE email = $1 ORDER BY generated_at DESC LIMIT 7
    `, [email])
    return res.status(200).json({
      history: result.rows.map(row => ({
        breakfast: row.breakfast, snack: row.snack, lunch: row.lunch,
        dinner: row.dinner, notes: row.notes,
        generatedAt: row.generated_at.toISOString(),
      }))
    })
  } catch (error) {
    console.error('Error obteniendo historial:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

export async function getDailyMenu(req: AuthenticatedRequest, res: Response) {
  const email = req.userEmail
  if (!email) return res.status(401).json({ error: 'Usuario no autenticado.' })

  try {
    const profileResult = await pool.query('SELECT * FROM profiles WHERE email = $1', [email])
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado. Completa el onboarding.' })
    }
    const row = profileResult.rows[0]
    const profile: Profile = {
      name: row.name, age: row.age, biologicalSex: row.biological_sex,
      weight: parseFloat(row.weight), height: row.height,
      activityLevel: row.activity_level, conditions: row.conditions,
      diet: row.diet, dislikes: row.dislikes, budget: row.budget,
      goals: row.goals, reminders: row.reminders, mealTimes: row.meal_times,
      dailyTips: row.daily_tips, updatedAt: row.updated_at.toISOString(),
    }

    const menuResult = await pool.query(`
      SELECT breakfast, snack, lunch, dinner, notes, generated_at FROM menus
      WHERE email = $1 ORDER BY generated_at DESC LIMIT 1
    `, [email])

    let menu: DailyMenu
    if (menuResult.rows.length > 0) {
      const r = menuResult.rows[0]
      menu = {
        breakfast: r.breakfast, snack: r.snack, lunch: r.lunch,
        dinner: r.dinner, notes: r.notes, generatedAt: r.generated_at.toISOString(),
      }
    } else {
      menu = await saveMenu(email, profile)
    }

    const prices = {
      breakfast: getMealCost(menu.breakfast, row.budget, 'breakfast'),
      snack:     getMealCost(menu.snack,     row.budget, 'snack'),
      lunch:     getMealCost(menu.lunch,     row.budget, 'lunch'),
      dinner:    getMealCost(menu.dinner,    row.budget, 'dinner'),
    }
    return res.status(200).json({ profile, menu, prices, dailyBudget: getDailyBudget(row.budget) })
  } catch (error) {
    console.error('Error obteniendo menú diario:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}
