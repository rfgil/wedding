/**
 * RSVP Form - Dynamic Guest Fields
 * Handles dynamic creation/removal of guest fields based on guest count
 */

(function() {
    'use strict';

    // ========================================
    // Configuration & Constants
    // ========================================

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

    // ========================================
    // State Management
    // ========================================

    let state = {
        currentGuestCount: 0,
        isAttending: null
    };

    // ========================================
    // DOM References
    // ========================================

    let elements = {};

    function initializeElements() {
        elements.form = document.querySelector(CONFIG.selectors.form);
        elements.guestCountInput = document.querySelector(CONFIG.selectors.guestCountInput);
        elements.guestContainer = document.querySelector(CONFIG.selectors.guestContainer);
        elements.attendanceRadios = document.querySelectorAll(CONFIG.selectors.attendanceRadio);

        if (!elements.form || !elements.guestCountInput || !elements.guestContainer) {
            console.error('Required form elements not found');
            return false;
        }
        return true;
    }

    // ========================================
    // Guest Field Generation
    // ========================================

    /**
     * Creates HTML for a single guest block
     * @param {number} index - Guest number (1-based)
     * @returns {string} HTML string
     */
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

    /**
     * Updates guest fields based on current count
     * @param {number} targetCount - Desired number of guest blocks
     */
    function updateGuestFields(targetCount) {
        const currentBlocks = elements.guestContainer.querySelectorAll('.guest-block');
        const currentCount = currentBlocks.length;

        // Add new blocks if needed
        if (targetCount > currentCount) {
            for (let i = currentCount + 1; i <= targetCount; i++) {
                const blockHTML = createGuestBlockHTML(i);
                elements.guestContainer.insertAdjacentHTML('beforeend', blockHTML);
            }

            // Attach event listeners to newly created select elements
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

    // ========================================
    // Dietary "Other" Field Toggle
    // ========================================

    /**
     * Toggles visibility of "Outra" text field based on select value
     * @param {HTMLSelectElement} selectElement - The dietary select element
     */
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
            otherInput.value = ''; // Clear value when hidden
        }
    }

    /**
     * Attaches change event listeners to all dietary select elements
     */
    function attachDietarySelectListeners() {
        const selects = elements.guestContainer.querySelectorAll('.dietary-select');
        selects.forEach(select => {
            // Remove existing listener to avoid duplicates
            select.removeEventListener('change', handleDietarySelectChangeEvent);
            // Attach new listener
            select.addEventListener('change', handleDietarySelectChangeEvent);
        });
    }

    function handleDietarySelectChangeEvent(event) {
        handleDietarySelectChange(event.target);
    }

    // ========================================
    // Guest Count Input Validation
    // ========================================

    /**
     * Validates and sanitizes guest count input
     * @param {number} value - Input value
     * @returns {number} Validated value
     */
    function validateGuestCount(value) {
        let count = parseInt(value, 10);

        // Handle invalid input
        if (isNaN(count) || count < CONFIG.minGuests) {
            return CONFIG.minGuests;
        }

        if (count > CONFIG.maxGuests) {
            return CONFIG.maxGuests;
        }

        return count;
    }

    /**
     * Handles guest count input changes
     */
    function handleGuestCountChange(event) {
        const rawValue = event.target.value;

        // Allow empty value (user is typing)
        if (rawValue === '') {
            updateGuestFields(0);
            return;
        }

        const validatedCount = validateGuestCount(rawValue);

        // Update input if value was corrected
        if (parseInt(rawValue, 10) !== validatedCount) {
            event.target.value = validatedCount;
        }

        updateGuestFields(validatedCount);
    }

    // ========================================
    // Attendance Confirmation Toggle
    // ========================================

    /**
     * Handles attendance radio button changes
     * Disables/enables guest count field based on attendance
     */
    function handleAttendanceChange(event) {
        const isAttending = event.target.value === 'sim';
        state.isAttending = isAttending;

        if (isAttending) {
            elements.guestCountInput.disabled = false;
            elements.guestCountInput.required = true;

            // If there's a value, update fields
            if (elements.guestCountInput.value) {
                const count = validateGuestCount(elements.guestCountInput.value);
                updateGuestFields(count);
            }
        } else {
            elements.guestCountInput.disabled = true;
            elements.guestCountInput.required = false;
            elements.guestCountInput.value = '';
            updateGuestFields(0);
        }
    }

    // ========================================
    // Form Submission
    // ========================================

    /**
     * Handles form submission
     */
    function handleFormSubmit(event) {
        event.preventDefault();

        // Validate that guest count matches number of filled blocks
        const guestCount = parseInt(elements.guestCountInput.value, 10);
        const guestBlocks = elements.guestContainer.querySelectorAll('.guest-block');

        if (state.isAttending && guestCount !== guestBlocks.length) {
            alert('Erro: O número de convidados não corresponde aos campos preenchidos.');
            return false;
        }

        // Collect form data
        const formData = new FormData(elements.form);
        const data = Object.fromEntries(formData.entries());

        console.log('Form submitted:', data);

        // TODO: Implement actual form submission
        // This could be:
        // - AJAX request to a backend
        // - Integration with a form service (Formspree, Google Forms, etc.)
        // - Email sending service

        alert('Formulário enviado com sucesso! (Demo mode - implementar submissão real)');
    }

    // ========================================
    // Form Reset
    // ========================================

    /**
     * Handles form reset
     */
    function handleFormReset() {
        setTimeout(() => {
            updateGuestFields(0);
            state.currentGuestCount = 0;
            state.isAttending = null;
            elements.guestCountInput.disabled = true;
        }, 0);
    }

    // ========================================
    // Event Listener Setup
    // ========================================

    function attachEventListeners() {
        // Guest count input
        elements.guestCountInput.addEventListener('input', handleGuestCountChange);
        elements.guestCountInput.addEventListener('blur', function(event) {
            // On blur, ensure valid value
            if (event.target.value !== '') {
                const validated = validateGuestCount(event.target.value);
                event.target.value = validated;
                updateGuestFields(validated);
            }
        });

        // Attendance radio buttons
        elements.attendanceRadios.forEach(radio => {
            radio.addEventListener('change', handleAttendanceChange);
        });

        // Form submission
        elements.form.addEventListener('submit', handleFormSubmit);

        // Form reset
        elements.form.addEventListener('reset', handleFormReset);
    }

    // ========================================
    // Initialization
    // ========================================

    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize DOM references
        if (!initializeElements()) {
            return;
        }

        // Initially disable guest count until attendance is selected
        elements.guestCountInput.disabled = true;
        elements.guestCountInput.required = false;

        // Attach event listeners
        attachEventListeners();

        console.log('RSVP form initialized');
    }

    // Start initialization
    init();

})();
