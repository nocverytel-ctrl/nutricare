import pool from './database'

async function initializeDatabase() {
  try {
    // Crear tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(255) PRIMARY KEY,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de perfiles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        email VARCHAR(255) PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL,
        biological_sex VARCHAR(50) NOT NULL,
        weight DECIMAL(5,2) NOT NULL,
        height INTEGER NOT NULL,
        activity_level VARCHAR(50) NOT NULL,
        conditions TEXT[] DEFAULT '{}',
        diet VARCHAR(50) NOT NULL,
        dislikes TEXT DEFAULT '',
        budget VARCHAR(100) DEFAULT '',
        goals TEXT[] DEFAULT '{}',
        reminders BOOLEAN DEFAULT true,
        meal_times JSONB NOT NULL,
        daily_tips BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de menús
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
        breakfast TEXT[] NOT NULL,
        snack TEXT[] NOT NULL,
        lunch TEXT[] NOT NULL,
        dinner TEXT[] NOT NULL,
        notes TEXT DEFAULT '',
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabla de tokens para recuperación de contraseña
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('Base de datos inicializada correctamente')
  } catch (error) {
    console.error('Error inicializando la base de datos:', error)
    throw error
  }
}

export default initializeDatabase