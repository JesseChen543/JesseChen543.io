/**
 * Action Dispatcher
 * Routes intent to appropriate action handlers
 */

import { INTENTS } from '../intent-recognition.js';
import { filterProjects } from './filter-projects.js';
import { sendEmail } from './send-email.js';
import { getResume } from './get-resume.js';
import { getProjectDetails } from './get-project-details.js';

/**
 * Execute action based on recognized intent
 * @param {Object} intentResult - Result from intent recognition
 * @param {string} message - Original user message
 * @param {Object} sessionContext - Current session context (for multi-turn conversations)
 * @param {string} apiKey - Google AI API key
 * @returns {Promise<Object>} - Action result with response and optional data
 */
export async function executeAction(intentResult, message, sessionContext, apiKey) {
  const { intent, parameters } = intentResult;

  console.log(`Executing action for intent: ${intent}`);

  try {
    switch (intent) {
    case INTENTS.FILTER_PROJECTS:
      return await filterProjects(parameters, message, apiKey);

    case INTENTS.SEND_EMAIL:
      return await sendEmail(message, sessionContext, apiKey);

    case INTENTS.DOWNLOAD_RESUME:
      return await getResume(parameters);

    case INTENTS.VIEW_PROJECT:
      return await getProjectDetails(parameters, message, apiKey);

    case INTENTS.NAVIGATION:
      return handleNavigation(parameters);

    case INTENTS.FAQ:
    case INTENTS.GENERAL_CHAT:
      // These intents don't trigger actions - they use the existing RAG/AI response
      return {
        requiresAiResponse: true,
        actionType: null
      };

    default:
      console.log('Unknown intent, falling back to AI response');
      return {
        requiresAiResponse: true,
        actionType: null
      };
    }
  } catch (error) {
    console.error('Error executing action:', error);
    return {
      success: false,
      response: 'Sorry, I encountered an error processing your request. Please try again.',
      error: error.message
    };
  }
}

/**
 * Handle navigation intent
 */
function handleNavigation(parameters) {
  const { section = 'home' } = parameters;

  return {
    success: true,
    actionType: 'navigation',
    response: `I'll take you to the ${section} section.`,
    data: {
      section,
      scrollTo: section
    }
  };
}

/**
 * Format action response for client
 * @param {Object} actionResult - Result from action execution
 * @param {string} aiResponse - Optional AI-generated response text
 * @returns {Object} - Formatted response for client
 */
export function formatActionResponse(actionResult, aiResponse = null) {
  if (actionResult.requiresAiResponse) {
    return {
      response: aiResponse,
      actionType: null
    };
  }

  return {
    response: actionResult.response || aiResponse,
    actionType: actionResult.actionType,
    success: actionResult.success !== false,
    data: actionResult.data || null,
    sessionContext: actionResult.sessionContext || null
  };
}
