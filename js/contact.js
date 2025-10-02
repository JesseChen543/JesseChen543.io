(function() {
  'use strict';

  // Initialize EmailJS with your user ID (you'll need to sign up for EmailJS)
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
   * Validate the form inputs
   * @returns {boolean} - Whether the form is valid
   */
  function validateForm() {
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return false;
    }

    return true;
  }

  /**
   * Handle the form submission
   * @param {Event} event - The form submit event
   */
  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
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
      email: 'jessechen959@gmail.com', // YOUR email address as recipient
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
})();
