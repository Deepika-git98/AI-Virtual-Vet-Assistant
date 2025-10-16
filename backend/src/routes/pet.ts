import express from 'express';
import { authenticateToken } from '../middleware/userAuth';
import {
    createPet,
    getPets,
    getPetById,
    updatePet,
    deletePet
} from '../controllers/petController';

const router = express.Router();

router.use(authenticateToken); // Apply authentication middleware to all routes

router.post('/', createPet);
router.get('/', getPets);
router.get('/:id', getPetById);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

export default router;