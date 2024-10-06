document.addEventListener('DOMContentLoaded', function() {
    // Function to create the dynamic header
    function createDynamicHeader(title, description) {
        const headerHtml = `
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
            description: "Showcasing data analyst projects demonstrating skills in data interpretation, analysis, and visualization using various tools.",
        },
        'deco7140': {
            title: "DECO7140 TEAM PROJECT",
            description: "A collaborative project for a birdwatch website, highlighting web development and teamwork skills.",
        },
        'web-design': {
            title: "WEB DESIGN PROJECT",
            description: "Featuring creative and responsive web design projects, showcasing UI/UX skills and modern web technologies.",
        }
    };

    // Get content based on selected project, or use deco7140 as default if not found
    const content = portfolioContent[selectedProject] || portfolioContent["deco7140"];

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