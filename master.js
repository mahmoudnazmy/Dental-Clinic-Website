/**
 * SmileStudio Website Scripts
 * @author Mahmoud Nazmy (@mahmoudnazmy)
 * @version 2.0.0
 * @lastUpdated 2025-10-29 11:18:56
 */

class SmileStudioApp {
    constructor() {
        // Initialize current date and user
        this.lastUpdated = '2025-10-29 11:18:56';
        this.currentUser = 'mahmoudnazmy';

        // Initialize components
        this.loading = new LoadingManager();
        this.theme = new ThemeManager();
        this.navigation = new NavigationManager();
        this.forms = new FormManager();
        this.modals = new ModalManager();

        // Setup initial state
        this.setupEventListeners();
        this.initializeApp();
    }

    initializeApp() {
        // Hide loading screen when everything is ready
        window.addEventListener('load', () => {
            this.loading.hide();
        });
    }

    setupEventListeners() {
        // Handle scroll events with throttling
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    this.navigation.handleScroll();
                    scrollTimeout = null;
                }, 100);
            }
        });

        // Handle resize events with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.navigation.updateLayout();
            }, 250);
        });
    }
}

class LoadingManager {
    constructor() {
        this.overlay = document.getElementById('loading-overlay');
    }

    hide() {
        if (!this.overlay) return;
        
        this.overlay.classList.add('opacity-0');
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 500);
    }
}

class ThemeManager {
    constructor() {
        this.toggle = document.getElementById('theme-toggle');
        this.initialize();
    }

    initialize() {
        // Check saved preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
        }

        // Setup toggle button
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
    }
}

class NavigationManager {
    constructor() {
        this.header = document.querySelector('header');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.indicator = document.getElementById('section-indicator');
        this.sections = document.querySelectorAll('section[id]');
        this.navLinks = document.querySelectorAll('nav a[href^="#"]');
        this.lastScroll = 0;
        this.isMenuOpen = false;

        this.initialize();
    }

    initialize() {
        // Setup mobile menu
        if (this.mobileMenuBtn && this.mobileMenu) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
            
            // Close menu on link clicks
            this.mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => this.closeMobileMenu());
            });

            // Close menu on overlay click
            const overlay = this.mobileMenu.querySelector('.backdrop-blur-sm');
            if (overlay) {
                overlay.addEventListener('click', () => this.closeMobileMenu());
            }
        }

        // Setup navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection(link.getAttribute('href'));
            });
        });

        // Setup escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.isMenuOpen ? this.closeMobileMenu() : this.openMobileMenu();
    }

    openMobileMenu() {
        if (!this.mobileMenu) return;
        this.mobileMenu.classList.remove('invisible');
        this.mobileMenu.querySelector('.backdrop-blur-sm').classList.add('opacity-100');
        this.mobileMenu.querySelector('.absolute.left-0').classList.remove('-translate-x-full');
        document.body.classList.add('overflow-hidden');
        this.isMenuOpen = true;
    }

    closeMobileMenu() {
        if (!this.mobileMenu) return;
        const backdrop = this.mobileMenu.querySelector('.backdrop-blur-sm');
        const panel = this.mobileMenu.querySelector('.absolute.left-0');
        
        backdrop.classList.remove('opacity-100');
        panel.classList.add('-translate-x-full');
        
        setTimeout(() => {
            this.mobileMenu.classList.add('invisible');
            document.body.classList.remove('overflow-hidden');
        }, 300);
        
        this.isMenuOpen = false;
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Header visibility
        if (this.header) {
            if (scrollTop > this.lastScroll && scrollTop > 100) {
                this.header.classList.add('-translate-y-full');
            } else {
                this.header.classList.remove('-translate-y-full');
            }
        }

        // Update active section
        this.updateActiveSection(scrollTop);
        this.lastScroll = scrollTop;
    }

    updateActiveSection(scrollPosition) {
        this.sections.forEach(section => {
            if (!section.id) return;

            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                this.updateIndicator(section.id);
                this.updateActiveLink(section.id);
            }
        });
    }

    updateIndicator(activeId) {
        if (!this.indicator) return;

        const activeLink = document.querySelector(`nav a[href="#${activeId}"]`);
        if (!activeLink) return;

        const linkRect = activeLink.getBoundingClientRect();
        const headerRect = this.header.getBoundingClientRect();

        this.indicator.style.width = `${linkRect.width}px`;
        this.indicator.style.transform = `translateX(${linkRect.left - headerRect.left}px)`;
        this.indicator.style.opacity = '1';
    }

    updateActiveLink(activeId) {
        this.navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${activeId}`;
            link.classList.toggle('text-primary', isActive);
        });
    }

    scrollToSection(targetId) {
        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        const headerHeight = this.header?.offsetHeight || 0;
        const targetPosition = targetSection.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        if (this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }

    updateLayout() {
        if (this.indicator) {
            const activeLink = document.querySelector('nav a.text-primary');
            if (activeLink) {
                this.updateIndicator(activeLink.getAttribute('href').substring(1));
            }
        }
    }
}

class FormManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formType = form.getAttribute('data-form-type');
                
                if (formType === 'contact') {
                    this.handleContactSubmit(e.target);
                } else if (formType === 'booking') {
                    this.handleBookingSubmit(e.target);
                }
            });
        });
    }

    handleContactSubmit(form) {
        const formElements = form.elements;
        const formData = {
            name: formElements.name.value,
            phone: formElements.phone.value,
            email: formElements.email.value,
            message: formElements.message.value
        };

        const message = this.formatContactMessage(formData);
        this.sendToWhatsApp(message);
        form.reset();
    }

    handleBookingSubmit(form) {
        const formElements = form.elements;
        const formData = {
            name: formElements.name.value,
            phone: formElements.phone.value,
            service: formElements.service.value,
            date: formElements.date.value,
            time: formElements.time.value,
            notes: formElements.notes?.value || 'لا توجد'
        };

        const message = this.formatBookingMessage(formData);
        this.sendToWhatsApp(message);
        form.reset();
    }

    formatContactMessage(data) {
        return `
*رسالة جديدة من الموقع* ✨
------------------
*الاسم:* ${data.name}
*الهاتف:* ${data.phone}
*البريد:* ${data.email}
*الرسالة:* ${data.message}
------------------
${new Date().toLocaleString('ar-EG')}
        `.trim();
    }

    formatBookingMessage(data) {
        return `
*حجز موعد جديد* ✨
------------------
*الاسم:* ${data.name}
*الهاتف:* ${data.phone}
*الخدمة:* ${data.service}
*التاريخ:* ${data.date}
*الوقت:* ${data.time}
*ملاحظات:* ${data.notes}
------------------
${new Date().toLocaleString('ar-EG')}
        `.trim();
    }

    sendToWhatsApp(message) {
        const whatsappUrl = `https://wa.me/201012345678?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        this.showNotification('تم إرسال رسالتك بنجاح!', 'success');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 z-50 rounded-lg p-4 
                                ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
                                text-white shadow-lg transition-all duration-500`;

        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined">
                    ${type === 'success' ? 'check_circle' : 'error'}
                </span>
                <p>${message}</p>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateY(200%)';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}



class ModalManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        document.querySelectorAll('[data-modal-target]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modalId = trigger.dataset.modalTarget;
                this.openModal(modalId);
            });
        });

        document.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                const modal = closeBtn.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }
}

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SmileStudioApp();
});

// Global exports
window.app = app;