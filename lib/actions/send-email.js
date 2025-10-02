/**
 * Send Email Action Handler
 * Extracts contact information from user message and scrolls to contact form
 */

import { callGoogleAI, formatGeminiRequest, extractResponseText } from '../google-ai-proxy.js';

/**
 * Handle email intent - extract info and scroll to contact form
 */
export async function sendEmail(message, sessionContext = {}, apiKey) {
  try {
    // Use AI to extract contact information from the message
    const contactInfo = await extractContactInfo(message, apiKey);

    return {
      success: true,
      actionType: 'fill_contact_form',
      response: 'I\'ll help you contact Jesse! Opening the contact form and filling in your details...',
      data: {
        contactInfo,
        scrollToForm: true
      },
      sessionContext
    };
  } catch (error) {
    console.error('Error extracting contact info:', error);
    return {
      success: false,
      actionType: 'send_email',
      response: 'I\'d be happy to help you contact Jesse! Please scroll down to the contact form and fill in your details.',
      data: {
        scrollToForm: true
      },
      sessionContext
    };
  }
}

/**
 * Extract contact information from natural language using AI
 */
async function extractContactInfo(message, apiKey) {
  const systemPrompt = `Extract contact information from the user's message. The user wants to send an email.

Extract the following if mentioned:
- name: User's name
- email: User's email address
- subject: Email subject/topic
- message: The message content they want to send

If information is not explicitly mentioned, leave it as an empty string.

RESPONSE FORMAT (JSON only):
{
  "name": "",
  "email": "",
  "subject": "",
  "message": ""
}

Examples:
- "send email to jesse, my name is John, email john@test.com, want to discuss a project"
  → {"name": "John", "email": "john@test.com", "subject": "Project Discussion", "message": "I want to discuss a project"}

- "email jesse for coffee chat tomorrow at 10am"
  → {"name": "", "email": "", "subject": "Coffee Chat", "message": "I'd like to have a coffee chat tomorrow at 10am"}

Extract from this message:`;

  try {
    const requestBody = formatGeminiRequest(
      systemPrompt,
      message,
      {
        temperature: 0.1,
        maxOutputTokens: 300,
        topK: 40,
        topP: 0.95
      }
    );

    const data = await callGoogleAI('gemini-2.5-flash', requestBody, apiKey);
    const aiResponse = extractResponseText(data);

    const cleanedResponse = aiResponse.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error extracting contact info:', error);
    // Return empty object if extraction fails
    return {
      name: '',
      email: '',
      subject: '',
      message: message
    };
  }
}
