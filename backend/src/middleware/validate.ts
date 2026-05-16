import { Request, Response, NextFunction } from 'express'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_DIETS   = ['Omnívora', 'Vegetariana', 'Vegana', 'Sin restricción']
const VALID_SEX     = ['Femenino', 'Masculino', 'Otro']
const VALID_ACTIVITY = ['Sedentario', 'Moderado', 'Activo']
const VALID_CONDITIONS = [
  'Diabetes tipo 2', 'Hipertensión arterial', 'Obesidad y sobrepeso',
  'Colesterol y triglicéridos altos', 'Gastritis y salud digestiva',
]
const VALID_GOALS = [
  'Mejorar control de mi enfermedad', 'Perder peso', 'Tener más energía',
  'Reducir medicamentos', 'Aprender a comer mejor', 'Mantener mis resultados actuales',
]

function stripHtml(str: unknown): string {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 500)
}

function err(res: Response, msg: string) {
  return res.status(400).json({ error: msg })
}

export function validateAuth(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body ?? {}

  if (!email || typeof email !== 'string') return err(res, 'El correo es obligatorio.')
  if (!EMAIL_RE.test(email.trim())) return err(res, 'Formato de correo inválido.')
  if (email.length > 254) return err(res, 'Correo demasiado largo.')

  if (password !== undefined) {
    if (typeof password !== 'string') return err(res, 'Contraseña inválida.')
    if (password.length < 6)  return err(res, 'La contraseña debe tener al menos 6 caracteres.')
    if (password.length > 128) return err(res, 'Contraseña demasiado larga.')
  }

  req.body.email = email.trim().toLowerCase()
  next()
}

export function validateProfile(req: Request, res: Response, next: NextFunction) {
  const b = req.body ?? {}

  const name = stripHtml(b.name)
  if (!name) return err(res, 'El nombre es obligatorio.')

  const age = Number(b.age)
  if (!Number.isInteger(age) || age < 12 || age > 110) return err(res, 'Edad inválida (12–110).')

  if (!VALID_SEX.includes(b.biologicalSex)) return err(res, 'Sexo biológico inválido.')

  const weight = Number(b.weight)
  if (!isFinite(weight) || weight < 20 || weight > 400) return err(res, 'Peso inválido (20–400 kg).')

  const height = Number(b.height)
  if (!Number.isInteger(height) || height < 50 || height > 250) return err(res, 'Altura inválida (50–250 cm).')

  if (!VALID_ACTIVITY.includes(b.activityLevel)) return err(res, 'Nivel de actividad inválido.')

  if (!VALID_DIETS.includes(b.diet)) return err(res, 'Tipo de dieta inválido.')

  const conditions = b.conditions
  if (!Array.isArray(conditions)) return err(res, 'Condiciones inválidas.')
  if (conditions.some((c: unknown) => !VALID_CONDITIONS.includes(c as string) && c !== '')) {
    return err(res, 'Condición de salud no reconocida.')
  }

  const goals = b.goals
  if (!Array.isArray(goals)) return err(res, 'Objetivos inválidos.')
  if (goals.some((g: unknown) => !VALID_GOALS.includes(g as string))) {
    return err(res, 'Objetivo no reconocido.')
  }

  const mt = b.mealTimes
  if (!mt || typeof mt !== 'object') return err(res, 'Horarios de comida inválidos.')

  // Sanitize free-text fields
  req.body.name    = name
  req.body.dislikes = stripHtml(b.dislikes)
  req.body.budget   = stripHtml(b.budget)

  next()
}

export function validatePasswordReset(req: Request, res: Response, next: NextFunction) {
  const { password } = req.body ?? {}
  if (!password || typeof password !== 'string') return err(res, 'La contraseña es obligatoria.')
  if (password.length < 6)  return err(res, 'La contraseña debe tener al menos 6 caracteres.')
  if (password.length > 128) return err(res, 'Contraseña demasiado larga.')
  next()
}
