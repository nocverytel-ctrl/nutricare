import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Heart, Users, TrendingUp, Download, RefreshCw } from 'lucide-react'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

const AGE_LABELS: Record<string, string>  = { A: '35–40', B: '41–45', C: '46–50', D: '51–55', E: '>55' }
const HEALTH_LABELS: Record<string, string> = { A: 'Diabetes tipo 2', B: 'Hipertensión', C: 'Sobrepeso/obesidad', D: 'Colesterol alto', E: 'Gastritis', F: 'Ninguna' }
const DL_LABELS: Record<string, string>   = { A: 'Sí', B: 'Tal vez', C: 'No' }
const FREQ_LABELS: Record<string, string> = { A: 'Diario', B: 'Semanal', C: 'Ocasionalmente', D: 'No la usaría' }
const PAY_LABELS: Record<string, string>  = { A: 'Sí', B: 'Tal vez', C: 'No' }

const LIKERT_QUESTIONS = [
  { key: 'q7',  short: 'Diseño, facilidad y propuesta de valor' },
  { key: 'q8',  short: 'Utilidad para hábitos alimenticios' },
  { key: 'q9',  short: 'Necesita mejoras' },
  { key: 'q10', short: 'Barreras de uso frecuente' },
  { key: 'q11', short: 'Disposición a pagar premium' },
  { key: 'q12', short: 'Recomendaría a otras personas' },
]

type Row = Record<string, string | number>

function avg(rows: Row[], key: string) {
  if (!rows.length) return 0
  return rows.reduce((s, r) => s + Number(r[key]), 0) / rows.length
}

function dist(rows: Row[], key: string) {
  return [1, 2, 3, 4, 5].map(n => rows.filter(r => Number(r[key]) === n).length)
}

function catDist(rows: Row[], key: string, labels: Record<string, string>) {
  const result: { label: string; count: number }[] = []
  for (const [k, label] of Object.entries(labels)) {
    result.push({ label, count: rows.filter(r => String(r[key]) === k).length })
  }
  return result
}

function ScoreBar({ value }: { value: number }) {
  const pct = (value / 5) * 100
  const color = pct >= 70 ? 'var(--color-primary)' : pct >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color, minWidth: 28, textAlign: 'right' }}>{value.toFixed(1)}</span>
    </div>
  )
}

function DistBars({ counts }: { counts: number[] }) {
  const max = Math.max(...counts, 1)
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e']
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 52 }}>
      {counts.map((c, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 'var(--font-semibold)' }}>{c > 0 ? c : ''}</span>
          <div style={{ width: '100%', borderRadius: 4, height: Math.max((c / max) * 36, c > 0 ? 4 : 0), background: colors[i], transition: 'height 0.5s ease' }} />
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{i + 1}</span>
        </div>
      ))}
    </div>
  )
}

function CatBars({ items }: { items: { label: string; count: number }[] }) {
  const max = Math.max(...items.map(i => i.count), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', minWidth: 130, flexShrink: 0 }}>{item.label}</span>
          <div style={{ flex: 1, height: 10, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${(item.count / max) * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 99, transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', minWidth: 16, textAlign: 'right' }}>{item.count}</span>
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

const card = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px 24px', marginBottom: 12 } as const
const h2 = { fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', margin: '24px 0 12px', letterSpacing: '-0.01em' } as const

export default function SurveyResultsPage() {
  const { token } = useAuth()
  const navigate  = useNavigate()
  const [responses, setResponses] = useState<Row[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/survey/results`, { headers: { Authorization: `Bearer ${token}` } })
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

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}><p style={{ color: 'var(--color-text-muted)' }}>Cargando resultados...</p></div>
  if (error)   return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}><p style={{ color: '#ef4444' }}>{error}</p></div>

  const total    = responses.length
  const utilidad = avg(responses, 'q3')
  const recomend = avg(responses, 'q12')
  const pctDescarga = total ? Math.round(responses.filter(r => r.q4 === 'A').length / total * 100) : 0

  // Health conditions (multi-select stored as comma-separated)
  const healthCounts: Record<string, number> = {}
  for (const r of responses) {
    for (const code of String(r.q2 ?? '').split(',')) {
      if (code) healthCounts[code] = (healthCounts[code] ?? 0) + 1
    }
  }
  const healthItems = Object.entries(HEALTH_LABELS).map(([k, label]) => ({ label, count: healthCounts[k] ?? 0 }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '32px 16px 80px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={16} strokeWidth={2} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em' }}>Dashboard de Encuesta</h1>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>NutriCare · Percepción de producto</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 8 }}>
          <KpiCard icon={Users}     label="Respuestas"         value={`${total}`}                    sub="personas encuestadas" />
          <KpiCard icon={Heart}     label="Utilidad percibida" value={`${utilidad.toFixed(1)}/5`}    sub="pregunta 3" />
          <KpiCard icon={TrendingUp} label="Recomendaría"      value={`${recomend.toFixed(1)}/5`}    sub="pregunta 12" color="#0ea5e9" />
          <KpiCard icon={Download}  label="Descargaría"        value={`${pctDescarga}%`}              sub="respondieron Sí" color="#7c3aed" />
        </div>

        {total === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', marginTop: 24 }}>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>Aún no hay respuestas registradas.</p>
            <p style={{ margin: '8px 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Comparte el link <strong>/encuesta</strong> con los participantes.</p>
          </div>
        )}

        {total > 0 && (<>

          {/* Datos generales */}
          <h2 style={h2}>Datos generales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 8 }}>
            <div style={card}>
              <p style={{ margin: '0 0 14px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>1. Distribución por edad</p>
              <CatBars items={Object.entries(AGE_LABELS).map(([k, label]) => ({ label, count: responses.filter(r => r.q1 === k).length }))} />
            </div>
            <div style={card}>
              <p style={{ margin: '0 0 14px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>2. Condiciones de salud (multi-respuesta)</p>
              <CatBars items={healthItems} />
            </div>
          </div>

          {/* Percepción */}
          <h2 style={h2}>Percepción y disposición de uso</h2>

          {/* Q3 Utilidad */}
          <div style={card}>
            <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>Pregunta 3</p>
            <p style={{ margin: '0 0 12px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)' }}>¿Qué tan útil le parece la App? (1–5)</p>
            <ScoreBar value={avg(responses, 'q3')} />
            <div style={{ marginTop: 12 }}>
              <DistBars counts={dist(responses, 'q3')} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Nada útil</span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Muy útil</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 8 }}>
            <div style={card}>
              <p style={{ margin: '0 0 14px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>4. ¿Descargaría la app?</p>
              <CatBars items={catDist(responses, 'q4', DL_LABELS)} />
            </div>
            <div style={card}>
              <p style={{ margin: '0 0 14px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>5. Frecuencia de uso</p>
              <CatBars items={catDist(responses, 'q5', FREQ_LABELS)} />
            </div>
            <div style={card}>
              <p style={{ margin: '0 0 14px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>6. ¿Pagaría premium?</p>
              <CatBars items={catDist(responses, 'q6', PAY_LABELS)} />
            </div>
          </div>

          {/* Likert */}
          <h2 style={h2}>Escala Likert (preguntas 7–12)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 12, marginBottom: 8 }}>
            {LIKERT_QUESTIONS.map((q, i) => (
              <div key={q.key} style={card}>
                <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>Pregunta {i + 7}</p>
                <p style={{ margin: '0 0 12px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)', lineHeight: 'var(--leading-snug)' }}>{q.short}</p>
                <ScoreBar value={avg(responses, q.key)} />
                <div style={{ marginTop: 12 }}>
                  <DistBars counts={dist(responses, q.key)} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Tot. desacuerdo</span>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Tot. de acuerdo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Q13 opcional */}
          {responses.some(r => r.q13) && (<>
            <h2 style={h2}>Pregunta 13 — ¿Por qué recomendaría (o no)?</h2>
            <div style={card}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {responses.filter(r => r.q13).map((r, i) => (
                  <div key={i} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 'var(--font-bold)', color: 'var(--color-primary)' }}>{String(r.respondent_name).charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-secondary)' }}>{r.respondent_name}</p>
                      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 'var(--leading-relaxed)' }}>{String(r.q13)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>)}

        </>)}
      </div>
    </div>
  )
}
