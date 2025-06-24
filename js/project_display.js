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
            link: "https://jessechen543.github.io/wingwatch_portfolio/",
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
                "discussions, and gaming opportunities. " +
                "<br><br>" +
                "This was my first project after learning basic HTML, CSS, and JavaScript, where I polished my skills in " +
                "styling techniques including flexbox (and I leant how to center a div), responsive web design, " +
                "learned how APIs work, and implemented 'post' functionality.",
            link: "https://jessechen543.github.io/Gamerversehub/",
            isEmbedded: true,
            tags: {
                software: ["html", "css", "javascript"],
                skills: ["api", "responsive design", "get", "post"],
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

    // Initialize multi-select dropdowns
    function populateFilters() {
        const softwareSet = new Set();
        const skillsSet = new Set();
        const typeSet = new Set();

        Object.values(all_projects).forEach(project => {
            project.tags.software.forEach(tag => softwareSet.add(tag));
            project.tags.skills.forEach(tag => skillsSet.add(tag));
            project.tags.type.forEach(tag => typeSet.add(tag));
        });

        // Convert regular dropdowns to multi-select
        convertToMultiSelect('software-filter', Array.from(softwareSet));
        convertToMultiSelect('skills-filter', Array.from(skillsSet));
        convertToMultiSelect('type-filter', Array.from(typeSet));
    }
    
    // Function to convert a regular dropdown to a custom multi-select element
    function convertToMultiSelect(selectId, options) {
        const originalSelect = document.getElementById(selectId);
        if (!originalSelect) return;
        
        const parentElement = originalSelect.parentElement;
        
        // Create container for the multi-select
        const container = document.createElement('div');
        container.className = 'multi-select-container';
        container.id = `${selectId}-container`;
        
        // Create the dropdown button/display
        const dropdownDisplay = document.createElement('div');
        dropdownDisplay.className = 'multi-select-dropdown';
        dropdownDisplay.innerHTML = `<span>All</span><span class="arrow-down">▼</span>`;
        container.appendChild(dropdownDisplay);
        
        // Create dropdown list
        const dropdownList = document.createElement('div');
        dropdownList.className = 'multi-select-options';
        dropdownList.style.display = 'none';
        
        // Add "All" option
        const allOption = document.createElement('div');
        allOption.className = 'multi-select-option selected';
        allOption.setAttribute('data-value', '');
        allOption.textContent = 'All';
        allOption.addEventListener('click', function() {
            // Deselect all other options and select only "All"
            const options = dropdownList.querySelectorAll('.multi-select-option');
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            updateDropdownDisplay(dropdownDisplay, []);
            filterProjects();
        });
        dropdownList.appendChild(allOption);
        
        // Add all other options
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'multi-select-option';
            optionElement.setAttribute('data-value', option);
            optionElement.textContent = option;
            
            optionElement.addEventListener('click', function() {
                // Toggle selected state
                this.classList.toggle('selected');
                
                // If any option is selected, deselect "All"
                const allOpt = dropdownList.querySelector('[data-value=""]');
                const selectedOptions = dropdownList.querySelectorAll('.multi-select-option.selected:not([data-value=""])');
                
                if (selectedOptions.length > 0) {
                    allOpt.classList.remove('selected');
                } else {
                    allOpt.classList.add('selected');
                }
                
                // Update the dropdown display text
                const selectedValues = Array.from(selectedOptions).map(opt => opt.getAttribute('data-value'));
                updateDropdownDisplay(dropdownDisplay, selectedValues);
                
                // Filter projects based on selected options
                filterProjects();
            });
            
            dropdownList.appendChild(optionElement);
        });
        
        container.appendChild(dropdownList);
        
        // Show/hide dropdown list when clicking on the dropdown display
        dropdownDisplay.addEventListener('click', function() {
            const isVisible = dropdownList.style.display === 'block';
            dropdownList.style.display = isVisible ? 'none' : 'block';
            dropdownDisplay.querySelector('.arrow-down').textContent = isVisible ? '▼' : '▲';
            
            // Close other open dropdowns
            const allDropdowns = document.querySelectorAll('.multi-select-options');
            allDropdowns.forEach(dropdown => {
                if (dropdown !== dropdownList) {
                    dropdown.style.display = 'none';
                    const arrow = dropdown.previousElementSibling.querySelector('.arrow-down');
                    if (arrow) arrow.textContent = '▼';
                }
            });
        });
        
        // Add new container and remove the original select element
        parentElement.insertBefore(container, originalSelect);
        originalSelect.style.display = 'none';
    }
    
    // Function to update the dropdown display text
    function updateDropdownDisplay(displayElement, selectedValues) {
        const displayText = displayElement.querySelector('span');
        if (selectedValues.length === 0) {
            displayText.textContent = 'All';
        } else if (selectedValues.length === 1) {
            displayText.textContent = selectedValues[0];
        } else {
            displayText.textContent = `${selectedValues.length} selected`;
        }
    }
    
    // Function to get selected values from a multi-select dropdown
    function getMultiSelectValues(selectId) {
        const container = document.getElementById(`${selectId}-container`);
        if (!container) return [];
        
        const selectedOptions = container.querySelectorAll('.multi-select-option.selected:not([data-value=""])');
        return Array.from(selectedOptions).map(opt => opt.getAttribute('data-value'));
    }

    // Filter projects based on selected tags
    function filterProjects() {
        const selectedSoftwareValues = getMultiSelectValues('software-filter');
        const selectedSkillsValues = getMultiSelectValues('skills-filter');
        const selectedTypeValues = getMultiSelectValues('type-filter');

        // Get the featured project
        const featuredProject = key_projects[selectedProject] || key_projects['deco7180'];

        const filteredProjects = Object.entries(all_projects).filter(([key, project]) => {
            // Exclude the featured project from regular posts
            if (project === featuredProject) {
                return false;
            }

            // Match if either no selection or any of the project's tags match any selected value
            const matchesSoftware = selectedSoftwareValues.length === 0 || 
                project.tags.software.some(tag => selectedSoftwareValues.includes(tag));
                
            const matchesSkills = selectedSkillsValues.length === 0 || 
                project.tags.skills.some(tag => selectedSkillsValues.includes(tag));
                
            const matchesType = selectedTypeValues.length === 0 || 
                project.tags.type.some(tag => selectedTypeValues.includes(tag));
                
            return matchesSoftware && matchesSkills && matchesType;
        });

        const regularPostsContainer = document.getElementById('regular-posts');
        regularPostsContainer.innerHTML = filteredProjects.map(([key, project]) => createRegularPost(project)).join('');
    }
    

    // Close multi-select dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.multi-select-container')) {
            const dropdowns = document.querySelectorAll('.multi-select-options');
            dropdowns.forEach(dropdown => {
                dropdown.style.display = 'none';
                const arrow = dropdown.previousElementSibling.querySelector('.arrow-down');
                if (arrow) arrow.textContent = '▼';
            });
        }
    });

    // Initial population of filters and display of projects
    populateFilters();
    filterProjects();
    
    // Get reference to the projects section and nav content
    const projectsSection = document.getElementById('projects');
    const navContent = document.querySelector('#portfolio-nav .nav-content');

    // Function to handle scroll event - always keep the filter visible
    function handleScroll() {
        // Always keep the nav-content (filter) visible regardless of scroll position
        navContent.style.opacity = '1'; // Make nav-content always visible
    }

    // Close multi-select dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.multi-select-container')) {
            const dropdowns = document.querySelectorAll('.multi-select-options');
            dropdowns.forEach(dropdown => {
                dropdown.style.display = 'none';
                const arrow = dropdown.previousElementSibling.querySelector('.arrow-down');
                if (arrow) arrow.textContent = '▼';
            });
        }
    });
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial call to set the correct opacity on page load
    handleScroll();
});