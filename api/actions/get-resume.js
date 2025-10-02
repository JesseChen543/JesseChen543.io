/**
 * Get Resume Action Handler
 * Provides resume download link through chat
 */

/**
 * Handle resume download request
 * @param {Object} parameters - Parameters from intent recognition
 * @returns {Object} - Action result with download link
 */
export async function getResume(parameters = {}) {
  const format = parameters?.format || 'docx';

  // Resume file path - works in both local and production (Vercel)
  const resumePath = '/data/Jesse_Resume.docx';

  return {
    success: true,
    actionType: 'download_resume',
    response: 'Here\'s my resume! You can download it by clicking the button below.',
    data: {
      resumePath,
      format,
      downloadReady: true
    }
  };
}
