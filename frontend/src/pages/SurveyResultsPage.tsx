import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Heart, Users, TrendingUp, DollarSign, Star, RefreshCw } from 'lucide-react'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

const SCALE_QUESTIONS = [
  { key: 'q1', short: 'Importancia de la alimentación' },
  { key: 'q2', short: 'Claridad de la propuesta' },
  { key: 'q3', short: 'Utilidad del menú diario' },
  { key: 'q4', short: 'Probabilidad de uso' },
  { key: 'q5', short: 'Disposición a pagar' },
  { key: 'q6', short: 'Probabilidad de recomendar' },
  { key: 'q7', short: 'Atractivo del plan gratuito' },
]

const OPEN_QUESTIONS = [
  { key: 'q8', label: 'Problema principal que resolvería NutriCare' },
  { key: 'q9', label: 'Funcionalidad más valiosa' },
  { key: 'q10', label: 'Sugerencias y mejoras' },
]

type Response = Record<string, string | number>

function avg(rows: Response[], key: string): number {
  if (!rows.length) return 0
  return rows.reduce((s, r) => s + Number(r[key]), 0) / rows.length
}

function dist(rows: Response[], key: string): number[] {
  return [1, 2, 3, 4, 5].map(n => rows.filter(r => Number(r[key]) === n).length)
}

function ScoreBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100
  const color = pct >= 70 ? 'var(--color-primary)' : pct >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color, minWidth: 28, textAlign: 'right' }}>
        {value.toFixed(1)}
      </span>
    </div>
  )
}

function DistChart({ counts }: { counts: number[] }) {
  const maxCount = Math.max(...counts, 1)
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e']
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 56 }}>
      {counts.map((c, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 'var(--font-semibold)' }}>{c > 0 ? c : ''}</span>
          <div style={{
            width: '100%', borderRadius: 4,
            height: Math.max((c / maxCount) * 40, c > 0 ? 4 : 0),
            background: colors[i],
            transition: 'height 0.5s ease',
          }} />
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{i + 1}</span>
        </div>
      ))}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, sub, color = 'var(--color-primary)' }: { icon: React.ElementType; label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} strokeWidth={1.5} color={color} />
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', color, letterSpacing: '-0.02em' }}>{value}</p>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default function SurveyResultsPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/survey/results`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { setError('No autorizado.'); return }
      const data = await res.json()
      setResponses(data.responses)
    } catch {
      setError('Error al cargar los resultados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <p style={{ color: 'var(--color-text-muted)' }}>Cargando resultados...</p>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <p style={{ color: '#ef4444' }}>{error}</p>
    </div>
  )

  const total = responses.length
  const overallAvg = total ? SCALE_QUESTIONS.reduce((s, q) => s + avg(responses, q.key), 0) / SCALE_QUESTIONS.length : 0
  const payAvg     = avg(responses, 'q5')
  const npsAvg     = avg(responses, 'q6')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '32px 16px 80px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={16} strokeWidth={2} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em' }}>Dashboard de Encuesta</h1>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>NutriCare · Validación de producto</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
              <RefreshCw size={14} strokeWidth={2} /> Actualizar
            </button>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-primary)', cursor: 'pointer', fontSize: 'var(--text-sm)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)' }}>
              Ir al dashboard
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <KpiCard icon={Users}      label="Respuestas"          value={`${total}/5`}              sub="personas encuestadas" />
          <KpiCard icon={Star}       label="Interés general"     value={`${overallAvg.toFixed(1)}/5`} sub="promedio 7 preguntas"   />
          <KpiCard icon={DollarSign} label="Disposición a pagar" value={`${payAvg.toFixed(1)}/5`}  sub="pregunta 5"  color="#7c3aed" />
          <KpiCard icon={TrendingUp} label="Recomendaría"        value={`${npsAvg.toFixed(1)}/5`}  sub="pregunta 6"  color="#0ea5e9" />
        </div>

        {total === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>Aún no hay respuestas registradas.</p>
            <p style={{ margin: '8px 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Comparte el link <strong>/encuesta</strong> con los participantes.
            </p>
          </div>
        )}

        {total > 0 && (
          <>
            {/* Preguntas de escala */}
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', margin: '0 0 12px', letterSpacing: '-0.01em' }}>Resultados por pregunta</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 12, marginBottom: 24 }}>
              {SCALE_QUESTIONS.map((q, i) => {
                const a = avg(responses, q.key)
                const d = dist(responses, q.key)
                return (
                  <div key={q.key} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px 24px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                      Pregunta {i + 1}
                    </p>
                    <p style={{ margin: '0 0 14px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)', lineHeight: 'var(--leading-snug)' }}>
                      {q.short}
                    </p>
                    <ScoreBar value={a} />
                    <div style={{ marginTop: 12 }}>
                      <DistChart counts={d} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Nada</span>
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Mucho</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Respuestas cualitativas */}
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', margin: '0 0 12px', letterSpacing: '-0.01em' }}>Respuestas abiertas</h2>
            {OPEN_QUESTIONS.map((q, qi) => (
              <div key={q.key} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px 24px', marginBottom: 12 }}>
                <p style={{ margin: '0 0 16px', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                  Pregunta {SCALE_QUESTIONS.length + qi + 1} — {q.label}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {responses.map((r, ri) => (
                    <div key={ri} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary-subtle)', border: '1px solid var(--sage-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 'var(--font-bold)', color: 'var(--color-primary)' }}>{String(r.respondent_name).charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-secondary)' }}>{r.respondent_name}</p>
                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 'var(--leading-relaxed)' }}>{String(r[q.key])}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
