import { config } from 'dotenv';

export default function validateEnv() {
  // En producción no hay .env — las variables vienen del entorno
  config(); // intenta cargar .env si existe, silencia el error si no

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET es obligatorio.');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL es obligatorio.');
  }
}
