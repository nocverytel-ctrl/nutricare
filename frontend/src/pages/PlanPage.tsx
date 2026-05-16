import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, Crown, Zap, Leaf, ArrowLeft, CreditCard, Lock, CheckCircle2 } from 'lucide-react'
import { useAuth, type SubscriptionPlan } from '../context/AuthContext'

type PlanKey = 'free' | 'annual' | 'premium'

interface PlanDef {
  key: PlanKey
  name: string
  price: string
  period: string
  description: string
  color: string
  badge?: string
  features: { text: string; included: boolean }[]
}

const PLANS: PlanDef[] = [
  {
    key: 'free',
    name: 'Básico',
    price: '$0',
    period: 'Siempre gratis',
    description: 'Ideal para comenzar tu camino hacia una alimentación saludable.',
    color: 'var(--neutral-400)',
    features: [
      { text: 'Menú diario personalizado', included: true },
      { text: 'Historial 7 días', included: true },
      { text: 'Videos y tiendas cercanas', included: true },
      { text: 'Recetas básicas', included: true },
      { text: 'Lista de compras', included: false },
      { text: 'Gráficas de progreso', included: false },
      { text: 'Chatbot nutricional IA', included: false },
      { text: 'Planeador semanal', included: false },
      { text: 'Asesor nutricional humano', included: false },
      { text: 'Soporte prioritario', included: false },
    ],
  },
  {
    key: 'annual',
    name: 'Anual',
    price: '$199.000',
    period: 'COP / año · equivale a $16.583/mes',
    description: 'El plan más popular. Acceso completo al 90% de funciones.',
    color: 'var(--sage-500)',
    badge: 'Más popular',
    features: [
      { text: 'Menú diario personalizado', included: true },
      { text: 'Historial 30 días', included: true },
      { text: 'Videos y tiendas cercanas', included: true },
      { text: 'Recetas completas + favoritos', included: true },
      { text: 'Lista de compras inteligente', included: true },
      { text: 'Gráficas de progreso', included: true },
      { text: 'Chatbot nutricional IA', included: true },
      { text: 'Planeador semanal', included: true },
      { text: 'Asesor nutricional humano', included: false },
      { text: 'Soporte prioritario', included: false },
    ],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: '$29.900',
    period: 'COP / mes',
    description: 'Máxima personalización con acompañamiento humano.',
    color: '#7c3aed',
    features: [
      { text: 'Menú diario personalizado', included: true },
      { text: 'Historial ilimitado', included: true },
      { text: 'Videos y tiendas cercanas', included: true },
      { text: 'Recetas completas + favoritos', included: true },
      { text: 'Lista de compras inteligente', included: true },
      { text: 'Gráficas de progreso avanzadas', included: true },
      { text: 'Chatbot nutricional IA', included: true },
      { text: 'Planeador semanal', included: true },
      { text: 'Asesor nutricional humano', included: true },
      { text: 'Soporte prioritario', included: true },
    ],
  },
]

const PLAN_ICONS: Record<PlanKey, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  free: Leaf,
  annual: Zap,
  premium: Crown,
}

type ModalState = { plan: PlanDef; step: 'confirm' | 'processing' | 'success' } | null

export default function PlanPage() {
  const { plan: currentPlan, setPlan } = useAuth()
  const navigate = useNavigate()
  const [modal, setModal] = useState<ModalState>(null)

  function handleSelect(planDef: PlanDef) {
    if (planDef.key === currentPlan) return
    if (planDef.key === 'free') {
      setPlan('free')
      return
    }
    setModal({ plan: planDef, step: 'confirm' })
  }

  function handleConfirmPayment() {
    if (!modal) return
    setModal({ plan: modal.plan, step: 'processing' })
    setTimeout(() => {
      setModal({ plan: modal.plan, step: 'success' })
      setPlan(modal.plan.key as SubscriptionPlan)
    }, 2000)
  }

  function handleCloseModal() {
    setModal(null)
  }

  function handleGoBack() {
    navigate('/dashboard')
  }

  const getPlanLabel = (key: PlanKey) => PLANS.find(p => p.key === key)?.name ?? key

  return (
    <>
      <section className="onboarding page-shell">

        <div className="onboarding-header">
          <div>
            <span className="tag">Suscripción</span>
            <h1>Elige tu plan NutriCare</h1>
            <p>Invierte en tu salud. Cancela cuando quieras.</p>
          </div>
          <button type="button" className="button secondary" onClick={handleGoBack}>
            <ArrowLeft size={14} strokeWidth={1.5} style={{ marginRight: 6 }} />
            Volver
          </button>
        </div>

        {currentPlan !== 'free' && (
          <div style={{
            background: 'var(--color-success-subtle)',
            border: '1px solid var(--sage-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-5)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}>
            <CheckCircle2 size={18} color="var(--color-primary)" strokeWidth={1.5} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              Plan activo: <strong style={{ color: 'var(--color-text)' }}>{getPlanLabel(currentPlan)}</strong>
            </span>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-5)',
          marginBottom: 'var(--space-8)',
        }}>
          {PLANS.map((planDef) => {
            const Icon = PLAN_ICONS[planDef.key]
            const isActive = planDef.key === currentPlan
            return (
              <article
                key={planDef.key}
                style={{
                  background: 'var(--color-surface)',
                  border: isActive
                    ? `2px solid ${planDef.color}`
                    : planDef.key === 'annual'
                    ? `2px solid var(--sage-300)`
                    : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-6)',
                  position: 'relative',
                  boxShadow: isActive ? `0 0 0 4px ${planDef.color}22` : 'var(--shadow-md)',
                  transition: 'box-shadow var(--duration-base) var(--ease-out)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {planDef.badge && (
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: planDef.color,
                    color: '#fff',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-semibold)',
                    letterSpacing: 'var(--tracking-wide)',
                    padding: '4px 14px',
                    borderRadius: 'var(--radius-full)',
                    whiteSpace: 'nowrap',
                  }}>
                    {planDef.badge}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-lg)',
                    background: `${planDef.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={20} strokeWidth={1.5} color={planDef.color} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
                      {planDef.name}
                    </h3>
                    {isActive && (
                      <span style={{ fontSize: 'var(--text-xs)', color: planDef.color, fontWeight: 'var(--font-medium)' }}>
                        Plan activo
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)' }}>
                    <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: planDef.color, fontFamily: 'var(--font-heading)' }}>
                      {planDef.price}
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {planDef.period}
                  </p>
                </div>

                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-5)' }}>
                  {planDef.description}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-6)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {planDef.features.map((f) => (
                    <li key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: f.included ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                      {f.included
                        ? <Check size={14} strokeWidth={2} color={planDef.color} style={{ flexShrink: 0 }} />
                        : <X size={14} strokeWidth={2} color="var(--neutral-300)" style={{ flexShrink: 0 }} />
                      }
                      {f.text}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSelect(planDef)}
                  disabled={isActive}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: isActive ? 'none' : `1.5px solid ${planDef.color}`,
                    background: isActive ? planDef.color : planDef.key === 'annual' ? planDef.color : 'transparent',
                    color: isActive || planDef.key === 'annual' ? '#fff' : planDef.color,
                    fontWeight: 'var(--font-semibold)',
                    fontSize: 'var(--text-sm)',
                    cursor: isActive ? 'default' : 'pointer',
                    opacity: isActive ? 0.7 : 1,
                    transition: 'all var(--duration-base) var(--ease-out)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {isActive ? 'Plan actual' : planDef.key === 'free' ? 'Continuar gratis' : `Suscribirse · ${planDef.price}`}
                </button>
              </article>
            )
          })}
        </div>

        <div className="summary-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Lock size={16} strokeWidth={1.5} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Pago seguro procesado por <strong>PSE / Wompi</strong> · Cancela en cualquier momento · Sin cargos ocultos · Datos protegidos bajo Ley 1581
          </p>
        </div>

      </section>

      {/* ── Modal de pago simulado ── */}
      {modal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(26,26,24,0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 'var(--z-modal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-5)',
          }}
          onClick={modal.step !== 'processing' ? handleCloseModal : undefined}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              maxWidth: 420,
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {modal.step === 'confirm' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-xl)',
                    background: `${PLANS.find(p => p.key === modal.plan.key)?.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-4)',
                  }}>
                    <CreditCard size={26} strokeWidth={1.5} color={PLANS.find(p => p.key === modal.plan.key)?.color} />
                  </div>
                  <h2 style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
                    Confirmar suscripción
                  </h2>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    Plan <strong>{modal.plan.name}</strong> · {modal.plan.price} {modal.plan.key === 'annual' ? 'COP/año' : 'COP/mes'}
                  </p>
                </div>

                <div style={{
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-6)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                      <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-medium)', letterSpacing: 'var(--tracking-wide)' }}>MÉTODO DE PAGO</label>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {['PSE', 'Nequi', 'Daviplata', 'Tarjeta'].map(m => (
                          <button key={m} type="button" style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: m === 'PSE' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                            background: m === 'PSE' ? 'var(--color-primary-subtle)' : 'transparent',
                            color: m === 'PSE' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-medium)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-body)',
                          }}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                      <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-medium)', letterSpacing: 'var(--tracking-wide)' }}>CORREO ELECTRÓNICO</label>
                      <div style={{
                        padding: 'var(--space-3)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                        background: 'var(--color-surface)',
                      }}>
                        usuario@email.com
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button type="button" className="button secondary" style={{ flex: 1 }} onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="button" className="button primary" style={{ flex: 2 }} onClick={handleConfirmPayment}>
                    Confirmar pago
                  </button>
                </div>
              </>
            )}

            {modal.step === 'processing' && (
              <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
                <div style={{
                  width: 56, height: 56,
                  borderRadius: '50%',
                  border: '3px solid var(--color-primary-muted)',
                  borderTopColor: 'var(--color-primary)',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto var(--space-5)',
                }} />
                <h3 style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)' }}>
                  Procesando pago...
                </h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Conectando con la pasarela de pago
                </p>
              </div>
            )}

            {modal.step === 'success' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64,
                  borderRadius: '50%',
                  background: 'var(--color-success-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-5)',
                }}>
                  <CheckCircle2 size={32} strokeWidth={1.5} color="var(--color-primary)" />
                </div>
                <h2 style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
                  ¡Suscripción activada!
                </h2>
                <p style={{ margin: '0 0 var(--space-6)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Bienvenido al plan <strong>{modal.plan.name}</strong>. Ya tienes acceso a todas las funciones.
                </p>
                <button type="button" className="button primary" style={{ width: '100%' }} onClick={() => { handleCloseModal(); navigate('/dashboard') }}>
                  Ir al dashboard
                </button>
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
