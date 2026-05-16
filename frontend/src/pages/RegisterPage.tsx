import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

function RegisterPage() {
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
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'Error al crear la cuenta')
        return
      }

      const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const loginData = await loginResponse.json()
      if (!loginResponse.ok) {
        setError(loginData.error ?? 'Registro exitoso, pero no se pudo iniciar sesión automáticamente')
        return
      }

      login(loginData.token, email)
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
          <span className="tag">Registro</span>
          <h1>Crea tu cuenta en Nutricare</h1>
          <p>Regístrate para guardar tu perfil nutricional y continuar con el onboarding.</p>
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
            minLength={6}
          />
        </label>
        {error && <div className="toast" role="alert">{error}</div>}

        <div className="actions">
          <button type="submit" className="button primary" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
          <Link className="button secondary" to="/login">
            Ya tengo cuenta
          </Link>
        </div>
      </form>
    </section>
  )
}

export default RegisterPage
