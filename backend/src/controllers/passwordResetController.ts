import { Request, Response } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import pool from '../config/database'

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

async function sendResetEmail(to: string, resetUrl: string) {
  const transporter = createTransporter()

  if (!transporter) {
    // En desarrollo sin SMTP configurado, imprime el link en consola
    console.log(`[DEV] Enlace de recuperación para ${to}: ${resetUrl}`)
    return
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: 'Recupera tu contraseña - Nutricare',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:16px">
        <h2 style="color:#166534;margin-top:0">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Nutricare</strong>.</p>
        <p>Haz clic en el siguiente botón para continuar. El enlace expira en <strong>1 hora</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#16a34a;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;margin:16px 0">
          Restablecer contraseña
        </a>
        <p style="color:#6b7280;font-size:13px">Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.</p>
      </div>
    `,
  })
}

export async function requestPasswordReset(req: Request, res: Response) {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'El correo es obligatorio.' })
  }

  try {
    const userResult = await pool.query('SELECT email FROM users WHERE email = $1', [email])
    // Respuesta genérica para no revelar si el email existe
    if (userResult.rows.length === 0) {
      return res.status(200).json({ message: 'Si el correo existe, recibirás las instrucciones.' })
    }

    // Invalidar tokens anteriores del mismo usuario
    await pool.query('DELETE FROM password_reset_tokens WHERE email = $1', [email])

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await pool.query(
      'INSERT INTO password_reset_tokens (token, email, expires_at) VALUES ($1, $2, $3)',
      [token, email, expiresAt]
    )

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`
    await sendResetEmail(email, resetUrl)

    return res.status(200).json({ message: 'Si el correo existe, recibirás las instrucciones.' })
  } catch (error) {
    console.error('Error en forgot-password:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body
  if (!token || !password) {
    return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
  }

  try {
    const result = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'El enlace es inválido o ha expirado.' })
    }

    const { email } = result.rows[0]
    const passwordHash = await bcrypt.hash(password, 10)

    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email])
    await pool.query('UPDATE password_reset_tokens SET used = true WHERE token = $1', [token])

    return res.status(200).json({ message: 'Contraseña actualizada correctamente.' })
  } catch (error) {
    console.error('Error en reset-password:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}
