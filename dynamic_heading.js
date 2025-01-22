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
            description: "As a dedicated data analyst, I specialize in turning complex datasets into actionable insights. " +
                "With skills in statistical analysis, data visualization, and machine learning, I uncover meaningful trends " +
                "that inform business decisions. I'm proficient in Python, R, SQL, and advanced visualization tools, " +
                "and I take pride in clearly communicating my findings. My work reflects a commitment to accuracy, efficiency, " +
                "and delivering value through data-driven strategies.",
        },
        'web-design': {
            title: "WEB DESIGN PROJECT",
            description: "As a passionate website developer, I create engaging, responsive web experiences. " +
                "My expertise covers HTML, CSS, JavaScript, and React, combined with a keen eye for UI/UX design. " +
                "I craft visually appealing, intuitive interfaces that perform optimally across devices. " +
                "My approach blends creativity with technical proficiency, pushing web design boundaries to " +
                "deliver innovative solutions that engage users and meet business objectives.",
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