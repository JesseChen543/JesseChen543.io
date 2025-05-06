/*
 * Title: Dynamic Header Creation with Project-Specific Content
 * Author: Adapted from various sources
 * Date: 2024
 * Availability: https://www.w3schools.com/howto/howto_js_sticky_header.asp
 * 
 * This code creates a dynamic header based on the selected project,
 * implements smooth scrolling, and handles scroll events.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to create the dynamic header
    function createDynamicHeader(title, description) {
        const headerHtml = `
            <style>
                .hero-content p {
                    font-size: 1.8em;
                    line-height: 1.6;
                }
            </style>
            <header class="hero">
                <div class="hero-content">
                    <h1>${title}</h1>
                    <p>${description}</p>
                    <div class="scroll-down">
                        <a href="#content"><span></span></a>
                    </div>
                </div>
            </header>
        `;

        document.getElementById('dynamic-header').innerHTML = headerHtml;
    }

    // Get the selected project from localStorage
    const selectedProject = localStorage.getItem('selectedProject');

    console.log("selectedProject", selectedProject);    
    // Define content based on the selected project
    const portfolioContent = {
        'data-analyst': {
            title: "JESSE THE ANALYST",
            description: "I’m a data analyst who loves digging into numbers to find stories that help businesses make smart moves. " +
                "Whether it’s crunching data with Python, R, or SQL, or creating clear visuals to show what’s going on, " +
                "I focus on making insights easy to understand and act on. I enjoy the challenge of spotting trends and patterns, " +
                "and I’m all about getting things right while keeping it practical and useful. Oh, and this website? It’s vibe-coded.",
        },
        'web-design': {
            title: "JESSE THE WEB DEVELOPER",
            description: "I’m a web developer who gets a kick out of building websites that look great and work smoothly. " +
                "Using HTML, CSS, JavaScript, and React, I create sites that are easy to use and feel just right on any device. " +
                "I love blending clean design with solid code to make something that not only pops visually but also gets the job done. " +
                "My goal is to create web experiences that users enjoy and businesses can count on. And yeah, this website is vibe-coded.",
        }
    };

    // Get content based on selected project, or use deco7180 as default if not found
    const content = portfolioContent[selectedProject];

    createDynamicHeader(content.title, content.description);

    // Smooth scrolling logic
    function smoothScroll(target) {
        const element = document.querySelector(target);
        window.scrollTo({
            top: element.offsetTop,
            behavior: 'smooth'
        });
    }
    // Add event listeners for navigation links
    const navLinks = document.querySelectorAll('#nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            smoothScroll(this.getAttWribute('href'));
        });
    });

    const scrollDownButton = document.querySelector('.scroll-down');
    const projectsSection = document.getElementById('projects');
    let hasScrolled = false;

    function smoothScrollToProjects() {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
    }

    scrollDownButton.addEventListener('click', function(e) {
        e.preventDefault();
        smoothScrollToProjects();
        hasScrolled = true;
    });

});