import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// @desc    Chat with AI assistant
// @route   POST /api/chatbot/message
// @access  Public
export const chatWithAI = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { message, context, chatHistory } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        console.log('Chatbot request received:', {
            message,
            hasContext: !!context,
            historyCount: Array.isArray(chatHistory) ? chatHistory.length : 0,
        });

        if (!apiKey) {
            res.json({
                response:
                    "I'm the Martify AI assistant! I'm here to help you shop. However, I'm currently in offline mode because the API key is not set.",
            });
            return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
            generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 500,
            },
        });

        const normalizedHistory = Array.isArray(chatHistory)
            ? chatHistory
                .filter((m: any) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
                .slice(-8)
            : [];

        const historyText = normalizedHistory.length
            ? normalizedHistory
                .map((m: any) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`)
                .join('\n')
            : 'No prior messages.';

        const systemPrompt = `
You are Martify Shopping Assistant, an expert AI for the Martify E-commerce Marketplace.

Your goal is to help users find products, compare options, and make confident buying decisions.

Martify offers products in Electronics, Fashion, Home & Living, and more.

Strict response style:
- Be concise, practical, and specific (max 120 words unless user asks for details).
- Do NOT repeat exact phrasing from your previous answer.
- Vary sentence openings and recommendation structure across turns.
- Give at least 2 concrete suggestions when user asks about products.
- Mention key buying factors (price, rating, use-case, and value) where relevant.
- End with one short follow-up question tailored to the user query.

If product data is unavailable, be transparent and suggest precise search keywords/categories instead of generic advice.

${context ? `Current page context: ${context}` : ''}
Recent conversation:
${historyText}
        `;

        const result = await model.generateContent(
            `${systemPrompt}\n\nUser Message: ${message}`
        );

        const aiResponse = result.response.text();

        res.json({ response: aiResponse });
    } catch (error: any) {
        console.error('Chatbot error:', error);

        res.json({
            response: `I'm sorry, I'm having a technical issue (${error.message || 'Unknown error'}). Please try again.`,
        });
    }
};

// @desc    AI-powered semantic search keywords
// @route   POST /api/chatbot/search
// @access  Public
export const aiSearch = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { query } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            res.json({
                keywords: query.split(' '),
                categories: [],
                intent: 'searching',
            });
            return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 300,
            },
        });

        const prompt = `
You are a search optimizer for Martify E-commerce.

User query: "${query}"

Extract:
- keywords
- product categories
- intent (searching | buying | comparing)

Respond ONLY in valid JSON:
{
  "keywords": ["word1", "word2"],
  "categories": ["Category Name"],
  "intent": "searching"
}
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON safely
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            res.json(JSON.parse(jsonMatch[0]));
        } else {
            res.json({
                keywords: query.split(' '),
                categories: [],
                intent: 'searching',
            });
        }
    } catch (error: any) {
        console.error('AI search error:', error);

        res.json({
            keywords: req.body.query?.split(' ') || [],
            categories: [],
            intent: 'searching',
        });
    }
};