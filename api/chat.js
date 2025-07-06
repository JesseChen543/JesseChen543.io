// This is a serverless function for Vercel
// Import the Google AI proxy service
const { callGoogleAI, formatGeminiRequest, extractResponseText } = require('./google-ai-proxy');
// Import rate limiter to prevent abuse
const { rateLimiter, checkRateLimit } = require('./rate-limiter');
// Import path and fs for file operations
const path = require('path');
const fs = require('fs');
// Import config (for local development) - handle missing config file safely
let config = {};
try {
  config = require('./config');
  console.log('Loaded config file successfully');
} catch (error) {
  console.log('Config file not found, using environment variables only');
  // This is expected in production environments like Vercel
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Apply rate limiting - 15 requests per day
  const rateLimitOptions = {
    maxRequests: 15,  // Allow 15 requests per day per IP
    windowMs: 24 * 60 * 60 * 1000 // 24 hour window (1 day)
  };
  
  // Let the rate limiter handle everything - it will do all the IP detection and validation
  // It will also return false if the request is not allowed (and send the appropriate error response)
  if (!rateLimiter(req, res, rateLimitOptions)) {
    console.log(`Rate limit check failed - request blocked`);
    return;
  }
  // The rate limiter already logged everything we need to know about the request count

  try {
    console.log('API handler called with request:', req.body);
    
    // Client IP has already been logged above with the request count
    
    // Log all environment variables (excluding sensitive values)
    console.log('Available environment variables:', Object.keys(process.env).join(', '));
    
    // Get the user's message and conversation history from the request body
    const { message, history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Log conversation history if present
    if (history && history.length > 0) {
      console.log(`Received ${history.length} previous messages in conversation`);
    }
    
    // Get API key from environment variables - check multiple possible variable names
    let apiKey = process.env.GOOGLEAI_API_KEY || process.env.GEMINI_API_KEY;
    
    // Log API key status - for debug only
    const keyStatus = apiKey 
      ? `Key exists (length: ${apiKey.length})` 
      : 'Key missing';
    console.log('Using Google AI API key:', keyStatus);
    console.log('GOOGLEAI_API_KEY exists:', !!process.env.GOOGLEAI_API_KEY);
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    
    // Check if API key is available
    if (!apiKey) {
      try {
        console.log('API key not found in environment variables, checking config file');
        console.log('Config object exists:', !!config);
        console.log('Config googleai exists:', !!(config && config.googleai));
        
        const configApiKey = config && config.googleai && config.googleai.apiKey;
        if (configApiKey) {
          console.log('Using API key from config file');
          apiKey = configApiKey;
        } else {
          console.error('API key not found in environment variables or config');
          return res.status(500).json({ error: 'API key not configured' });
        }
      } catch (configError) {
        console.error('Error accessing config:', configError);
        return res.status(500).json({ error: 'Error accessing config file', details: configError.message });
      }
    }
    
    // Load FAQ data from JSON file
    let faqData;
    try {
      // Determine the correct path to the JSON file - works in both dev and production
      const faqPath = path.resolve(process.cwd(), 'data/faq.json');
      console.log('Attempting to load FAQ data from:', faqPath);
      
      // Read and parse the JSON file
      const faqContent = fs.readFileSync(faqPath, 'utf-8');
      faqData = JSON.parse(faqContent);
      console.log(`Successfully loaded FAQ data with ${faqData.faqs?.length || 0} questions`);
    } catch (error) {
      console.error('Error loading FAQ data from file:', error);
      // Fallback to empty structure if file cannot be loaded
      faqData = { faqs: [] };
      console.log('Using empty FAQ data structure as fallback');
    }

    console.log('Preparing Google AI API request');
    
    return runWithApiKey(apiKey, message, faqData, res, history);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

/**
 * Runs the API call with the provided API key
 */
async function runWithApiKey(apiKey, message, faqData, res, history = []) {
  try {
    console.log('API Key found with length:', apiKey.length);
    
    // Rate limiting is already handled in the handler function
    
    // Function to select relevant FAQs based on user query
    function selectRelevantFAQs(query, allFaqs, maxItems = 5) {
      // Basic keyword matching - could be improved with more sophisticated NLP
      const keywords = query.toLowerCase().split(/\W+/).filter(k => k.length > 2);
      
      // Score each FAQ
      const scoredFaqs = allFaqs.map(faq => {
        const text = (faq.question + ' ' + faq.answer).toLowerCase();
        let score = 0;
        
        // Count keyword matches
        keywords.forEach(keyword => {
          if (text.includes(keyword)) {
            score += 1;
          }
        });
        
        // Always include general background info
        if (faq.question.toLowerCase().includes('tell me about yourself') || 
            faq.question.toLowerCase().includes('background')) {
          score += 1;
        }
        
        return { faq, score };
      });
      
      // Sort by score and take top N
      const selectedFaqs = scoredFaqs
        .sort((a, b) => b.score - a.score)
        .slice(0, maxItems)
        .map(item => item.faq);
      
      console.log(`Selected ${selectedFaqs.length} relevant FAQs for query: ${query}`);
      
      return selectedFaqs;
    }
    
    // Select relevant FAQs instead of using all of them
    const relevantFaqs = selectRelevantFAQs(message, faqData.faqs);
    const faqContent = relevantFaqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');
    
    // More flexible system instruction that allows for conversational questions
    const systemInstructions = `ROLE: Jesse Chen's personal assistant AI
TASK: Answer questions concisly about Jesse based on the FAQ data below. 
TONE: casual, conversational, helpful

FAQ DATA:
${faqContent}

RULES:
- Use the FAQ data creatively to answer a wide range of questions about Jesse
- Answer conversationally but factually - stay grounded in the provided information
- Be concise but complete - limit responses to within 200 words to avoid being cut off
- If a question is completely unrelated to Jesse, politely redirect 
- do not answer things that is irrelevent to the question`
;
    
    try {
      // Use the proxy service to format the request with conversation history
      const requestBody = formatGeminiRequest(
        systemInstructions, 
        message, 
        {
          temperature: 0.7,
          maxOutputTokens: 1500, 
          topK: 40,
          topP: 0.95
        },
        history // Pass the conversation history
      );
      
      console.log('Request body structure:', JSON.stringify(requestBody, null, 2));
      
      // Use the proxy service to make the API call
      const data = await callGoogleAI('gemini-2.5-flash', requestBody, apiKey);
      
      // Use the proxy service to extract the response text
      const aiResponse = extractResponseText(data);
      
      if (!aiResponse) {
        console.error('No response content found in API response:', data);
        return res.status(500).json({ error: 'No response content from AI service' });
      }
      
      // Return the successful response
      return res.status(200).json({ response: aiResponse });
    } catch (error) {
      console.error('Error calling Google AI service:', error);
      return res.status(500).json({ error: `AI Service error: ${error.message}` });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
