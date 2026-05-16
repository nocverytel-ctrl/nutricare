import { Request, Response } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'
import pool from '../config/database'

async function sendResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log(`[DEV] Enlace de recuperación para ${to}: ${resetUrl}`)
    return
  }

  const resend = new Resend(apiKey)
  const timeoutMs = 8_000
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Resend timeout after ${timeoutMs}ms`)), timeoutMs)
  )
  await Promise.race([
    resend.emails.send({
      from: process.env.RESEND_FROM ?? 'Nutricare <onboarding@resend.dev>',
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
    }),
    timeoutPromise,
  ])
}

export async function requestPasswordReset(req: Request, res: Response) {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'El correo es obligatorio.' })
  }

  try {
    console.log('[DEBUG-pw1] SELECT user')
    const userResult = await pool.query('SELECT email FROM users WHERE email = $1', [email])
    console.log('[DEBUG-pw2] user rows:', userResult.rows.length)
    if (userResult.rows.length === 0) {
      return res.status(200).json({ message: 'Si el correo existe, recibirás las instrucciones.' })
    }

    console.log('[DEBUG-pw3] DELETE old tokens')
    await pool.query('DELETE FROM password_reset_tokens WHERE email = $1', [email])
    console.log('[DEBUG-pw4] DELETE done')

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    console.log('[DEBUG-pw5] INSERT token')
    await pool.query(
      'INSERT INTO password_reset_tokens (token, email, expires_at) VALUES ($1, $2, $3)',
      [token, email, expiresAt]
    )
    console.log('[DEBUG-pw6] INSERT done')

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`

    console.log('[DEBUG-pw7] calling sendResetEmail')
    try {
      await sendResetEmail(email, resetUrl)
      console.log('[DEBUG-pw8] email sent ok')
    } catch (mailError) {
      console.error('[DEBUG-pw8] email error:', (mailError as Error).message)
    }

    console.log('[DEBUG-pw9] sending 200')
    return res.status(200).json({ message: 'Si el correo existe, recibirás las instrucciones.' })
  } catch (error) {
    console.error('[DEBUG-pw-ERR]', error)
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
