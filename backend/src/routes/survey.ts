import { Router } from 'express'
import { submitSurvey, getSurveyResults } from '../controllers/surveyController'
import authenticate from '../middleware/authenticate'

const router = Router()

router.post('/', submitSurvey)
router.get('/results', authenticate, getSurveyResults)

export default router
