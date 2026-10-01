import { handleAskAiRequest } from '../server/geminiService.js';

/**
 * Vercel Serverless Function Handler for /api/ask-ai
 * Receives frontend requests and interfaces with the Gemini AI service.
 */
export default async function handler(req, res) {
  // Ensure JSON response header
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method Not Allowed'
    });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body) {
      body = {};
    }

    const { action, payload } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured in Vercel environment variables. Please add GEMINI_API_KEY in your Vercel Project Settings.'
      });
      return;
    }

    if (!action) {
      res.status(400).json({
        success: false,
        error: 'Missing action parameter in request body.'
      });
      return;
    }

    const result = await handleAskAiRequest(action, payload, apiKey);
    res.status(200).json(result);
  } catch (err) {
    console.error('Ask AI Vercel API error:', err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || 'AI explanation is temporarily unavailable. Please try again.'
    });
  }
}
