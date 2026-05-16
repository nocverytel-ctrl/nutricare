import { Router } from 'express'
import { register, login } from '../controllers/authController'
import { requestPasswordReset, resetPassword } from '../controllers/passwordResetController'
import { validateAuth, validatePasswordReset } from '../middleware/validate'

const router = Router()

router.post('/register',       validateAuth, register)
router.post('/login',          validateAuth, login)
router.post('/forgot-password', validateAuth, requestPasswordReset)
router.post('/reset-password',  validatePasswordReset, resetPassword)

export default router
