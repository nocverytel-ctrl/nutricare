import { Request, Response } from 'express'
import pool from '../config/database'

const LIKERT_KEYS = ['q7', 'q8', 'q9', 'q10', 'q11', 'q12'] as const

export async function submitSurvey(req: Request, res: Response) {
  const { respondentName, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13 } = req.body

  if (!respondentName?.trim())               return res.status(400).json({ error: 'El nombre es obligatorio.' })
  if (!q1 || !q4 || !q5 || !q6)             return res.status(400).json({ error: 'Completa todas las preguntas de selección.' })
  if (!Array.isArray(q2) || q2.length === 0) return res.status(400).json({ error: 'Selecciona al menos una condición de salud.' })

  const q3n = Number(q3)
  if (!Number.isInteger(q3n) || q3n < 1 || q3n > 5)
    return res.status(400).json({ error: 'Responde la pregunta de utilidad (1–5).' })

  for (const key of LIKERT_KEYS) {
    const n = Number(req.body[key])
    if (!Number.isInteger(n) || n < 1 || n > 5)
      return res.status(400).json({ error: 'Completa todas las preguntas de escala Likert (1–5).' })
  }

  try {
    await pool.query(
      `INSERT INTO survey_responses (respondent_name, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        respondentName.trim(),
        q1, (q2 as string[]).join(','), q3n,
        q4, q5, q6,
        Number(q7), Number(q8), Number(q9), Number(q10), Number(q11), Number(q12),
        q13?.trim() || null,
      ]
    )
    return res.status(201).json({ message: '¡Gracias por tu respuesta!' })
  } catch (error) {
    console.error('Error guardando encuesta:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

export async function getSurveyResults(_req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT id, respondent_name, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, created_at
       FROM survey_responses ORDER BY created_at ASC`
    )
    return res.status(200).json({ responses: result.rows, total: result.rows.length })
  } catch (error) {
    console.error('Error obteniendo resultados de encuesta:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}
