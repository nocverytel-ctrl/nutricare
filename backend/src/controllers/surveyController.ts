import { Request, Response } from 'express'
import pool from '../config/database'

const SCALE_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const

export async function submitSurvey(req: Request, res: Response) {
  const { respondentName, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 } = req.body

  if (!respondentName?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio.' })
  if (!q8?.trim() || !q9?.trim() || !q10?.trim()) return res.status(400).json({ error: 'Todas las preguntas abiertas son obligatorias.' })

  for (const key of SCALE_KEYS) {
    const n = Number(req.body[key])
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return res.status(400).json({ error: `Responde todas las preguntas de escala (1–5).` })
    }
  }

  try {
    await pool.query(
      `INSERT INTO survey_responses (respondent_name, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [respondentName.trim(), q1, q2, q3, q4, q5, q6, q7, q8.trim(), q9.trim(), q10.trim()]
    )
    return res.status(201).json({ message: '¡Gracias por tu respuesta!' })
  } catch (error) {
    console.error('Error guardando encuesta:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

export async function getSurveyResults(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT id, respondent_name, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, created_at
       FROM survey_responses ORDER BY created_at ASC`
    )
    return res.status(200).json({ responses: result.rows, total: result.rows.length })
  } catch (error) {
    console.error('Error obteniendo resultados de encuesta:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}
