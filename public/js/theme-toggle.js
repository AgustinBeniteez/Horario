// Theme Toggle Functionality
class ThemeToggle {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply saved theme on page load
        this.applyTheme(this.currentTheme);
        
        // Create theme toggle button
        this.createToggleButton();
        
        // Add event listeners
        this.addEventListeners();
    }

    createToggleButton() {
        // Check if button already exists
        if (document.getElementById('theme-toggle')) return;

        const toggleButton = document.createElement('button');
        toggleButton.id = 'theme-toggle';
        toggleButton.className = 'theme-toggle-btn';
        toggleButton.innerHTML = this.getToggleIcon();
        toggleButton.setAttribute('aria-label', 'Cambiar tema');
        toggleButton.title = 'Cambiar entre modo claro y oscuro';

        // Add styles for the toggle button
        this.addToggleStyles();

        // Find a suitable place to insert the button
        const headerActions = document.querySelector('.header-actions');
        const heroContent = document.querySelector('.hero-content');
        const appHeader = document.querySelector('.app-header .header-content');

        if (headerActions) {
            headerActions.appendChild(toggleButton);
        } else if (appHeader) {
            appHeader.appendChild(toggleButton);
        } else if (heroContent) {
            heroContent.appendChild(toggleButton);
        } else {
            // Fallback: add to body
            document.body.appendChild(toggleButton);
        }
    }

    addToggleStyles() {
        if (document.getElementById('theme-toggle-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'theme-toggle-styles';
        styles.textContent = `
            .theme-toggle-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                width: 45px;
                height: 45px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                color: var(--text-inverse);
                font-size: 1.2rem;
                position: relative;
                overflow: hidden;
            }

            .theme-toggle-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }

            .theme-toggle-btn:active {
                transform: scale(0.95);
            }

            /* Animation for icon change */
            .theme-toggle-btn .icon {
                transition: transform 0.3s ease;
            }

            .theme-toggle-btn.changing .icon {
                transform: rotate(180deg);
            }

            /* Fixed position fallback */
            body > .theme-toggle-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                background: var(--primary-color);
                color: var(--text-inverse);
                border: none;
                box-shadow: var(--shadow-lg);
            }

            body > .theme-toggle-btn:hover {
                background: var(--primary-dark);
            }
        `;
        document.head.appendChild(styles);
    }

    getToggleIcon() {
        const icon = this.currentTheme === 'light' ? '🌙' : '☀️';
        return `<span class="icon">${icon}</span>`;
    }

    addEventListeners() {
        const toggleButton = document.getElementById('theme-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.updateToggleButton();
        localStorage.setItem('theme', theme);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update meta theme-color for mobile browsers
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const themeColor = theme === 'dark' ? '#1a1a1a' : '#667eea';
        metaThemeColor.content = themeColor;
    }

    updateToggleButton() {
        const toggleButton = document.getElementById('theme-toggle');
        if (toggleButton) {
            // Add animation class
            toggleButton.classList.add('changing');
            
            setTimeout(() => {
                toggleButton.innerHTML = this.getToggleIcon();
                toggleButton.classList.remove('changing');
            }, 150);
        }
    }

    // Public method to get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize theme toggle when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeToggle = new ThemeToggle();
    });
} else {
    window.themeToggle = new ThemeToggle();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeToggle;
}