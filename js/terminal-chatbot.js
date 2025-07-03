/**
 * Terminal-style Chatbot for Jesse Chen's portfolio
 * Creates a sticky chatbot icon that opens a terminal-like interface
 */

document.addEventListener('DOMContentLoaded', function() {
    // Store conversation history
    let conversationHistory = [];
    // Create chatbot icon
    const chatbotIcon = document.createElement('div');
    chatbotIcon.id = 'chatbot-icon';
    chatbotIcon.innerHTML = '<i class="fas fa-terminal"></i>';
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
                <p><span class="terminal-prompt">jesse@portfolio:~$</span> <span class="typing-animation">Welcome to Jesse Chen's interactive terminal.</span></p>
                <p><span class="terminal-prompt">jesse@portfolio:~$</span> <span class="typing-animation">Type 'help' for available commands or ask me anything about Jesse's projects and skills.</span></p>
            </div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">jesse@portfolio:~$</span>
                <input type="text" id="terminal-input" autofocus>
            </div>
        </div>
    `;
    document.body.appendChild(terminalContainer);
    
    // Event Listeners
    chatbotIcon.addEventListener('click', toggleTerminal);
    
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
    
    // Functions
    function toggleTerminal() {
        if (terminalContainer.classList.contains('hidden')) {
            showTerminal();
        } else {
            hideTerminal();
        }
    }
    
    function showTerminal() {
        terminalContainer.classList.remove('hidden', 'minimized');
        setTimeout(() => {
            document.getElementById('terminal-input').focus();
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
        
        // Add user command to output
        addToTerminal(`<span class="terminal-prompt">jesse@portfolio:~$</span> ${command}`);
        
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
    
    async function simulateTypingResponse(command) {
        // Show thinking animation
        const loadingId = showLoading();
        
        try {
            // Call chat API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: command,
                    history: conversationHistory.slice(0, -1) // Send previous messages (excluding current)
                })
            });
            
            // Get detailed error information if available
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: 'Unknown error', details: errorText };
                }
                
                throw new Error(`API request failed: ${errorData.error || 'Unknown error'}`);
            }
            
            const data = await response.json();
            hideLoading(loadingId);
            
            // Display the AI response
            addToTerminal(`<span class="terminal-ai-response">${data.response}</span>`, true);
            
            // Add AI response to conversation history
            conversationHistory.push({ role: 'assistant', content: data.response });
        } catch (error) {
            console.error('Error calling AI service:', error);
            hideLoading(loadingId);
            
            // Fallback response in case of error
            const fallbackResponse = `I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later or use commands like 'help', 'projects', or 'skills' to learn more about Jesse.`;
            addToTerminal(`<span class="terminal-ai-response">${fallbackResponse}</span>`, true);
        }
    }
    
    function addToTerminal(content, isResponse = false) {
        const outputContainer = document.getElementById('terminal-output');
        const newLine = document.createElement('p');
        
        if (isResponse) {
            newLine.innerHTML = content;
        } else {
            newLine.innerHTML = content;
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
        loadingDiv.innerHTML = '<span class="terminal-prompt">jesse@portfolio:~$</span> <span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>';
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
