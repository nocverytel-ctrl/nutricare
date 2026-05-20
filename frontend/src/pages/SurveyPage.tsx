import { useState } from 'react'
import { Heart, Check } from 'lucide-react'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

const AGE_OPTIONS    = [{ v: 'A', l: '35 a 40 años' }, { v: 'B', l: '41 a 45 años' }, { v: 'C', l: '46 a 50 años' }, { v: 'D', l: '51 a 55 años' }, { v: 'E', l: 'Más de 55 años' }]
const HEALTH_OPTIONS = [{ v: 'A', l: 'Diabetes tipo 2' }, { v: 'B', l: 'Hipertensión' }, { v: 'C', l: 'Sobrepeso u obesidad' }, { v: 'D', l: 'Colesterol o triglicéridos altos' }, { v: 'E', l: 'Gastritis' }, { v: 'F', l: 'Ninguna de las anteriores' }]
const DL_OPTIONS     = [{ v: 'A', l: 'Sí' }, { v: 'B', l: 'Tal vez' }, { v: 'C', l: 'No' }]
const FREQ_OPTIONS   = [{ v: 'A', l: 'Diario' }, { v: 'B', l: 'Semanal' }, { v: 'C', l: 'Ocasionalmente' }, { v: 'D', l: 'No la usaría' }]
const PAY_OPTIONS    = [{ v: 'A', l: 'Sí' }, { v: 'B', l: 'Tal vez' }, { v: 'C', l: 'No' }]

const LIKERT_QUESTIONS = [
  { key: 'q7',  text: 'La App Nutricare me llamó la atención por su diseño, facilidad de uso y propuesta de valor.' },
  { key: 'q8',  text: 'Las funcionalidades de la App Nutricare serían útiles para mejorar mis hábitos alimenticios diarios.' },
  { key: 'q9',  text: 'Considero que la App Nutricare necesita mejoras en diseño, navegación o funcionalidades.' },
  { key: 'q10', text: 'Podría encontrar barreras para usar la App Nutricare de manera frecuente.' },
  { key: 'q11', text: 'Estaría dispuesto/a a pagar por una versión premium si ofrece funciones personalizadas y beneficios adicionales.' },
  { key: 'q12', text: 'Recomendaría la App Nutricare a otras personas interesadas en mejorar sus hábitos de salud y alimentación.' },
]

const UTILITY_LABELS: Record<number, string>  = { 1: 'Nada útil', 2: 'Poco útil', 3: 'Medianamente', 4: 'Útil', 5: 'Muy útil' }
const LIKERT_LABELS: Record<number, string>   = { 1: 'Tot. desacuerdo', 2: 'En desacuerdo', 3: 'Neutral', 4: 'De acuerdo', 5: 'Tot. de acuerdo' }

const card = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px 24px', marginBottom: 12 } as const
const sectionTag = { fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)' as const, letterSpacing: 'var(--tracking-wider)', color: 'var(--color-primary)', textTransform: 'uppercase' as const, marginBottom: 12, marginTop: 8 }

function RadioGroup({ options, value, onChange }: { options: { v: string; l: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(o => {
        const sel = value === o.v
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: sel ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)', background: sel ? 'var(--color-primary-subtle, #f0fdf4)' : 'var(--color-bg)', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: sel ? '5px solid var(--color-primary)' : '2px solid var(--color-border)', flexShrink: 0, background: '#fff', transition: 'all 0.15s' }} />
            <span style={{ fontSize: 'var(--text-sm)', color: sel ? 'var(--color-text)' : 'var(--color-text-secondary)', fontWeight: sel ? 'var(--font-semibold)' : 'var(--font-normal)' }}>
              {o.l}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function CheckGroup({ options, values, onChange }: { options: { v: string; l: string }[]; values: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(o => {
        const sel = values.includes(o.v)
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: sel ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)', background: sel ? 'var(--color-primary-subtle, #f0fdf4)' : 'var(--color-bg)', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: sel ? 'none' : '2px solid var(--color-border)', background: sel ? 'var(--color-primary)' : '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
              {sel && <Check size={12} strokeWidth={3} color="#fff" />}
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: sel ? 'var(--color-text)' : 'var(--color-text-secondary)', fontWeight: sel ? 'var(--font-semibold)' : 'var(--font-normal)' }}>
              {o.l}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function SurveyPage() {
  const [name, setName]   = useState('')
  const [q1, setQ1]       = useState('')
  const [q2, setQ2]       = useState<string[]>([])
  const [q3, setQ3]       = useState(0)
  const [q4, setQ4]       = useState('')
  const [q5, setQ5]       = useState('')
  const [q6, setQ6]       = useState('')
  const [likert, setLikert] = useState<Record<string, number>>({})
  const [q13, setQ13]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]   = useState(false)
  const [error, setError] = useState('')

  function toggleQ2(val: string) {
    setQ2(prev => {
      if (val === 'F') return prev.includes('F') ? [] : ['F']
      const without = prev.filter(v => v !== 'F')
      return without.includes(val) ? without.filter(v => v !== val) : [...without, val]
    })
  }

  const allLikert = LIKERT_QUESTIONS.every(q => (likert[q.key] ?? 0) >= 1)
  const canSubmit  = name.trim() && q1 && q2.length > 0 && q3 >= 1 && q4 && q5 && q6 && allLikert

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respondentName: name.trim(), q1, q2, q3, q4, q5, q6, ...likert, q13: q13.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al enviar.'); return }
      setDone(true)
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={36} strokeWidth={2.5} color="#fff" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', marginBottom: 12 }}>¡Gracias, {name}!</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-relaxed)' }}>
          Tu respuesta fue registrada. Nos ayuda a mejorar NutriCare para más personas.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '40px 16px 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={16} strokeWidth={2} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>NutriCare</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Encuesta de percepción
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: '0 0 4px' }}>
            Por favor responda con sinceridad. La información será utilizada únicamente con fines académicos y para mejorar la solución propuesta.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>13 preguntas · menos de 5 minutos</p>
        </div>

        {/* Nombre */}
        <div style={card}>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 8, color: 'var(--color-text)' }}>
            ¿Cuál es tu nombre?
          </label>
          <input type="text" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--text-md)', fontFamily: 'var(--font-body)', outline: 'none', background: 'var(--color-bg)' }} />
        </div>

        {/* Sección 1: Datos generales */}
        <p style={sectionTag}>Sección 1 — Datos generales</p>

        <div style={card}>
          <p style={{ margin: '0 0 14px', fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', marginRight: 8 }}>1.</span>
            Edad
          </p>
          <RadioGroup options={AGE_OPTIONS} value={q1} onChange={setQ1} />
        </div>

        <div style={card}>
          <p style={{ margin: '0 0 6px', fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', marginRight: 8 }}>2.</span>
            ¿Padece alguna de las siguientes condiciones de salud?
          </p>
          <p style={{ margin: '0 0 12px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Puede seleccionar una o varias opciones.</p>
          <CheckGroup options={HEALTH_OPTIONS} values={q2} onChange={toggleQ2} />
        </div>

        {/* Sección 2: Percepción y disposición */}
        <p style={{ ...sectionTag, marginTop: 20 }}>Sección 2 — Percepción y disposición de uso</p>

        {/* Q3: Utilidad */}
        <div style={card}>
          <p style={{ margin: '0 0 6px', fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', marginRight: 8 }}>3.</span>
            En una escala de 1 a 5, ¿qué tan útil le parece la App Nutricare?
          </p>
          <p style={{ margin: '0 0 14px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>1 = Nada útil &nbsp;|&nbsp; 5 = Muy útil</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map(n => {
              const sel = q3 === n
              return (
                <button key={n} onClick={() => setQ3(n)} style={{ flex: 1, minWidth: 56, padding: '10px 4px', borderRadius: 'var(--radius-md)', border: sel ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)', background: sel ? 'var(--color-primary)' : 'var(--color-bg)', color: sel ? '#fff' : 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 'var(--text-lg)', lineHeight: 1 }}>{n}</span>
                  <span style={{ fontSize: 9, opacity: 0.85 }}>{UTILITY_LABELS[n]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Q4: Descargar */}
        <div style={card}>
          <p style={{ margin: '0 0 14px', fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', marginRight: 8 }}>4.</span>
            ¿Descargaría esta aplicación en su celular?
          </p>
          <RadioGroup options={DL_OPTIONS} value={q4} onChange={setQ4} />
        </div>

        {/* Q5: Frecuencia */}
        <div style={card}>
          <p style={{ margin: '0 0 14px', fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', marginRight: 8 }}>5.</span>
            ¿Con qué frecuencia usaría la App Nutricare?
          </p>
          <RadioGroup options={FREQ_OPTIONS} value={q5} onChange={setQ5} />
        </div>

        {/* Q6: Premium */}
        <div style={card}>
          <p style={{ margin: '0 0 14px', fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', marginRight: 8 }}>6.</span>
            ¿Estaría dispuesto/a a pagar por una versión premium?
          </p>
          <RadioGroup options={PAY_OPTIONS} value={q6} onChange={setQ6} />
        </div>

        {/* Sección 3: Likert */}
        <p style={{ ...sectionTag, marginTop: 20 }}>Sección 3 — Preguntas escala Likert</p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 12, marginTop: -8 }}>1 = Totalmente en desacuerdo &nbsp;|&nbsp; 5 = Totalmente de acuerdo</p>

        {LIKERT_QUESTIONS.map((q, i) => {
          const sel = likert[q.key] ?? 0
          return (
            <div key={q.key} style={card}>
              <p style={{ margin: '0 0 14px', fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)', lineHeight: 'var(--leading-snug)' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', marginRight: 8 }}>{i + 7}.</span>
                {q.text}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map(n => {
                  const active = sel === n
                  return (
                    <button key={n} onClick={() => setLikert(s => ({ ...s, [q.key]: n }))} style={{ flex: 1, minWidth: 52, padding: '10px 4px', borderRadius: 'var(--radius-md)', border: active ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)', background: active ? 'var(--color-primary)' : 'var(--color-bg)', color: active ? '#fff' : 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: 'var(--text-lg)', lineHeight: 1 }}>{n}</span>
                      <span style={{ fontSize: 8, opacity: 0.85, textAlign: 'center', lineHeight: 1.2 }}>{LIKERT_LABELS[n]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Sección 4: Opcional */}
        <p style={{ ...sectionTag, marginTop: 20 }}>Sección 4 — Pregunta adicional (opcional)</p>

        <div style={card}>
          <p style={{ margin: '0 0 12px', fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)', lineHeight: 'var(--leading-snug)' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', marginRight: 8 }}>13.</span>
            ¿Por qué recomendaría o no recomendaría la App Nutricare?
          </p>
          <textarea placeholder="Escribe tu respuesta aquí (opcional)..." value={q13} onChange={e => setQ13(e.target.value)} rows={3}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', background: 'var(--color-bg)', color: 'var(--color-text)', lineHeight: 'var(--leading-relaxed)' }} />
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: 16 }}>{error}</div>
        )}

        <button onClick={handleSubmit} disabled={!canSubmit || loading} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: 'none', background: canSubmit ? 'var(--color-primary)' : 'var(--color-border)', color: canSubmit ? '#fff' : 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-md)', cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}>
          {loading ? 'Enviando...' : 'Enviar respuestas'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 12 }}>
          Tus respuestas son confidenciales y solo se usan para mejorar NutriCare.
        </p>
      </div>
    </div>
  )
}
