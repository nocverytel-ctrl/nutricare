import { Router } from 'express'
import authenticate from '../middleware/authenticate'
import { saveProfile, getProfile } from '../controllers/profileController'
import { validateProfile } from '../middleware/validate'

const router = Router()

router.post('/', authenticate, validateProfile, saveProfile)
router.get('/', authenticate, getProfile)

export default router
