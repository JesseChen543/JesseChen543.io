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
            <header class="hero">
                <div class="hero-content">
                    <div class="avatar-container">
                        <img src="images/avatar.jpg" alt="Jesse Chen" class="avatar-image">
                    </div>
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

  console.log('selectedProject', selectedProject);
  // Define a single heading content regardless of project selection
  const portfolioContent = {
    'data-analyst': {
      title: 'JESSE CHEN',
      description: 'Recent IT graduate with a passion for solving complex problems. I find satisfaction in working through challenges and creating effective solutions. Excited to start my career in technology and continue developing my skills as a programmer.'
    },
    'web-design': {
      title: 'JESSE CHEN',
      description: 'Recent IT graduate with a passion for solving complex problems. I find satisfaction in working through challenges and creating effective solutions. Excited to start my career in technology and continue developing my skills as a programmer.'
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
      const href = this.getAttribute('href');
      // Only use smoothScroll for internal links starting with #
      if (href.startsWith('#')) {
        smoothScroll(href);
      } else {
        // For external links or downloads, follow the link normally
        window.location.href = href;
      }
    });
  });

  const scrollDownButton = document.querySelector('.scroll-down');
  const projectsSection = document.getElementById('projects');

  function smoothScrollToProjects() {
    projectsSection.scrollIntoView({ behavior: 'smooth' });
  }

  scrollDownButton.addEventListener('click', function(e) {
    e.preventDefault();
    smoothScrollToProjects();
  });

});
