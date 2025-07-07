import express from 'express';
import { authenticateToken } from '../middleware/userAuth';
import { createPet, getPets, updatePet, deletePet } from '../controllers/petController';

const router = express.Router();

router.use(authenticateToken as express.RequestHandler); // Apply authentication middleware to all routes

router.post('/', createPet as express.RequestHandler);
router.get('/', getPets as express.RequestHandler);
router.put('/:id', updatePet as express.RequestHandler);
router.delete('/:id', deletePet as express.RequestHandler);

export default router;