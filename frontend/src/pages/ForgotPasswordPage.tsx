import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'Error al procesar la solicitud.')
        return
      }

      setMessage(data.message)
      setSent(true)
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="onboarding page-shell">
      <div className="onboarding-header">
        <div>
          <span className="tag">Recuperar acceso</span>
          <h1>¿Olvidaste tu contraseña?</h1>
          <p>Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
        </div>
      </div>

      {sent ? (
        <div className="summary-card">
          <h2>Revisa tu correo</h2>
          <p>{message}</p>
          <p style={{ fontSize: '14px', color: '#52726a', marginTop: '8px' }}>
            Si no ves el correo, revisa tu carpeta de spam. El enlace expira en 1 hora.
          </p>
          <div className="actions" style={{ marginTop: '20px' }}>
            <Link className="button primary" to="/login">Volver al inicio de sesión</Link>
          </div>
        </div>
      ) : (
        <form className="onboarding-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </label>

          {error && <div className="toast" role="alert">{error}</div>}

          <div className="actions">
            <Link className="button secondary" to="/login">Cancelar</Link>
            <button type="submit" className="button primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default ForgotPasswordPage
