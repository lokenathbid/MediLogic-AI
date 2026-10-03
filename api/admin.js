import { handleAdminRequest } from '../server/adminService.js';

/**
 * Vercel Serverless Function Handler for /api/admin
 * Receives frontend admin requests and interfaces with the secure admin service.
 * Role check and Bearer session verification are performed strictly server-side.
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
    const authHeader = req.headers.authorization || req.headers['authorization'];

    const apiKey = process.env.INSFORGE_API_KEY;
    const baseUrl = process.env.VITE_INSFORGE_URL || process.env.INSFORGE_BASE_URL || 'https://3g2ha7rp.ap-southeast.insforge.app';

    if (!apiKey) {
      res.status(500).json({
        success: false,
        error: 'INSFORGE_API_KEY is not configured in Vercel environment variables. Please add INSFORGE_API_KEY in your Vercel Project Settings.'
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

    const result = await handleAdminRequest(action, payload, authHeader, { baseUrl, apiKey });
    res.status(200).json(result);
  } catch (err) {
    console.error('Admin API error:', err?.message || err);
    const status = err.statusCode || 500;
    res.status(status).json({
      success: false,
      error: err?.message || 'Admin operation failed.'
    });
  }
}
