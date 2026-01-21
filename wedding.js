/**
 * Wedding Website - Combined JavaScript
 * Includes navigation functionality and RSVP form management
 */

// ===========================
// Navigation Functionality
// ===========================

// Mobile menu toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (navToggle) {
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        if (navToggle) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

if (navbar) {
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class for styling
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Smooth scrolling with offset for fixed navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target && navbar) {
            const navbarHeight = navbar.offsetHeight;
            const offset = 20; // Extra offset
            const targetPosition = target.offsetTop - navbarHeight - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Highlight active section in navigation
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            if (navLink) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightNavigation);
window.addEventListener('load', highlightNavigation);

// ===========================
// Click to Copy IBAN functionality
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    const copyBtn = document.getElementById('copy-btn');
    const ibanElement = document.getElementById('iban');

    if (copyBtn && ibanElement) {
        const ibanText = ibanElement.textContent;

        copyBtn.addEventListener('click', function() {
            // Create a temporary textarea to copy the text
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = ibanText;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();

            try {
                // Copy the text
                document.execCommand('copy');

                // Visual feedback
                copyBtn.classList.add('copied');
                copyBtn.textContent = 'copiado!';

                // Reset button after 2 seconds
                setTimeout(function() {
                    copyBtn.classList.remove('copied');
                    copyBtn.textContent = 'copiar';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }

            // Remove the temporary textarea
            document.body.removeChild(tempTextarea);
        });
    }
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections for fade-in animation
document.addEventListener('DOMContentLoaded', function() {
    const sectionsToObserve = document.querySelectorAll('section');
    sectionsToObserve.forEach(section => {
        observer.observe(section);
    });
});

// ===========================
// RSVP Form - Dynamic Guest Fields
// ===========================

(function() {
    'use strict';

    // Configuration & Constants
    const CONFIG = {
        minGuests: 1,
        maxGuests: 10,
        selectors: {
            form: '.rsvp-form',
            guestCountInput: '#guest-count',
            guestContainer: '#guest-fields-container',
            attendanceRadio: 'input[name="attendance"]'
        },
        dietaryOptions: [
            { value: '', label: 'Selecione uma opção' },
            { value: 'none', label: 'Nenhuma' },
            { value: 'vegetarian', label: 'Vegetariano' },
            { value: 'vegan', label: 'Vegano' },
            { value: 'gluten', label: 'Alergia ao Glúten' },
            { value: 'lactose', label: 'Intolerância à Lactose' },
            { value: 'seafood', label: 'Alergia a Marisco' },
            { value: 'other', label: 'Outra' }
        ]
    };

    // State Management
    let state = {
        currentGuestCount: 0,
        isAttending: null
    };

    // DOM References
    let elements = {};

    function initializeElements() {
        elements.form = document.querySelector(CONFIG.selectors.form);
        elements.guestCountInput = document.querySelector(CONFIG.selectors.guestCountInput);
        elements.guestContainer = document.querySelector(CONFIG.selectors.guestContainer);
        elements.attendanceRadios = document.querySelectorAll(CONFIG.selectors.attendanceRadio);
        elements.guestCountGroup = document.getElementById('guest-count-group');
        elements.songGroup = document.getElementById('song-group');
        elements.songInput = document.getElementById('song');

        if (!elements.form || !elements.guestCountInput || !elements.guestContainer) {
            console.error('Required form elements not found');
            return false;
        }
        return true;
    }

    // Guest Field Generation
    function createGuestBlockHTML(index) {
        const dietaryOptionsHTML = CONFIG.dietaryOptions
            .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
            .join('');

        return `
            <div class="guest-block" data-guest-index="${index}">
                <h3 class="guest-heading">Convidado ${index}</h3>

                <div class="form-group">
                    <label for="guest-name-${index}">Nome do Convidado *</label>
                    <input
                        type="text"
                        id="guest-name-${index}"
                        name="guest-name-${index}"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="guest-dietary-${index}">Restrições Alimentares *</label>
                    <select
                        id="guest-dietary-${index}"
                        name="guest-dietary-${index}"
                        class="dietary-select"
                        data-guest-index="${index}"
                        required
                    >
                        ${dietaryOptionsHTML}
                    </select>
                </div>

                <div class="form-group dietary-other-group" id="guest-dietary-other-group-${index}" style="display: none;">
                    <label for="guest-dietary-other-${index}">Especifique a restrição *</label>
                    <input
                        type="text"
                        id="guest-dietary-other-${index}"
                        name="guest-dietary-other-${index}"
                    >
                </div>
            </div>
        `;
    }

    function updateGuestFields(targetCount) {
        const currentBlocks = elements.guestContainer.querySelectorAll('.guest-block');
        const currentCount = currentBlocks.length;

        // Add new blocks if needed
        if (targetCount > currentCount) {
            for (let i = currentCount + 1; i <= targetCount; i++) {
                const blockHTML = createGuestBlockHTML(i);
                elements.guestContainer.insertAdjacentHTML('beforeend', blockHTML);
            }
            attachDietarySelectListeners();
        }
        // Remove excess blocks if needed
        else if (targetCount < currentCount) {
            for (let i = currentCount; i > targetCount; i--) {
                const blockToRemove = elements.guestContainer.querySelector(`[data-guest-index="${i}"]`);
                if (blockToRemove) {
                    blockToRemove.remove();
                }
            }
        }

        state.currentGuestCount = targetCount;
    }

    // Dietary "Other" Field Toggle
    function handleDietarySelectChange(selectElement) {
        const guestIndex = selectElement.dataset.guestIndex;
        const otherGroup = document.getElementById(`guest-dietary-other-group-${guestIndex}`);
        const otherInput = document.getElementById(`guest-dietary-other-${guestIndex}`);

        if (!otherGroup || !otherInput) return;

        if (selectElement.value === 'other') {
            otherGroup.style.display = 'flex';
            otherInput.required = true;
        } else {
            otherGroup.style.display = 'none';
            otherInput.required = false;
            otherInput.value = '';
        }
    }

    function attachDietarySelectListeners() {
        const selects = elements.guestContainer.querySelectorAll('.dietary-select');
        selects.forEach(select => {
            select.removeEventListener('change', handleDietarySelectChangeEvent);
            select.addEventListener('change', handleDietarySelectChangeEvent);
        });
    }

    function handleDietarySelectChangeEvent(event) {
        handleDietarySelectChange(event.target);
    }

    // Guest Count Input Validation
    function validateGuestCount(value) {
        let count = parseInt(value, 10);

        if (isNaN(count) || count < CONFIG.minGuests) {
            return CONFIG.minGuests;
        }

        if (count > CONFIG.maxGuests) {
            return CONFIG.maxGuests;
        }

        return count;
    }

    function handleGuestCountChange(event) {
        const rawValue = event.target.value;

        if (rawValue === '') {
            updateGuestFields(0);
            return;
        }

        const validatedCount = validateGuestCount(rawValue);

        if (parseInt(rawValue, 10) !== validatedCount) {
            event.target.value = validatedCount;
        }

        updateGuestFields(validatedCount);
    }

    // Attendance Confirmation Toggle
    function handleAttendanceChange(event) {
        const isAttending = event.target.value === 'sim';
        state.isAttending = isAttending;

        if (isAttending) {
            // Show guest count and song fields
            elements.guestCountGroup.style.display = 'flex';
            elements.songGroup.style.display = 'flex';

            elements.guestCountInput.disabled = false;
            elements.guestCountInput.required = true;

            if (elements.guestCountInput.value) {
                const count = validateGuestCount(elements.guestCountInput.value);
                updateGuestFields(count);
            }
        } else {
            // Hide guest count and song fields
            elements.guestCountGroup.style.display = 'none';
            elements.songGroup.style.display = 'none';

            elements.guestCountInput.disabled = true;
            elements.guestCountInput.required = false;
            elements.guestCountInput.value = '';
            elements.songInput.value = '';
            updateGuestFields(0);
        }
    }

    // Form Submission
    function handleFormSubmit(event) {
        event.preventDefault();

        const guestCount = parseInt(elements.guestCountInput.value, 10);
        const guestBlocks = elements.guestContainer.querySelectorAll('.guest-block');

        if (state.isAttending && guestCount !== guestBlocks.length) {
            alert('Erro: O número de convidados não corresponde aos campos preenchidos.');
            return false;
        }

        const formData = new FormData(elements.form);
        const data = Object.fromEntries(formData.entries());

        console.log('Form submitted:', data);

        // TODO: Implement actual form submission
        alert('Formulário enviado com sucesso! (Demo mode - implementar submissão real)');
    }

    // Form Reset
    function handleFormReset() {
        setTimeout(() => {
            updateGuestFields(0);
            state.currentGuestCount = 0;
            state.isAttending = null;
            elements.guestCountInput.disabled = true;
        }, 0);
    }

    // Event Listener Setup
    function attachEventListeners() {
        elements.guestCountInput.addEventListener('input', handleGuestCountChange);
        elements.guestCountInput.addEventListener('blur', function(event) {
            if (event.target.value !== '') {
                const validated = validateGuestCount(event.target.value);
                event.target.value = validated;
                updateGuestFields(validated);
            }
        });

        elements.attendanceRadios.forEach(radio => {
            radio.addEventListener('change', handleAttendanceChange);
        });

        elements.form.addEventListener('submit', handleFormSubmit);
        elements.form.addEventListener('reset', handleFormReset);
    }

    // Initialization
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        if (!initializeElements()) {
            return;
        }

        // Initially hide guest count and song fields
        elements.guestCountGroup.style.display = 'none';
        elements.songGroup.style.display = 'none';
        elements.guestCountInput.disabled = true;
        elements.guestCountInput.required = false;

        attachEventListeners();

        console.log('RSVP form initialized');
    }

    // Start initialization
    init();

})();

// Log when the page is fully loaded
window.addEventListener('load', function() {
    console.log('Wedding website loaded successfully! 💍');
});
