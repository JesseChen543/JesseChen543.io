// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with the class 'flip-container'
    document.querySelectorAll('.flip-container').forEach(container => {
        // Add a click event listener to each flip container
        container.addEventListener('click', function() {
            // Toggle the 'flipped' class on the child element with class 'flipper'
            // This triggers the flip animation defined in CSS
            this.querySelector('.flipper').classList.toggle('flipped');
        });
    });
});