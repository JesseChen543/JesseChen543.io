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
                .hero-content h1 {
                    font-size: 4em;
                    font-weight: 700;
                    background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 20px;
                    text-shadow: 3px 3px 6px rgba(0,0,0,0.1);
                    letter-spacing: 2px;
                    animation: fadeIn 1.5s ease-out;
                    transition: all 0.5s ease;
                    cursor: pointer;
                    display: inline-block;
                    position: relative;
                }
                
                .hero-content h1:hover {
                    background: linear-gradient(45deg, #fc466b 0%, #3f5efb 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    transform: scale(1.05);
                    text-shadow: 0 0 15px rgba(106, 17, 203, 0.5);
                    letter-spacing: 3px;
                }
                
                .hero-content h1::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 3px;
                    bottom: -5px;
                    left: 50%;
                    background: linear-gradient(45deg, #fc466b 0%, #3f5efb 100%);
                    transition: all 0.5s ease;
                    transform: translateX(-50%);
                }  
                
                .hero-content h1:hover::after {
                    width: 80%;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .hero-content p {
                    font-size: 1.6em;
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 0 auto;
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
    // Define a single heading content regardless of project selection
    const portfolioContent = {
        'data-analyst': {
            title: "JESSE CHEN",
            description: "Recent IT graduate with a passion for solving complex problems. I find satisfaction in working through challenges and creating effective solutions. Excited to start my career in technology and continue developing my skills as a programmer."
        },
        'web-design': {
            title: "JESSE CHEN",
            description: "Recent IT graduate with a passion for solving complex problems. I find satisfaction in working through challenges and creating effective solutions. Excited to start my career in technology and continue developing my skills as a programmer."
        }
    };
    // Get content based on selected project, or use a default if not found
    const content = portfolioContent[selectedProject] || portfolioContent['data-analyst'];

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