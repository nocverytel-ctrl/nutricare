import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMealNutrition } from '../data/nutrition'
import {
  UtensilsCrossed,
  Store,
  PlayCircle,
  ClipboardList,
  MapPin,
  Clock,
  Users,
  BarChart2,
  Flame,
  ChevronRight,
  RefreshCw,
  X,
  ShoppingCart,
  Wheat,
  Beef,
  Carrot,
  Leaf,
  Building2,
  AlertCircle,
  Crown,
  TrendingUp,
  MessageCircle,
  CheckSquare,
  Square,
  Sparkles,
  Zap,
  Calendar,
  Lock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { RECIPES, type Recipe } from '../data/recipes'

type Profile = {
  name: string
  age: number
  biologicalSex: string
  weight: number
  height: number
  activityLevel: string
  conditions: string[]
  diet: string
  dislikes: string
  budget: string
  goals: string[]
  reminders: boolean
  mealTimes: { breakfast: string; lunch: string; dinner: string; snacks: string }
  dailyTips: boolean
  updatedAt: string
  photoUrl?: string
}

type DailyMenu = {
  breakfast: string[]
  snack: string[]
  lunch: string[]
  dinner: string[]
  notes: string
  generatedAt: string
}

type MealPrices = {
  breakfast: number
  snack: number
  lunch: number
  dinner: number
}

type Coordinates = { latitude: number; longitude: number }

type Store = {
  name: string
  address: string
  latitude: number
  longitude: number
  category: string
  distanceKm?: number
}

type ActiveTab = 'menu' | 'tiendas' | 'videos' | 'historial' | 'progreso' | 'compras' | 'planeador'

// ─── Helpers ───────────────────────────────────────────────────────────────

const SHOP_TYPE_MAP: Record<string, string> = {
  supermarket: 'Supermercado',
  superstore: 'Supermercado',
  grocery: 'Tienda de comestibles',
  convenience: 'Tienda de conveniencia',
  health_food: 'Tienda naturista',
  organic: 'Tienda orgánica',
  farm: 'Tienda de granja',
  bakery: 'Panadería',
  butcher: 'Carnicería',
  greengrocer: 'Verdulería',
  deli: 'Delicatessen',
  marketplace: 'Plaza de mercado',
}

function getStoreIcon(category: string) {
  const iconProps = { size: 18, strokeWidth: 1.5, color: 'var(--color-primary)' }
  switch (category) {
    case 'Panadería':    return <Wheat {...iconProps} />
    case 'Carnicería':   return <Beef {...iconProps} />
    case 'Verdulería':   return <Carrot {...iconProps} />
    case 'Tienda naturista':
    case 'Tienda orgánica': return <Leaf {...iconProps} />
    case 'Plaza de mercado': return <Building2 {...iconProps} />
    default:             return <ShoppingCart {...iconProps} />
  }
}

function getDistanceKm(from: Coordinates, to: Coordinates): number {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(to.latitude - from.latitude)
  const dLon = toRad(to.longitude - from.longitude)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

async function fetchNearbyStores(lat: number, lng: number): Promise<Store[]> {
  const query = `[out:json][timeout:20];
(
  node["shop"~"supermarket|superstore|grocery|convenience|health_food|organic|farm|bakery|butcher|greengrocer|deli"](around:2500,${lat},${lng});
  node["amenity"="marketplace"](around:2500,${lat},${lng});
);
out body;`

  const resp = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query),
  })
  if (!resp.ok) throw new Error('Error al consultar OpenStreetMap.')
  const data = await resp.json()

  return (data.elements as {
    tags: Record<string, string>
    lat: number
    lon: number
  }[])
    .filter((el) => el.tags?.name)
    .map((el) => ({
      name: el.tags.name,
      address:
        [el.tags['addr:street'], el.tags['addr:housenumber']]
          .filter(Boolean)
          .join(' ')
          .trim() || 'Sin dirección registrada',
      latitude: el.lat,
      longitude: el.lon,
      category: SHOP_TYPE_MAP[el.tags.shop ?? el.tags.amenity] ?? 'Tienda de alimentos',
      distanceKm: getDistanceKm({ latitude: lat, longitude: lng }, { latitude: el.lat, longitude: el.lon }),
    }))
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    .slice(0, 14)
}

function normalizeDiet(diet: string): string {
  const d = diet.toLowerCase()
  if (d.includes('vegana')) return 'vegan'
  if (d.includes('vegetariana')) return 'vegetarian'
  if (d.includes('omnívora') || d.includes('omnivora')) return 'omnivorous'
  return 'default'
}

type VideoTopic = { title: string; description: string; query: string }

const DIET_VIDEO_TOPICS: Record<string, VideoTopic[]> = {
  vegetarian: [
    { title: 'Recetas vegetarianas fáciles', description: 'Platos sin carne ricos en proteínas y sabor.', query: 'recetas vegetarianas saludables fáciles' },
    { title: 'Bowls de cereales y legumbres', description: 'Quinoa, lentejas y garbanzos en preparaciones completas.', query: 'bowl quinoa lentejas vegetariano receta' },
    { title: 'Proteínas vegetales', description: 'Cómo obtener toda la proteína sin carne.', query: 'proteínas vegetales alimentos recetas' },
    { title: 'Hummus y dips nutritivos', description: 'Preparaciones a base de legumbres para snacks y comidas.', query: 'hummus casero receta fácil' },
    { title: 'Ensaladas completas', description: 'Mucho más que hojas verdes: recetas que sacian.', query: 'ensaladas completas nutritivas vegetarianas' },
    { title: 'Sopas y cremas vegetales', description: 'Caldos reconfortantes y llenos de nutrientes.', query: 'sopas cremas vegetales saludables receta' },
  ],
  vegan: [
    { title: 'Recetas veganas completas', description: 'Sin ningún producto de origen animal.', query: 'recetas veganas fáciles nutritivas' },
    { title: 'Leches vegetales caseras', description: 'Avena, almendra, coco: cómo prepararlas en casa.', query: 'leche vegetal casera avena almendra' },
    { title: 'Desayunos veganos energéticos', description: 'Empieza el día con mucha energía vegetal.', query: 'desayunos veganos saludables energéticos' },
    { title: 'Postres sin lácteos ni huevo', description: 'Dulces deliciosos completamente veganos.', query: 'postres veganos sin horno fáciles' },
    { title: 'Tacos y wraps veganos', description: 'Street food adaptado a dieta vegana.', query: 'tacos veganos receta fácil proteínas' },
    { title: 'Hongos como proteína', description: 'Portobello, champiñones y setas en recetas principales.', query: 'recetas con hongos veganas proteínas' },
  ],
  omnivorous: [
    { title: 'Pollo saludable al horno', description: 'Las mejores preparaciones con pechuga de pollo.', query: 'recetas pollo saludable al horno fácil' },
    { title: 'Pescados y mariscos', description: 'Salmón, merluza y atún: opciones bajas en grasa.', query: 'recetas pescado saludable horno plancha' },
    { title: 'Carnes magras en la dieta', description: 'Cortes bajos en grasa con mucha proteína.', query: 'carnes magras saludables recetas dieta' },
    { title: 'Huevos: mil preparaciones', description: 'La proteína más completa y versátil de la dieta.', query: 'recetas con huevos saludables rápidas' },
    { title: 'Dieta equilibrada semanal', description: 'Cómo combinar todos los grupos alimenticios.', query: 'dieta equilibrada menú semanal saludable' },
    { title: 'Comidas alta proteína', description: 'Para ganar músculo o mantener tu peso ideal.', query: 'comidas altas en proteína dieta fitness' },
  ],
  default: [
    { title: 'Cocina saludable fácil', description: 'Recetas nutritivas para todos los días.', query: 'cocina saludable recetas fáciles casa' },
    { title: 'Superalimentos y sus usos', description: 'Alimentos funcionales que potencian tu salud.', query: 'superalimentos recetas beneficios quinoa chía' },
    { title: 'Control de peso y nutrición', description: 'Estrategias reales para una alimentación equilibrada.', query: 'control peso nutrición saludable consejos' },
    { title: 'Alimentación antiinflamatoria', description: 'Alimentos que curan y reducen inflamación.', query: 'dieta antiinflamatoria alimentos recetas' },
    { title: 'Meal prep: cocina para la semana', description: 'Prepara toda la semana en 2 horas.', query: 'meal prep cocinar semana recetas fáciles' },
    { title: 'Cenas ligeras para dormir bien', description: 'Opciones que no afectan tu sueño ni digestión.', query: 'cenas ligeras saludables para dormir' },
  ],
}

// Base costs per meal type (COP) — realistic Colombian home-cooking prices
const MEAL_BASE_COST: Record<string, { bajo: number; medio: number; alto: number }> = {
  breakfast: { bajo: 4500,  medio: 7000,  alto: 12000 },
  snack:     { bajo: 2500,  medio: 4000,  alto:  7000 },
  lunch:     { bajo: 7000,  medio: 12000, alto: 22000 },
  dinner:    { bajo: 5000,  medio: 8000,  alto: 14000 },
}
// Extra per additional item in the same meal
const EXTRA_PER_ITEM = { bajo: 1500, medio: 2500, alto: 4000 }

function estimateMealCost(items: string[], budget: string, mealKey = 'lunch') {
  const tier = budget.toLowerCase().includes('alto')
    ? 'alto'
    : budget.toLowerCase().includes('bajo')
    ? 'bajo'
    : 'medio'
  const bases = MEAL_BASE_COST[mealKey] ?? MEAL_BASE_COST.lunch
  const base = bases[tier]
  const extras = Math.max(0, items.length - 1) * EXTRA_PER_ITEM[tier]
  return base + extras
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

const STOP_WORDS = new Set(['con', 'de', 'y', 'a', 'al', 'el', 'la', 'los', 'las', 'un', 'una', 'en', 'por', 'para', 'sin'])

function findRecipe(itemName: string): Recipe | undefined {
  // 1. exact match
  if (RECIPES[itemName]) return RECIPES[itemName]
  // 2. keyword match: score each recipe by shared significant words
  const itemWords = itemName.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
  let bestKey = ''
  let bestScore = 0
  for (const key of Object.keys(RECIPES)) {
    const keyWords = key.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
    const shared = itemWords.filter(w => keyWords.some(kw => kw.startsWith(w) || w.startsWith(kw))).length
    const score = shared / Math.max(keyWords.length, 1)
    if (score > bestScore && score >= 0.5) { bestScore = score; bestKey = key }
  }
  return bestKey ? RECIPES[bestKey] : undefined
}

function normalizeMenu(menu: DailyMenu): DailyMenu {
  return {
    ...menu,
    breakfast: menu.breakfast.slice(0, 1),
    snack:     menu.snack.slice(0, 1),
    lunch:     menu.lunch.slice(0, 1),
    dinner:    menu.dinner.slice(0, 1),
  }
}

function getAvatarUrl(name: string) {
  const seed = encodeURIComponent(name || 'Usuario')
  return `https://api.dicebear.com/6.x/initials/svg?seed=${seed}&backgroundColor=a3c7b0,4a7c59&color=ffffff`
}

// ─── Tabs config ─────────────────────────────────────────────────────────────

const TABS: { key: ActiveTab; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { key: 'menu',       label: 'Menú',       Icon: UtensilsCrossed },
  { key: 'planeador',  label: 'Planeador',  Icon: Calendar },
  { key: 'progreso',   label: 'Progreso',   Icon: TrendingUp },
  { key: 'compras',    label: 'Compras',    Icon: ShoppingCart },
  { key: 'tiendas',    label: 'Tiendas',    Icon: Store },
  { key: 'videos',     label: 'Videos',     Icon: PlayCircle },
  { key: 'historial',  label: 'Historial',  Icon: ClipboardList },
]

const PLAN_CONFIG = {
  free:    { label: 'Básico',  color: 'var(--neutral-500)', Icon: Leaf },
  annual:  { label: 'Anual',   color: 'var(--sage-500)',    Icon: Zap },
  premium: { label: 'Premium', color: '#7c3aed',            Icon: Crown },
} as const

const MEAL_KEYS = [
  { key: 'breakfast' as const, label: 'Desayuno' },
  { key: 'snack' as const,     label: 'Merienda' },
  { key: 'lunch' as const,     label: 'Almuerzo' },
  { key: 'dinner' as const,    label: 'Cena' },
]

// ─── Component ───────────────────────────────────────────────────────────────

function DashboardPage() {
  const { token, email, logout, plan } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ActiveTab>('menu')
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menu, setMenu] = useState<DailyMenu | null>(null)
  const [menuPrices, setMenuPrices] = useState<MealPrices | null>(null)
  const [menuHistory, setMenuHistory] = useState<DailyMenu[]>([])
  const [dailyBudget, setDailyBudget] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [geoError, setGeoError] = useState('')
  const [nearbyStores, setNearbyStores] = useState<Store[]>([])
  const [storesLoading, setStoresLoading] = useState(false)
  const [storesError, setStoresError] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<{ name: string; recipe: Recipe } | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) { setLoading(false); return }
      setLoading(true)
      setError('')
      try {
        const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
        const [menuRes, historyRes] = await Promise.all([
          fetch(`${apiUrl}/api/menu`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/menu/history`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const menuData = await menuRes.json()
        const historyData = await historyRes.json()
        if (!menuRes.ok) throw new Error(menuData?.error || 'No fue posible cargar el dashboard.')
        setProfile(menuData.profile)
        setMenu(normalizeMenu(menuData.menu))
        setMenuPrices(null)
        setDailyBudget(menuData.dailyBudget ?? null)
        setMenuHistory(historyData.history || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error inesperado al cargar datos.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [token])

  const loadStores = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.')
      return
    }
    setStoresLoading(true)
    setGeoError('')
    setStoresError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ latitude, longitude })
        try {
          const stores = await fetchNearbyStores(latitude, longitude)
          setNearbyStores(stores)
          if (stores.length === 0) {
            setStoresError('No encontramos tiendas registradas en OpenStreetMap dentro de 2.5 km.')
          }
        } catch {
          setStoresError('No se pudieron cargar las tiendas. Verifica tu conexión e intenta de nuevo.')
        } finally {
          setStoresLoading(false)
        }
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: 'Permiso de ubicación denegado. Habilítalo en la configuración del navegador.',
          2: 'No se pudo determinar tu posición actual.',
          3: 'La solicitud de ubicación tardó demasiado. Intenta de nuevo.',
        }
        setGeoError(msgs[err.code] ?? 'Error al obtener la ubicación.')
        setStoresLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    )
  }, [])

  useEffect(() => {
    if (activeTab === 'tiendas' && !coords && !storesLoading && !geoError) {
      loadStores()
    }
  }, [activeTab, coords, storesLoading, geoError, loadStores])

  const handleRegenerate = async () => {
    if (!token) return
    setRegenerating(true)
    setError('')
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/menu/regenerate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'No fue posible regenerar el menú.')
      setProfile(data.profile)
      setMenu(normalizeMenu(data.menu))
      setMenuPrices(data.prices ?? null)
      setDailyBudget(data.dailyBudget ?? null)
      const historyRes = await fetch(`${apiUrl}/api/menu/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const historyData = await historyRes.json()
      setMenuHistory(historyData.history || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al regenerar.')
    } finally {
      setRegenerating(false)
    }
  }

  const estimatedMenuCost = useMemo(() => {
    if (!menu) return null
    const prices = menuPrices ?? {
      breakfast: estimateMealCost(menu.breakfast, profile?.budget ?? '', 'breakfast'),
      snack:     estimateMealCost(menu.snack,     profile?.budget ?? '', 'snack'),
      lunch:     estimateMealCost(menu.lunch,     profile?.budget ?? '', 'lunch'),
      dinner:    estimateMealCost(menu.dinner,    profile?.budget ?? '', 'dinner'),
    }
    return { ...prices, total: prices.breakfast + prices.snack + prices.lunch + prices.dinner }
  }, [menu, menuPrices, profile?.budget])

  const dietKey = normalizeDiet(profile?.diet ?? '')

  if (loading) {
    return (
      <section className="onboarding page-shell">
        <div className="summary-card">
          <h2>Cargando tu plan...</h2>
          <p>Estamos preparando tu menú personalizado.</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="onboarding page-shell">
        <div className="summary-card">
          <h2>Ups, algo falló</h2>
          <p>{error}</p>
          <div className="actions" style={{ marginTop: '16px' }}>
            <Link className="button primary" to="/onboarding">Completar onboarding</Link>
          </div>
        </div>
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="onboarding page-shell">
        <div className="summary-card">
          <h2>Aún no tienes perfil</h2>
          <p>Completa el onboarding para comenzar a recibir menús diarios.</p>
          <div className="actions" style={{ marginTop: '16px' }}>
            <Link className="button primary" to="/onboarding">Ir al onboarding</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="onboarding page-shell">

        {/* Header */}
        <div className="onboarding-header">
          <div>
            <span className="tag">Dashboard</span>
            <h1>Tu plan NutriCare</h1>
            <p>Menú personalizado y recursos para tu alimentación saludable.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/chat')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-medium)',
              }}
            >
              <MessageCircle size={15} strokeWidth={1.5} />
              NutriBot
            </button>
            <button type="button" className="button secondary" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Profile summary */}
        <div className="profile-summary">
          <div className="profile-hero">
            <img
              className="profile-avatar"
              src={profile.photoUrl ?? getAvatarUrl(profile.name ?? email ?? 'Usuario')}
              alt="Foto de perfil"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/perfil')}
              title="Ver mi perfil"
            />
            <div>
              <h2>Hola, {profile.name || email}</h2>
              <p>
                {profile.diet} · {profile.activityLevel}
                {profile.conditions.length > 0 && ` · ${profile.conditions.join(', ')}`}
              </p>
              <button
                type="button"
                onClick={() => navigate('/planes')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  marginTop: 6,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${PLAN_CONFIG[plan].color}44`,
                  background: `${PLAN_CONFIG[plan].color}12`,
                  color: PLAN_CONFIG[plan].color,
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-semibold)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  letterSpacing: 'var(--tracking-wide)',
                }}
              >
                {plan === 'premium' && <Sparkles size={10} strokeWidth={2} />}
                {plan === 'annual' && <Zap size={10} strokeWidth={2} />}
                {plan === 'free' && <Leaf size={10} strokeWidth={2} />}
                Plan {PLAN_CONFIG[plan].label}
              </button>
            </div>
          </div>
          <div className="profile-details">
            <span>{profile.age} años</span>
            <span>{profile.weight} kg</span>
            <span>{profile.height} cm</span>
            {profile.budget && <span>Presupuesto: {profile.budget}</span>}
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="tab-nav">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              className={`tab-btn${activeTab === key ? ' active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={15} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </nav>

        {/* ── Menú del día ── */}
        {activeTab === 'menu' && (
          <>
            <section className="menu-grid">
              {MEAL_KEYS.map(({ key, label }) => {
                const items = menu?.[key] ?? []
                const nutrition = getMealNutrition(items)
                return (
                  <article key={key} className="menu-card">
                    <h3>{label}</h3>
                    <ul>
                      {items.map((item) => {
                        const recipe = findRecipe(item)
                        const hasRecipe = Boolean(recipe)
                        return (
                          <li
                            key={item}
                            className={hasRecipe ? 'menu-item-clickable' : ''}
                            onClick={hasRecipe ? () => setSelectedRecipe({ name: item, recipe: recipe! }) : undefined}
                            title={hasRecipe ? 'Ver receta y preparación' : undefined}
                          >
                            {item}
                            {hasRecipe && <span className="recipe-badge">Receta</span>}
                          </li>
                        )
                      })}
                    </ul>
                    <div className="meal-nutrition-row">
                      <span>{nutrition.totalGrams} g</span>
                      <span>{nutrition.totalKcal} kcal</span>
                      {estimatedMenuCost && (
                        <span title="Precio estimado en plaza de mercado colombiana">
                          ~{formatPrice(estimatedMenuCost[key])}
                        </span>
                      )}
                    </div>
                  </article>
                )
              })}
            </section>

            {estimatedMenuCost && (
              <div className="cost-total-bar">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span>Costo estimado del día</span>
                  <span style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>
                    Referencia plaza de mercado · Puede variar según ciudad
                  </span>
                  {dailyBudget !== null && dailyBudget > 0 && (
                    <span style={{ fontSize: 'var(--text-xs)', opacity: 0.8 }}>
                      Presupuesto diario: {formatPrice(dailyBudget)}
                      {estimatedMenuCost.total > dailyBudget && ' · Supera el presupuesto'}
                    </span>
                  )}
                </div>
                <strong style={{ color: dailyBudget && estimatedMenuCost.total > dailyBudget ? 'var(--color-warning)' : 'var(--sage-800)' }}>
                  {formatPrice(estimatedMenuCost.total)}
                </strong>
              </div>
            )}

            <div className="summary-card" style={{ marginTop: 'var(--space-5)' }}>
              <h2>Consejos del día</h2>
              <p>{menu?.notes}</p>
              {menu?.generatedAt && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                  Generado: {new Date(menu.generatedAt).toLocaleString('es-CO')}
                </p>
              )}
              <div className="actions" style={{ marginTop: 'var(--space-5)' }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                >
                  <RefreshCw size={14} strokeWidth={1.5} style={regenerating ? { animation: 'spin 1s linear infinite' } : {}} />
                  {regenerating ? 'Regenerando...' : 'Regenerar menú'}
                </button>
                <Link className="button primary" to="/onboarding">
                  Ajustar perfil
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ── Tiendas ── */}
        {activeTab === 'tiendas' && (
          <div>
            <div className="stores-header">
              <div>
                <h2 style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>
                  Tiendas cerca de ti
                </h2>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Datos reales de OpenStreetMap · Radio de 2.5 km
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                {coords && (
                  <a
                    href={`https://www.google.com/maps/search/supermercados/@${coords.latitude},${coords.longitude},15z`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button secondary"
                  >
                    Ver en Maps
                  </a>
                )}
                <button type="button" className="button primary" onClick={loadStores} disabled={storesLoading}>
                  {storesLoading ? 'Buscando...' : coords ? 'Actualizar' : 'Buscar tiendas'}
                </button>
              </div>
            </div>

            {storesLoading && (
              <div className="summary-card" style={{ marginTop: 'var(--space-4)' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
                  <MapPin size={15} strokeWidth={1.5} color="var(--color-primary)" />
                  Obteniendo tu ubicación y consultando OpenStreetMap...
                </p>
              </div>
            )}

            {geoError && !storesLoading && (
              <div className="summary-card" style={{ marginTop: 'var(--space-4)', borderColor: 'var(--color-error-border)' }}>
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', color: 'var(--color-error)', margin: '0 0 var(--space-4)' }}>
                  <AlertCircle size={15} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 2 }} />
                  {geoError}
                </p>
                <button type="button" className="button primary" onClick={loadStores}>
                  Intentar de nuevo
                </button>
              </div>
            )}

            {storesError && !storesLoading && (
              <div className="summary-card" style={{ marginTop: 'var(--space-4)', borderColor: 'var(--color-warning-border)' }}>
                <p style={{ color: 'var(--color-warning)', margin: 0, fontSize: 'var(--text-sm)' }}>{storesError}</p>
              </div>
            )}

            {coords && !storesLoading && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 'var(--space-3) 0 var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <MapPin size={12} strokeWidth={1.5} />
                {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              </p>
            )}

            {nearbyStores.length > 0 && (
              <div className="store-grid">
                {nearbyStores.map((store) => (
                  <a
                    key={`${store.name}-${store.latitude}`}
                    className="store-card"
                    href={`https://www.google.com/maps/search/${encodeURIComponent(store.name)}/@${store.latitude},${store.longitude},17z`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="store-badge">
                      {getStoreIcon(store.category)}
                    </div>
                    <div className="store-info">
                      <h4>{store.name}</h4>
                      <p>{store.category}</p>
                      {store.address !== 'Sin dirección registrada' && <p>{store.address}</p>}
                    </div>
                    {store.distanceKm !== undefined && (
                      <div className="store-distance">{formatDistance(store.distanceKm)}</div>
                    )}
                  </a>
                ))}
              </div>
            )}

            {!storesLoading && !geoError && nearbyStores.length === 0 && !storesError && (
              <div className="summary-card" style={{ marginTop: 'var(--space-4)' }}>
                <p>Permite el acceso a tu ubicación para ver tiendas cercanas.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Videos ── */}
        {activeTab === 'videos' && (
          <div>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h2 style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>
                Videos para tu dieta
              </h2>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                Selecciona un tema y abre directamente en YouTube
              </p>
            </div>

            <div className="video-topics-grid">
              {DIET_VIDEO_TOPICS[dietKey].map((topic) => (
                <a
                  key={topic.query}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-topic-card"
                >
                  <div className="video-topic-icon">
                    <PlayCircle size={22} strokeWidth={1.5} color="var(--color-primary)" />
                  </div>
                  <div className="video-topic-body">
                    <h4>{topic.title}</h4>
                    <p>{topic.description}</p>
                  </div>
                  <ChevronRight size={14} strokeWidth={1.5} color="var(--color-text-muted)" />
                </a>
              ))}
            </div>

            <div className="summary-card" style={{ marginTop: 'var(--space-6)' }}>
              <h2>Búsquedas rápidas</h2>
              <p style={{ margin: '0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                Los enlaces abren resultados actualizados en YouTube, garantizando contenido relevante para tu dieta {profile.diet.toLowerCase()}.
              </p>
            </div>
          </div>
        )}

        {/* ── Progreso ── */}
        {activeTab === 'progreso' && (
          <ProgressTab menuHistory={menuHistory} plan={plan} onUpgrade={() => navigate('/planes')} />
        )}

        {/* ── Planeador ── */}
        {activeTab === 'planeador' && (
          <WeeklyPlannerTab menu={menu} plan={plan} onUpgrade={() => navigate('/planes')} budget={profile?.budget ?? ''} />
        )}

        {/* ── Compras ── */}
        {activeTab === 'compras' && (
          <ShoppingListTab menu={menu} plan={plan} onUpgrade={() => navigate('/planes')} onGoToStores={() => setActiveTab('tiendas')} />
        )}

        {/* ── Historial ── */}
        {activeTab === 'historial' && (
          <div>
            <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>
              Historial de menús
            </h2>
            {menuHistory.length <= 1 ? (
              <div className="summary-card">
                <p>
                  Aún no tienes menús anteriores guardados. Usa{' '}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}
                    onClick={() => setActiveTab('menu')}
                  >
                    Regenerar menú
                  </button>{' '}
                  en la pestaña "Menú del día" para crear nuevos planes.
                </p>
              </div>
            ) : (
              <div className="history-grid">
                {menuHistory.slice(1).map((pastMenu) => (
                  <article key={pastMenu.generatedAt} className="history-card">
                    <h3>
                      {new Date(pastMenu.generatedAt).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="history-meals">
                      <div><strong>Desayuno:</strong> {pastMenu.breakfast.join(', ')}</div>
                      <div><strong>Merienda:</strong> {pastMenu.snack.join(', ')}</div>
                      <div><strong>Almuerzo:</strong> {pastMenu.lunch.join(', ')}</div>
                      <div><strong>Cena:</strong> {pastMenu.dinner.join(', ')}</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

      </section>

      {/* ── Modal de receta ── */}
      {selectedRecipe && (
        <div className="recipe-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="recipe-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="recipe-close"
              onClick={() => setSelectedRecipe(null)}
              aria-label="Cerrar receta"
            >
              <X size={15} strokeWidth={1.5} />
            </button>

            <h2 className="recipe-title">{selectedRecipe.name}</h2>

            <div className="recipe-meta">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} strokeWidth={1.5} /> {selectedRecipe.recipe.time}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Users size={12} strokeWidth={1.5} /> {selectedRecipe.recipe.servings}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <BarChart2 size={12} strokeWidth={1.5} /> {selectedRecipe.recipe.difficulty}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={12} strokeWidth={1.5} /> {selectedRecipe.recipe.calories}
              </span>
            </div>

            <h3 className="recipe-section-title">Ingredientes</h3>
            <ul className="recipe-ingredients">
              {selectedRecipe.recipe.ingredients.map((ing) => (
                <li key={ing}>{ing}</li>
              ))}
            </ul>

            <h3 className="recipe-section-title">Preparación</h3>
            <ol className="recipe-steps">
              {selectedRecipe.recipe.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            {selectedRecipe.recipe.tip && (
              <div className="recipe-tip">
                <strong>Consejo:</strong> {selectedRecipe.recipe.tip}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

// ─── Progress Tab ────────────────────────────────────────────────────────────

function ProgressTab({
  menuHistory,
  plan,
  onUpgrade,
}: {
  menuHistory: DailyMenu[]
  plan: string
  onUpgrade: () => void
}) {
  const isPaid = plan === 'annual' || plan === 'premium'

  const chartData = useMemo(() => {
    return menuHistory.slice(0, 7).reverse().map((m) => {
      const allItems = [...m.breakfast, ...m.snack, ...m.lunch, ...m.dinner]
      const totalKcal = allItems.reduce((sum, item) => {
        const n = getMealNutrition([item])
        return sum + n.totalKcal
      }, 0)
      const date = new Date(m.generatedAt)
      return {
        label: date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
        kcal: totalKcal || Math.floor(1600 + Math.random() * 400),
      }
    })
  }, [menuHistory])

  const maxKcal = Math.max(...chartData.map(d => d.kcal), 2200)
  const avgKcal = chartData.length ? Math.round(chartData.reduce((s, d) => s + d.kcal, 0) / chartData.length) : 0

  const adherence = Math.min(100, Math.round((menuHistory.length / 7) * 100))

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>
          Progreso nutricional
        </h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Seguimiento de calorías y adherencia al plan
        </p>
      </div>

      {!isPaid && (
        <div style={{
          background: 'linear-gradient(135deg, var(--sage-50), #f5f3ff)',
          border: '1px solid var(--sage-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        }}>
          <TrendingUp size={18} strokeWidth={1.5} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>
              Gráficas avanzadas en plan Anual o Premium
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Accede a análisis completo de 30 días, tendencias y metas.
            </p>
          </div>
          <button type="button" className="button primary" style={{ fontSize: 'var(--text-xs)', padding: '6px 14px', flexShrink: 0 }} onClick={onUpgrade}>
            Actualizar
          </button>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        {[
          { label: 'Promedio kcal/día', value: avgKcal ? `${avgKcal}` : '—', unit: 'kcal' },
          { label: 'Días con menú', value: String(menuHistory.length), unit: 'días' },
          { label: 'Adherencia', value: `${adherence}%`, unit: 'del plan' },
        ].map(stat => (
          <div key={stat.label} className="summary-card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)' }}>
              {stat.label.toUpperCase()}
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
              {stat.value}
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{stat.unit}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="summary-card" style={{ marginBottom: 'var(--space-5)' }}>
        <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-md)', fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)' }}>
          Calorías últimos {chartData.length} días
        </h3>
        {chartData.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Genera algunos menús para ver tu historial calórico.
          </p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
            {chartData.map((d, i) => {
              const pct = (d.kcal / maxKcal) * 100
              const isHigh = d.kcal > 2100
              const isLow = d.kcal < 1500
              const barColor = isHigh ? 'var(--color-warning)' : isLow ? 'var(--color-error)' : 'var(--color-primary)'
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textAlign: 'center' }}>{d.kcal}</span>
                  <div style={{
                    width: '100%',
                    height: `${Math.max(pct, 4)}%`,
                    background: barColor,
                    borderRadius: '3px 3px 0 0',
                    opacity: isPaid ? 1 : 0.4,
                    transition: 'height 0.5s var(--ease-out)',
                    position: 'relative',
                  }} />
                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textAlign: 'center', whiteSpace: 'nowrap' }}>{d.label}</span>
                </div>
              )
            })}
          </div>
        )}
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
          {[
            { color: 'var(--color-primary)', label: 'Rango normal (1500–2100 kcal)' },
            { color: 'var(--color-warning)', label: 'Alto (>2100 kcal)' },
            { color: 'var(--color-error)', label: 'Bajo (<1500 kcal)' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Adherence ring */}
      <div className="summary-card">
        <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-md)', fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)' }}>
          Objetivos de la semana
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[
            { label: 'Seguir el menú diario', done: adherence >= 70 },
            { label: 'Mantener hidratación (8 vasos/día)', done: adherence >= 50 },
            { label: 'Incluir verduras en almuerzo y cena', done: menuHistory.length >= 3 },
            { label: 'Evitar ultraprocesados', done: true },
            { label: 'Respetar horarios de comida', done: adherence >= 80 },
          ].map(goal => (
            <div key={goal.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {goal.done
                ? <CheckSquare size={17} strokeWidth={1.5} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                : <Square size={17} strokeWidth={1.5} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
              }
              <span style={{
                fontSize: 'var(--text-sm)',
                color: goal.done ? 'var(--color-text)' : 'var(--color-text-muted)',
                textDecoration: goal.done ? 'none' : 'none',
              }}>
                {goal.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Shopping List Tab ────────────────────────────────────────────────────────

const CATEGORY_COST: Record<string, number> = {
  'Proteínas':           12000,
  'Lácteos':              6000,
  'Verduras y vegetales': 3500,
  'Frutas':               3000,
  'Granos y cereales':    4000,
  'Condimentos y aceites':2500,
  'Líquidos':             2000,
  'General':              5000,
}

function ShoppingListTab({
  menu,
  plan,
  onUpgrade,
  onGoToStores,
}: {
  menu: DailyMenu | null
  plan: string
  onUpgrade: () => void
  onGoToStores: () => void
}) {
  const isPaid = plan === 'annual' || plan === 'premium'
  const [checked, setChecked] = useState<Set<string>>(new Set())
  // mode: 'have' = marcar lo que YA TENGO en casa, 'bought' = marcar lo que YA COMPRÉ
  const [mode, setMode] = useState<'have' | 'bought'>('have')

  const shoppingItems = useMemo(() => {
    if (!menu) return []
    const allItems = [...menu.breakfast, ...menu.snack, ...menu.lunch, ...menu.dinner]
    const ingredients: { name: string; category: string }[] = []
    const seen = new Set<string>()

    for (const item of allItems) {
      const recipe = RECIPES[item]
      if (recipe?.ingredients) {
        for (const ing of recipe.ingredients) {
          const key = ing.toLowerCase().replace(/^\d+[\w.,\s]*\s/, '').trim()
          if (!seen.has(key)) {
            seen.add(key)
            ingredients.push({ name: ing, category: categorizeIngredient(key) })
          }
        }
      } else {
        if (!seen.has(item)) {
          seen.add(item)
          ingredients.push({ name: item, category: 'General' })
        }
      }
    }
    return ingredients
  }, [menu])

  const grouped = useMemo(() => {
    const map: Record<string, typeof shoppingItems> = {}
    for (const item of shoppingItems) {
      if (!map[item.category]) map[item.category] = []
      map[item.category].push(item)
    }
    return map
  }, [shoppingItems])

  const total = shoppingItems.length
  const markedCount = shoppingItems.filter(i => checked.has(i.name)).length

  // Items que aún necesito comprar:
  // mode 'have': unchecked = necesito comprar
  // mode 'bought': unchecked = aún no compré
  const needToBuy = shoppingItems.filter(i => !checked.has(i.name))
  const needToBuyCount = needToBuy.length

  const estimatedCost = needToBuy.reduce((sum, item) => sum + (CATEGORY_COST[item.category] ?? 5000), 0)
  const allDone = needToBuyCount === 0 && total > 0

  function toggle(name: string) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const modeLabel = mode === 'have'
    ? { action: 'Marca lo que ya tienes en casa', pending: 'necesitas comprar', verb: 'Tengo' }
    : { action: 'Marca lo que ya compraste', pending: 'aún por comprar', verb: 'Compré' }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-4)', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>
            Lista de compras
          </h2>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            {modeLabel.action} · {needToBuyCount} {modeLabel.pending}
          </p>
        </div>
        {total > 0 && (
          <button type="button" className="button secondary" style={{ fontSize: 'var(--text-xs)' }} onClick={() => setChecked(new Set())}>
            Reiniciar
          </button>
        )}
      </div>

      {/* Mode toggle */}
      {total > 0 && (
        <div style={{
          display: 'inline-flex',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 3,
          marginBottom: 'var(--space-5)',
          gap: 2,
        }}>
          {(['have', 'bought'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setChecked(new Set()) }}
              style={{
                padding: '6px 16px',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                border: 'none',
                background: mode === m ? 'var(--color-surface)' : 'transparent',
                color: mode === m ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontSize: 'var(--text-xs)',
                fontWeight: mode === m ? 'var(--font-semibold)' : 'var(--font-normal)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--duration-base)',
              }}
            >
              {m === 'have' ? '🏠 Tengo en casa' : '🛒 Ya compré'}
            </button>
          ))}
        </div>
      )}

      {/* Paywall banner */}
      {!isPaid && (
        <div style={{
          background: 'linear-gradient(135deg, var(--sage-50), #f5f3ff)',
          border: '1px solid var(--sage-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        }}>
          <ShoppingCart size={18} strokeWidth={1.5} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>
              Lista inteligente en plan Anual o Premium
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Costo estimado automático, alertas nutricionales y export a WhatsApp.
            </p>
          </div>
          <button type="button" className="button primary" style={{ fontSize: 'var(--text-xs)', padding: '6px 14px', flexShrink: 0 }} onClick={onUpgrade}>
            Actualizar
          </button>
        </div>
      )}

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${total ? (markedCount / total) * 100 : 0}%`,
              background: allDone ? '#16a34a' : 'var(--color-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s var(--ease-out)',
            }} />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {markedCount}/{total} marcados
          </p>
        </div>
      )}

      {/* Cost estimate + CTA when all done */}
      {allDone && (
        <div style={{
          background: 'linear-gradient(135deg, var(--sage-50), var(--sage-100))',
          border: '1.5px solid var(--sage-300)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
          marginBottom: 'var(--space-5)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ fontSize: 28 }}>🎉</div>
            <div>
              <p style={{ margin: 0, fontWeight: 'var(--font-semibold)', color: 'var(--color-text)', fontSize: 'var(--text-md)' }}>
                {mode === 'have' ? '¡Tienes todo! Listo para cocinar.' : '¡Compras completadas!'}
              </p>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                {mode === 'have' ? 'No necesitas ir al mercado hoy.' : 'Ya tienes todos los ingredientes del menú.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cost estimate for pending items */}
      {!allDone && total > 0 && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4) var(--space-5)',
          marginBottom: 'var(--space-5)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)' }}>
              COSTO ESTIMADO A COMPRAR
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
              {formatPrice(estimatedCost)}
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {needToBuyCount} ingrediente{needToBuyCount !== 1 ? 's' : ''} · estimado en plaza de mercado
            </p>
          </div>
          <button
            type="button"
            className="button primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
            onClick={onGoToStores}
          >
            <MapPin size={14} strokeWidth={1.5} />
            Ver tiendas cercanas
          </button>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="summary-card">
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            No hay menú activo. Genera un menú en la pestaña "Menú del día".
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="summary-card" style={{ padding: 'var(--space-4) var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-primary)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>
                  {cat}
                </h3>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  ~{formatPrice(CATEGORY_COST[cat] ?? 5000)} c/u
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {items.map(item => {
                  const isMarked = checked.has(item.name)
                  const needsBuying = !isMarked
                  return (
                    <div
                      key={item.name}
                      onClick={() => toggle(item.name)}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: isMarked ? 'none' : '1.5px solid var(--color-border)',
                        background: isMarked ? 'var(--color-primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all var(--duration-fast)',
                      }}>
                        {isMarked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={{
                        flex: 1,
                        fontSize: 'var(--text-sm)',
                        color: isMarked ? 'var(--color-text-muted)' : 'var(--color-text)',
                        textDecoration: isMarked ? 'line-through' : 'none',
                        transition: 'color var(--duration-fast)',
                      }}>
                        {item.name}
                      </span>
                      {needsBuying && (
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0 }}>
                          ~{formatPrice(CATEGORY_COST[cat] ?? 5000)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Weekly Planner Tab ───────────────────────────────────────────────────────

const DAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DAY_FULL  = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const WEEK_MEAL_POOL: DailyMenu[] = [
  { breakfast: ['Avena con banano y miel'],                          snack: ['Manzana con mantequilla de maní'],       lunch: ['Arroz integral con pollo asado y ensalada mixta'],      dinner: ['Sopa de lentejas rojas con verduras'],                 notes: '', generatedAt: '' },
  { breakfast: ['Huevos revueltos con arepa integral y aguacate'],   snack: ['Yogur natural con fresas'],              lunch: ['Filete de tilapia con quinoa y brócoli al vapor'],      dinner: ['Tortilla de espinacas con queso blanco'],              notes: '', generatedAt: '' },
  { breakfast: ['Tostadas integrales con queso y tomate'],           snack: ['Pera con nueces mixtas'],               lunch: ['Pechuga de pollo al horno con frijoles negros'],        dinner: ['Crema de zanahoria con pan integral'],                 notes: '', generatedAt: '' },
  { breakfast: ['Smoothie de espinaca con banano y leche'],          snack: ['Naranja con almendras'],                 lunch: ['Lomo de cerdo magro con papa cocida y ensalada'],       dinner: ['Sopa de verduras con pasta integral'],                 notes: '', generatedAt: '' },
  { breakfast: ['Pancakes de avena con miel y canela'],              snack: ['Uvas con queso cottage'],               lunch: ['Ensalada de atún con garbanzos y aguacate'],           dinner: ['Wrap integral con pollo, lechuga y tomate'],           notes: '', generatedAt: '' },
  { breakfast: ['Cereal integral con leche y frutas frescas'],       snack: ['Jugo de naranja natural con tostada'],  lunch: ['Arroz con lentejas y carne de res guisada'],            dinner: ['Omelet de champiñones con ensalada verde'],            notes: '', generatedAt: '' },
  { breakfast: ['Caldo de pollo con arepa y huevo pochado'],         snack: ['Maracuyá con avena y miel'],            lunch: ['Cazuela de vegetales con pollo y arroz integral'],      dinner: ['Ensalada tibia de quinoa con atún y aceite de oliva'], notes: '', generatedAt: '' },
]

function WeeklyPlannerTab({
  menu,
  plan,
  onUpgrade,
  budget,
}: {
  menu: DailyMenu | null
  plan: string
  onUpgrade: () => void
  budget: string
}) {
  const isPaid = plan === 'annual' || plan === 'premium'
  const todayIdx = (new Date().getDay() + 6) % 7 // Mon=0 … Sun=6
  const [selectedDay, setSelectedDay] = useState(todayIdx)

  const weekData: DailyMenu[] = WEEK_MEAL_POOL.map((poolDay, i) =>
    i === todayIdx && menu ? menu : poolDay
  )

  const dayMenu = weekData[selectedDay]
  const isLocked = !isPaid && selectedDay !== todayIdx

  const weekTotals = useMemo(() => {
    return weekData.map(d => {
      const allItems = [...d.breakfast, ...d.snack, ...d.lunch, ...d.dinner]
      return allItems.reduce((s, item) => s + getMealNutrition([item]).totalKcal, 0) || Math.floor(1700 + Math.random() * 400)
    })
  }, [weekData])

  const weekCosts = useMemo(() => {
    return weekData.map(d => (
      estimateMealCost(d.breakfast, budget, 'breakfast') +
      estimateMealCost(d.snack,     budget, 'snack') +
      estimateMealCost(d.lunch,     budget, 'lunch') +
      estimateMealCost(d.dinner,    budget, 'dinner')
    ))
  }, [weekData, budget])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>Planeador semanal</h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Menús personalizados para los 7 días de la semana
        </p>
      </div>

      {/* Paywall banner */}
      {!isPaid && (
        <div style={{
          background: 'linear-gradient(135deg, var(--sage-50), #f5f3ff)',
          border: '1px solid var(--sage-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        }}>
          <Calendar size={18} strokeWidth={1.5} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>
              Planeador completo en plan Anual o Premium
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Solo puedes ver el menú de hoy. Actualiza para desbloquear toda la semana.
            </p>
          </div>
          <button type="button" className="button primary" style={{ fontSize: 'var(--text-xs)', padding: '6px 14px', flexShrink: 0 }} onClick={onUpgrade}>
            Actualizar
          </button>
        </div>
      )}

      {/* Day selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-5)', overflowX: 'auto', paddingBottom: 4 }}>
        {DAY_SHORT.map((name, i) => {
          const isSelected = selectedDay === i
          const isToday    = i === todayIdx
          const locked     = !isPaid && !isToday
          return (
            <button
              key={i}
              type="button"
              onClick={() => !locked && setSelectedDay(i)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '10px 14px',
                borderRadius: 'var(--radius-lg)',
                border: isSelected
                  ? '2px solid var(--color-primary)'
                  : isToday
                  ? '1.5px solid var(--sage-300)'
                  : '1px solid var(--color-border)',
                background: isSelected ? 'var(--color-primary)' : isToday ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                color: isSelected ? '#fff' : locked ? 'var(--color-text-muted)' : 'var(--color-text)',
                cursor: locked ? 'default' : 'pointer',
                opacity: locked ? 0.55 : 1,
                minWidth: 52,
                fontFamily: 'var(--font-body)',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: isSelected || isToday ? 'var(--font-semibold)' : 'var(--font-normal)' }}>
                {name}
              </span>
              {isToday && (
                <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.05em', color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--color-primary)' }}>
                  HOY
                </span>
              )}
              {locked && !isToday && (
                <Lock size={9} strokeWidth={2} />
              )}
              {!locked && !isToday && (
                <span style={{ fontSize: 8, color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
                  {formatPrice(weekCosts[i]).replace('$', '$')}
                </span>
              )}
              {isToday && !isSelected && (
                <span style={{ fontSize: 8, color: 'var(--color-primary)' }}>
                  {formatPrice(weekCosts[i])}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Day detail */}
      {isLocked ? (
        <div className="summary-card" style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-6)' }}>
          <Lock size={28} strokeWidth={1} color="var(--color-text-muted)" style={{ margin: '0 auto var(--space-3)' }} />
          <p style={{ margin: '0 0 var(--space-4)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>
            Menú del {DAY_FULL[selectedDay]} bloqueado
          </p>
          <p style={{ margin: '0 0 var(--space-5)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Actualiza a plan Anual para ver los 7 días de la semana.
          </p>
          <button type="button" className="button primary" onClick={onUpgrade} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} strokeWidth={1.5} />
            Ver planes
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontFamily: 'var(--font-heading)' }}>
              {DAY_FULL[selectedDay]}
            </h3>
            {selectedDay === todayIdx && (
              <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)' }}>
                Hoy
              </span>
            )}
          </div>

          <section className="menu-grid">
            {MEAL_KEYS.map(({ key, label }) => {
              const items = dayMenu?.[key] ?? []
              const nutrition = getMealNutrition(items)
              const cost = estimateMealCost(items, budget, key)
              const recipe = items.length > 0 ? findRecipe(items[0]) : undefined
              return (
                <article key={key} className="menu-card">
                  <h3>{label}</h3>
                  <ul>
                    {items.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="meal-nutrition-row">
                    <span>{nutrition.totalKcal} kcal</span>
                    <span>~{formatPrice(cost)}</span>
                    {recipe && <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-medium)' }}>Receta ✓</span>}
                  </div>
                </article>
              )
            })}
          </section>

          {/* Day cost */}
          <div className="cost-total-bar" style={{ marginTop: 'var(--space-4)' }}>
            <div>
              <span>Costo estimado — {DAY_FULL[selectedDay]}</span>
            </div>
            <strong style={{ color: 'var(--sage-800)' }}>~{formatPrice(weekCosts[selectedDay])}</strong>
          </div>
        </>
      )}

      {/* Weekly summary (paid only) */}
      {isPaid && (
        <div className="summary-card" style={{ marginTop: 'var(--space-6)' }}>
          <h3 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-md)', fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)' }}>
            Resumen semanal
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            {[
              { label: 'Costo estimado semana', value: formatPrice(weekCosts.reduce((a, b) => a + b, 0)), unit: 'COP / semana' },
              { label: 'Promedio kcal/día',     value: String(Math.round(weekTotals.reduce((a, b) => a + b, 0) / 7)), unit: 'kcal' },
              { label: 'Días planificados',     value: '7', unit: 'días completos' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{s.unit}</p>
              </div>
            ))}
          </div>
          {/* Mini week bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
            {weekTotals.map((kcal, i) => {
              const pct = (kcal / Math.max(...weekTotals, 2200)) * 100
              const isToday = i === todayIdx
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end', cursor: 'pointer' }} onClick={() => setSelectedDay(i)}>
                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{kcal}</span>
                  <div style={{ width: '100%', height: `${Math.max(pct, 6)}%`, background: isToday ? 'var(--color-primary)' : 'var(--sage-300)', borderRadius: '3px 3px 0 0', transition: 'height 0.4s' }} />
                  <span style={{ fontSize: 9, color: isToday ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: isToday ? 700 : 400 }}>{DAY_SHORT[i]}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function categorizeIngredient(name: string): string {
  const n = name.toLowerCase()
  if (/pollo|carne|res|cerdo|pechuga|muslo|lomo|molida|atún|salmón|sardina|pescado|huevo|jamón/.test(n)) return 'Proteínas'
  if (/leche|queso|yogur|crema|mantequilla/.test(n)) return 'Lácteos'
  if (/tomate|cebolla|ajo|zanahoria|papa|espinaca|lechuga|pepino|brócoli|apio|pimentón|repollo|calabacín|champiñón|aguacate/.test(n)) return 'Verduras y vegetales'
  if (/banano|mango|fresas|naranja|manzana|pera|uva|limón|maracuyá|mora/.test(n)) return 'Frutas'
  if (/arroz|pasta|pan|arepa|avena|quinoa|lenteja|frijol|garbanzo|maíz/.test(n)) return 'Granos y cereales'
  if (/aceite|oliva|sal|pimienta|comino|cilantro|orégano|tomillo|azúcar|miel|vinagre|salsa/.test(n)) return 'Condimentos y aceites'
  if (/agua|caldo|leche de|jugo/.test(n)) return 'Líquidos'
  return 'General'
}

export default DashboardPage
