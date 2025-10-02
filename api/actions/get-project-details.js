/**
 * Get Project Details Action Handler
 * Returns detailed information about a specific project
 */

import path from 'path';
import fs from 'fs';
import { callGoogleAI, formatGeminiRequest, extractResponseText } from '../google-ai-proxy.js';

/**
 * Load projects data
 */
function loadProjects() {
  try {
    const projectsPath = path.resolve(process.cwd(), 'data/projects.json');
    const projectsContent = fs.readFileSync(projectsPath, 'utf-8');
    const projectsData = JSON.parse(projectsContent);
    return projectsData.projects || [];
  } catch (error) {
    console.error('Error loading projects data:', error);
    return [];
  }
}

/**
 * Find project by name or ID using fuzzy matching
 */
function findProject(projectName, projects) {
  const searchTerm = projectName.toLowerCase();

  // Exact match on ID
  let project = projects.find(p => p.id === searchTerm);
  if (project) return project;

  // Exact match on name
  project = projects.find(p => p.name.toLowerCase() === searchTerm);
  if (project) return project;

  // Partial match on title
  project = projects.find(p => p.title.toLowerCase().includes(searchTerm));
  if (project) return project;

  // Partial match on name
  project = projects.find(p => p.name.toLowerCase().includes(searchTerm));
  if (project) return project;

  // Fuzzy match on description
  project = projects.find(p => p.description.toLowerCase().includes(searchTerm));
  if (project) return project;

  return null;
}

/**
 * Get detailed information about a specific project
 * @param {Object} parameters - Parameters with projectName
 * @param {string} message - Original user message
 * @param {string} apiKey - Google AI API key
 * @returns {Promise<Object>} - Project details with response
 */
export async function getProjectDetails(parameters, message, apiKey) {
  const { projectName } = parameters;

  if (!projectName) {
    return {
      success: false,
      actionType: 'view_project',
      response: 'Which project would you like to know more about? I have projects like WingWatch, Real Estate Analysis, Heart Attack Analysis, and GamerverseHub.'
    };
  }

  const projects = loadProjects();
  const project = findProject(projectName, projects);

  if (!project) {
    return {
      success: false,
      actionType: 'view_project',
      response: `I couldn't find a project matching "${projectName}". Would you like to see all my projects instead?`,
      data: {
        availableProjects: projects.map(p => ({ id: p.id, name: p.name, title: p.title }))
      }
    };
  }

  // Generate detailed response using AI
  const responseText = await generateProjectResponse(project, message, apiKey);

  return {
    success: true,
    actionType: 'view_project',
    response: responseText,
    data: {
      project: {
        id: project.id,
        name: project.name,
        title: project.title,
        date: project.date,
        description: project.description,
        link: project.link,
        image: project.image,
        tags: project.tags
      }
    }
  };
}

/**
 * Generate conversational response about the project
 */
async function generateProjectResponse(project, message, apiKey) {
  const systemPrompt = `Generate a conversational response about this project.

PROJECT DETAILS:
- Title: ${project.title}
- Date: ${project.date}
- Technologies: ${project.tags.software.join(', ')}
- Skills: ${project.tags.skills.join(', ')}
- Type: ${project.tags.type.join(', ')}
- Description: ${project.description}
- Link: ${project.link}

Create a response that:
1. Introduces the project briefly
2. Highlights key technologies and skills used
3. Mentions interesting aspects or achievements
4. Provides the link to view more
5. Is conversational and engaging (max 200 words)
6. Uses markdown formatting

Generate the response:`;

  try {
    const requestBody = formatGeminiRequest(
      systemPrompt,
      message,
      {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    );

    const data = await callGoogleAI('gemini-2.5-flash', requestBody, apiKey);
    return extractResponseText(data);
  } catch (error) {
    console.error('Error generating project response:', error);
    // Fallback to simple response
    return `**${project.title}** (${project.date})\n\n${project.description}\n\n**Technologies:** ${project.tags.software.join(', ')}\n**Skills:** ${project.tags.skills.join(', ')}\n\n[View Project](${project.link})`;
  }
}
