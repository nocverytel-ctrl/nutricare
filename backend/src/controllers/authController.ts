import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database'
import { logger } from '../utils/logger'

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }

  try {
    const existingUser = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Usuario ya existe.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [email, passwordHash]);

    return res.status(201).json({ message: 'Usuario creado.' });
  } catch (error) {
    logger.error('Error en registro', { message: String(error) });
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const user = userResult.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET ?? 'changeme', {
      expiresIn: '24h',
    });

    return res.json({ token });
  } catch (error) {
    logger.error('Error en login', { message: String(error) });
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
