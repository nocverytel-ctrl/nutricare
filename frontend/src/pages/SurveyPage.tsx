import { useState } from 'react'
import { Heart, Check } from 'lucide-react'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

const SCALE_QUESTIONS = [
  { key: 'q1', text: '¿Qué tan importante es para ti cuidar tu alimentación según tu condición de salud?' },
  { key: 'q2', text: '¿Qué tan claro fue entender qué ofrece NutriCare?' },
  { key: 'q3', text: '¿Qué tan útil te parece recibir un menú diario personalizado?' },
  { key: 'q4', text: '¿Qué tan probable es que uses una app como esta en tu día a día?' },
  { key: 'q5', text: '¿Qué tan dispuesto estarías a pagar por este servicio?' },
  { key: 'q6', text: '¿Qué tan probable es que recomiendes NutriCare a un familiar o amigo?' },
  { key: 'q7', text: '¿Qué tan atractiva te parece la opción de empezar completamente gratis?' },
]

const OPEN_QUESTIONS = [
  { key: 'q8', text: '¿Cuál es el principal problema de salud o alimentación que resolverías con NutriCare?' },
  { key: 'q9', text: '¿Qué funcionalidad te pareció más valiosa de las que viste?' },
  { key: 'q10', text: '¿Qué cambiarías, agregarías o mejorarías?' },
]

const LABELS: Record<number, string> = { 1: 'Nada', 2: 'Poco', 3: 'Regular', 4: 'Bastante', 5: 'Mucho' }

type Scores = Record<string, number>
type Texts  = Record<string, string>

export default function SurveyPage() {
  const [name, setName] = useState('')
  const [scores, setScores] = useState<Scores>({})
  const [texts, setTexts]   = useState<Texts>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  const allScale = SCALE_QUESTIONS.every(q => scores[q.key] >= 1)
  const allOpen  = OPEN_QUESTIONS.every(q => (texts[q.key] ?? '').trim().length > 0)
  const canSubmit = name.trim() && allScale && allOpen

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respondentName: name.trim(), ...scores, ...texts }),
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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={16} strokeWidth={2} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>NutriCare</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Encuesta de validación
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-md)', margin: 0 }}>
            10 preguntas · menos de 5 minutos
          </p>
        </div>

        {/* Nombre */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '24px', marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 8, color: 'var(--color-text)' }}>
            ¿Cuál es tu nombre?
          </label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              fontSize: 'var(--text-md)', fontFamily: 'var(--font-body)',
              outline: 'none', background: 'var(--color-bg)',
            }}
          />
        </div>

        {/* Preguntas de escala */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 12 }}>
            Preguntas de escala — Sección 1 de 2
          </p>
          {SCALE_QUESTIONS.map((q, i) => (
            <div key={q.key} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px 24px', marginBottom: 12 }}>
              <p style={{ margin: '0 0 16px', fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)', lineHeight: 'var(--leading-snug)' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', marginRight: 8 }}>{i + 1}.</span>
                {q.text}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map(n => {
                  const selected = scores[q.key] === n
                  return (
                    <button
                      key={n}
                      onClick={() => setScores(s => ({ ...s, [q.key]: n }))}
                      style={{
                        flex: 1, minWidth: 52,
                        padding: '10px 4px',
                        borderRadius: 'var(--radius-md)',
                        border: selected ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                        background: selected ? 'var(--color-primary)' : 'var(--color-bg)',
                        color: selected ? '#fff' : 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 'var(--font-semibold)',
                        fontSize: 'var(--text-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                      }}
                    >
                      <span style={{ fontSize: 'var(--text-lg)', lineHeight: 1 }}>{n}</span>
                      <span style={{ fontSize: 10, opacity: 0.8 }}>{LABELS[n]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Preguntas abiertas */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 12 }}>
            Preguntas abiertas — Sección 2 de 2
          </p>
          {OPEN_QUESTIONS.map((q, i) => (
            <div key={q.key} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px 24px', marginBottom: 12 }}>
              <p style={{ margin: '0 0 12px', fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)', lineHeight: 'var(--leading-snug)' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', marginRight: 8 }}>{SCALE_QUESTIONS.length + i + 1}.</span>
                {q.text}
              </p>
              <textarea
                placeholder="Escribe tu respuesta aquí..."
                value={texts[q.key] ?? ''}
                onChange={e => setTexts(t => ({ ...t, [q.key]: e.target.value }))}
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
                  outline: 'none', resize: 'vertical',
                  background: 'var(--color-bg)', color: 'var(--color-text)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
              />
            </div>
          ))}
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: 16 }}>{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: canSubmit ? 'var(--color-primary)' : 'var(--color-border)',
            color: canSubmit ? '#fff' : 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--font-semibold)',
            fontSize: 'var(--text-md)',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Enviando...' : 'Enviar respuestas'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 12 }}>
          Tus respuestas son confidenciales y solo se usan para mejorar NutriCare.
        </p>
      </div>
    </div>
  )
}
