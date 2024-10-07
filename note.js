document.addEventListener('DOMContentLoaded', function() {
    const stickyNoteIcon = document.getElementById('sticky-note-icon');
    const notePopup = document.getElementById('note-popup');
    const closeBtn = document.querySelector('.close-btn');
    const sendToOwnerBtn = document.getElementById('send-to-owner');
    const sendToMeBtn = document.getElementById('send-to-me');
    const noteEditor = document.getElementById('note-editor');

    stickyNoteIcon.addEventListener('click', function() {
        notePopup.classList.add('show');
    });

    closeBtn.addEventListener('click', function() {
        notePopup.classList.remove('show');
    });

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

    function sendEmail(to, subject, body) {
        // This is a placeholder function. In a real-world scenario, 
        // this data should be sent to server which would then use an
        // email service to send the actual email.
        console.log(`Sending email to: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
