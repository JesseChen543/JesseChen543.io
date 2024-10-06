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
            if (pageYOffset >= sectionTop - 100) {
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
    const continueBtn = document.getElementById('continueBtn');
    const selectedTopics = new Set();

    topics.forEach(topic => {
        topic.addEventListener('click', () => {
            const topicName = topic.dataset.topic;

            // Single selection behavior (unselect others)
            topics.forEach(t => {
                if (t !== topic) {
                    t.classList.remove('selected');
                }
            });

            // Toggle selection for the clicked topic
            topic.classList.toggle('selected');

            // Update selectedTopics Set
            selectedTopics.clear(); // Clear previous selection
            if (topic.classList.contains('selected')) {
                selectedTopics.add(topicName);
            }

            // Update button state
            updateContinueButtonState();
        });
    });

    function updateContinueButtonState() {
        if (selectedTopics.size === 0) {
            continueBtn.disabled = true;
            continueBtn.title = "Please select at least one option to proceed";
        } else {
            continueBtn.disabled = false;
            continueBtn.title = "";
        }
    }

    continueBtn.addEventListener('click', () => {
        if (!continueBtn.disabled) {
            // Redirect to home page
            window.location.href = 'index.html'; 
        }
    });

    // Initial button state
    updateContinueButtonState();
});
