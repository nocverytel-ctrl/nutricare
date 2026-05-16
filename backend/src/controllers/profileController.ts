import { Response } from 'express'
import { Profile } from '../models/profile'
import pool from '../config/database'
import { saveMenu } from './menuController'
import { AuthenticatedRequest } from '../types/authenticated-request'

export async function saveProfile(req: AuthenticatedRequest, res: Response) {
  const email = req.userEmail
  if (!email) {
    return res.status(401).json({ error: 'Usuario no autenticado.' })
  }

  const profileData = req.body as Profile
  if (!profileData || typeof profileData !== 'object') {
    return res.status(400).json({ error: 'Datos de perfil inválidos.' })
  }

  try {
    const savedProfile: Profile = {
      ...profileData,
      updatedAt: new Date().toISOString(),
    }

    await pool.query(`
      INSERT INTO profiles (email, name, age, biological_sex, weight, height, activity_level, conditions, diet, dislikes, budget, goals, reminders, meal_times, daily_tips, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (email) DO UPDATE SET
        name = COALESCE(NULLIF(profiles.name, ''), EXCLUDED.name),
        age = COALESCE(profiles.age, EXCLUDED.age),
        biological_sex = EXCLUDED.biological_sex,
        weight = EXCLUDED.weight,
        height = COALESCE(profiles.height, EXCLUDED.height),
        activity_level = EXCLUDED.activity_level,
        conditions = EXCLUDED.conditions,
        diet = EXCLUDED.diet,
        dislikes = EXCLUDED.dislikes,
        budget = EXCLUDED.budget,
        goals = EXCLUDED.goals,
        reminders = EXCLUDED.reminders,
        meal_times = EXCLUDED.meal_times,
        daily_tips = EXCLUDED.daily_tips,
        updated_at = EXCLUDED.updated_at
    `, [
      email,
      savedProfile.name,
      savedProfile.age,
      savedProfile.biologicalSex,
      savedProfile.weight,
      savedProfile.height,
      savedProfile.activityLevel,
      savedProfile.conditions,
      savedProfile.diet,
      savedProfile.dislikes,
      savedProfile.budget,
      savedProfile.goals,
      savedProfile.reminders,
      JSON.stringify(savedProfile.mealTimes),
      savedProfile.dailyTips,
      savedProfile.updatedAt
    ])

    await saveMenu(email, savedProfile)

    return res.status(200).json({ message: 'Perfil guardado con éxito.', profile: savedProfile })
  } catch (error) {
    console.error('Error guardando perfil:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const email = req.userEmail
  if (!email) {
    return res.status(401).json({ error: 'Usuario no autenticado.' })
  }

  try {
    const result = await pool.query('SELECT * FROM profiles WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado.' })
    }

    const row = result.rows[0]
    const profile: Profile = {
      name: row.name,
      age: row.age,
      biologicalSex: row.biological_sex,
      weight: parseFloat(row.weight),
      height: row.height,
      activityLevel: row.activity_level,
      conditions: row.conditions,
      diet: row.diet,
      dislikes: row.dislikes,
      budget: row.budget,
      goals: row.goals,
      reminders: row.reminders,
      mealTimes: row.meal_times,
      dailyTips: row.daily_tips,
      updatedAt: row.updated_at.toISOString(),
    }

    return res.status(200).json({ profile })
  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}
