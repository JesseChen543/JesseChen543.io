/*
 * Title: Flip Card Animation with JavaScript
 * Author: Adapted from various sources
 * Date: 2024
 * Availability: https://www.w3schools.com/howto/howto_css_flip_card.asp
 *
 * This code implements a flip card animation by toggling a CSS class
 * on click events for elements with the 'flip-container' class.
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Select all elements with the class 'flip-container'
  document.querySelectorAll('.flip-container').forEach(container => {
    // Add a click event listener to each flip container
    container.addEventListener('click', function() {
      // Toggle the 'flipped' class on the child element with class 'flipper'
      // This triggers the flip animation defined in CSS
      this.querySelector('.flipper').classList.toggle('flipped');
    });
  });
});
