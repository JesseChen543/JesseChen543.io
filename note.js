// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const stickyNoteIcon = document.getElementById('sticky-note-icon');
    const notePopup = document.getElementById('note-popup');
    const closeBtn = document.querySelector('.close-btn');
    const sendToOwnerBtn = document.getElementById('send-to-owner');
    const sendToMeBtn = document.getElementById('send-to-me');
    const noteEditor = document.getElementById('note-editor');

    // Show note popup when sticky note icon is clicked
    stickyNoteIcon.addEventListener('click', function() {
        notePopup.classList.add('show');
    });

    // Hide note popup when close button is clicked
    closeBtn.addEventListener('click', function() {
        notePopup.classList.remove('show');
    });

    // Handle sending note to website owner
    sendToOwnerBtn.addEventListener('click', function() {
        const noteContent = noteEditor.value;
        if (noteContent.trim() !== '') {
            sendEmail('jessechen959@gmail.com', 'Note from Website User', noteContent);
            alert('Note sent to website owner!');
            noteEditor.value = '';
            notePopup.classList.remove('show');
        } else {
            alert('Please write a note before sending.');
        }
    });

    // Handle sending note to user's email
    sendToMeBtn.addEventListener('click', function() {
        const noteContent = noteEditor.value;
        if (noteContent.trim() !== '') {
            const userEmail = prompt('Please enter your email address:');
            if (userEmail && validateEmail(userEmail)) {
                sendEmail(userEmail, 'Your Note from Our Website', noteContent);
                alert('Note sent to your email!');
                noteEditor.value = '';
                notePopup.classList.remove('show');
            } else {
                alert('Please enter a valid email address.');
            }
        } else {
            alert('Please write a note before sending.');
        }
    });

    // Placeholder function for sending email
    // In a real-world scenario, this would be handled by a server
    function sendEmail(to, subject, body) {
        console.log(`Sending email to: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
    }

    // Function to validate email format
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});