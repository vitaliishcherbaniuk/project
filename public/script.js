// Mobile menu
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Custom budget field toggle
const budgetSelect = document.getElementById('budget');
const customBudgetGroup = document.getElementById('customBudgetGroup');
const customBudgetInput = document.getElementById('custom_budget');

if (budgetSelect) {
    budgetSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customBudgetGroup.style.display = 'block';
            customBudgetInput.required = true;
        } else {
            customBudgetGroup.style.display = 'none';
            customBudgetInput.required = false;
            customBudgetInput.value = '';
        }
    });
}

// Order form handling
const orderForm = document.getElementById('orderForm');
const successMessage = document.getElementById('successMessage');
const submitButton = document.querySelector('.btn-submit');

function showError(inputId, message) {
    const errorElement = document.getElementById(`${inputId}Error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
    const input = document.getElementById(inputId);
    if (input) {
        input.style.borderColor = '#ef4444';
    }
}

function clearError(inputId) {
    const errorElement = document.getElementById(`${inputId}Error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
    const input = document.getElementById(inputId);
    if (input) {
        input.style.borderColor = '';
    }
}

// Функція для перевірки імені та прізвища
function validateFullName(name) {
    const trimmedName = name.trim();
    // Розділяємо на слова
    const words = trimmedName.split(/\s+/);

    // Перевіряємо, що є хоча б 2 слова (ім'я та прізвище)
    if (words.length < 2) {
        return { isValid: false, message: 'Будь ласка, введіть ім\'я та прізвище' };
    }

    // Перевіряємо, що кожне слово починається з великої літери і містить тільки літери
    for (let word of words) {
        if (word.length < 2) {
            return { isValid: false, message: 'Ім\'я та прізвище мають бути довшими за 1 літеру' };
        }
        if (!/^[A-Za-zА-Яа-яЄєІіЇїҐґ']+$/.test(word)) {
            return { isValid: false, message: 'Використовуйте тільки літери' };
        }
    }

    return { isValid: true, message: '' };
}

function validateForm(data) {
    let isValid = true;

    // Перевірка імені та прізвища
    if (!data.name || data.name.trim().length < 2) {
        showError('name', 'Будь ласка, введіть ім\'я та прізвище');
        isValid = false;
    } else {
        const nameValidation = validateFullName(data.name);
        if (!nameValidation.isValid) {
            showError('name', nameValidation.message);
            isValid = false;
        } else {
            clearError('name');
        }
    }

    if (!data.telegram || data.telegram.trim().length < 3) {
        showError('telegram', 'Будь ласка, введіть ваш Telegram username');
        isValid = false;
    } else {
        clearError('telegram');
    }

    if (!data.budget) {
        showError('budget', 'Будь ласка, оберіть бюджет');
        isValid = false;
    } else {
        clearError('budget');
    }

    // Перевірка для кастомного бюджету
    if (budgetSelect && budgetSelect.value === 'custom') {
        const customBudget = customBudgetInput ? customBudgetInput.value : '';
        if (!customBudget || customBudget.trim() === '') {
            showError('budget', 'Будь ласка, вкажіть ваш бюджет');
            isValid = false;
        } else if (isNaN(customBudget) || Number(customBudget) <= 0) {
            showError('budget', 'Будь ласка, вкажіть коректну суму бюджету');
            isValid = false;
        }
    }

    if (!data.description || data.description.trim().length < 10) {
        showError('description', 'Будь ласка, опишіть ваше завдання (мінімум 10 символів)');
        isValid = false;
    } else {
        clearError('description');
    }

    return isValid;
}

if (orderForm) {
    orderForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        const formData = new FormData(orderForm);
        let budget = formData.get('budget');

        // If custom budget is selected, use the custom value
        if (budget === 'custom') {
            const customBudget = formData.get('custom_budget');
            if (!customBudget || customBudget.trim() === '') {
                showError('budget', 'Будь ласка, вкажіть ваш бюджет');
                return;
            }
            if (isNaN(customBudget) || Number(customBudget) <= 0) {
                showError('budget', 'Будь ласка, вкажіть коректну суму бюджету');
                return;
            }
            budget = customBudget + ' грн (свій варіант)';
        }

        const data = {
            name: formData.get('name'),
            telegram: formData.get('telegram'),
            budget: budget,
            description: formData.get('description')
        };

        if (!validateForm(data)) {
            return;
        }

        // Show loading state
        submitButton.disabled = true;
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Відправляємо...</span>';

        try {
            const response = await fetch('/api/submit-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                orderForm.style.display = 'none';
                successMessage.style.display = 'block';

                // Reset form
                orderForm.reset();
                if (customBudgetGroup) {
                    customBudgetGroup.style.display = 'none';
                }
                if (budgetSelect) {
                    budgetSelect.value = '';
                }
            } else {
                alert(result.error || 'Помилка при відправленні. Спробуйте пізніше.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Помилка з\'єднання. Перевірте інтернет-з\'єднання та спробуйте ще раз.');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}

// Input validation on blur
const inputs = ['name', 'telegram', 'budget', 'description'];
inputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('blur', () => {
            if (input.value.trim()) {
                if (inputId === 'name') {
                    const nameValidation = validateFullName(input.value);
                    if (!nameValidation.isValid) {
                        showError('name', nameValidation.message);
                    } else {
                        clearError('name');
                    }
                } else {
                    clearError(inputId);
                }
            } else {
                if (inputId === 'name') {
                    showError('name', 'Будь ласка, введіть ім\'я та прізвище');
                } else {
                    showError(inputId, 'Це поле обов\'язкове');
                }
            }
        });
    }
});

// Додаткова валідація для кастомного бюджету
if (customBudgetInput) {
    customBudgetInput.addEventListener('blur', () => {
        if (budgetSelect && budgetSelect.value === 'custom') {
            if (!customBudgetInput.value || customBudgetInput.value.trim() === '') {
                showError('budget', 'Будь ласка, вкажіть ваш бюджет');
            } else if (isNaN(customBudgetInput.value) || Number(customBudgetInput.value) <= 0) {
                showError('budget', 'Будь ласка, вкажіть коректну суму бюджету');
            } else {
                clearError('budget');
            }
        }
    });
}

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    } else {
        header.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
    }
});

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .advantage-card, .stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});