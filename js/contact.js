(function() {
  'use strict';

  // Initialize EmailJS with your user ID (you'll need to sign up for EmailJS)
  // This will be initialized once the script loads
  const initEmailJS = () => {
    if (typeof emailjs !== 'undefined') {
      // Replace with your actual EmailJS user ID when you create an account
      emailjs.init("YsR_1Ave_sEtBkq74");
    } else {
      console.error("EmailJS library not loaded");
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
    
    // Prepare template parameters for EmailJS
    const templateParams = {
      from_name: name,
      from_email: email,
      subject: subject,
      message: message,
      to_email: 'jessechen959@gmail.com'
    };
    
    // Send the email using EmailJS
    emailjs.send('service_q2r2twm', 'template_contact_form', templateParams)
      .then((response) => {
        console.log('Email sent successfully!', response);
        showStatus('Your message has been sent. Thank you!', 'success');
        clearForm();
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        showStatus('Failed to send message. Please try again later.', 'error');
      });
  }

  // Add event listener to form submission
  if (contactForm) {
    contactForm.addEventListener('submit', handleSubmit);
  }
})();
