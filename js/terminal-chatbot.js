/**
 * Modern Chatbot for Jesse Chen's portfolio
 * Creates a sticky chatbot icon that opens a modern chat interface
 */

document.addEventListener('DOMContentLoaded', function() {
    // Store conversation history
    let conversationHistory = [];
    // Create chatbot icon
    const chatbotIcon = document.createElement('div');
    chatbotIcon.id = 'chatbot-icon';
    chatbotIcon.innerHTML = '<i class="fas fa-comments"></i>';
    chatbotIcon.title = 'Chat with Jesse\'s AI Assistant';
    document.body.appendChild(chatbotIcon);
    
    // Create terminal container
    const terminalContainer = document.createElement('div');
    terminalContainer.id = 'terminal-container';
    terminalContainer.classList.add('hidden');
    terminalContainer.innerHTML = `
        <div class="terminal-header">
            <div class="terminal-header-content">
                <div class="chatbot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="chatbot-info">
                    <div class="chatbot-name">Jesse's AI Assistant</div>
                    <div class="chatbot-status">Online</div>
                </div>
            </div>
            <div class="terminal-buttons">
                <span class="terminal-button minimize"><i class="fas fa-minus"></i></span>
                <span class="terminal-button maximize"><i class="fas fa-expand-alt"></i></span>
                <span class="terminal-button close"><i class="fas fa-times"></i></span>
            </div>
        </div>
        <div class="terminal-body">
            <div class="terminal-output" id="terminal-output">
                <div class="welcome-message">
                    <strong>Welcome! 👋</strong>
                    Feel free to ask me questions about Jesse's background, skills, or projects. I'm here to help you get to know him better!
                </div>
            </div>
            <div class="terminal-input-line">
                <input type="text" id="terminal-input" placeholder="Type your question..." autofocus>
                <button class="send-button" id="send-button">
                    <i class="fas fa-paper-plane"></i>
                </button>
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
    const sendButton = document.getElementById('send-button');

    // Handle Enter key
    terminalInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            processCommand(this.value.trim());
            this.value = '';
        }
    });

    // Handle send button click
    sendButton.addEventListener('click', function() {
        const message = terminalInput.value.trim();
        if (message) {
            processCommand(message);
            terminalInput.value = '';
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

        // Add user message bubble to output
        const userMessageHTML = `
            <div class="message-wrapper user-message">
                <div class="message-avatar user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content">${escapeHtml(command)}</div>
            </div>
        `;
        addToTerminal(userMessageHTML);

        // Add user message to conversation history
        conversationHistory.push({ role: 'user', content: command });

        // Keep history to a reasonable length (last 10 messages)
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
        }

        // Process commands
        let response;

        if (command.toLowerCase() === 'help') {
            response = `
                <span class="command-help">Available commands:</span>
                <span class="command-list">help</span> <span class="command-list">projects</span> <span class="command-list">skills</span> <span class="command-list">about</span> <span class="command-list">contact</span> <span class="command-list">clear</span>
            `;
        } else if (command.toLowerCase() === 'clear') {
            document.getElementById('terminal-output').innerHTML = `
                <div class="welcome-message">
                    <strong>Welcome! 👋</strong>
                    Feel free to ask me questions about Jesse's background, skills, or projects. I'm here to help you get to know him better!
                </div>
            `;
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
            // AI response
            simulateTypingResponse(command);
            return;
        }

        // Add bot response
        addBotMessage(response);
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${errorText}`);
            }

            const data = await response.json();
            hideLoading(loadingId);

            // Handle action responses
            if (data.actionType) {
                handleActionResponse(data);
            } else {
                addBotMessage(data.response);
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
            const fallbackResponse = `I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later or use commands like 'help', 'projects', or 'skills' to learn more about Jesse.`;
            addBotMessage(fallbackResponse);
        }
    }

    /**
     * Handle action responses from the API
     */
    function handleActionResponse(data) {
        const { actionType, response, data: actionData } = data;

        // Always show the text response first
        addBotMessage(response);

        // Handle specific action types
        switch (actionType) {
            case 'filter_projects':
                displayFilteredProjects(actionData);
                break;

            case 'view_project':
                displayProjectDetails(actionData);
                break;

            case 'navigation':
                handleNavigationAction(actionData);
                break;

            case 'fill_contact_form':
            case 'send_email':
                handleContactFormAction(actionData);
                break;

            default:
                console.log('Unknown action type:', actionType);
        }
    }

    /**
     * Display filtered projects as interactive cards
     */
    function displayFilteredProjects(actionData) {
        if (!actionData || !actionData.projects || actionData.projects.length === 0) {
            return;
        }

        const projectsHTML = actionData.projects.map(project => `
            <div class="project-card" data-project-id="${escapeHtml(project.id)}">
                <div class="project-header">
                    <h4>${escapeHtml(project.title)}</h4>
                    <span class="project-date">${escapeHtml(project.date)}</span>
                </div>
                <p class="project-description">${escapeHtml(project.description.substring(0, 150))}...</p>
                <div class="project-tags">
                    ${project.tags.software.slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
                <a href="${escapeHtml(project.link)}" target="_blank" class="project-link">View Project →</a>
            </div>
        `).join('');

        const projectsContainer = `
            <div class="message-wrapper bot-message">
                <div class="message-avatar bot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="projects-container">
                    ${projectsHTML}
                </div>
            </div>
        `;

        addToTerminal(projectsContainer);
    }

    /**
     * Display project details card
     */
    function displayProjectDetails(actionData) {
        if (!actionData || !actionData.project) {
            return;
        }

        const project = actionData.project;
        const detailsHTML = `
            <div class="message-wrapper bot-message">
                <div class="message-avatar bot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="project-details-card">
                    <h3>${escapeHtml(project.title)}</h3>
                    <p class="project-date">${escapeHtml(project.date)}</p>
                    <p class="project-description">${escapeHtml(project.description)}</p>
                    <div class="project-tech-section">
                        <strong>Technologies:</strong>
                        <div class="project-tags">
                            ${project.tags.software.map(tag => `<span class="tag tech-tag">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                    <div class="project-skills-section">
                        <strong>Skills:</strong>
                        <div class="project-tags">
                            ${project.tags.skills.map(tag => `<span class="tag skill-tag">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                    <a href="${escapeHtml(project.link)}" target="_blank" class="project-link-button">View Full Project →</a>
                </div>
            </div>
        `;

        addToTerminal(detailsHTML);
    }

    /**
     * Handle navigation action
     */
    function handleNavigationAction(actionData) {
        if (!actionData || !actionData.section) {
            return;
        }

        // Scroll to the section
        const sectionElement = document.getElementById(actionData.section);
        if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: 'smooth' });
            // Close the chatbot after navigation
            setTimeout(() => {
                hideTerminal();
            }, 500);
        }
    }

    /**
     * Handle contact form action - scroll to form and prefill data
     */
    function handleContactFormAction(actionData) {
        if (!actionData) {
            return;
        }

        // Show visual feedback
        const hasContactInfo = actionData.contactInfo &&
            (actionData.contactInfo.name || actionData.contactInfo.email ||
             actionData.contactInfo.subject || actionData.contactInfo.message);

        if (hasContactInfo) {
            const feedbackHTML = `
                <div class="message-wrapper bot-message">
                    <div class="message-avatar bot-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="contact-action-card">
                        <div class="contact-action-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="contact-action-text">
                            <strong>Opening contact form...</strong>
                            <p>I've extracted the following information:</p>
                            <ul class="contact-info-list">
                                ${actionData.contactInfo.name ? `<li><strong>Name:</strong> ${escapeHtml(actionData.contactInfo.name)}</li>` : ''}
                                ${actionData.contactInfo.email ? `<li><strong>Email:</strong> ${escapeHtml(actionData.contactInfo.email)}</li>` : ''}
                                ${actionData.contactInfo.subject ? `<li><strong>Subject:</strong> ${escapeHtml(actionData.contactInfo.subject)}</li>` : ''}
                                ${actionData.contactInfo.message ? `<li><strong>Message:</strong> ${escapeHtml(actionData.contactInfo.message.substring(0, 80))}${actionData.contactInfo.message.length > 80 ? '...' : ''}</li>` : ''}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            addToTerminal(feedbackHTML);
        }

        // Scroll to contact section
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            setTimeout(() => {
                contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, hasContactInfo ? 500 : 0);
        }

        // Prefill form if contactInfo is provided
        if (hasContactInfo) {
            const { name, email, subject, message } = actionData.contactInfo;

            // Wait for scroll to complete, then fill form
            setTimeout(() => {
                if (name) {
                    const nameInput = document.getElementById('name');
                    if (nameInput) {
                        nameInput.value = name;
                        // Add a subtle animation
                        nameInput.style.backgroundColor = '#f0f9ff';
                        setTimeout(() => nameInput.style.backgroundColor = '', 1000);
                    }
                }

                if (email) {
                    const emailInput = document.getElementById('email');
                    if (emailInput) {
                        emailInput.value = email;
                        emailInput.style.backgroundColor = '#f0f9ff';
                        setTimeout(() => emailInput.style.backgroundColor = '', 1000);
                    }
                }

                if (subject) {
                    const subjectInput = document.getElementById('subject');
                    if (subjectInput) {
                        subjectInput.value = subject;
                        subjectInput.style.backgroundColor = '#f0f9ff';
                        setTimeout(() => subjectInput.style.backgroundColor = '', 1000);
                    }
                }

                if (message) {
                    const messageInput = document.getElementById('message');
                    if (messageInput) {
                        messageInput.value = message;
                        messageInput.style.backgroundColor = '#f0f9ff';
                        setTimeout(() => messageInput.style.backgroundColor = '', 1000);
                    }
                }

                // Focus on the first empty required field
                const nameInput = document.getElementById('name');
                const emailInput = document.getElementById('email');
                const subjectInput = document.getElementById('subject');
                const messageInput = document.getElementById('message');

                if (!nameInput.value) {
                    nameInput.focus();
                } else if (!emailInput.value) {
                    emailInput.focus();
                } else if (!subjectInput.value) {
                    subjectInput.focus();
                } else if (!messageInput.value) {
                    messageInput.focus();
                }
            }, 1200);
        }

        // Close the chatbot after a delay
        setTimeout(() => {
            hideTerminal();
        }, hasContactInfo ? 1500 : 800);
    }

    function addToTerminal(content) {
        const outputContainer = document.getElementById('terminal-output');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = content;
        outputContainer.appendChild(wrapper.firstElementChild || wrapper);
        outputContainer.scrollTop = outputContainer.scrollHeight;
    }

    function addBotMessage(content) {
        const botMessageHTML = `
            <div class="message-wrapper bot-message">
                <div class="message-avatar bot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">${content}</div>
            </div>
        `;
        addToTerminal(botMessageHTML);
    }
    
    function showLoading() {
        const outputContainer = document.getElementById('terminal-output');
        const loadingDiv = document.createElement('div');
        const loadingId = 'loading-' + Date.now();
        loadingDiv.id = loadingId;
        loadingDiv.classList.add('terminal-loading');
        loadingDiv.innerHTML = `
            <div class="message-avatar bot-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="loading-bubble">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
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
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }
        
        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
});
