import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'Error al iniciar sesión')
        return
      }

      login(data.token, email)
      navigate('/dashboard')
    } catch (err) {
      setError('No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="onboarding page-shell">
      <div className="onboarding-header">
        <div>
          <span className="tag">Acceso</span>
          <h1>Inicia sesión en Nutricare</h1>
          <p>Usa tu correo y contraseña para continuar con el onboarding.</p>
        </div>
      </div>

      <form className="onboarding-form" onSubmit={handleSubmit}>
        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <div style={{ textAlign: 'right', marginTop: '-8px' }}>
          <Link className="forgot-link" to="/forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {error && <div className="toast" role="alert">{error}</div>}

        <div className="actions">
          <button type="submit" className="button primary" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
          <Link className="button secondary" to="/register">
            Crear cuenta
          </Link>
        </div>
      </form>
    </section>
  )
}

export default LoginPage
