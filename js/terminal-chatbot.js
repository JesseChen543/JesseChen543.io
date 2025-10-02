/**
 * Terminal-style Chatbot for Jesse Chen's portfolio
 * Creates a sticky chatbot icon that opens a terminal-like interface
 */

document.addEventListener('DOMContentLoaded', function() {
  // Store conversation history
  let conversationHistory = [];
  // Store session context for multi-turn actions (like email flow)
  let sessionContext = {};
  // Create chatbot icon
  const chatbotIcon = document.createElement('div');
  chatbotIcon.id = 'chatbot-icon';
  chatbotIcon.innerHTML = '<i class="fas fa-robot"></i>';
  document.body.appendChild(chatbotIcon);

  // Create terminal container
  const terminalContainer = document.createElement('div');
  terminalContainer.id = 'terminal-container';
  terminalContainer.classList.add('hidden');
  terminalContainer.innerHTML = `
        <div class="terminal-header">
            <div class="terminal-buttons">
                <span class="terminal-button close"></span>
                <span class="terminal-button minimize"></span>
                <span class="terminal-button maximize"></span>
            </div>
            <div class="terminal-title">JESSE_CHEN.terminal</div>
        </div>
        <div class="terminal-body">
            <div class="terminal-output" id="terminal-output">
                <p><span class="terminal-prompt">virtual-assistant@jesse:~$</span> <span class="multiline-message">Welcome to Jesse Chen's interactive terminal.</span></p>
                <p><span class="terminal-prompt">virtual-assistant@jesse:~$</span> <span class="multiline-message">I'm more than just an AI chatbot! Jesse implemented the<br>trendy AI workflow to make me action-driven.<br><br>I can perform every action you can do on this website:<br>📧 Send Jesse an email<br>📄 Download his resume<br>🔍 Filter and explore projects<br>💬 Answer questions about his background & skills<br><br>Try asking me to "send an email" or "show me web projects"!</span></p>
            </div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">virtual-assistant@jesse:~$</span>
                <input type="text" id="terminal-input" autofocus>
            </div>
        </div>
    `;
  document.body.appendChild(terminalContainer);

  // Event Listeners
  chatbotIcon.addEventListener('click', function(e) {
    // Stop propagation to prevent the document click handler from firing
    e.stopPropagation();
    toggleTerminal();
  });

  const closeButton = terminalContainer.querySelector('.terminal-button.close');
  closeButton.addEventListener('click', hideTerminal);

  const minimizeButton = terminalContainer.querySelector('.terminal-button.minimize');
  minimizeButton.addEventListener('click', minimizeTerminal);

  const maximizeButton = terminalContainer.querySelector('.terminal-button.maximize');
  maximizeButton.addEventListener('click', maximizeTerminal);

  const terminalInput = document.getElementById('terminal-input');
  terminalInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      processCommand(this.value.trim());
      this.value = '';
    }
  });

  // Make terminal draggable
  makeDraggable(terminalContainer);

  // Close terminal when clicking outside of it
  let clickOutsideEnabled = true;
  document.addEventListener('click', function(e) {
    // Only if terminal is visible and click-outside is enabled
    if (!terminalContainer.classList.contains('hidden') && clickOutsideEnabled) {
      // Check if click is outside both the terminal and the chatbot icon
      if (!terminalContainer.contains(e.target) && e.target !== chatbotIcon && !chatbotIcon.contains(e.target)) {
        hideTerminal();
      }
    }
  });

  // Prevent click-through on terminal container
  terminalContainer.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // Functions
  function toggleTerminal() {
    if (terminalContainer.classList.contains('hidden')) {
      showTerminal();
    } else {
      hideTerminal();
    }
  }

  function showTerminal() {
    // Temporarily disable click-outside to prevent immediate closing
    clickOutsideEnabled = false;
    terminalContainer.classList.remove('hidden', 'minimized');
    setTimeout(() => {
      document.getElementById('terminal-input').focus();
      // Re-enable click-outside after a short delay
      clickOutsideEnabled = true;
    }, 300);
  }

  function hideTerminal() {
    terminalContainer.classList.add('hidden');
  }

  function minimizeTerminal() {
    terminalContainer.classList.add('minimized');
    terminalContainer.classList.remove('maximized');
  }

  function maximizeTerminal() {
    terminalContainer.classList.remove('minimized');
    terminalContainer.classList.toggle('maximized');
  }

  function processCommand(command) {
    if (!command) return;

    // Add user command to output with sanitization
    const sanitizedCommand = sanitizeHTML(command);
    addToTerminal(`<span class="terminal-prompt">virtual-assistant@jesse:~$</span> ${sanitizedCommand}`, false, true);

    // Add user message to conversation history
    conversationHistory.push({ role: 'user', content: command });

    // Keep history to a reasonable length (last 6 messages)
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    // Process commands
    let response;

    if (command.toLowerCase() === 'help') {
      response = `
                <span class="command-help">Available commands:</span>
                <span class="command-list">help</span> - Display available commands
                <span class="command-list">projects</span> - List Jesse's key projects
                <span class="command-list">skills</span> - List Jesse's technical skills
                <span class="command-list">about</span> - Information about Jesse Chen
                <span class="command-list">contact</span> - Get contact information
                <span class="command-list">clear</span> - Clear terminal output
            `;
    } else if (command.toLowerCase() === 'clear') {
      document.getElementById('terminal-output').innerHTML = '';
      return;
    } else if (command.toLowerCase() === 'projects') {
      response = `
                <span class="command-help">Jesse's Key Projects:</span>
                <span class="project-item">• Birdwatching website (Wingwatch) - Backend development with APIs</span>
                <span class="project-item">• Real Estate Analysis - Python data analysis project</span>
                <span class="project-item">• GamerverseHub - Gaming platform connecting gamers</span>
                <span class="project-item">• Heart Attack Analysis - Data analytics with R</span>
                
                Type the project name to learn more.
            `;
    } else if (command.toLowerCase() === 'skills') {
      response = `
                <span class="command-help">Technical Skills:</span>
                <span class="skill-category">Programming:</span> JavaScript, Python, R, HTML/CSS
                <span class="skill-category">Data:</span> Data processing, Analysis, Predictive modeling
                <span class="skill-category">Web:</span> API integration, Website optimization, Responsive design
                <span class="skill-category">Soft Skills:</span> Team collaboration, User research, Project management
            `;
    } else if (command.toLowerCase() === 'about') {
      response = `
                <span class="command-help">About Jesse Chen:</span>
                Recent IT graduate with a passion for solving complex problems.
                Specializes in web development, data analysis, and creating interactive user experiences.
                Seeking opportunities to apply technical skills in challenging environments.
            `;
    } else if (command.toLowerCase() === 'contact') {
      response = `
                <span class="command-help">Contact Information:</span>
                <span class="contact-item">• Email: [Your email here]</span>
                <span class="contact-item">• LinkedIn: [Your LinkedIn profile]</span>
                <span class="contact-item">• GitHub: https://github.com/JesseChen543</span>
            `;
    } else {
      // Simulated AI response
      simulateTypingResponse(command);
      return;
    }

    // Add response with typing animation
    addToTerminal(response, true);
  }

  // terminal-chatbot.js (partial update in simulateTypingResponse)
  async function saveChatWithRetry(data, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('/api/save-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Attempt ${attempt} failed: ${errorText}`);
        }
        console.log('Chat conversation saved to database');
        return;
      } catch (error) {
        console.error(`Retry ${attempt}/${maxRetries}:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async function simulateTypingResponse(command) {
    const loadingId = showLoading();
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: command,
          history: conversationHistory.slice(0, -1),
          sessionContext: sessionContext,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${errorText}`);
      }

      const data = await response.json();
      hideLoading(loadingId);

      // Update session context if returned from server
      if (data.sessionContext) {
        sessionContext = data.sessionContext;
      }

      // Check if this is an action response with special rendering
      if (data.actionType) {
        renderActionResponse(data);
      } else {
        addToTerminal(`<span class="terminal-ai-response">${data.response}</span>`, true);
      }

      conversationHistory.push({ role: 'assistant', content: data.response });

      await saveChatWithRetry({
        userMessage: command,
        aiResponse: data.response,
        userInfo: {
          referrer: document.referrer,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error calling AI service or saving chat:', error);
      hideLoading(loadingId);
      const fallbackResponse = 'I\'m sorry, I\'m having trouble connecting to my AI services right now. Please try again later or use commands like \'help\', \'projects\', or \'skills\' to learn more about Jesse.';
      addToTerminal(`<span class="terminal-ai-response">${fallbackResponse}</span>`, true);
    }
  }

  /**
     * Render action responses with interactive card UI
     */
  function renderActionResponse(data) {
    const { actionType, response, data: actionData } = data;

    // Always show the text response first
    if (response) {
      addToTerminal(`<span class="terminal-ai-response">${response}</span>`, true);
    }

    // Render action-specific card UI
    switch (actionType) {
    case 'download_resume':
      renderResumeCard(actionData);
      break;
    case 'filter_projects':
      renderProjectsCard(actionData);
      break;
    case 'view_project':
      renderProjectDetailCard(actionData);
      break;
    case 'navigation':
      handleNavigation(actionData);
      break;
    case 'fill_contact_form':
      // Scroll to contact form and fill in extracted info
      fillContactForm(actionData.contactInfo);
      break;
    case 'send_email_ready':
      // Email data collected, send via EmailJS
      sendEmailViaEmailJS(actionData.emailData);
      break;
    default:
      // For other action types, just show the response
      break;
    }
  }

  /**
     * Fill contact form and scroll to it
     */
  function fillContactForm(contactInfo) {
    // Scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Fill in the form fields
    setTimeout(() => {
      if (contactInfo.name) {
        const nameField = document.getElementById('name');
        if (nameField) nameField.value = contactInfo.name;
      }
      if (contactInfo.email) {
        const emailField = document.getElementById('email');
        if (emailField) emailField.value = contactInfo.email;
      }
      if (contactInfo.subject) {
        const subjectField = document.getElementById('subject');
        if (subjectField) subjectField.value = contactInfo.subject;
      }
      if (contactInfo.message) {
        const messageField = document.getElementById('message');
        if (messageField) messageField.value = contactInfo.message;
      }

      // Focus on the first empty field or the submit button
      const nameField = document.getElementById('name');
      if (nameField && !nameField.value) {
        nameField.focus();
      } else {
        const emailField = document.getElementById('email');
        if (emailField && !emailField.value) {
          emailField.focus();
        } else {
          // All fields filled, highlight the submit button
          const submitButton = document.querySelector('#contact-form button[type="submit"]');
          if (submitButton) {
            submitButton.focus();
            submitButton.style.animation = 'pulse 1s ease-in-out 3';
          }
        }
      }

      addToTerminal('<span class="terminal-ai-response">✅ Form filled! Please review and click "Send Message" to submit.</span>', true);
    }, 1000);
  }

  /**
     * Send email using EmailJS (reuses existing contact form setup)
     */
  async function sendEmailViaEmailJS(emailData) {
    try {
      // Check if EmailJS is loaded
      if (typeof emailjs === 'undefined') {
        console.error('EmailJS library not loaded');
        throw new Error('EmailJS library not loaded');
      }

      // Initialize EmailJS (matching js/contact.js configuration)
      emailjs.init({ publicKey: 'Y88cQ4BFSgiHhYzpt' });

      // EmailJS configuration from js/contact.js
      const serviceId = 'service_q2r2twm';
      const autoReplyTemplateId = 'template_etb3h1t';
      const notificationTemplateId = 'template_150s0n3';

      // Auto-reply parameters
      const autoReplyParams = {
        to_name: emailData.name,
        from_name: 'Jesse Chen',
        message: emailData.message,
        email: emailData.email,
        subject: emailData.subject
      };

      // Notification parameters
      const notificationParams = {
        to_name: 'Jesse',
        from_name: 'Portfolio Contact Form',
        email: 'jessechen959@gmail.com',
        subject: `[Portfolio Contact] ${emailData.subject}`,
        message: `Hi Jesse,\n\nSomeone sent you an email via chatbot.\n\nSender's Name: ${emailData.name}\nSender's Email: ${emailData.email}\nSubject: ${emailData.subject}\n\nMessage:\n${emailData.message}`,
        reply_to: emailData.email
      };

      // Send auto-reply
      await emailjs.send(serviceId, autoReplyTemplateId, autoReplyParams);

      // Send notification
      await emailjs.send(serviceId, notificationTemplateId, notificationParams);

      addToTerminal('<span class="terminal-ai-response">✅ Your message has been sent successfully! Jesse will get back to you soon.</span>', true);
    } catch (error) {
      console.error('Error sending email:', error);
      addToTerminal('<span class="terminal-ai-response">❌ Sorry, there was an error sending your message. Please try again or use the contact form.</span>', true);
    }
  }

  /**
     * Render resume download card
     */
  function renderResumeCard(data) {
    const { resumePath, format } = data;
    const displayFormat = format ? format.toUpperCase() : 'DOCX';
    const cardHTML = `
        <div class="action-card resume-card">
          <div class="card-icon">📄</div>
          <div class="card-content">
            <h3>Jesse's Resume (${displayFormat})</h3>
            <p>Click below to download</p>
            <a href="${resumePath}" download="Jesse_Chen_Resume.${format || 'docx'}" class="card-button">
              <i class="fas fa-download"></i> Download Resume
            </a>
          </div>
        </div>
      `;
    addToTerminal(cardHTML, true);
  }

  /**
     * Render filtered projects card
     */
  function renderProjectsCard(data) {
    const { projects, totalCount } = data;

    if (!projects || projects.length === 0) {
      return;
    }

    const projectsHTML = projects.map(project => `
        <div class="project-card-item">
          <h4>${project.title}</h4>
          <p class="project-date">${project.date}</p>
          <p class="project-description">${project.description.substring(0, 120)}...</p>
          <div class="project-tags">
            ${project.tags.software.map(tag => `<span class="tag software-tag">${tag}</span>`).join('')}
          </div>
          <a href="${project.link}" target="_blank" class="card-button-small">View Project →</a>
        </div>
      `).join('');

    const cardHTML = `
        <div class="action-card projects-card">
          <div class="card-header">
            <div class="card-icon">🚀</div>
            <h3>${totalCount} Project${totalCount > 1 ? 's' : ''} Found</h3>
          </div>
          <div class="projects-grid">
            ${projectsHTML}
          </div>
        </div>
      `;
    addToTerminal(cardHTML, true);
  }

  /**
     * Render project detail card
     */
  function renderProjectDetailCard(data) {
    const { project } = data;

    if (!project) {
      return;
    }

    const cardHTML = `
        <div class="action-card project-detail-card">
          <div class="card-header">
            <div class="card-icon">💼</div>
            <h3>${project.title}</h3>
          </div>
          <div class="card-content">
            <p class="project-date">${project.date}</p>
            <p class="project-description">${project.description}</p>
            <div class="project-meta">
              <div class="meta-section">
                <strong>Technologies:</strong>
                <div class="project-tags">
                  ${project.tags.software.map(tag => `<span class="tag software-tag">${tag}</span>`).join('')}
                </div>
              </div>
              <div class="meta-section">
                <strong>Skills:</strong>
                <div class="project-tags">
                  ${project.tags.skills.map(tag => `<span class="tag skill-tag">${tag}</span>`).join('')}
                </div>
              </div>
            </div>
            <a href="${project.link}" target="_blank" class="card-button">
              <i class="fas fa-external-link-alt"></i> View Full Project
            </a>
          </div>
        </div>
      `;
    addToTerminal(cardHTML, true);
  }

  /**
     * Handle navigation action
     */
  function handleNavigation(data) {
    const { section } = data;
    // Scroll to section on the page
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Sanitize HTML to prevent XSS attacks
   */
  function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  function addToTerminal(content, isResponse = false, allowHTML = false) {
    const outputContainer = document.getElementById('terminal-output');
    const newLine = document.createElement('p');

    if (isResponse || allowHTML) {
      // Allow HTML for AI responses and formatted content
      newLine.innerHTML = content;
    } else {
      // Sanitize user input to prevent XSS
      newLine.textContent = content;
    }

    outputContainer.appendChild(newLine);
    outputContainer.scrollTop = outputContainer.scrollHeight;
  }

  function showLoading() {
    const outputContainer = document.getElementById('terminal-output');
    const loadingDiv = document.createElement('p');
    const loadingId = 'loading-' + Date.now();
    loadingDiv.id = loadingId;
    loadingDiv.classList.add('terminal-loading');
    loadingDiv.innerHTML = '<span class="terminal-prompt">virtual-assistant@jesse:~$</span> <span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>';
    outputContainer.appendChild(loadingDiv);
    outputContainer.scrollTop = outputContainer.scrollHeight;
    return loadingId;
  }

  function hideLoading(loadingId) {
    const loadingDiv = document.getElementById(loadingId);
    if (loadingDiv) loadingDiv.remove();
  }

  function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.terminal-header');

    if (header) {
      header.onmousedown = dragMouseDown;
    } else {
      element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // Get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // Call a function whenever the cursor moves
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // Calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // Set the element's new position
      element.style.top = (element.offsetTop - pos2) + 'px';
      element.style.left = (element.offsetLeft - pos1) + 'px';
    }

    function closeDragElement() {
      // Stop moving when mouse button is released
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
});
