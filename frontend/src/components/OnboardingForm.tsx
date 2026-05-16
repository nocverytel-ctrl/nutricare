import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type ConditionType =
  | 'Diabetes tipo 2'
  | 'Hipertensión arterial'
  | 'Obesidad y sobrepeso'
  | 'Colesterol y triglicéridos altos'
  | 'Gastritis y salud digestiva'

type DietType = 'Omnívora' | 'Vegetariana' | 'Vegana' | 'Sin restricción'

type GoalType =
  | 'Mejorar control de mi enfermedad'
  | 'Perder peso'
  | 'Tener más energía'
  | 'Reducir medicamentos'
  | 'Aprender a comer mejor'
  | 'Mantener mis resultados actuales'

interface FormData {
  name: string
  age: string
  biologicalSex: string
  weight: string
  height: string
  activityLevel: string
  conditions: ConditionType[]
  diet: DietType
  dislikes: string
  budget: string
  goals: GoalType[]
  reminders: boolean
  mealTimes: { breakfast: string; lunch: string; dinner: string; snacks: string }
  dailyTips: boolean
}

const conditionOptions: ConditionType[] = [
  'Diabetes tipo 2',
  'Hipertensión arterial',
  'Obesidad y sobrepeso',
  'Colesterol y triglicéridos altos',
  'Gastritis y salud digestiva',
]

const dietOptions: DietType[] = ['Omnívora', 'Vegetariana', 'Vegana', 'Sin restricción']

const goalOptions: GoalType[] = [
  'Mejorar control de mi enfermedad',
  'Perder peso',
  'Tener más energía',
  'Reducir medicamentos',
  'Aprender a comer mejor',
  'Mantener mis resultados actuales',
]

const steps = ['Datos básicos', 'Condiciones', 'Preferencias', 'Objetivos', 'Recordatorios', 'Resumen']

const initialState: FormData = {
  name: '', age: '', biologicalSex: '', weight: '', height: '', activityLevel: '',
  conditions: [], diet: 'Omnívora', dislikes: '', budget: '', goals: [],
  reminders: true,
  mealTimes: { breakfast: '08:00', lunch: '12:30', dinner: '19:00', snacks: '16:00' },
  dailyTips: true,
}

function OnboardingForm() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialState)
  const [profileLocked, setProfileLocked] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { token } = useAuth()

  // Load existing profile → pre-fill + lock immutable fields
  useEffect(() => {
    if (!token) return
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
    fetch(`${apiUrl}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.profile) return
        const p = data.profile
        setProfileLocked(true)
        setFormData({
          name:           p.name        ?? '',
          age:            String(p.age  ?? ''),
          biologicalSex:  p.biologicalSex ?? '',
          weight:         String(p.weight ?? ''),
          height:         String(p.height ?? ''),
          activityLevel:  p.activityLevel ?? '',
          conditions:     p.conditions  ?? [],
          diet:           (p.diet as DietType) ?? 'Omnívora',
          dislikes:       p.dislikes    ?? '',
          budget:         p.budget      ?? '',
          goals:          p.goals       ?? [],
          reminders:      p.reminders   ?? true,
          mealTimes:      p.mealTimes   ?? initialState.mealTimes,
          dailyTips:      p.dailyTips   ?? true,
        })
      })
      .catch(() => {})
  }, [token])

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const updateField = (field: keyof FormData, value: string | boolean) =>
    setFormData(c => ({ ...c, [field]: value }))

  const toggleOption = <T extends string>(key: keyof FormData, value: T) =>
    setFormData(c => {
      const list = c[key] as T[]
      const next = list.includes(value) ? list.filter(i => i !== value) : [...list, value]
      return { ...c, [key]: next } as FormData
    })

  const handleMealTime = (field: keyof FormData['mealTimes'], value: string) =>
    setFormData(c => ({ ...c, mealTimes: { ...c.mealTimes, [field]: value } }))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    if (!token) { setErrorMessage('Debes iniciar sesión para guardar tu perfil.'); return }
    setSaving(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.error || 'Error al guardar el perfil.')
      }
      setSubmitted(true)
      navigate('/dashboard')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error inesperado al guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="onboarding">
      <div className="onboarding-header">
        <div>
          <span className="tag">NutriCare</span>
          <h1>{profileLocked ? 'Actualizar perfil nutricional' : 'Comencemos tu perfil nutricional'}</h1>
          <p>
            {profileLocked
              ? 'Nombre, edad y estatura no son modificables. Puedes actualizar el resto.'
              : 'Completa estos pasos para obtener recomendaciones personalizadas.'}
          </p>
        </div>
      </div>

      {/* Visual step progress bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 'var(--space-6)', overflowX: 'auto', paddingBottom: 4 }}>
        {steps.map((stepLabel, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 52 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: i < step ? 'var(--color-primary)' : i === step ? 'var(--color-surface)' : 'var(--color-bg)',
                border: i <= step ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: i < step ? '#fff' : i === step ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontSize: 12, fontWeight: 700, transition: 'all 0.25s',
              }}>
                {i < step ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span style={{
                fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase',
                color: i === step ? 'var(--color-primary)' : i < step ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                fontWeight: i === step ? 700 : 400,
                whiteSpace: 'nowrap', textAlign: 'center',
              }}>
                {stepLabel}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginTop: 15,
                background: i < step ? 'var(--color-primary)' : 'var(--color-border)',
                transition: 'background 0.25s',
              }} />
            )}
          </div>
        ))}
      </div>

      <form className="onboarding-form" onSubmit={handleSubmit}>

        {/* ── Step 0: Datos básicos ── */}
        {step === 0 && (
          <div className="form-grid">

            {/* Nombre — bloqueado si ya existe perfil */}
            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                Nombre completo
                {profileLocked && <Lock size={12} strokeWidth={1.5} color="var(--color-text-muted)" />}
              </span>
              <input
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                required
                readOnly={profileLocked}
                style={profileLocked ? { background: 'var(--neutral-100)', color: 'var(--color-text-muted)', cursor: 'not-allowed' } : {}}
              />
            </label>

            {/* Edad — bloqueada */}
            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                Edad
                {profileLocked && <Lock size={12} strokeWidth={1.5} color="var(--color-text-muted)" />}
              </span>
              <input
                type="number"
                min="12"
                value={formData.age}
                onChange={e => updateField('age', e.target.value)}
                required
                readOnly={profileLocked}
                style={profileLocked ? { background: 'var(--neutral-100)', color: 'var(--color-text-muted)', cursor: 'not-allowed' } : {}}
              />
            </label>

            <label>
              Sexo biológico
              <select
                value={formData.biologicalSex}
                onChange={e => updateField('biologicalSex', e.target.value)}
                required
              >
                <option value="">Seleccione</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="Otro">Otro</option>
              </select>
            </label>

            <label>
              Peso actual (kg)
              <input
                type="number"
                min="30"
                value={formData.weight}
                onChange={e => updateField('weight', e.target.value)}
                required
              />
            </label>

            {/* Altura — bloqueada */}
            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                Altura (cm)
                {profileLocked && <Lock size={12} strokeWidth={1.5} color="var(--color-text-muted)" />}
              </span>
              <input
                type="number"
                min="100"
                value={formData.height}
                onChange={e => updateField('height', e.target.value)}
                required
                readOnly={profileLocked}
                style={profileLocked ? { background: 'var(--neutral-100)', color: 'var(--color-text-muted)', cursor: 'not-allowed' } : {}}
              />
            </label>

            <label>
              Nivel de actividad
              <select
                value={formData.activityLevel}
                onChange={e => updateField('activityLevel', e.target.value)}
                required
              >
                <option value="">Seleccione</option>
                <option value="Sedentario">Sedentario</option>
                <option value="Moderado">Moderado</option>
                <option value="Activo">Activo</option>
              </select>
            </label>
          </div>
        )}

        {/* ── Step 1: Condiciones ── */}
        {step === 1 && (
          <div className="form-grid">
            <p className="section-text">Selecciona todas las condiciones de salud que apliquen.</p>
            <div className="option-grid">
              {conditionOptions.map(condition => (
                <button
                  type="button"
                  key={condition}
                  className={formData.conditions.includes(condition) ? 'option active' : 'option'}
                  onClick={() => toggleOption('conditions', condition)}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Preferencias ── */}
        {step === 2 && (
          <div className="form-grid">
            <label>
              Tipo de dieta
              <select
                value={formData.diet}
                onChange={e => updateField('diet', e.target.value as DietType)}
              >
                {dietOptions.map(diet => <option key={diet} value={diet}>{diet}</option>)}
              </select>
            </label>
            <label>
              Alimentos que no consumes o no te gustan
              <input
                placeholder="Ej: lácteos, cilantro, legumbres"
                value={formData.dislikes}
                onChange={e => updateField('dislikes', e.target.value)}
              />
            </label>
            <label>
              Presupuesto mensual para alimentación (COP)
              <input
                type="text"
                placeholder="Ej: 220000"
                value={formData.budget}
                onChange={e => updateField('budget', e.target.value)}
              />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-normal)', textTransform: 'none', letterSpacing: 0 }}>
                Ingresa solo el número en pesos colombianos. Ej: 220000 para $220.000 COP/mes
              </span>
            </label>
          </div>
        )}

        {/* ── Step 3: Objetivos ── */}
        {step === 3 && (
          <div className="form-grid">
            <p className="section-text">Elige hasta 3 objetivos principales.</p>
            <div className="option-grid">
              {goalOptions.map(goal => (
                <button
                  type="button"
                  key={goal}
                  className={formData.goals.includes(goal) ? 'option active' : 'option'}
                  onClick={() => toggleOption('goals', goal)}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Recordatorios ── */}
        {step === 4 && (
          <div className="form-grid">
            <div className="toggle-row">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.reminders}
                  onChange={e => updateField('reminders', e.target.checked)}
                />
                Activar recordatorios de comidas
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.dailyTips}
                  onChange={e => updateField('dailyTips', e.target.checked)}
                />
                Recibir consejos diarios
              </label>
            </div>
            <div className="meal-times">
              <h3>Horarios sugeridos</h3>
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map(meal => (
                <label key={meal}>
                  {meal === 'breakfast' ? 'Desayuno' : meal === 'lunch' ? 'Almuerzo' : meal === 'dinner' ? 'Cena' : 'Meriendas'}
                  <input
                    type="time"
                    value={formData.mealTimes[meal]}
                    onChange={e => handleMealTime(meal, e.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 5: Resumen ── */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Avatar + nombre */}
            <div className="summary-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--color-primary)', color: '#fff',
                margin: '0 auto var(--space-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontFamily: 'var(--font-heading)', fontWeight: 700,
              }}>
                {(formData.name.charAt(0) || '?').toUpperCase()}
              </div>
              <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
                {formData.name || 'Sin nombre'}
              </h2>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                {[formData.biologicalSex, formData.age && `${formData.age} años`, formData.activityLevel].filter(Boolean).join(' · ')}
              </p>
            </div>

            {/* Métricas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
              {[
                { label: 'Peso',      value: formData.weight ? `${formData.weight} kg` : '—' },
                { label: 'Altura',    value: formData.height ? `${formData.height} cm` : '—' },
                { label: 'IMC',       value: formData.weight && formData.height ? (Number(formData.weight) / ((Number(formData.height) / 100) ** 2)).toFixed(1) : '—' },
                { label: 'Presupuesto', value: formData.budget ? `$${Number(formData.budget.replace(/\D/g, '')).toLocaleString('es-CO')}` : 'No espec.' },
              ].map(m => (
                <div key={m.label} className="summary-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>{m.label}</p>
                  <p style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Condiciones */}
            <div className="summary-card" style={{ padding: 'var(--space-4)' }}>
              <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Condiciones de salud</p>
              {formData.conditions.length === 0 ? (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Ninguna seleccionada</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {formData.conditions.map(c => (
                    <span key={c} style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', border: '1px solid var(--sage-200)' }}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Objetivos */}
            {formData.goals.length > 0 && (
              <div className="summary-card" style={{ padding: 'var(--space-4)' }}>
                <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Objetivos</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {formData.goals.map(g => (
                    <span key={g} style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dieta + recordatorios */}
            <div className="summary-card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Tipo de dieta</p>
                  <p style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>{formData.diet}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Recordatorios</p>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    background: formData.reminders ? 'var(--color-success-subtle)' : 'var(--color-bg)',
                    color: formData.reminders ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    border: formData.reminders ? '1px solid var(--sage-200)' : '1px solid var(--color-border)',
                    fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
                  }}>
                    {formData.reminders ? 'Activados' : 'Desactivados'}
                  </span>
                </div>
              </div>
              {formData.dislikes && (
                <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>No consume</p>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{formData.dislikes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="actions">
          {step > 0 && (
            <button type="button" className="button secondary" onClick={prevStep}>
              Volver
            </button>
          )}
          {step < steps.length - 1 ? (
            <button type="button" className="button primary" onClick={nextStep}>
              Siguiente
            </button>
          ) : (
            <button type="submit" className="button primary" disabled={saving}>
              {saving ? 'Guardando...' : profileLocked ? 'Guardar cambios' : 'Finalizar onboarding'}
            </button>
          )}
        </div>
      </form>

      {errorMessage && <div className="toast">{errorMessage}</div>}
      {submitted && <div className="toast success">Perfil guardado correctamente.</div>}
    </section>
  )
}

export default OnboardingForm
