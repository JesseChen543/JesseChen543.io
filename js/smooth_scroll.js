/*
 * Title: Smooth Scrolling Functionality
 * Author: Adapted from various sources
 * Date: 2024
 * Availability: https://css-tricks.com/snippets/jquery/smooth-scrolling/
 *
 * This code implements smooth scrolling functionality for anchor links with the 'smooth-scroll' class.
 */

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a.smooth-scroll').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
});
