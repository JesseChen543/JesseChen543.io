document.querySelectorAll('.flip-container').forEach(container => {
    container.addEventListener('click', function() {
        this.querySelector('.flipper').classList.toggle('flipped');
    });
});