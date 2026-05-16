import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Check, Zap, Crown, Leaf, UtensilsCrossed,
  MessageCircle, TrendingUp, ShoppingCart, MapPin, BookOpen,
  Heart, Activity, Star, ChevronDown, Play,
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '5',    label: 'Condiciones crónicas atendidas' },
  { value: '+190', label: 'Alimentos colombianos' },
  { value: '4',    label: 'Tipos de dieta' },
  { value: '100%', label: 'Personalizado por perfil' },
]

const CONDITIONS = [
  { emoji: '🩸', name: 'Diabetes tipo 2',                text: 'Menús de bajo índice glucémico, control de carbohidratos y porciones.' },
  { emoji: '❤️',  name: 'Hipertensión arterial',          text: 'Dieta DASH adaptada, reducción de sodio y alimentos ricos en potasio.' },
  { emoji: '⚖️',  name: 'Obesidad y sobrepeso',           text: 'Déficit calórico inteligente, alta saciedad y proteína en cada comida.' },
  { emoji: '🫀',  name: 'Colesterol y triglicéridos altos', text: 'Grasas saludables, fibra soluble y omega-3 para mejorar el perfil lipídico.' },
  { emoji: '🫁',  name: 'Gastritis y salud digestiva',   text: 'Alimentos protectores de mucosa, horarios regulares y sin irritantes.' },
]

const FEATURES = [
  { Icon: UtensilsCrossed, title: 'Menú diario personalizado',   desc: 'Desayuno, merienda, almuerzo y cena adaptados a tu condición, dieta y presupuesto.' },
  { Icon: MessageCircle,   title: 'Chatbot nutricional IA',       desc: 'Resuelve dudas sobre tu alimentación al instante, 24/7, con contexto de tu perfil clínico.' },
  { Icon: TrendingUp,      title: 'Progreso y adherencia',        desc: 'Gráficas de calorías diarias, objetivos semanales y seguimiento de tu constancia.' },
  { Icon: ShoppingCart,    title: 'Lista de compras inteligente', desc: 'Ingredientes del menú agrupados por categoría con costo estimado en plaza de mercado.' },
  { Icon: MapPin,          title: 'Tiendas cercanas',             desc: 'Encuentra supermercados, tiendas naturistas y plazas de mercado cerca de ti.' },
  { Icon: BookOpen,        title: 'Recetas paso a paso',          desc: 'Instrucciones completas con ingredientes, tiempo de preparación y consejos de chef.' },
]

const STEPS = [
  { n: '01', title: 'Crea tu perfil de salud', desc: 'Ingresa tus condiciones médicas, preferencias de dieta, presupuesto y objetivos. Solo toma 5 minutos.' },
  { n: '02', title: 'Recibe tu menú del día',  desc: 'Cada día recibes 4 comidas personalizadas, con nutrición, recetas y costo estimado en COP.' },
  { n: '03', title: 'Sigue tu progreso',       desc: 'Consulta tu historial, lista de compras, chatbot y gráficas de adherencia desde tu dashboard.' },
]

const PLANS = [
  {
    key: 'free', name: 'Básico', price: '$0', period: 'Siempre gratis',
    color: 'var(--neutral-500)', Icon: Leaf,
    features: ['Menú diario personalizado', 'Historial 7 días', 'Videos y tiendas', 'Recetas básicas'],
  },
  {
    key: 'annual', name: 'Anual', price: '$199.000', period: 'COP / año',
    color: 'var(--sage-500)', Icon: Zap, badge: 'Más popular',
    features: ['Todo lo del plan Básico', 'Historial 30 días', 'Lista de compras', 'Gráficas de progreso', 'Chatbot IA', 'Planeador semanal'],
  },
  {
    key: 'premium', name: 'Premium', price: '$29.900', period: 'COP / mes',
    color: '#7c3aed', Icon: Crown,
    features: ['Todo lo del plan Anual', 'Historial ilimitado', 'Asesor nutricional humano', 'Soporte prioritario'],
  },
]

const TESTIMONIALS = [
  { name: 'Marcela R.', city: 'Bogotá', condition: 'Diabetes tipo 2',        text: 'Por primera vez entiendo qué comer sin miedo a subir la glucosa. El menú diario me cambió la vida.', stars: 5 },
  { name: 'Carlos M.',  city: 'Medellín', condition: 'Hipertensión arterial', text: 'En 3 meses bajé 8 puntos de presión siguiendo los menús. Mi médico quedó sorprendido.', stars: 5 },
  { name: 'Ana L.',     city: 'Cali',    condition: 'Obesidad y sobrepeso',   text: 'Nunca pensé que podía comer rico y perder peso. La lista de compras me ahorra plata y tiempo.', stars: 5 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function NavBar({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(250,250,248,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 var(--space-6)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 60,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={14} strokeWidth={2} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
          NutriCare
        </span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        <button onClick={onLogin} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)',
          padding: 'var(--space-2) var(--space-3)',
        }}>
          Iniciar sesión
        </button>
        <button onClick={onRegister} className="button primary" style={{ fontSize: 'var(--text-sm)', padding: '8px 18px' }}>
          Empezar gratis
        </button>
      </div>
    </nav>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={12} strokeWidth={0} fill="var(--color-warning)" color="var(--color-warning)" />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text)', background: 'var(--color-bg)', overflowX: 'hidden' }}>
      <style>{`
        .landing-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .landing-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
        .landing-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; position: relative; }
        .landing-hero-visual { position: relative; }
        @media (max-width: 900px) {
          .landing-hero { grid-template-columns: 1fr; gap: 40px; }
          .landing-hero-visual { display: none; }
          .landing-stats { grid-template-columns: repeat(2, 1fr); }
          .landing-steps { grid-template-columns: 1fr; gap: 24px; }
          .landing-steps .step-connector { display: none; }
        }
        @media (max-width: 540px) {
          .landing-stats { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <NavBar onLogin={() => navigate('/login')} onRegister={() => navigate('/register')} />

      {/* ── HERO ── */}
      <section className="landing-hero" style={{
        maxWidth: 'var(--container-xl)', margin: '0 auto',
        padding: 'var(--space-20) var(--space-6) var(--space-16)',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            background: 'var(--color-primary-subtle)',
            border: '1px solid var(--sage-200)',
            borderRadius: 'var(--radius-full)',
            padding: '5px 14px',
            marginBottom: 'var(--space-5)',
          }}>
            <Activity size={12} strokeWidth={2} color="var(--color-primary)" />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-wide)' }}>
              NUTRICIÓN CLÍNICA PERSONALIZADA
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            color: 'var(--color-text)',
            margin: '0 0 var(--space-5)',
          }}>
            Come bien.<br />
            <span style={{ color: 'var(--color-primary)' }}>Vive mejor.</span><br />
            Controla tu salud.
          </h1>

          <p style={{
            fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)', margin: '0 0 var(--space-8)',
            maxWidth: 480,
          }}>
            NutriCare genera menús diarios personalizados para personas con diabetes, hipertensión, obesidad y otras condiciones crónicas — adaptados a tu dieta, presupuesto y ciudad.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
            <button
              onClick={() => navigate('/register')}
              className="button primary"
              style={{ fontSize: 'var(--text-md)', padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              Comenzar gratis
              <ArrowRight size={16} strokeWidth={2} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="button secondary"
              style={{ fontSize: 'var(--text-md)', padding: '12px 28px' }}
            >
              Ya tengo cuenta
            </button>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            {['Sin tarjeta de crédito', 'Cancela cuando quieras', 'Para Colombia y LATAM'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Check size={13} strokeWidth={2.5} color="var(--color-primary)" />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual — dashboard mock */}
        <div className="landing-hero-visual">
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-6)',
            boxShadow: '0 24px 64px rgba(26,26,24,0.10)',
          }}>
            {/* Mock header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <div>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Buenos días</p>
                <p style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>María García</p>
              </div>
              <span style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--sage-200)' }}>
                Plan Anual
              </span>
            </div>
            {/* Mock meals */}
            {[
              { meal: 'Desayuno', item: 'Avena con frutas y miel', kcal: '320 kcal', price: 'aprox. $4.200' },
              { meal: 'Almuerzo', item: 'Pollo a la plancha con quinoa', kcal: '480 kcal', price: 'aprox. $9.500' },
              { meal: 'Merienda', item: 'Yogur con semillas de chía', kcal: '180 kcal', price: 'aprox. $3.000' },
              { meal: 'Cena',     item: 'Sopa de lentejas con verduras', kcal: '290 kcal', price: 'aprox. $4.500' },
            ].map((m, i) => (
              <div key={i} style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: i === 1 ? 'var(--color-primary-subtle)' : 'var(--color-bg)',
                border: `1px solid ${i === 1 ? 'var(--sage-200)' : 'var(--color-border)'}`,
                marginBottom: 'var(--space-2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)' }}>{m.meal.toUpperCase()}</p>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: i === 1 ? 'var(--color-primary)' : 'var(--color-text)' }}>{m.item}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{m.kcal}</p>
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--font-medium)' }}>{m.price}</p>
                  </div>
                </div>
              </div>
            ))}
            {/* Mock total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: 'var(--sage-800)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.8)' }}>Costo estimado del día</span>
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: '#fff' }}>aprox. $21.200</span>
            </div>
          </div>

          {/* Floating badge */}
          <div style={{
            position: 'absolute', top: -16, right: -16,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-3) var(--space-4)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          }}>
            <span style={{ fontSize: 18 }}>🩸</span>
            <div>
              <p style={{ margin: 0, fontSize: 10, color: 'var(--color-text-muted)' }}>Optimizado para</p>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>Diabetes tipo 2</p>
            </div>
          </div>

          <div style={{
            position: 'absolute', bottom: -16, left: -16,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-3) var(--space-4)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <div>
              <p style={{ margin: 0, fontSize: 10, color: 'var(--color-text-muted)' }}>Adherencia semanal</p>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-primary)' }}>86% esta semana</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: 'var(--color-primary)', padding: 'var(--space-8) var(--space-6)' }}>
        <div className="landing-stats" style={{ maxWidth: 'var(--container-xl)', margin: '0 auto' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: '#fff', letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.75)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONDICIONES ── */}
      <section style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: 'var(--space-20) var(--space-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <span style={{ display: 'inline-block', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
            Condiciones atendidas
          </span>
          <h2 style={{ margin: '0 0 var(--space-4)', fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', letterSpacing: '-0.02em' }}>
            Diseñado para tu condición específica
          </h2>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Cada menú considera las restricciones y necesidades de tu diagnóstico médico.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {CONDITIONS.map(c => (
            <div key={c.name} style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'box-shadow var(--duration-base)',
            }}>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 'var(--space-4)' }}>{c.emoji}</span>
              <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-md)', fontWeight: 'var(--font-semibold)', fontFamily: 'var(--font-body)' }}>{c.name}</h3>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ background: 'var(--sage-50)', padding: 'var(--space-20) var(--space-6)', borderTop: '1px solid var(--sage-100)', borderBottom: '1px solid var(--sage-100)' }}>
        <div style={{ maxWidth: 'var(--container-lg)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span style={{ display: 'inline-block', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
              Proceso simple
            </span>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', letterSpacing: '-0.02em' }}>
              En 3 pasos tienes tu plan
            </h2>
          </div>
          <div className="landing-steps">
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 56, height: 56,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-xl)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto var(--space-5)',
                }}>
                  {s.n}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="step-connector" style={{
                    position: 'absolute', top: 28, left: '60%', width: '80%',
                    height: 1, background: 'var(--sage-300)',
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
                  }}>
                    <ChevronDown size={12} color="var(--sage-300)" style={{ transform: 'rotate(-90deg)' }} />
                  </div>
                )}
                <h3 style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', fontFamily: 'var(--font-body)' }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: 'var(--space-20) var(--space-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <span style={{ display: 'inline-block', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
            Funcionalidades
          </span>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', letterSpacing: '-0.02em' }}>
            Todo lo que necesitas en un solo lugar
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                background: 'var(--color-primary-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 'var(--space-4)',
              }}>
                <Icon size={20} strokeWidth={1.5} color="var(--color-primary)" />
              </div>
              <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-md)', fontWeight: 'var(--font-semibold)', fontFamily: 'var(--font-body)' }}>{title}</h3>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VIDEOS ── */}
      <section style={{ background: 'var(--sage-50)', padding: 'var(--space-20) var(--space-6)', borderTop: '1px solid var(--sage-100)', borderBottom: '1px solid var(--sage-100)' }}>
        <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span style={{ display: 'inline-block', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
              Contenido educativo
            </span>
            <h2 style={{ margin: '0 0 var(--space-4)', fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', letterSpacing: '-0.02em' }}>
              Videos de salud y nutrición
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              Aprende a comer bien con contenido clínico explicado de forma sencilla, adaptado a tu condición.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)' }}>
            {[
              { emoji: '🩸', category: 'Diabetes',       title: 'Índice glucémico: qué comer y qué evitar',      duration: '8 min' },
              { emoji: '❤️',  category: 'Hipertensión',  title: 'Dieta DASH: cómo reducir la presión naturalmente', duration: '11 min' },
              { emoji: '⚖️',  category: 'Peso saludable', title: 'Cómo calcular tu déficit calórico ideal',       duration: '6 min' },
              { emoji: '🫀',  category: 'Colesterol',    title: 'Grasas buenas vs. malas: la guía definitiva',    duration: '9 min' },
              { emoji: '🥗',  category: 'Nutrición',     title: 'Proteínas, carbohidratos y grasas en equilibrio', duration: '7 min' },
              { emoji: '🛒',  category: 'Compras',       title: 'Cómo hacer mercado saludable con poco presupuesto', duration: '5 min' },
            ].map(v => (
              <div key={v.title} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}>
                {/* Thumbnail */}
                <div style={{
                  background: 'var(--color-primary-subtle)',
                  height: 140,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  <span style={{ fontSize: 48 }}>{v.emoji}</span>
                  <div style={{
                    position: 'absolute',
                    width: 44, height: 44,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}>
                    <Play size={18} strokeWidth={0} fill="#fff" color="#fff" style={{ marginLeft: 3 }} />
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-primary)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>
                      {v.category}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{v.duration}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)', lineHeight: 'var(--leading-snug)' }}>
                    {v.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Accede a toda la biblioteca de videos con tu cuenta NutriCare
            </p>
            <button
              onClick={() => navigate('/register')}
              className="button primary"
              style={{ fontSize: 'var(--text-sm)', padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Play size={14} strokeWidth={0} fill="#fff" color="#fff" />
              Ver biblioteca completa
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section style={{ background: 'var(--color-primary)', padding: 'var(--space-20) var(--space-6)' }}>
        <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#fff', letterSpacing: '-0.02em' }}>
              Historias reales de cambio
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6)',
              }}>
                <Stars n={t.stars} />
                <p style={{ margin: 'var(--space-4) 0', fontSize: 'var(--text-md)', color: '#fff', lineHeight: 'var(--leading-relaxed)', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 'var(--space-4)' }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 'var(--font-semibold)', color: '#fff', fontSize: 'var(--text-sm)' }}>{t.name}</p>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)' }}>{t.city} · {t.condition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: 'var(--space-20) var(--space-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <span style={{ display: 'inline-block', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
            Precios
          </span>
          <h2 style={{ margin: '0 0 var(--space-4)', fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', letterSpacing: '-0.02em' }}>
            Un plan para cada etapa
          </h2>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>
            Empieza gratis. Actualiza cuando estés listo.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)', alignItems: 'start' }}>
          {PLANS.map(p => {
            const Icon = p.Icon
            const isPopular = p.key === 'annual'
            return (
              <div key={p.key} style={{
                background: 'var(--color-surface)',
                border: isPopular ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6)',
                position: 'relative',
                boxShadow: isPopular ? '0 0 0 4px rgba(74,124,89,0.12)' : 'var(--shadow-md)',
              }}>
                {p.badge && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--color-primary)', color: '#fff',
                    fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
                    padding: '3px 14px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
                  }}>
                    {p.badge}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: `${p.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} strokeWidth={1.5} color={p.color} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', fontFamily: 'var(--font-body)' }}>{p.name}</h3>
                </div>
                <p style={{ margin: '0 0 2px', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', color: p.color }}>{p.price}</p>
                <p style={{ margin: '0 0 var(--space-5)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{p.period}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      <Check size={13} strokeWidth={2.5} color={p.color} style={{ flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  style={{
                    width: '100%', padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: isPopular ? 'none' : `1.5px solid ${p.color}`,
                    background: isPopular ? p.color : 'transparent',
                    color: isPopular ? '#fff' : p.color,
                    fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}
                >
                  {p.key === 'free' ? 'Empezar gratis' : `Elegir ${p.name}`}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        background: 'var(--sage-900)',
        padding: 'var(--space-20) var(--space-6)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 var(--space-5)', fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff', letterSpacing: '-0.02em' }}>
            Tu salud merece un plan personalizado
          </h2>
          <p style={{ margin: '0 0 var(--space-8)', fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.7)', lineHeight: 'var(--leading-relaxed)' }}>
            Únete a miles de colombianos que ya controlan su alimentación con NutriCare. Es gratis para comenzar.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#fff', color: 'var(--sage-800)',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '14px 32px',
              fontWeight: 'var(--font-bold)', fontSize: 'var(--text-md)',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            }}
          >
            Crear mi cuenta gratis
            <ArrowRight size={18} strokeWidth={2} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--sage-900)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: 'var(--space-8) var(--space-6)' }}>
        <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--sage-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={11} strokeWidth={2} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.9)' }}>NutriCare</span>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.4)' }}>
            © 2025 NutriCare · Protegido bajo Ley 1581 de Colombia · Hecho con ❤️ para LATAM
          </p>
        </div>
      </footer>

    </div>
  )
}
