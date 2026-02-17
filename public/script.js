// Check authentication (optional - only shows admin button)
function checkAuth() {
    const user = localStorage.getItem('user');
    const btnAuthToggle = document.getElementById('btnAuthToggle');
    
    if (user) {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
            const btnAdmin = document.getElementById('btnAdmin');
            if (btnAdmin) {
                btnAdmin.classList.remove('hidden');
            }
        }
        // Update button text if exists
        if (btnAuthToggle) {
            btnAuthToggle.textContent = 'Déconnexion';
        }
    } else {
        // Update button text if exists
        if (btnAuthToggle) {
            btnAuthToggle.textContent = 'Connexion';
        }
    }
}

// Toggle authentication
function toggleAuth() {
    const user = localStorage.getItem('user');
    
    if (user) {
        // User is logged in - logout
        logout();
    } else {
        // User is not logged in - redirect to login
        window.location.href = '/login.html';
    }
}

// Logout
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('theme');
    window.location.href = '/';
}

checkAuth();

// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

// Theme toggle event listener
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
});

// Booking Form Handler
const bookingForm = document.getElementById('bookingForm');
const successMessage = document.getElementById('successMessage');
const resetFormBtn = document.getElementById('resetForm');

bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(bookingForm);
    const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        eventType: formData.get('eventType'),
        eventDate: formData.get('eventDate'),
        eventTime: formData.get('eventTime'),
        eventDuration: formData.get('eventDuration'),
        location: formData.get('location'),
        guestCount: formData.get('guestCount'),
        musicGenre: formData.get('musicGenre'),
        services: formData.getAll('services'),
        budget: formData.get('budget'),
        message: formData.get('message'),
        submittedAt: new Date().toISOString()
    };

    try {
        // Send data to backend
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'envoi du formulaire');
        }

        const result = await response.json();

        // Show success message
        bookingForm.style.display = 'none';
        successMessage.classList.remove('hidden');

        // Optionally send email or notification to admin
        console.log('Réservation envoyée:', result);

    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
});

// Reset form
resetFormBtn.addEventListener('click', () => {
    bookingForm.reset();
    bookingForm.style.display = 'block';
    successMessage.classList.add('hidden');
    window.scrollTo(0, 0);
});

// Form validation on input
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const budgetInput = document.getElementById('budget');
const durationInput = document.getElementById('eventDuration');

phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^\d+\s-]/g, '');
});

budgetInput.addEventListener('input', (e) => {
    if (e.target.value < 0) {
        e.target.value = 0;
    }
});

durationInput.addEventListener('input', (e) => {
    if (e.target.value < 1) {
        e.target.value = 1;
    }
    if (e.target.value > 72) {
        e.target.value = 72;
    }
});

// Date validation - prevent past dates
const eventDateInput = document.getElementById('eventDate');
const minDate = new Date();
minDate.setDate(minDate.getDate() + 1);
const minDateString = minDate.toISOString().split('T')[0];
eventDateInput.min = minDateString;
