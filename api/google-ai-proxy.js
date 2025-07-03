// Google AI API Proxy service
// This proxy handles authentication and request formatting for Google AI services

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local for local development
// In production (Vercel), environment variables are loaded automatically
function loadEnvironmentVariables() {
  try {
    // Check if we already have the API key in environment variables
    // This will be true in Vercel production environment
    if (process.env.GOOGLEAI_API_KEY || process.env.GEMINI_API_KEY) {
      console.log('Google AI API Key already available in environment variables');
      return;
    }
    
    // If not in environment variables, try to load from .env.local (for local development)
    // Go up one level from /api to root directory
    const rootDir = path.resolve(__dirname, '..');
    const envPath = path.join(rootDir, '.env.local');
    
    console.log('Attempting to load .env.local from:', envPath);
    
    if (fs.existsSync(envPath)) {
      console.log('.env.local file found');
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Parse each line of the .env file
      envContent.split('\n').forEach(line => {
        // Skip empty lines or comments
        if (!line || line.startsWith('#')) return;
        
        // Split by first equals sign
        const equalSignIndex = line.indexOf('=');
        if (equalSignIndex > 0) {
          const key = line.substring(0, equalSignIndex).trim();
          const value = line.substring(equalSignIndex + 1).trim();
          
          if (key && value) {
            // Set environment variable
            process.env[key] = value;
            console.log(`Set environment variable: ${key} (value hidden)`);
          }
        }
      });
      
      // Verify key was loaded
      if (process.env.GOOGLEAI_API_KEY || process.env.GEMINI_API_KEY) {
        console.log('Google AI API Key loaded successfully from .env.local');
      } else {
        console.warn('Failed to load API key from .env.local');
        console.warn('Looking for either GOOGLEAI_API_KEY or GEMINI_API_KEY');
      }
    } else {
      console.warn('.env.local file not found at:', envPath);
      console.warn('Make sure either GOOGLEAI_API_KEY or GEMINI_API_KEY is set in your environment variables or .env.local file');
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
}

// Load environment variables immediately
loadEnvironmentVariables();

/**
 * Makes a request to the Google AI Gemini API
 * @param {string} model - The model ID to use (e.g., 'gemini-2.5-flash')
 * @param {object} requestBody - The formatted request body for the API
 * @param {string} apiKey - The Google AI API key
 * @returns {Promise<object>} - The API response
 */
async function callGoogleAI(model, requestBody, apiKey) {
  try {
    console.log(`Calling Google AI API model: ${model}`);
    
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    // Format endpoint URL based on model
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;
    
    // Make the API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });
    
    // Get the response data
    const data = await response.json();
    
    // Check for API errors
    if (!response.ok) {
      console.error('Google AI API error:', data);
      throw new Error(data.error?.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error in Google AI proxy service:', error);
    throw error;
  }
}

/**
 * Formats a chat message for the Gemini API
 * @param {string} systemInstruction - The system instruction for the AI
 * @param {string} userMessage - The user's message
 * @param {object} config - Additional configuration options
 * @param {array} history - Previous conversation history
 * @returns {object} - Formatted request body
 */
function formatGeminiRequest(systemInstruction, userMessage, config = {}, history = []) {
  // Build contents array based on conversation history
  const contents = [];
  
  // First message is always system instruction
  contents.push({
    role: 'user',
    parts: [{ text: systemInstruction }]
  });
  
  // Add conversation history if available
  if (history && history.length > 0) {
    // Format history in the way Gemini expects
    history.forEach(message => {
      // Only include messages with content
      if (message.content && message.role) {
        contents.push({
          role: message.role === 'user' ? 'user' : 'model',
          parts: [{ text: message.content }]
        });
      }
    });
  }
  
  // Add the current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });
  
  return {
    contents,
    generationConfig: {
      temperature: config.temperature || 0.7,
      maxOutputTokens: config.maxOutputTokens || 800,
      topP: config.topP || 0.95,
      topK: config.topK || 40
    }
  };
}

/**
 * Extracts the AI response text from the Gemini API response
 * @param {object} apiResponse - The raw API response
 * @returns {string} - The extracted text response
 */
function extractResponseText(apiResponse) {
  try {
    console.log('Extracting response from:', JSON.stringify(apiResponse, null, 2));
    
    // Check if we have a valid response with candidates
    if (apiResponse.candidates && apiResponse.candidates.length > 0) {
      const candidate = apiResponse.candidates[0];
      
      // Handle different finish reasons
      if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn('API response cut off due to MAX_TOKENS limit');
        // We'll still try to extract what we got
      } else if (candidate.finishReason === 'STOP') {
        console.log('Response completed normally');
      } else if (candidate.finishReason) {
        console.warn(`Response finished with reason: ${candidate.finishReason}`);
      }
      
      // First check for text in the most common location
      if (candidate.content?.parts?.[0]?.text) {
        return candidate.content.parts[0].text;
      }
      
      // Second, check if there's a text property directly in the content
      if (candidate.content?.text) {
        return candidate.content.text;
      }
      
      // Third, look for any text in any of the parts
      if (candidate.content?.parts && candidate.content.parts.length > 0) {
        for (const part of candidate.content.parts) {
          if (part.text) return part.text;
        }
      }
      
      // If we have content in any form, try to extract something useful
      if (candidate.content) {
        console.log('Found content but no recognizable text structure:', candidate.content);
        // Return a readable version of the content if possible
        return 'Jesse\'s assistant attempted to respond but the message format was unexpected. '
          + 'Please try asking your question in a different way.';
      }
    }
    
    // If we can't find the expected path, return an error message
    console.error('Unexpected API response structure:', JSON.stringify(apiResponse));
    return 'Unable to process response from AI service. Please try again later.';
  } catch (error) {
    console.error('Error extracting response text:', error);
    return 'Error processing AI response. Please try again later.';
  }
}

module.exports = {
  callGoogleAI,
  formatGeminiRequest,
  extractResponseText
};
