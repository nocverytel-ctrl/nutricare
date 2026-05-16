import dotenv from 'dotenv'
dotenv.config()

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import menuRoutes from './routes/menu'
import validateEnv from './middleware/validateEnv'
import initializeDatabase from './config/initDb'
import { logger } from './utils/logger'

const app = express()

// ─── Security ───────────────────────────────────────────────────────────────
app.use(helmet())

const allowedOrigins = (process.env.CORS_ORIGIN ?? '*')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      cb(null, true)
    } else {
      cb(new Error(`CORS: origen no permitido — ${origin}`))
    }
  },
  credentials: true,
}))

// ─── Rate limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // max 20 intentos de login/registro por 15 min
  message: { error: 'Demasiados intentos de autenticación. Espera 15 minutos.' },
})

app.use(limiter)
app.use('/api/auth', authLimiter)

// ─── Parsing + logging ───────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }))

app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim(), { src: 'http' }) },
}))

validateEnv()

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'nutricare-backend', ts: new Date().toISOString() })
})

app.use('/api/auth',    authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/menu',    menuRoutes)

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', {
    message: err.message,
    path: req.path,
    method: req.method,
  })
  res.status(500).json({ error: 'Error interno del servidor.' })
})

// ─── Start ───────────────────────────────────────────────────────────────────
const port = Number(process.env.PORT ?? 4000)

async function startServer() {
  try {
    await initializeDatabase()
    app.listen(port, () => {
      logger.info(`Nutricare backend iniciado`, { port, env: process.env.NODE_ENV ?? 'development' })
    })
  } catch (error) {
    logger.error('Error al iniciar el servidor', { message: String(error) })
    process.exit(1)
  }
}

startServer()
