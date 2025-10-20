import { Router } from 'express';
const { body } = require('express-validator');
import {
    analyzeSymptoms,
    createSymptomReport,
    deleteSymptomReport,
    getSymptomReportById,
    getSymptomReports,
    updateSymptomReport
} from '../controllers/symptomController';
import { authenticateToken } from '../middleware/userAuth';

const router = Router();

router.use(authenticateToken);

router.post(
    '/',
    [
        body('petId').isString().notEmpty(),
        body('title').isString().notEmpty(),
        body('symptoms').optional().isArray(),
        body('severity').isIn(['mild', 'moderate', 'severe', 'emergency']),
        body('duration').isString().notEmpty(),
        body('frequency').optional().isString(),
        body('description').optional().isString(),
        body('bodyPart').optional().isString(),
        body('behaviorChanges').optional().isString(),
        body('appetite').optional().isString(),
        body('energy').optional().isString()
    ],
    createSymptomReport
);

router.get('/pet/:petId', getSymptomReports);
router.get('/:id', getSymptomReportById);

router.post(
    '/analyze',
    [body('symptomReportId').isString().notEmpty()],
    analyzeSymptoms
);

router.put(
    '/:id',
    [
        body('title').optional().isString(),
        body('symptoms').optional().isArray({ min: 1 }),
        body('severity').optional().isIn(['mild', 'moderate', 'severe', 'emergency']),
        body('duration').optional().isString(),
        body('frequency').optional().isString(),
        body('description').optional().isString(),
        body('bodyPart').optional().isString(),
        body('behaviorChanges').optional().isString(),
        body('appetite').optional().isString(),
        body('energy').optional().isString()
    ],
    updateSymptomReport
);

router.delete('/:id', deleteSymptomReport);

export default router;