import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit2, Crown, Zap, Leaf, Activity, Scale, Ruler,
  Calendar, Heart, Target, Clock, Bell, Utensils, Wallet,
  AlertCircle, CheckCircle2, Sparkles, ChevronRight, User,
} from 'lucide-react'
import { useAuth, type SubscriptionPlan } from '../context/AuthContext'

interface Profile {
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
  dailyTips: boolean
  mealTimes: { breakfast: string; lunch: string; dinner: string; snacks: string }
  updatedAt: string
  photoUrl?: string
}

const PLAN_CONFIG: Record<SubscriptionPlan, { label: string; color: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }> }> = {
  free:    { label: 'Básico',  color: 'var(--neutral-500)', Icon: Leaf },
  annual:  { label: 'Anual',   color: 'var(--sage-500)',    Icon: Zap },
  premium: { label: 'Premium', color: '#7c3aed',            Icon: Crown },
}

const CONDITION_ICONS: Record<string, string> = {
  'Diabetes tipo 2':                '🩸',
  'Hipertensión arterial':          '❤️',
  'Obesidad y sobrepeso':           '⚖️',
  'Colesterol y triglicéridos altos':'🫀',
  'Gastritis y salud digestiva':    '🫁',
}

const GOAL_ICONS: Record<string, string> = {
  'Mejorar control de mi enfermedad': '🏥',
  'Perder peso':                      '⚖️',
  'Tener más energía':                '⚡',
  'Reducir medicamentos':             '💊',
  'Aprender a comer mejor':          '📚',
  'Mantener mis resultados actuales': '🎯',
}

function getAvatarUrl(name: string) {
  const seed = encodeURIComponent(name || 'Usuario')
  return `https://api.dicebear.com/6.x/initials/svg?seed=${seed}&backgroundColor=a3c7b0,4a7c59&color=ffffff`
}

function calcBMI(weight: number, height: number) {
  if (!weight || !height) return null
  return weight / ((height / 100) ** 2)
}

function bmiLabel(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Bajo peso',       color: '#2563eb' }
  if (bmi < 25)   return { label: 'Peso normal',      color: 'var(--color-primary)' }
  if (bmi < 30)   return { label: 'Sobrepeso',        color: 'var(--color-warning)' }
  return              { label: 'Obesidad',            color: 'var(--color-error)' }
}

function formatBudget(raw: string): string {
  const n = Number(raw.replace(/\D/g, ''))
  if (!n) return 'No especificado'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n) + '/mes'
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="summary-card" style={{ padding: 'var(--space-5) var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
        {icon}
        <h3 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-semibold)', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

function MetricItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>{value}</span>
      {sub && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{sub}</span>}
    </div>
  )
}

export default function ProfilePage() {
  const { token, email, plan, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
    fetch(`${apiUrl}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data?.profile) setProfile(data.profile)
        else setError('No se encontró tu perfil.')
      })
      .catch(() => setError('Error al cargar el perfil.'))
      .finally(() => setLoading(false))
  }, [token])

  const planCfg = PLAN_CONFIG[plan]
  const PlanIcon = planCfg.Icon

  if (loading) {
    return (
      <section className="onboarding page-shell">
        <div className="summary-card"><p>Cargando perfil...</p></div>
      </section>
    )
  }

  if (error || !profile) {
    return (
      <section className="onboarding page-shell">
        <div className="summary-card">
          <p style={{ color: 'var(--color-error)' }}>{error || 'Perfil no disponible.'}</p>
          <button className="button primary" style={{ marginTop: 12 }} onClick={() => navigate('/onboarding')}>
            Completar perfil
          </button>
        </div>
      </section>
    )
  }

  const bmi = calcBMI(profile.weight, profile.height)
  const bmiInfo = bmi ? bmiLabel(bmi) : null

  return (
    <section className="onboarding page-shell">

      {/* Header */}
      <div className="onboarding-header">
        <div>
          <span className="tag">Mi perfil</span>
          <h1>Perfil de salud</h1>
          <p>Toda tu información clínica y preferencias nutricionales.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="button secondary"
            onClick={() => navigate('/dashboard')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Dashboard
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate('/onboarding')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Edit2 size={14} strokeWidth={1.5} />
            Editar perfil
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="summary-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
          <img
            src={profile.photoUrl ?? getAvatarUrl(profile.name ?? email ?? 'Usuario')}
            alt="Avatar"
            style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--sage-200)', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-heading)' }}>
              {profile.name}
            </h2>
            <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {email} · {profile.biologicalSex} · {profile.age} años
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {/* Plan badge */}
              <button
                type="button"
                onClick={() => navigate('/planes')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${planCfg.color}44`,
                  background: `${planCfg.color}12`,
                  color: planCfg.color,
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-semibold)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {plan === 'premium' && <Sparkles size={10} strokeWidth={2} />}
                <PlanIcon size={11} strokeWidth={2} />
                Plan {planCfg.label}
              </button>
              {/* Diet badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-medium)',
              }}>
                <Utensils size={10} strokeWidth={2} />
                {profile.diet}
              </span>
              {/* Activity badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-medium)',
              }}>
                <Activity size={10} strokeWidth={2} />
                {profile.activityLevel}
              </span>
            </div>
          </div>
          {/* Last updated */}
          {profile.updatedAt && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Actualizado</p>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-medium)' }}>
                {new Date(profile.updatedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>

        {/* Métricas corporales */}
        <Section title="Métricas corporales" icon={<Scale size={16} strokeWidth={1.5} color="var(--color-primary)" />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
            <MetricItem label="Peso" value={`${profile.weight} kg`} />
            <MetricItem label="Altura" value={`${profile.height} cm`} />
            <MetricItem label="Edad" value={`${profile.age} años`} />
            <MetricItem
              label="IMC"
              value={bmi ? bmi.toFixed(1) : '—'}
              sub={bmiInfo?.label}
            />
          </div>
          {bmi && bmiInfo && (
            <div style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: `${bmiInfo.color}12`,
              border: `1px solid ${bmiInfo.color}30`,
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: bmiInfo.color, flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--text-xs)', color: bmiInfo.color, fontWeight: 'var(--font-medium)' }}>
                IMC {bmi.toFixed(1)} — {bmiInfo.label}
              </span>
            </div>
          )}
          {/* IMC scale bar */}
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'linear-gradient(to right, #2563eb 0%, var(--color-primary) 25%, #eab308 55%, #dc2626 100%)', position: 'relative', overflow: 'visible' }}>
              {bmi && (
                <div style={{
                  position: 'absolute',
                  left: `${Math.min(Math.max(((bmi - 15) / 25) * 100, 2), 98)}%`,
                  top: '50%', transform: 'translate(-50%, -50%)',
                  width: 12, height: 12, borderRadius: '50%',
                  background: 'white', border: `2px solid ${bmiInfo?.color}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {['15', '18.5', '25', '30', '40'].map(v => (
                <span key={v} style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{v}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* Condiciones de salud */}
        <Section title="Condiciones de salud" icon={<Heart size={16} strokeWidth={1.5} color="var(--color-primary)" />}>
          {profile.conditions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={16} strokeWidth={1.5} color="var(--color-primary)" />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Sin condiciones registradas</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {profile.conditions.map(c => (
                <div key={c} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{CONDITION_ICONS[c] ?? '🏥'}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', fontWeight: 'var(--font-medium)' }}>{c}</span>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            style={{
              marginTop: 'var(--space-4)',
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span>Actualizar condiciones</span>
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </Section>

        {/* Objetivos */}
        <Section title="Objetivos de salud" icon={<Target size={16} strokeWidth={1.5} color="var(--color-primary)" />}>
          {profile.goals.length === 0 ? (
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Sin objetivos definidos</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {profile.goals.map(g => (
                <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{GOAL_ICONS[g] ?? '🎯'}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{g}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Preferencias alimentarias */}
        <Section title="Preferencias alimentarias" icon={<Utensils size={16} strokeWidth={1.5} color="var(--color-primary)" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Tipo de dieta</p>
              <p style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)' }}>{profile.diet}</p>
            </div>
            {profile.dislikes && (
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>No consume / no le gusta</p>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{profile.dislikes}</p>
              </div>
            )}
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Presupuesto mensual</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Wallet size={14} strokeWidth={1.5} color="var(--color-primary)" />
                <p style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-semibold)', color: 'var(--color-primary)' }}>{formatBudget(profile.budget)}</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Horarios */}
        <Section title="Horarios de comidas" icon={<Clock size={16} strokeWidth={1.5} color="var(--color-primary)" />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {([
              { key: 'breakfast', label: 'Desayuno' },
              { key: 'lunch',     label: 'Almuerzo' },
              { key: 'dinner',    label: 'Cena' },
              { key: 'snacks',    label: 'Merienda' },
            ] as const).map(({ key, label }) => (
              <MetricItem
                key={key}
                label={label}
                value={profile.mealTimes?.[key] ?? '—'}
              />
            ))}
          </div>
        </Section>

        {/* Notificaciones */}
        <Section title="Notificaciones" icon={<Bell size={16} strokeWidth={1.5} color="var(--color-primary)" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { label: 'Recordatorios de comidas', active: profile.reminders },
              { label: 'Consejos diarios',         active: profile.dailyTips },
            ].map(n => (
              <div key={n.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{n.label}</span>
                <span style={{
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-semibold)',
                  background: n.active ? 'var(--color-success-subtle)' : 'var(--color-bg)',
                  color: n.active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  border: n.active ? '1px solid var(--sage-200)' : '1px solid var(--color-border)',
                }}>
                  {n.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* Plan CTA */}
      {plan === 'free' && (
        <div style={{
          marginTop: 'var(--space-6)',
          background: 'linear-gradient(135deg, var(--sage-50) 0%, #f5f3ff 100%)',
          border: '1.5px solid var(--sage-200)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-5)', flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-md)', color: 'var(--color-text)' }}>
              Desbloquea el análisis completo de tu perfil
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              Con plan Anual accedes a gráficas avanzadas, chatbot IA y planeador semanal.
            </p>
          </div>
          <button type="button" className="button primary" onClick={() => navigate('/planes')} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} strokeWidth={1.5} />
            Ver planes
          </button>
        </div>
      )}

      {/* Danger zone */}
      <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
        <button
          type="button"
          onClick={logout}
          style={{
            background: 'none', border: '1px solid var(--color-error-border)',
            color: 'var(--color-error)', padding: 'var(--space-3) var(--space-5)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer',
            fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
            fontWeight: 'var(--font-medium)',
          }}
        >
          Cerrar sesión
        </button>
      </div>

    </section>
  )
}
