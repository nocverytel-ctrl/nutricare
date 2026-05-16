import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Bot, User, ArrowLeft, Lock, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface Message {
  id: number
  role: 'bot' | 'user'
  text: string
  timestamp: Date
}

// ─── Knowledge base por condición y tema ──────────────────────────────────────

const BOT_RESPONSES: { patterns: string[]; response: string }[] = [
  // Diabetes
  {
    patterns: ['diabetes', 'glucosa', 'azúcar en sangre', 'insulina', 'glucemia'],
    response: `Para diabetes tipo 2 recomiendo:

**Alimentos permitidos libremente:**
• Verduras de hoja verde (espinaca, acelga, lechuga)
• Proteínas magras (pollo, pescado, huevo)
• Legumbres en porciones moderadas

**Alimentos a limitar:**
• Arroz blanco → reemplazar por arroz integral o quinoa
• Pan blanco → optar por pan integral o de centeno
• Jugos de fruta → preferir fruta entera con fibra

**Tip clave:** Divide las comidas en 5-6 porciones pequeñas para evitar picos de glucosa. El índice glucémico de cada alimento importa tanto como la cantidad de carbohidratos.

¿Quieres saber más sobre el control de glucosa con dieta?`,
  },
  // Hipertensión
  {
    patterns: ['hipertensión', 'presión alta', 'presión arterial', 'sodio', 'sal'],
    response: `Para hipertensión arterial, la dieta DASH es la más efectiva:

**Reducir drásticamente:**
• Sal de mesa → máximo 2g de sodio/día (equivale a 1 cucharadita)
• Embutidos y carnes procesadas (salchichas, jamón, tocineta)
• Sopas instantáneas y enlatados

**Aumentar en tu dieta:**
• Potasio: banano, papa, aguacate (contrarresta el sodio)
• Magnesio: almendras, espinaca, frijoles negros
• Calcio: leche descremada, yogur natural, brócoli

**Cambio concreto hoy:** Usa hierbas frescas (cilantro, albahaca, tomillo) y limón en lugar de sal. En 2-4 semanas puedes ver reducción de 5-11 mmHg.

¿Te explico cómo leer etiquetas de sodio en los productos?`,
  },
  // Obesidad / peso
  {
    patterns: ['obesidad', 'bajar de peso', 'perder peso', 'sobrepeso', 'adelgazar', 'imc'],
    response: `Para control de peso sostenible:

**Déficit calórico inteligente:**
• Meta realista: 0.5–1 kg por semana (no más)
• Déficit de 500 kcal/día es suficiente y sostenible

**Estrategias basadas en evidencia:**
• **Proteína en cada comida** → mayor saciedad, preserva músculo
• **Fibra como aliada** → verduras, frutas enteras, legumbres
• **Evitar ultraprocesados** → no la grasa ni el azúcar por separado

**Lo que SÍ funciona a largo plazo:**
Cambiar el patrón de alimentación, no hacer dietas restrictivas de corto plazo. El 90% de las dietas restrictivas generan efecto rebote.

**Tu menú NutriCare** ya está calculado según tu IMC y nivel de actividad.

¿Quieres que te explique cómo calcular tus calorías de mantenimiento?`,
  },
  // Colesterol
  {
    patterns: ['colesterol', 'triglicéridos', 'ldl', 'hdl', 'grasas', 'lípidos'],
    response: `Para colesterol alto:

**Reducir grasas saturadas y trans:**
• Carnes rojas grasas → máximo 2 veces/semana
• Mantequilla → sustituir por aceite de oliva extra virgen
• Productos de paquete con "grasas parcialmente hidrogenadas"

**Aumentar estos alimentos:**
• **Avena** → betaglucanos reducen LDL hasta 10%
• **Aguacate** → grasas monoinsaturadas elevan HDL
• **Pescado azul** (sardinas, atún, salmón) → omega-3 baja triglicéridos
• **Nueces y almendras** → 30g diarios tienen evidencia sólida

**Dato importante:** El colesterol dietario (huevos) tiene menos impacto que las grasas saturadas. 1-2 huevos/día no son problema para la mayoría.

¿Quieres un plan de 7 días específico para colesterol?`,
  },
  // Gastritis / digestión
  {
    patterns: ['gastritis', 'gastro', 'reflujo', 'digestión', 'estómago', 'colitis', 'intestino'],
    response: `Para gastritis y problemas digestivos:

**Evitar estrictamente:**
• Café en ayunas y en exceso (máximo 1 taza después de desayuno)
• Picante, ají, pimienta en grandes cantidades
• Alcohol y bebidas carbonatadas
• Comidas muy grasosas o fritas

**Alimentos protectores:**
• **Avena y arroz** → cubren y protegen la mucosa gástrica
• **Plátano maduro** → neutraliza acidez naturalmente
• **Jengibre** → antiinflamatorio digestivo (té antes de comidas)
• **Yogur natural** → probióticos para microbiota intestinal

**Hábito clave:** Come despacio, mastica bien, evita acostarte los primeros 30 min después de comer. Las porciones pequeñas y frecuentes reducen la irritación.

¿Tienes gastritis diagnosticada o es malestar general?`,
  },
  // Desayuno
  {
    patterns: ['desayuno', 'mañana', 'ayuno', 'primera comida'],
    response: `Un desayuno ideal para tus condiciones debe incluir:

**Los 3 componentes clave:**
1. **Proteína** → huevo, queso fresco, yogur → saciedad y músculo
2. **Fibra** → avena, frutas enteras, pan integral → control glucémico
3. **Grasa buena** → aguacate, nueces → energía sostenida

**Ejemplo concreto:**
• Avena en agua con banano y canela (no azúcar)
• 2 huevos revueltos con espinaca
• Tinto sin azúcar o aromática de jengibre

**Tiempo:** Desayunar dentro de las primeras 2 horas después de levantarte ayuda al metabolismo y al control glucémico.

¿Quieres más opciones de desayuno según tu presupuesto?`,
  },
  // Proteínas
  {
    patterns: ['proteína', 'músculo', 'pollo', 'carne', 'pescado', 'huevo', 'legumbres'],
    response: `Proteínas recomendadas para tu perfil:

**Fuentes animales (más completas):**
• Pechuga de pollo → 31g proteína/100g, bajo en grasa
• Atún en agua → económico, alto en omega-3
• Clara de huevo → proteína casi pura
• Res magra (solomo, lomo) → 2 veces/semana máximo

**Fuentes vegetales (excelentes para acompañar):**
• Lentejas → 18g proteína/taza cocida + hierro
• Frijoles → 15g proteína/taza + fibra
• Quinoa → proteína completa (todos los aminoácidos)

**Cuánta necesitas:** Aproximadamente 1.2–1.6g de proteína por kg de peso corporal si eres activo. Para 70kg = 84–112g/día.

¿Quieres que te arme un plan de proteínas según tu peso actual?`,
  },
  // Snacks
  {
    patterns: ['snack', 'merienda', 'entre comidas', 'matar el hambre', 'antojo'],
    response: `Snacks saludables para tu plan:

**Opciones rápidas (sin preparación):**
• Puñado de nueces o almendras (30g)
• Fruta entera con yogur natural
• Zanahoria o pepino con hummus casero
• Tostadas integrales con aguacate

**Para preparar en 5 minutos:**
• Huevo duro con sal y limón
• Batido de leche descremada + banano + avena
• Queso fresco con tomate y orégano

**Lo que debes evitar:**
Paquetes, galletas con relleno, jugos en caja → son calorías vacías que generan picos de glucosa y hambre rápido.

La clave es que el snack tenga proteína + fibra para mantenerte satisfecho 2-3 horas.`,
  },
  // Agua / hidratación
  {
    patterns: ['agua', 'hidratación', 'beber', 'líquidos', 'sed'],
    response: `Hidratación óptima para tu salud:

**Cuánto tomar:** 35 ml por kg de peso corporal. Para 70 kg = 2.45 litros/día.

**Distribuirlo así:**
• 1 vaso al despertar (antes de desayunar)
• 1 vaso 30 min antes de cada comida
• 1 vaso entre comidas
• No tomes grandes cantidades en las comidas (diluye enzimas digestivas)

**Buenas opciones además del agua:**
• Agua de panela sin azúcar (o con stevia)
• Aromáticas de jengibre, manzanilla, canela
• Agua con rodajas de pepino o limón
• Agua de coco natural (rico en potasio para hipertensión)

**Evitar:** Gaseosas, jugos en caja, bebidas energizantes, alcohol.`,
  },
  // Ejercicio
  {
    patterns: ['ejercicio', 'actividad física', 'deporte', 'caminar', 'gym'],
    response: `Actividad física para maximizar tu nutrición:

**Recomendación OMS para tu perfil:**
• 150 min/semana de actividad moderada (caminar rápido, nadar, bicicleta)
• O 75 min/semana de actividad intensa

**Relación con alimentación:**
• **Antes de ejercicio:** carbohidrato complejo 1-2h antes (arroz, avena)
• **Después de ejercicio:** proteína en los primeros 30-45 min (huevo, pollo, proteína vegetal)
• Hidratación: 500ml agua antes, 150-200ml cada 20 min durante

**Para diabéticos:** Monitorear glucosa antes y después. El ejercicio puede bajar la glucosa significativamente.

**Para hipertensión:** Ejercicio aeróbico regular puede reducir la presión 5-7 mmHg sola.

¿Qué tipo de actividad haces actualmente?`,
  },
  // Presupuesto bajo
  {
    patterns: ['económico', 'barato', 'poco dinero', 'presupuesto', 'bajo costo', 'asequible'],
    response: `Comer saludable con presupuesto limitado:

**Los alimentos más nutritivos y económicos en Colombia:**
• **Huevo** → proteína completa, más barata del mercado
• **Lentejas y frijoles** → proteína + fibra + hierro a bajo costo
• **Avena** → desayuno nutritivo por menos de $500 la porción
• **Plátano y banano** → energía + potasio, siempre asequibles
• **Repollo, zanahoria, remolacha** → verduras más económicas

**Estrategia de mercado:**
• Compra en plazas de mercado (30-40% más barato que supermercado)
• Compra en cantidad y cocina en lote (meal prep)
• Las proteínas más baratas: huevo > pollo muslo > atún en lata > carne molida

**Menú de un día nutritivo por menos de $15.000:**
Desayuno: avena + huevo
Almuerzo: arroz + lenteja + ensalada
Cena: sopa de verduras + tostada integral`,
  },
  // Saludos y genérico
  {
    patterns: ['hola', 'buenos días', 'buenas', 'hey', 'hola nutricare'],
    response: `¡Hola! Soy NutriBot, tu asistente nutricional. 🥗

Puedo ayudarte con:
• **Recomendaciones por condición:** diabetes, hipertensión, obesidad, colesterol, gastritis
• **Preguntas de alimentación:** qué comer, qué evitar, horarios
• **Nutrición específica:** proteínas, carbohidratos, grasas, hidratación
• **Opciones económicas:** comer bien con presupuesto limitado

¿Sobre qué tema te gustaría comenzar?`,
  },
  {
    patterns: ['gracias', 'muchas gracias', 'genial', 'perfecto', 'excelente'],
    response: `¡Con gusto! Recuerda que la clave está en la constancia. Los pequeños cambios diarios generan grandes resultados a largo plazo.

Si tienes más preguntas sobre nutrición o quieres profundizar en algún tema, aquí estaré.

¡Éxito en tu camino hacia una alimentación más saludable! 🌱`,
  },
]

const DEFAULT_RESPONSE = `Entiendo tu pregunta. Para darte una respuesta más precisa, te recomiendo consultar directamente con un nutricionista registrado.

Lo que sí puedo decirte es que los principios básicos de una buena alimentación son:

1. **Variedad:** Include todos los grupos alimenticios
2. **Moderación:** El exceso de cualquier alimento puede ser perjudicial
3. **Consistencia:** Los resultados vienen de hábitos sostenidos

¿Quieres preguntarme sobre alguna condición específica como diabetes, hipertensión, colesterol o problemas digestivos?`

function getBotResponse(userText: string): string {
  const normalized = userText.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  for (const entry of BOT_RESPONSES) {
    if (entry.patterns.some(p => {
      const pNorm = p.normalize('NFD').replace(/[̀-ͯ]/g, '')
      return normalized.includes(pNorm)
    })) {
      return entry.response
    }
  }
  return DEFAULT_RESPONSE
}

function renderBotText(text: string) {
  return text.split('\n').map((line, i) => {
    const boldLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    return <p key={i} style={{ margin: '2px 0' }} dangerouslySetInnerHTML={{ __html: boldLine }} />
  })
}

const QUICK_QUESTIONS = [
  '¿Qué puedo comer con diabetes?',
  'Tengo hipertensión, ¿qué evitar?',
  '¿Cómo bajo el colesterol?',
  'Snacks saludables y económicos',
  '¿Cuánta proteína necesito?',
  '¿Cuánta agua debo tomar?',
]

let msgId = 0

export default function ChatbotPage() {
  const { plan } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: ++msgId,
      role: 'bot',
      text: `¡Hola! Soy NutriBot, tu asistente nutricional con IA. Estoy aquí para ayudarte con preguntas sobre alimentación, tus condiciones de salud y cómo aprovechar mejor tu plan NutriCare.\n\n¿Sobre qué te gustaría hablar hoy?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: Message = { id: ++msgId, role: 'user', text: trimmed, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    const delay = 800 + Math.random() * 800
    setTimeout(() => {
      const botText = getBotResponse(trimmed)
      const botMsg: Message = { id: ++msgId, role: 'bot', text: botText, timestamp: new Date() }
      setMessages(prev => [...prev, botMsg])
      setTyping(false)
    }, delay)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  const isPaidPlan = plan === 'annual' || plan === 'premium'

  return (
    <section className="onboarding page-shell" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', padding: 0 }}>

      {/* Header */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        flexShrink: 0,
      }}>
        <button type="button" onClick={() => navigate('/dashboard')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center',
        }}>
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'var(--color-primary-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Bot size={20} strokeWidth={1.5} color="var(--color-primary)" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-semibold)', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
            NutriBot IA
          </h2>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} />
            En línea · Asistente nutricional
          </p>
        </div>
        {isPaidPlan && (
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'linear-gradient(135deg, #7c3aed22, #4a7c5922)',
              border: '1px solid #7c3aed44',
              color: '#7c3aed',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
            }}>
              <Sparkles size={11} strokeWidth={2} />
              IA Activa
            </span>
          </div>
        )}
      </div>

      {/* Paywall si es plan free */}
      {!isPaidPlan && (
        <div style={{
          background: 'linear-gradient(135deg, var(--sage-50), #f5f3ff)',
          border: '1px solid var(--sage-200)',
          borderRadius: 'var(--radius-lg)',
          margin: 'var(--space-4) var(--space-6)',
          padding: 'var(--space-5)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
          flexShrink: 0,
        }}>
          <Lock size={18} strokeWidth={1.5} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>
              Chatbot disponible en plan Anual o Premium
            </p>
            <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Obtén respuestas personalizadas 24/7 sobre tu alimentación y condiciones de salud.
            </p>
            <button type="button" className="button primary" style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }} onClick={() => navigate('/planes')}>
              Ver planes
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-5) var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        opacity: isPaidPlan ? 1 : 0.4,
        pointerEvents: isPaidPlan ? 'auto' : 'none',
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            gap: 'var(--space-3)',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'bot' ? 'var(--color-primary-subtle)' : 'var(--sage-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {msg.role === 'bot'
                ? <Bot size={16} strokeWidth={1.5} color="var(--color-primary)" />
                : <User size={16} strokeWidth={1.5} color="#fff" />
              }
            </div>
            <div style={{
              maxWidth: '75%',
              background: msg.role === 'bot' ? 'var(--color-surface)' : 'var(--sage-600)',
              color: msg.role === 'bot' ? 'var(--color-text)' : '#fff',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: msg.role === 'bot' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
              boxShadow: 'var(--shadow-sm)',
              border: msg.role === 'bot' ? '1px solid var(--color-border)' : 'none',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-relaxed)',
            }}>
              {renderBotText(msg.text)}
              <p style={{ margin: '6px 0 0', fontSize: 10, opacity: 0.55 }}>
                {msg.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--color-primary-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Bot size={16} strokeWidth={1.5} color="var(--color-primary)" />
            </div>
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px 12px 12px 12px',
              padding: 'var(--space-3) var(--space-4)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                  display: 'block',
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {isPaidPlan && (
        <div style={{
          padding: '0 var(--space-6) var(--space-3)',
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}>
          {QUICK_QUESTIONS.map(q => (
            <button key={q} type="button" onClick={() => sendMessage(q)} style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all var(--duration-fast)',
            }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        padding: 'var(--space-4) var(--space-6)',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        display: 'flex',
        gap: 'var(--space-3)',
        flexShrink: 0,
        opacity: isPaidPlan ? 1 : 0.5,
        pointerEvents: isPaidPlan ? 'auto' : 'none',
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu pregunta nutricional..."
          disabled={!isPaidPlan || typing}
          style={{
            flex: 1,
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-body)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            outline: 'none',
          }}
        />
        <button type="submit" disabled={!input.trim() || !isPaidPlan || typing} style={{
          width: 42, height: 42,
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: 'var(--color-primary)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
          opacity: input.trim() && !typing ? 1 : 0.5,
          flexShrink: 0,
          transition: 'opacity var(--duration-fast)',
        }}>
          <Send size={16} strokeWidth={1.5} />
        </button>
      </form>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </section>
  )
}
