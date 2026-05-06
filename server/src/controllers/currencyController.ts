// import { Request, Response } from 'express';
// import axios from 'axios';

// // @desc    Get exchange rates
// // @route   GET /api/currency/rates
// // @access  Public
// export const getExchangeRates = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const apiKey = process.env.EXCHANGE_RATE_API_KEY;

//         const url = apiKey
//             ? `https://open.er-api.com/v6/latest/USD?apikey=${apiKey}`
//             : 'https://open.er-api.com/v6/latest/USD'; // free tier (no key, limited)

        
//         const response = await axios.get(url, { timeout: 5000 });
//         const allRates = response.data.rates;
       

//         // Return only the currencies we support in the UI
//         const supported = ['USD', 'PKR', 'EUR', 'GBP', 'INR', 'AED', 'SAR', 'CAD', 'AUD'];
//         const rates: Record<string, number> = {};
//         for (const code of supported) {
//             if (allRates[code] !== undefined) rates[code] = allRates[code];
//         }

//         res.json({
//             base: 'USD',
//             rates,
//             lastUpdated: response.data.time_last_update_utc,
//         });
//     } catch (error) {
//         // Fallback to hardcoded rates
//         res.json({
//             base: 'USD',
//             rates: { USD: 1, PKR: 279.37, EUR: 0.85, GBP: 0.74, INR: 95.23, AED: 3.67, SAR: 3.75, CAD: 1.36, AUD: 1.39 },
//             lastUpdated: null,
//         });
//     }
// };

// // @desc    Get user geolocation
// // @route   GET /api/currency/geolocation
// // @access  Public
// export const getGeolocation = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const response = await axios.get('https://ipapi.co/json/');
//         res.json({
//             country: response.data.country_name,
//             countryCode: response.data.country_code,
//             city: response.data.city,
//             currency: response.data.currency,
//         });
//     } catch (error) {
//         res.json({
//             country: 'Pakistan',
//             countryCode: 'PK',
//             city: 'Islamabad',
//             currency: 'PKR',
//         });
//     }
// };


import { Request, Response } from 'express';
import axios from 'axios';

/**
 * =========================================
 *  GET EXCHANGE RATES (DISABLED MODE)
 * =========================================
 */

// @desc    Get exchange rates
// @route   GET /api/currency/rates
// @access  Public
export const getExchangeRates = async (req: Request, res: Response): Promise<void> => {
    try {

        // =====================================================
        // 🚫 DISABLED: External API call (to save requests)
        // =====================================================

        /*
        const apiKey = process.env.EXCHANGE_RATE_API_KEY;

        const url = apiKey
            ? `https://open.er-api.com/v6/latest/USD?apikey=${apiKey}`
            : 'https://open.er-api.com/v6/latest/USD';

        const response = await axios.get(url, { timeout: 5000 });
        const allRates = response.data.rates;

        const supported = ['USD', 'PKR', 'EUR', 'GBP', 'INR', 'AED', 'SAR', 'CAD', 'AUD'];
        const rates: Record<string, number> = {};

        for (const code of supported) {
            if (allRates[code] !== undefined) rates[code] = allRates[code];
        }

        res.json({
            base: 'USD',
            rates,
            lastUpdated: response.data.time_last_update_utc,
            source: 'live-api'
        });
        return;
        */

        // =====================================================
        // ✅ MOCK DATA (ACTIVE NOW)
        // =====================================================

        const rates: Record<string, number> = {
            USD: 1,
            PKR: 279.37,
            EUR: 0.85,
            GBP: 0.74,
            INR: 95.23,
            AED: 3.67,
            SAR: 3.75,
            CAD: 1.36,
            AUD: 1.39,
        };

        res.json({
            base: 'USD',
            rates,
            lastUpdated: 'STATIC_MODE',
            source: 'mock',
        });

        return;

    } catch (error) {
        console.error('Currency API error:', error);

        res.json({
            base: 'USD',
            rates: {
                USD: 1,
                PKR: 279.37,
                EUR: 0.85,
                GBP: 0.74,
                INR: 95.23,
                AED: 3.67,
                SAR: 3.75,
                CAD: 1.36,
                AUD: 1.39,
            },
            lastUpdated: null,
            source: 'fallback',
        });

        return;
    }
};

/**
 * =========================================
 *  GEOLOCATION (OPTIONAL MOCK MODE)
 * =========================================
 */

// @desc    Get user geolocation
// @route   GET /api/currency/geolocation
// @access  Public
export const getGeolocation = async (req: Request, res: Response): Promise<void> => {
    try {

        // =====================================================
        // 🚫 DISABLED: External IP API
        // =====================================================

        /*
        const response = await axios.get('https://ipapi.co/json/');

        res.json({
            country: response.data.country_name,
            countryCode: response.data.country_code,
            city: response.data.city,
            currency: response.data.currency,
            source: 'live-api'
        });
        return;
        */

        // =====================================================
        // ✅ MOCK DATA (ACTIVE NOW)
        // =====================================================

        res.json({
            country: 'Pakistan',
            countryCode: 'PK',
            city: 'Islamabad',
            currency: 'PKR',
            source: 'mock',
        });

        return;

    } catch (error) {
        res.json({
            country: 'Pakistan',
            countryCode: 'PK',
            city: 'Islamabad',
            currency: 'PKR',
            source: 'fallback',
        });

        return;
    }
};