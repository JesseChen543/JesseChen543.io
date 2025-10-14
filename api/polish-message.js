/**
 * API endpoint to polish user messages using AI
 * Improves grammar, clarity, and professionalism
 */

import { callGoogleAI, formatGeminiRequest, extractResponseText } from '../lib/google-ai-proxy.js';
import { rateLimiter } from '../lib/rate-limiter.js';
import { DEFAULT_RATE_LIMIT_OPTIONS } from '../lib/rate-limit-config.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  if (!rateLimiter(req, res, DEFAULT_RATE_LIMIT_OPTIONS)) {
    console.log('Rate limit check failed - request blocked');
    return;
  }

  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get API key
    const apiKey = process.env.GOOGLEAI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('API key not found in environment variables');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Polish the message using AI
    const polishedMessage = await polishMessageWithAI(message, apiKey);

    return res.status(200).json({
      success: true,
      original: message,
      polished: polishedMessage
    });

  } catch (error) {
    console.error('Error polishing message:', error);
    return res.status(500).json({
      error: 'Failed to polish message',
      details: error.message
    });
  }
}

/**
 * Polish message using AI
 */
async function polishMessageWithAI(message, apiKey) {
  const systemPrompt = `You are a professional message editor. Your task is to improve the user's message while maintaining their original intent and tone.

IMPROVEMENTS TO MAKE:
- Fix grammar and spelling errors
- Improve clarity and readability
- Make it more professional (but keep casual if that's the tone)
- Remove unnecessary words or repetition
- Improve sentence structure

RULES:
- Keep the same general length (don't make it much longer or shorter)
- Maintain the original tone and intent
- Don't add information that wasn't in the original
- Don't be overly formal if the original was casual
- Return ONLY the polished message, no explanations or comments
- If the message is already well-written, make minor improvements or return it as-is

Polish this message:`;

  try {
    const requestBody = formatGeminiRequest(
      systemPrompt,
      message,
      {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topK: 40,
        topP: 0.95
      }
    );

    const data = await callGoogleAI('gemini-2.5-flash', requestBody, apiKey);
    const polishedText = extractResponseText(data);

    // Clean up any markdown or extra formatting
    const cleanedText = polishedText
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .trim();

    return cleanedText;
  } catch (error) {
    console.error('Error calling AI service:', error);
    throw error;
  }
}
