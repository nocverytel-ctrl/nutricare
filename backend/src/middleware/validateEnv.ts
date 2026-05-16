import { config } from 'dotenv';

export default function validateEnv() {
  const result = config();
  if (result.error) {
    throw new Error('No se pudo cargar el archivo .env');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET es obligatorio. Defínelo en .env');
  }
}
