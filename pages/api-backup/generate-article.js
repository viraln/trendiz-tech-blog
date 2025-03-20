/**
 * Generate Article API Endpoint
 * 
 * This API route handles requests to generate new articles on demand.
 * Supports both GET and POST methods:
 * - GET: /api/generate-article?topic=Topic Name
 * - POST: /api/generate-article with JSON body { topic: "Topic Name" }
 * 
 * The endpoint calls the generateArticle function from our Gemini script
 * and returns the article information including title, slug, and filename.
 */

import { generateArticleApi } from '../../scripts/generate-article-gemini';

export default async function handler(req, res) {
  // Only allow GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Pass request through to the generateArticleApi handler
    return generateArticleApi(req, res);
  } catch (error) {
    console.error('API endpoint error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate article',
      message: error.message
    });
  }
}

// Configure longer timeout for article generation (5 minutes)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
    externalResolver: true,
  },
}; 