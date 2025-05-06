/*
 * Title: Smooth Scrolling Navigation
 * Author: Adapted from various sources
 * Date: 2024
 * Availability: https://css-tricks.com/snippets/jquery/smooth-scrolling/
 * 
 * This code implements smooth scrolling functionality for navigation links
 * within the side navigation menu.
 */

document.addEventListener('DOMContentLoaded', (event) => {
    // Select all anchor tags within the element with id 'side-nav'
    document.querySelectorAll('#side-nav a').forEach(anchor => {
        // Add a click event listener to each anchor
        anchor.addEventListener('click', function (e) {
            // Prevent the default anchor click behavior
            e.preventDefault();

            // Get the target id from the href attribute
            // The substring(1) removes the '#' from the beginning of the href
            const targetId = this.getAttribute('href').substring(1);
            
            // Find the element on the page with the target id
            const targetElement = document.getElementById(targetId);

            // Scroll to the target element
            window.scrollTo({
                // Scroll to the top of the target element
                // Subtract 20 pixels to give some space at the top
                top: targetElement.offsetTop - 20,
                // Use smooth scrolling for
                behavior: 'smooth'
            });
        });
    });
});
