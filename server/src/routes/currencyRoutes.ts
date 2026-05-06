import express from 'express';
import { getExchangeRates, getGeolocation } from '../controllers/currencyController';

const router = express.Router();

router.get('/rates', getExchangeRates);
router.get('/geolocation', getGeolocation);

export default router;
