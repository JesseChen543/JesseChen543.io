/**
 * Intent Recognition System
 * Classifies user messages into actionable intents using AI-based classification
 */

import { callGoogleAI, formatGeminiRequest, extractResponseText } from './google-ai-proxy.js';

// Define intent categories
export const INTENTS = {
  FILTER_PROJECTS: 'filter_projects',
  SEND_EMAIL: 'send_email',
  DOWNLOAD_RESUME: 'download_resume',
  VIEW_PROJECT: 'view_project',
  NAVIGATION: 'navigation',
  FAQ: 'faq',
  GENERAL_CHAT: 'general_chat'
};

/**
 * Recognize user intent from natural language input
 * @param {string} message - User's message
 * @param {string} apiKey - Google AI API key
 * @param {Array} history - Conversation history for context
 * @returns {Promise<Object>} - Intent object with type and extracted parameters
 */
export async function recognizeIntent(message, apiKey, history = []) {
  const systemPrompt = `You are an intent classifier for a portfolio website chatbot. Analyze the user's message and classify it into ONE of these intents:

INTENT TYPES:
1. filter_projects - User wants to search/filter projects by technology, category, or date
   Examples: "Show me Python projects", "What projects use React?", "Filter by web development"
   Extract: technologies[], categories[], dateRange

2. send_email - User wants to contact Jesse or send a message
   Examples: "I want to contact you", "Send an email", "I'd like to discuss a job"
   Extract: none (will be handled in multi-turn conversation)

3. download_resume - User wants to download/view the resume/CV
   Examples: "Can I see your resume?", "Download CV", "Show me your resume"
   Extract: format (pdf/docx)

4. view_project - User wants details about a specific project
   Examples: "Tell me about WingWatch", "What did you do in Real Estate Analysis?"
   Extract: projectName

5. navigation - User wants to navigate to a specific section
   Examples: "Go to projects section", "Show me the about page"
   Extract: section

6. faq - User is asking a question about Jesse (background, skills, experience)
   Examples: "What languages do you know?", "Tell me about yourself"
   Extract: none

7. general_chat - General conversation, greetings, or off-topic
   Examples: "Hello", "How are you?", "What's the weather?"
   Extract: none

RESPONSE FORMAT (JSON only, no additional text):
{
  "intent": "<intent_type>",
  "confidence": <0-1>,
  "parameters": {
    // extracted parameters based on intent
  }
}

Analyze this message and respond with ONLY the JSON object:`;

  try {
    const requestBody = formatGeminiRequest(
      systemPrompt,
      message,
      {
        temperature: 0.1, // Low temperature for more deterministic classification
        maxOutputTokens: 500,
        topK: 40,
        topP: 0.95
      },
      history
    );

    const data = await callGoogleAI('gemini-2.5-flash', requestBody, apiKey);
    const aiResponse = extractResponseText(data);

    // Parse JSON response
    const cleanedResponse = aiResponse.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const intentResult = JSON.parse(cleanedResponse);

    console.log('Intent recognized:', intentResult);

    return {
      intent: intentResult.intent || INTENTS.GENERAL_CHAT,
      confidence: intentResult.confidence || 0.5,
      parameters: intentResult.parameters || {}
    };
  } catch (error) {
    console.error('Error recognizing intent:', error);

    // Fallback to keyword-based classification if AI fails
    return fallbackIntentRecognition(message);
  }
}

/**
 * Fallback keyword-based intent recognition
 * Used when AI classification fails
 */
function fallbackIntentRecognition(message) {
  const lowerMessage = message.toLowerCase();

  // Filter projects keywords
  if (lowerMessage.match(/\b(show|filter|find|search|display)\b.*\b(project|work|portfolio)\b/) ||
      lowerMessage.match(/\b(python|javascript|react|node|html|css|java|r)\b.*\b(project)\b/) ||
      lowerMessage.match(/\bprojects?\s+(using|with|in|by)\b/)) {
    return {
      intent: INTENTS.FILTER_PROJECTS,
      confidence: 0.7,
      parameters: extractTechnologies(message)
    };
  }

  // Email/contact keywords
  if (lowerMessage.match(/\b(contact|email|message|reach|hire|discuss|opportunity)\b/)) {
    return {
      intent: INTENTS.SEND_EMAIL,
      confidence: 0.8,
      parameters: {}
    };
  }

  // Resume download keywords
  if (lowerMessage.match(/\b(resume|cv|curriculum vitae|download)\b/)) {
    return {
      intent: INTENTS.DOWNLOAD_RESUME,
      confidence: 0.8,
      parameters: { format: 'pdf' }
    };
  }

  // Specific project inquiry
  if (lowerMessage.match(/\b(tell me about|details about|what.*about)\b.*\b(wingwatch|birdwatch|estate|heart|gamerverse)\b/)) {
    return {
      intent: INTENTS.VIEW_PROJECT,
      confidence: 0.7,
      parameters: { projectName: extractProjectName(message) }
    };
  }

  // Navigation keywords
  if (lowerMessage.match(/\b(go to|navigate|show|take me to)\b.*\b(section|page|about|projects|contact)\b/)) {
    return {
      intent: INTENTS.NAVIGATION,
      confidence: 0.7,
      parameters: { section: extractSection(message) }
    };
  }

  // FAQ - questions about Jesse
  if (lowerMessage.match(/\b(what|who|where|when|tell me|about you|your)\b/)) {
    return {
      intent: INTENTS.FAQ,
      confidence: 0.6,
      parameters: {}
    };
  }

  // Default to general chat
  return {
    intent: INTENTS.GENERAL_CHAT,
    confidence: 0.5,
    parameters: {}
  };
}

/**
 * Extract technology names from message
 */
function extractTechnologies(message) {
  const technologies = [];
  const techKeywords = ['python', 'javascript', 'react', 'node', 'html', 'css', 'java', 'r', 'api', 'typescript'];
  const lowerMessage = message.toLowerCase();

  techKeywords.forEach(tech => {
    if (lowerMessage.includes(tech)) {
      technologies.push(tech);
    }
  });

  return { technologies };
}

/**
 * Extract project name from message
 */
function extractProjectName(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('wingwatch') || lowerMessage.includes('bird')) return 'wingwatch';
  if (lowerMessage.includes('estate') || lowerMessage.includes('real estate')) return 'data-analyst';
  if (lowerMessage.includes('heart')) return 'heart-attack-analysis';
  if (lowerMessage.includes('gamerverse') || lowerMessage.includes('gaming')) return 'web-design';

  return '';
}

/**
 * Extract section name from message
 */
function extractSection(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('about')) return 'about';
  if (lowerMessage.includes('project')) return 'projects';
  if (lowerMessage.includes('contact')) return 'contact';

  return 'home';
}
