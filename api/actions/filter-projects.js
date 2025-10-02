/**
 * Filter Projects Action Handler
 * Filters and returns projects based on user criteria
 */

import path from 'path';
import fs from 'fs';
import { callGoogleAI, formatGeminiRequest, extractResponseText } from '../google-ai-proxy.js';

/**
 * Load projects data from JSON file
 */
function loadProjects() {
  try {
    const projectsPath = path.resolve(process.cwd(), 'data/projects.json');
    const projectsContent = fs.readFileSync(projectsPath, 'utf-8');
    const projectsData = JSON.parse(projectsContent);
    console.log(`Loaded ${projectsData.projects?.length || 0} projects from data file`);
    return projectsData.projects || [];
  } catch (error) {
    console.error('Error loading projects data:', error);
    return [];
  }
}

/**
 * Filter projects based on criteria
 * @param {Object} parameters - Filter parameters from intent recognition
 * @param {string} message - Original user message
 * @param {string} apiKey - Google AI API key
 * @returns {Promise<Object>} - Filtered projects with response
 */
export async function filterProjects(parameters, message, apiKey) {
  const projects = loadProjects();

  if (projects.length === 0) {
    return {
      success: false,
      actionType: 'filter_projects',
      response: 'Sorry, I couldn\'t load the projects data. Please try again later.',
      data: { projects: [] }
    };
  }

  // Use AI to extract filter criteria from natural language
  const filterCriteria = await extractFilterCriteria(message, apiKey);

  console.log('Filter criteria extracted:', filterCriteria);

  // Filter projects based on criteria
  const filteredProjects = projects.filter(project => {
    let matches = true;

    // Filter by technologies/software
    if (filterCriteria.technologies && filterCriteria.technologies.length > 0) {
      const projectTech = project.tags.software.map(t => t.toLowerCase());
      const hasTechMatch = filterCriteria.technologies.some(tech =>
        projectTech.some(pt => pt.includes(tech.toLowerCase()) || tech.toLowerCase().includes(pt))
      );
      matches = matches && hasTechMatch;
    }

    // Filter by skills
    if (filterCriteria.skills && filterCriteria.skills.length > 0) {
      const projectSkills = project.tags.skills.map(s => s.toLowerCase());
      const hasSkillMatch = filterCriteria.skills.some(skill =>
        projectSkills.some(ps => ps.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ps))
      );
      matches = matches && hasSkillMatch;
    }

    // Filter by project type
    if (filterCriteria.type && filterCriteria.type.length > 0) {
      const projectType = project.tags.type.map(t => t.toLowerCase());
      const hasTypeMatch = filterCriteria.type.some(type =>
        projectType.includes(type.toLowerCase())
      );
      matches = matches && hasTypeMatch;
    }

    // Filter by category (more flexible matching)
    if (filterCriteria.categories && filterCriteria.categories.length > 0) {
      const matchesCategory = filterCriteria.categories.some(category => {
        const cat = category.toLowerCase();

        // Check description, title, and skills
        const textMatch = project.description.toLowerCase().includes(cat) ||
                         project.title.toLowerCase().includes(cat) ||
                         project.tags.skills.some(s => s.toLowerCase().includes(cat));

        // Map common category terms to technologies
        const categoryTechMap = {
          'web': ['html', 'css', 'javascript', 'js'],
          'web development': ['html', 'css', 'javascript', 'js'],
          'data': ['python', 'r'],
          'data science': ['python', 'r'],
          'data analysis': ['python', 'r']
        };

        // Check if category maps to technologies
        const mappedTechs = categoryTechMap[cat] || [];
        const techMatch = mappedTechs.some(tech =>
          project.tags.software.some(pt => pt.toLowerCase().includes(tech))
        );

        // Also check if any part of the category matches technologies or skills
        const categoryWords = cat.split(' ');
        const partialMatch = categoryWords.some(word =>
          project.tags.software.some(pt => pt.toLowerCase().includes(word)) ||
          project.tags.skills.some(s => s.toLowerCase().includes(word))
        );

        return textMatch || techMatch || partialMatch;
      });
      matches = matches && matchesCategory;
    }

    return matches;
  });

  // Generate response text
  const responseText = await generateFilterResponse(filteredProjects, filterCriteria, message, apiKey);

  return {
    success: true,
    actionType: 'filter_projects',
    response: responseText,
    data: {
      projects: filteredProjects,
      filterCriteria,
      totalCount: filteredProjects.length
    }
  };
}

/**
 * Extract filter criteria from natural language using AI
 */
async function extractFilterCriteria(message, apiKey) {
  const systemPrompt = `Extract filter criteria from the user's message about projects.

EXTRACT:
- technologies: array of technology names (python, javascript, react, html, css, r, etc.)
- skills: array of skill names (data analysis, api, web design, predictive modeling, etc.)
- type: array of project types (individual, team)
- categories: array of general categories (web development, data science, etc.)

RESPONSE FORMAT (JSON only):
{
  "technologies": [],
  "skills": [],
  "type": [],
  "categories": []
}

Extract criteria from this message:`;

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
    console.error('Error extracting filter criteria:', error);
    // Fallback to basic keyword extraction
    return extractCriteriaFromKeywords(message);
  }
}

/**
 * Fallback: Extract criteria using keywords
 */
function extractCriteriaFromKeywords(message) {
  const lowerMessage = message.toLowerCase();
  const criteria = {
    technologies: [],
    skills: [],
    type: [],
    categories: []
  };

  // Common technologies
  const techKeywords = ['python', 'javascript', 'react', 'node', 'html', 'css', 'java', 'r', 'typescript'];
  techKeywords.forEach(tech => {
    if (lowerMessage.includes(tech)) {
      criteria.technologies.push(tech);
    }
  });

  // Common skills
  const skillKeywords = ['data analysis', 'api', 'web design', 'predictive modeling', 'data processing'];
  skillKeywords.forEach(skill => {
    if (lowerMessage.includes(skill)) {
      criteria.skills.push(skill);
    }
  });

  // Project types
  if (lowerMessage.includes('team')) criteria.type.push('team');
  if (lowerMessage.includes('individual') || lowerMessage.includes('solo')) criteria.type.push('individual');

  // Categories
  if (lowerMessage.includes('web') || lowerMessage.includes('website')) criteria.categories.push('web development');
  if (lowerMessage.includes('data') || lowerMessage.includes('analytics')) criteria.categories.push('data science');

  return criteria;
}

/**
 * Generate conversational response for filtered projects
 */
async function generateFilterResponse(projects, criteria, message, apiKey) {
  if (projects.length === 0) {
    return 'I couldn\'t find any projects matching your criteria. You can browse all my projects or try different filters!';
  }

  // Create a natural language response using AI
  const projectSummaries = projects.map(p =>
    `- ${p.title} (${p.date}): ${p.description.substring(0, 150)}...`
  ).join('\n');

  const systemPrompt = `Generate a brief, conversational response about the filtered projects.

PROJECTS FOUND:
${projectSummaries}

FILTER CRITERIA:
${JSON.stringify(criteria, null, 2)}

Create a response that:
1. States how many projects were found
2. Briefly mentions what they match
3. Lists the project titles with short descriptions
4. Is friendly and conversational (max 200 words)
5. Includes links in markdown format where applicable

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
    console.error('Error generating filter response:', error);
    // Fallback to simple response
    return `I found ${projects.length} project${projects.length > 1 ? 's' : ''} matching your criteria:\n\n${projects.map(p => `- **${p.title}**: ${p.description.substring(0, 100)}... [View Project](${p.link})`).join('\n')}`;
  }
}
