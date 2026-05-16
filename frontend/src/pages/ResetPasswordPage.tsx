import { FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'No se pudo restablecer la contraseña.')
        return
      }

      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <section className="onboarding page-shell">
        <div className="onboarding-header">
          <div>
            <span className="tag">Error</span>
            <h1>Enlace inválido</h1>
            <p>Este enlace de recuperación no es válido o ha expirado.</p>
          </div>
        </div>
        <div className="actions">
          <Link className="button primary" to="/forgot-password">Solicitar nuevo enlace</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="onboarding page-shell">
      <div className="onboarding-header">
        <div>
          <span className="tag">Nueva contraseña</span>
          <h1>Restablece tu contraseña</h1>
          <p>Elige una nueva contraseña segura para tu cuenta.</p>
        </div>
      </div>

      {success ? (
        <div className="summary-card">
          <h2>¡Contraseña actualizada!</h2>
          <p>Tu contraseña se cambió correctamente. Serás redirigido al inicio de sesión en unos segundos.</p>
          <div className="actions" style={{ marginTop: '20px' }}>
            <Link className="button primary" to="/login">Ir al inicio de sesión</Link>
          </div>
        </div>
      ) : (
        <form className="onboarding-form" onSubmit={handleSubmit}>
          <label>
            Nueva contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </label>
          <label>
            Confirmar contraseña
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </label>

          {error && <div className="toast" role="alert">{error}</div>}

          <div className="actions">
            <Link className="button secondary" to="/login">Cancelar</Link>
            <button type="submit" className="button primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Restablecer contraseña'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default ResetPasswordPage
