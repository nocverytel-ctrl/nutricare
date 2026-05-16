import { Router } from 'express'
import authenticate from '../middleware/authenticate'
import { getDailyMenu, regenerateDailyMenu, getMenuHistory } from '../controllers/menuController'

const router = Router()

router.get('/', authenticate, getDailyMenu)
router.post('/regenerate', authenticate, regenerateDailyMenu)
router.get('/history', authenticate, getMenuHistory)

export default router
