// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', function() {
    // Retrieve the selected project from local storage
    const selectedProject = localStorage.getItem('selectedProject');
    // Get references to the container elements for featured and regular posts
    const featuredPostContainer = document.getElementById('featured-post');
    const regularPostsContainer = document.getElementById('regular-posts');

    // Define the key projects object with project details
    const key_projects = {
        'web-design': {
            title: "Gaming platform-GamerverseHub",
            date: "September, 2023",
            description: "GamerverseHub functions as a gaming platform aimed at connecting gamers worldwide. " +
                "It fosters interaction among gamers through various features including events, streams, " +
                "discussions, and gaming opportunities.",
            link: "https://jessechen543.github.io/Gamerversehub/",
            isEmbedded: true
        },
        'deco7180': {
            title: "DECO7180 website implementation team project",
            date: "October, 2024",
            description: "As a key team member in the Wingwatch website project, I spearheaded the backend development. " +
                "My responsibilities included integrating data retrieval from the Wildlife API, implementing Google Maps API " +
                "to visualize bird location data, and developing algorithms to filter and enhance information, improving overall user experience. " +
                "To learn more about our design process and development journey, check out our detailed project breakdown on the " +
                "<a href='wingwatch_process.html' target='_blank'><strong>Wingwatch Process</strong></a> page.",
            link: "https://deco1800teams-t03-wingwatch.uqcloud.net/",
            image: "pictures/wingwatch.png"
        },
        'data-analyst': {
            title: "Real Estate Analysis with python",
            date: "April, 2022",
            description: "The goal of this project is to gain insight into the features that influence the length of time " +
                "a property stays on the market, and to create predictive models for this purpose.",
            link: "https://jessechen543.github.io/ESTATE_ANALYSIS/",
            image: "pictures/ESTATE_ANA_PIC.png"
        }
    };

    // Combine key projects with additional projects
    const all_projects = {
        ...key_projects,
        'heart-attack-analysis': {
            title: "Heart Attack Analysis with R",
            date: "April, 2022",
            description: "This project involved using data analytics to predict heart attacks using a dataset of 300 observations " +
                "and 20 variables, resulting in achieving finalist status in a competition hosted by BANA and presenting findings " +
                "to judges from Deloitte, KPMG, and UQ.",
            link: "https://jessechen543.github.io/Heart_attack_analysis_Jesse/",
            image: "pictures/heart attack analysis.png"
        },
        'kpmg-internship': {
            title: "KPMG Data Analytics consulting virtual internship",
            date: "January, 2022",
            description: "I participated in the KPMG Virtual Experience Program, completing data quality assessments, " +
                "implementing RFM analysis, and presenting my findings through a well-structured PowerPoint presentation " +
                "and interactive Excel dashboards.",
            link: "https://jessechen543.github.io/churnrate_analysis/",
            image: "pictures/imgae for kpmg project.png"
        },
        'ai-career-assistance': {
            title: "Resume AI Career Assistance Wireframe Design",
            date: "January, 2023",
            description: "As the business analyst for this project, I analyzed the demand and created a logic flow chart " +
                "and requirement tickets. Using Figma, I designed a wireframe for a Resume AI Career Assistance feature " +
                "on a recruitment platform.",
            link: "https://www.figma.com/file/K670eaQ8qW2GflPw8ClybR/JobPin-AI-career-assistance?node-id=0%3A1&t=WA7n1Cqggs2HwOUk-1",
            image: "pictures/AI career assistance wireframe.png"
        }
    };

    // Function to create media content (embedded site or image) for a project
    function createMediaContent(project, isFeatured = false) {
        if (project.isEmbedded) {
            return `
                <a href="${project.link}" target="_blank" class="embedded-site">
                    <iframe src="${project.link}" title="${project.title}" width="100%" height="${isFeatured ? '500px' : '300px'}"></iframe>
                </a>`;
        } else {
            return `
                <a href="${project.link}" target="_blank" class="${isFeatured ? 'image main' : 'image fit'}">
                    <img src="${project.image}" alt="${project.title}" />
                </a>`;
        }
    }

    // Function to create HTML for a featured post
    function createFeaturedPost(project) {
        return `
            <article class="post featured">
                <header class="major">
                    <span class="date">${project.date}</span>
                    <h2><a href="${project.link}" target="_blank">${project.title}</a></h2>
                    <p>${project.description}</p>
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
                <ul class="actions special">
                    <li><a href="${project.link}" target="_blank" class="button">VIEW PROJECT</a></li>
                </ul>
            </article>
        `;
    }

    // Set featured post based on user selection or default to 'deco7180'
    const featuredProject = key_projects[selectedProject] || key_projects['deco7180'];
    featuredPostContainer.innerHTML = createFeaturedPost(featuredProject);

    // Display all other projects as regular posts
    const regularPosts = Object.entries(all_projects)
        .filter(([key, project]) => project !== featuredProject)
        .map(([key, project]) => createRegularPost(project))
        .join('');

    regularPostsContainer.innerHTML = regularPosts;
});