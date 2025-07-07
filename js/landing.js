/*
 * Title: Landing Page Interactivity
 * Author: Adapted from various sources
 * Date: 2024
 * Availability: https://css-tricks.com/sticky-smooth-active-nav/
 * 
 * This code implements smooth scrolling, active navigation highlighting,
 * and topic selection functionality for a landing page.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('#nav-menu a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Highlight active section in navigation
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('#nav-menu a');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Interactivity for interest selector
    const topics = document.querySelectorAll('.topic');

    topics.forEach(topic => {
        topic.addEventListener('click', () => {
            const topicName = topic.dataset.topic;

            // Unselect all topics
            topics.forEach(t => {
                t.classList.remove('selected');
            });

            // Select the clicked topic
            topic.classList.add('selected');

            // Store the selected project in localStorage
            localStorage.setItem('selectedProject', topicName);

            console.log("Stored project: ", topicName); // Debug log

            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = 'portfolio.html';
            }, 300); // 300ms delay for visual feedback
        });
    });
});
