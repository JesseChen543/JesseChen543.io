/*
 * Title: Dynamic Project Display using JavaScript
 * Author: Adapted from various sources
 * Date: 2024
 * Availability: https://stackoverflow.com/questions/1533568/what-is-the-correct-way-to-write-html-using-javascript
 * 
 * This code dynamically generates HTML content for project display using JavaScript.
 * It demonstrates best practices for creating and manipulating DOM elements.
 */

// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', function() {
    // Retrieve the selected project from local storage
    const selectedProject = localStorage.getItem('selectedProject');
    // Get references to the container elements for featured and regular posts
    const featuredPostContainer = document.getElementById('featured-post');
    const regularPostsContainer = document.getElementById('regular-posts');

    // Define the key projects object with project details
    const key_projects = {
        'deco7180': {
            title: "Birdwatching website",
            date: "October, 2024",
            description: "As a key team member in the Wingwatch website project, I spearheaded the backend development. " +
                "My responsibilities included integrating data retrieval from the Wildlife API, implementing Google Maps API " +
                "to visualize bird location data, and developing algorithms to filter and enhance information, improving overall user experience. " +
                "To learn more about our design process and development journey, check out our detailed project breakdown on the " +
                "<a href='wingwatch_process.html' target='_blank'><strong>Wingwatch development Process</strong></a> page.",
            link: "wingwatch_process.html",
            image: "pictures/wingwatch.png",
            tags: {
                software: ["javascript"],
                skills: ["data processing", "api", "website optimization", "user research"],
                type: ["team"]
            }
        },
        'data-analyst': {
            title: "Real Estate Analysis with python",
            date: "April, 2022",
            description: "The goal of this project is to gain insight into the features that influence the length of time " +
                "a property stays on the market, and to create predictive models for this purpose.",
            link: "https://jessechen543.github.io/ESTATE_ANALYSIS/",
            image: "pictures/ESTATE_ANA_PIC.png",
            tags: {
                software: ["python"],
                skills: ["data analysis", "predictive modeling"],
                type: ["individual"]
            }
        }
    };

    // Combine key projects with additional projects
    const all_projects = {
        ...key_projects,
        'web-design': {
            title: "Gaming platform-GamerverseHub",
            date: "September, 2023",
            description: "GamerverseHub functions as a gaming platform aimed at connecting gamers worldwide. " +
                "It fosters interaction among gamers through various features including events, streams, " +
                "discussions, and gaming opportunities.",
            link: "https://jessechen543.github.io/Gamerversehub/",
            isEmbedded: true,
            tags: {
                software: ["html", "css", "javascript"],
                skills: ["api"],
                type: ["individual"]
            }
        },
        'heart-attack-analysis': {
            title: "Heart Attack Analysis with R",
            date: "April, 2022",
            description: "This project involved using data analytics to predict heart attacks using a dataset of 300 observations " +
                "and 20 variables, resulting in achieving finalist status in a competition hosted by BANA and presenting findings " +
                "to judges from Deloitte, KPMG, and UQ.",
            link: "https://jessechen543.github.io/Heart_attack_analysis_Jesse/",
            image: "pictures/heart attack analysis.png",
            tags: {
                software: ["R"],
                skills: ["data analytics", "predictive modeling"],
                type: ["individual"]
            }
        },
        'kpmg-internship': {
            title: "KPMG Data Analytics consulting virtual internship",
            date: "January, 2022",
            description: "I participated in the KPMG Virtual Experience Program, completing data quality assessments, " +
                "implementing RFM analysis, and presenting my findings through a well-structured PowerPoint presentation " +
                "and interactive Excel dashboards.",
            link: "https://jessechen543.github.io/churnrate_analysis/",
            image: "pictures/imgae for kpmg project.png",
            tags: {
                software: ["Excel"],
                skills: ["data analytics", "RFM analysis"],
                type: ["individual"]
            }
        },
        'ai-career-assistance': {
            title: "Resume AI Career Assistance Wireframe Design",
            date: "January, 2023",
            description: "As the business analyst for this project, I analyzed the demand and created a logic flow chart " +
                "and requirement tickets. Using Figma, I designed a wireframe for a Resume AI Career Assistance feature " +
                "on a recruitment platform.",
            link: "https://www.figma.com/file/K670eaQ8qW2GflPw8ClybR/JobPin-AI-career-assistance?node-id=0%3A1&t=WA7n1Cqggs2HwOUk-1",
            image: "pictures/AI career assistance wireframe.png",
            tags: {
                software: ["Figma"],
                skills: ["business analysis", "wireframe"],
                type: ["individual"]
            }
        }
    };

    // Function to create media content (embedded site or image) for a project
    function createMediaContent(project, isFeatured = false) {
        if (project.isEmbedded) {
            return `
                <a href="${project.link}" target="_blank" class="embedded-site">
                    <iframe src="${project.link}" title="${project.title}" width="100%" 
                    height="${isFeatured ? '500px' : '300px'}" allow="autoplay; 
                    encrypted-media" allowfullscreen muted></iframe>
                </a>`;
        } else {
            return `
                <a href="${project.link}" target="_blank" class="${isFeatured ? 'image main' : 'image fit'}">
                    <img src="${project.image}" alt="${project.title}" />
                </a>`;
        }
    }

    // Function to create HTML for tags as labels
    function createTags(tags) {
        // Combine all tags into a single array
        const allTags = [
            ...tags.software.map(tag => ({ text: tag, category: 'software' })),
            ...tags.skills.map(tag => ({ text: tag, category: 'skills' })),
            ...tags.type.map(tag => ({ text: tag, category: 'type' }))
        ];

        return `
            <div class="tags-container">
                ${allTags.map(tag => `
                    <span class="tag-label ${tag.category}-tag">
                        ${tag.text}
                    </span>
                `).join('')}
            </div>
        `;
    }

    // Function to create HTML for a featured post
    function createFeaturedPost(project) {
        return `
            <article class="post featured">
                <header class="major">
                    <span class="date">${project.date}</span>
                    <h2><a href="${project.link}" target="_blank">${project.title}</a></h2>
                    <p>${project.description}</p>
                    ${createTags(project.tags)}
                </header>
                ${createMediaContent(project, true)}

                <ul class="actions special">
                    <li><a href="${project.link}" target="_blank" class="button large">View Project</a></li>
                </ul>
            </article>
        `;
    }

    // Function to create HTML for a regular post
    function createRegularPost(project) {
        return `
            <article>
                <header>
                    <span class="date">${project.date}</span>
                    <h2><a href="${project.link}" target="_blank">${project.title}</a></h2>
                </header>
                ${createMediaContent(project)}
                <p>${project.description}</p>
                ${createTags(project.tags)}
                <ul class="actions special">
                    <li><a href="${project.link}" target="_blank" class="button">VIEW PROJECT</a></li>
                </ul>
            </article>
        `;
    }

    // Set featured post based on user selection
    const featuredProject = key_projects[selectedProject] || key_projects['deco7180'];
    featuredPostContainer.innerHTML = createFeaturedPost(featuredProject);

    // Display all other projects as regular posts
    const regularPosts = Object.entries(all_projects)
        .filter(([key, project]) => project !== featuredProject)
        .map(([key, project]) => createRegularPost(project))
        .join('');

    regularPostsContainer.innerHTML = regularPosts;

    // Populate filter dropdowns
    function populateFilters() {
        const softwareSet = new Set();
        const skillsSet = new Set();
        const typeSet = new Set();

        Object.values(all_projects).forEach(project => {
            project.tags.software.forEach(tag => softwareSet.add(tag));
            project.tags.skills.forEach(tag => skillsSet.add(tag));
            project.tags.type.forEach(tag => typeSet.add(tag));
        });

        const softwareFilter = document.getElementById('software-filter');
        const skillsFilter = document.getElementById('skills-filter');
        const typeFilter = document.getElementById('type-filter');

        softwareSet.forEach(tag => softwareFilter.add(new Option(tag, tag)));
        skillsSet.forEach(tag => skillsFilter.add(new Option(tag, tag)));
        typeSet.forEach(tag => typeFilter.add(new Option(tag, tag)));
    }

    // Filter projects based on selected tags
    function filterProjects() {
        const selectedSoftware = document.getElementById('software-filter').value;
        const selectedSkills = document.getElementById('skills-filter').value;
        const selectedType = document.getElementById('type-filter').value;

        // Get the featured project
        const featuredProject = key_projects[selectedProject] || key_projects['deco7180'];

        const filteredProjects = Object.entries(all_projects).filter(([key, project]) => {
            // Exclude the featured project from regular posts
            if (project === featuredProject) {
                return false;
            }

            const matchesSoftware = !selectedSoftware || project.tags.software.includes(selectedSoftware);
            const matchesSkills = !selectedSkills || project.tags.skills.includes(selectedSkills);
            const matchesType = !selectedType || project.tags.type.includes(selectedType);
            return matchesSoftware && matchesSkills && matchesType;
        });

        const regularPostsContainer = document.getElementById('regular-posts');
        regularPostsContainer.innerHTML = filteredProjects.map(([key, project]) => createRegularPost(project)).join('');
    }
    

    // Event listeners for dropdowns
    document.getElementById('software-filter').addEventListener('change', filterProjects);
    document.getElementById('skills-filter').addEventListener('change', filterProjects);
    document.getElementById('type-filter').addEventListener('change', filterProjects);

    // Initial population of filters and display of projects
    populateFilters();
    filterProjects();

    // Get reference to the projects section and nav content
    const projectsSection = document.getElementById('projects');
    const navContent = document.querySelector('#portfolio-nav .nav-content');

    // Function to handle scroll event
    function handleScroll() {
        const sectionTop = projectsSection.getBoundingClientRect().top;
        const viewportHeight = window.innerHeight;

        if (sectionTop <= viewportHeight && sectionTop >= 0) {
            navContent.style.opacity = '0'; // Make nav-content visible
        } else {
            navContent.style.opacity = '1'; // Make nav-content invisible
        }
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial call to set the correct opacity on page load
    handleScroll();
});