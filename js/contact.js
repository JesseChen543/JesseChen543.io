(function() {
  'use strict';

  // Initialize EmailJS with your user ID 
  // This will be initialized once the script loads
  const initEmailJS = () => {
    if (typeof emailjs !== 'undefined') {
      // Updated initialization method for EmailJS v3
      emailjs.init({
        publicKey: 'Y88cQ4BFSgiHhYzpt',
      });
    } else {
      console.error('EmailJS library not loaded');
    }
  };

  // Call initialization when window loads
  window.onload = initEmailJS;

  // Get form and status elements
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  /**
   * Display a status message to the user
   * @param {string} message - The message to display
   * @param {string} type - The type of message ('success' or 'error')
   */
  function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = type;
    formStatus.style.display = 'block';

    // Hide the message after 5 seconds if it's a success message
    if (type === 'success') {
      setTimeout(() => {
        formStatus.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Clear all form inputs
   */
  function clearForm() {
    contactForm.reset();
  }

  /**
   * Validate email with backend API
   * @param {string} email - The email to validate
   * @returns {Promise<boolean>} - Whether the email is valid
   */
  async function validateEmailBackend(email) {
    try {
      const response = await fetch('/api/validate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error validating email:', error);
      // If validation API fails, allow submission (fail open)
      return { valid: true, message: 'Could not verify email' };
    }
  }

  /**
   * Validate the form inputs
   * @returns {Promise<boolean>} - Whether the form is valid
   */
  async function validateForm() {
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Basic format check
    if (!emailRegex.test(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return false;
    }

    // Check if email domain exists
    showStatus('Validating email...', 'success');
    const emailValidation = await validateEmailBackend(email);

    if (!emailValidation.valid) {
      const errorMsg = emailValidation.message || 'Email domain does not exist. Please check your email address.';
      showStatus(errorMsg, 'error');
      return false;
    }

    return true;
  }

  /**
   * Handle the form submission
   * @param {Event} event - The form submit event
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    // Show loading status
    showStatus('Sending...', 'success');

    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Debug form input values
    console.log('Form data collected:', {
      name,
      email,
      subject,
      message
    });

    // 1. Auto-reply parameters - matches your template shown in the screenshot
    const autoReplyParams = {
      to_name: name, // Person's name for greeting in the template
      from_name: 'Jesse Chen',
      message: message,
      email: email, // Recipient email (the person who filled out the form)
      subject: subject // Adding subject as it might be needed by the template
    };

    // Debug auto-reply parameters
    console.log('Auto-reply parameters:', JSON.stringify(autoReplyParams, null, 2));

    // 2. Notification parameters - sends you an email with their contact info
    // Using the same template but with your email as recipient
    const notificationParams = {
      to_name: 'Jesse',
      from_name: 'Portfolio Contact Form',
      email: 'jessechen959@gmail.com', 
      subject: `[Portfolio Contact] ${subject}`,
      message: `Hi Jesse,\n\nSomeone sent you an email via https://jesse-chen543-io.vercel.app/\n\nSender's Name: ${name}\nSender's Email: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      reply_to: email // So you can easily reply to them
    };

    // Debug notification parameters
    console.log('Notification parameters:', JSON.stringify(notificationParams, null, 2));

    console.log('Sending auto-reply email to:', email);
    // First send the auto-reply
    emailjs.send('service_q2r2twm', 'template_etb3h1t', autoReplyParams)
      .then((response) => {
        console.log('Auto-reply sent successfully!', response);
        console.log('Auto-reply status:', response.status);
        console.log('Auto-reply text:', response.text);

        // Log which template parameters might be missing
        console.log('Checking your EmailJS template parameters:');
        console.log('- to_name present:', Object.prototype.hasOwnProperty.call(autoReplyParams, 'to_name'));
        console.log('- from_name present:', Object.prototype.hasOwnProperty.call(autoReplyParams, 'from_name'));
        console.log('- email present:', Object.prototype.hasOwnProperty.call(autoReplyParams, 'email'));
        console.log('- message present:', Object.prototype.hasOwnProperty.call(autoReplyParams, 'message'));
        console.log('- subject present:', Object.prototype.hasOwnProperty.call(autoReplyParams, 'subject'));

        // Then send you the notification - without using the template
        // service_q2r2twm is your EmailJS service ID
        return emailjs.send('service_q2r2twm', 'template_150s0n3', notificationParams);
      })
      .then((response) => {
        console.log('Notification email sent to Jesse successfully!', response);
        console.log('Notification status:', response.status);
        console.log('Notification text:', response.text);
        showStatus('Your message has been sent. Thank you!', 'success');
        clearForm();
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        console.error('Error details:', error.text || 'No additional error details');
        showStatus('Failed to send message. Please try again later.', 'error');
      });
  }

  // Add event listener to form submission
  if (contactForm) {
    contactForm.addEventListener('submit', handleSubmit);
  }

  /**
   * AI Polish Feature
   * Polishes the message textarea content using AI
   */
  const polishBtn = document.getElementById('polish-btn');
  const messageTextarea = document.getElementById('message');
  const polishStatus = document.getElementById('polish-status');

  /**
   * Show polish status message
   * @param {string} message - Status message to display
   * @param {string} type - Message type ('loading', 'success', 'error')
   */
  function showPolishStatus(message, type) {
    polishStatus.textContent = message;
    polishStatus.className = `polish-status ${type}`;
    polishStatus.style.display = 'block';

    // Hide after 3 seconds for non-loading messages
    if (type !== 'loading') {
      setTimeout(() => {
        polishStatus.style.display = 'none';
      }, 3000);
    }
  }

  /**
   * Handle AI polish button click
   */
  async function handlePolish() {
    const originalMessage = messageTextarea.value.trim();

    // Validate that there's content to polish
    if (!originalMessage) {
      showPolishStatus('Please enter a message first', 'error');
      return;
    }

    // Minimum length check
    if (originalMessage.length < 10) {
      showPolishStatus('Message too short to polish', 'error');
      return;
    }

    // Disable button and show loading
    polishBtn.disabled = true;
    polishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Polishing...';
    showPolishStatus('AI is polishing your message...', 'loading');

    try {
      // Call polish API
      const response = await fetch('/api/polish-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: originalMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to polish message');
      }

      const data = await response.json();

      // Update textarea with polished message
      messageTextarea.value = data.polished;

      // Add a subtle animation
      messageTextarea.style.backgroundColor = '#f0f9ff';
      setTimeout(() => {
        messageTextarea.style.backgroundColor = '';
      }, 1000);

      showPolishStatus('Message polished successfully!', 'success');

    } catch (error) {
      console.error('Error polishing message:', error);
      showPolishStatus('Failed to polish message. Please try again.', 'error');
    } finally {
      // Re-enable button
      polishBtn.disabled = false;
      polishBtn.innerHTML = '<i class="fas fa-magic"></i> AI Polish';
    }
  }

  // Add event listener to polish button
  if (polishBtn && messageTextarea) {
    polishBtn.addEventListener('click', handlePolish);
  }
})();
