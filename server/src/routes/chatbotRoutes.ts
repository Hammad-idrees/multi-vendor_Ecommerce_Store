import express from 'express';
import { chatWithAI, aiSearch } from '../controllers/chatbotController';

const router = express.Router();

router.post('/message', chatWithAI);
router.post('/search', aiSearch);

export default router;
