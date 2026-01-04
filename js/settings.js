// Settings Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
    setupEventListeners();
    loadUserSettings();
});

// Initialize settings functionality
function initializeSettings() {
    // Set up navigation
    setupSettingsNavigation();
    
    // Set up theme selector
    setupThemeSelector();
    
    // Set up toggle switches
    setupToggleSwitches();
    
    // Set up form validation
    setupFormValidation();
}

// Setup settings navigation
function setupSettingsNavigation() {
    const settingsLinks = document.querySelectorAll('.settings-link');
    const settingsPanels = document.querySelectorAll('.settings-panel');
    
    settingsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all links and panels
            settingsLinks.forEach(l => l.classList.remove('active'));
            settingsPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked link and corresponding panel
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
            
            // Update URL hash
            window.location.hash = targetSection;
        });
    });
    
    // Handle direct hash navigation
    if (window.location.hash) {
        const hashSection = window.location.hash.substring(1);
        const targetLink = document.querySelector(`[data-section="${hashSection}"]`);
        if (targetLink) {
            targetLink.click();
        }
    }
}

// Setup theme selector
function setupThemeSelector() {
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
        themeSelector.addEventListener('change', function() {
            const selectedTheme = this.value;
            applyTheme(selectedTheme);
            saveUserSetting('theme', selectedTheme);
            showSettingsMessage('Theme updated successfully!', 'success');
        });
    }
}

// Apply theme to the website
function applyTheme(theme) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-gold', 'theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-red');
    
    // Add new theme class
    if (theme !== 'gold') {
        body.classList.add(`theme-${theme}`);
    }
    
    // Update CSS variables based on theme
    const root = document.documentElement;
    const themeColors = {
        gold: { primary: '#FFD700', hover: '#FFA500' },
        blue: { primary: '#3498db', hover: '#2980b9' },
        green: { primary: '#2ecc71', hover: '#27ae60' },
        purple: { primary: '#9b59b6', hover: '#8e44ad' },
        orange: { primary: '#f39c12', hover: '#e67e22' },
        red: { primary: '#e74c3c', hover: '#c0392b' }
    };
    
    if (themeColors[theme]) {
        root.style.setProperty('--primary-color', themeColors[theme].primary);
        root.style.setProperty('--primary-hover', themeColors[theme].hover);
    }
}

// Setup toggle switches
function setupToggleSwitches() {
    const toggles = document.querySelectorAll('.toggle-switch input');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const settingName = this.closest('.notification-item, .marketing-item, .privacy-item')
                ?.querySelector('h4')?.textContent || 'Setting';
            
            const status = this.checked ? 'enabled' : 'disabled';
            console.log(`${settingName} ${status}`);
            
            // Save setting
            saveUserSetting(this.id || settingName.toLowerCase().replace(/\s+/g, '_'), this.checked);
        });
    });
}

// Setup form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('.setting-input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            // Remove error styling on input
            this.classList.remove('error');
        });
    });
}

// Validate individual input
function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    
    if (input.hasAttribute('required') && !value) {
        isValid = false;
    }
    
    if (input.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
    }
    
    if (input.type === 'url' && value && !isValidUrl(value)) {
        isValid = false;
    }
    
    if (isValid) {
        input.classList.remove('error');
    } else {
        input.classList.add('error');
    }
    
    return isValid;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// URL validation
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Save settings button
    const saveBtn = document.querySelector('.save-settings-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAllSettings);
    }
    
    // Reset settings button
    const resetBtn = document.querySelector('.reset-settings-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAllSettings);
    }
    
    // Copy URL buttons
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            copyUrl(this);
        });
    });
    
    // Account action buttons
    const logoutSettingsBtn = document.querySelector('.logout-settings-btn');
    if (logoutSettingsBtn) {
        logoutSettingsBtn.addEventListener('click', handleLogoutFromSettings);
    }
    
    const changePasswordBtn = document.querySelector('.change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handleChangePassword);
    }
    
    const downloadDataBtn = document.querySelector('.download-data-btn');
    if (downloadDataBtn) {
        downloadDataBtn.addEventListener('click', handleDownloadData);
    }
    
    const deleteAccountBtn = document.querySelector('.delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }
    
    // Language selector
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            const selectedLanguage = this.value;
            changeLanguage(selectedLanguage);
            saveUserSetting('language', selectedLanguage);
        });
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            toggleDarkMode(this.checked);
            saveUserSetting('darkMode', this.checked);
        });
    }
    
    // Animations toggle
    const animationsToggle = document.getElementById('animations');
    if (animationsToggle) {
        animationsToggle.addEventListener('change', function() {
            toggleAnimations(this.checked);
            saveUserSetting('animations', this.checked);
        });
    }
}

// Copy URL to clipboard
function copyUrl(button) {
    const urlInput = button.previousElementSibling;
    const url = urlInput.value;
    
    navigator.clipboard.writeText(url).then(() => {
        // Show success feedback
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
        
        showSettingsMessage(`URL copied to clipboard: ${url}`, 'success');
    }).catch(err => {
        console.error('Failed to copy URL:', err);
        showSettingsMessage('Failed to copy URL to clipboard', 'error');
    });
}

// Save all settings
function saveAllSettings() {
    const saveBtn = document.querySelector('.save-settings-btn');
    saveBtn.classList.add('loading');
    
    // Simulate API call
    setTimeout(() => {
        const allInputs = document.querySelectorAll('.setting-input');
        let allValid = true;
        
        allInputs.forEach(input => {
            if (!validateInput(input)) {
                allValid = false;
            }
        });
        
        if (allValid) {
            // Collect all settings
            const settings = collectAllSettings();
            
            // Save to localStorage (in real app, this would be an API call)
            localStorage.setItem('targstar_settings', JSON.stringify(settings));
            
            showSettingsMessage('All settings saved successfully!', 'success');
        } else {
            showSettingsMessage('Please fix the errors before saving', 'error');
        }
        
        saveBtn.classList.remove('loading');
    }, 1500);
}

// Reset all settings to default
function resetAllSettings() {
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
        // Reset form values
        document.getElementById('theme-selector').value = 'gold';
        document.getElementById('language-selector').value = 'en';
        document.getElementById('dark-mode').checked = true;
        document.getElementById('animations').checked = true;
        
        // Reset all toggles
        const toggles = document.querySelectorAll('.toggle-switch input');
        toggles.forEach(toggle => {
            toggle.checked = true;
        });
        
        // Reset profile form
        document.getElementById('profile-name').value = 'John Doe';
        document.getElementById('profile-email').value = 'john.doe@example.com';
        document.getElementById('profile-phone').value = '+251-911-123456';
        document.getElementById('profile-timezone').value = 'Africa/Addis_Ababa';
        
        // Apply default theme
        applyTheme('gold');
        
        // Clear localStorage
        localStorage.removeItem('targstar_settings');
        
        showSettingsMessage('All settings have been reset to default', 'success');
    }
}

// Collect all settings
function collectAllSettings() {
    const settings = {
        theme: document.getElementById('theme-selector').value,
        language: document.getElementById('language-selector').value,
        darkMode: document.getElementById('dark-mode').checked,
        animations: document.getElementById('animations').checked,
        profile: {
            name: document.getElementById('profile-name').value,
            email: document.getElementById('profile-email').value,
            phone: document.getElementById('profile-phone').value,
            timezone: document.getElementById('profile-timezone').value
        },
        notifications: {},
        marketing: {},
        privacy: {}
    };
    
    // Collect notification settings
    const notificationToggles = document.querySelectorAll('#email-notifications .toggle-switch input');
    notificationToggles.forEach((toggle, index) => {
        const settingName = `notification_${index}`;
        settings.notifications[settingName] = toggle.checked;
    });
    
    // Collect marketing settings
    const marketingToggles = document.querySelectorAll('#marketing-emails .toggle-switch input');
    marketingToggles.forEach((toggle, index) => {
        const settingName = `marketing_${index}`;
        settings.marketing[settingName] = toggle.checked;
    });
    
    // Collect privacy settings
    const privacyToggles = document.querySelectorAll('#privacy-security .toggle-switch input');
    privacyToggles.forEach((toggle, index) => {
        const settingName = `privacy_${index}`;
        settings.privacy[settingName] = toggle.checked;
    });
    
    return settings;
}

// Load user settings
function loadUserSettings() {
    const savedSettings = localStorage.getItem('targstar_settings');
    
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            // Apply saved settings
            if (settings.theme) {
                document.getElementById('theme-selector').value = settings.theme;
                applyTheme(settings.theme);
            }
            
            if (settings.language) {
                document.getElementById('language-selector').value = settings.language;
            }
            
            if (typeof settings.darkMode === 'boolean') {
                document.getElementById('dark-mode').checked = settings.darkMode;
                toggleDarkMode(settings.darkMode);
            }
            
            if (typeof settings.animations === 'boolean') {
                document.getElementById('animations').checked = settings.animations;
                toggleAnimations(settings.animations);
            }
            
            // Load profile settings
            if (settings.profile) {
                if (settings.profile.name) document.getElementById('profile-name').value = settings.profile.name;
                if (settings.profile.email) document.getElementById('profile-email').value = settings.profile.email;
                if (settings.profile.phone) document.getElementById('profile-phone').value = settings.profile.phone;
                if (settings.profile.timezone) document.getElementById('profile-timezone').value = settings.profile.timezone;
            }
            
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
}

// Save individual user setting
function saveUserSetting(key, value) {
    const savedSettings = localStorage.getItem('targstar_settings');
    let settings = {};
    
    if (savedSettings) {
        try {
            settings = JSON.parse(savedSettings);
        } catch (error) {
            console.error('Error parsing saved settings:', error);
        }
    }
    
    settings[key] = value;
    localStorage.setItem('targstar_settings', JSON.stringify(settings));
}

// Change language (placeholder function)
function changeLanguage(language) {
    console.log(`Language changed to: ${language}`);
    // In a real application, this would load different language files
    // and update all text content on the page
}

// Toggle dark mode
function toggleDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Toggle animations
function toggleAnimations(enabled) {
    if (enabled) {
        document.body.classList.remove('no-animations');
    } else {
        document.body.classList.add('no-animations');
    }
}

// Show settings message
function showSettingsMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.settings-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `settings-message ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    messageDiv.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    // Insert at the top of settings content
    const settingsContent = document.querySelector('.settings-content');
    const activePanel = document.querySelector('.settings-panel.active');
    
    if (activePanel) {
        activePanel.insertBefore(messageDiv, activePanel.firstChild);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Fake API endpoints for demonstration
const API_ENDPOINTS = {
    website: 'https://targstar.ai',
    api: 'https://api.targstar.ai/v1',
    cdn: 'https://cdn.targstar.ai/assets',
    support: 'https://support.targstar.ai',
    email: 'https://email.targstar.ai/notifications',
    unsubscribe: 'https://targstar.ai/unsubscribe',
    templates: 'https://templates.targstar.ai/email',
    reminders: 'https://reminders.targstar.ai/course',
    schedule: 'https://schedule.targstar.ai/manage',
    push: 'https://push.targstar.ai/notifications',
    marketing: 'https://marketing.targstar.ai/campaigns',
    newsletter: 'https://newsletter.targstar.ai/subscribe',
    analytics: 'https://analytics.targstar.ai/marketing',
    preferences: 'https://preferences.targstar.ai/marketing'
};

// Export for global access
window.settingsAPI = {
    copyUrl,
    saveAllSettings,
    resetAllSettings,
    applyTheme,
    showSettingsMessage,
    API_ENDPOINTS
};

// Account action handlers
function handleLogoutFromSettings() {
    if (confirm('Are you sure you want to logout from your account?')) {
        // Show loading state
        const logoutBtn = document.querySelector('.logout-settings-btn');
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
        logoutBtn.disabled = true;
        
        // Simulate logout process
        setTimeout(() => {
            // Clear user data
            localStorage.removeItem('targstar_user');
            localStorage.removeItem('targstar_settings');
            
            // Show success message
            showSettingsMessage('Successfully logged out! Redirecting...', 'success');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }, 1000);
    }
}

function handleChangePassword() {
    const modal = createPasswordChangeModal();
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function handleDownloadData() {
    const downloadBtn = document.querySelector('.download-data-btn');
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
    downloadBtn.disabled = true;
    
    // Simulate data preparation
    setTimeout(() => {
        // Create fake data file
        const userData = {
            profile: {
                name: document.getElementById('profile-name').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value,
                timezone: document.getElementById('profile-timezone').value
            },
            settings: JSON.parse(localStorage.getItem('targstar_settings') || '{}'),
            courses: [
                { name: 'Machine Learning Fundamentals', progress: 75, completed: false },
                { name: 'Deep Learning Mastery', progress: 45, completed: false },
                { name: 'Natural Language Processing', progress: 100, completed: true }
            ],
            certificates: [
                { course: 'Natural Language Processing', date: '2024-01-15', id: 'CERT-NLP-2024-001' }
            ]
        };
        
        // Create and download file
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'targstar-user-data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Reset button
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Data';
        downloadBtn.disabled = false;
        
        showSettingsMessage('Your data has been downloaded successfully!', 'success');
    }, 2000);
}

function handleDeleteAccount() {
    const confirmText = 'DELETE';
    const userInput = prompt(`This action cannot be undone. All your data will be permanently deleted.\n\nType "${confirmText}" to confirm account deletion:`);
    
    if (userInput === confirmText) {
        const deleteBtn = document.querySelector('.delete-account-btn');
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        deleteBtn.disabled = true;
        
        // Simulate account deletion
        setTimeout(() => {
            // Clear all data
            localStorage.clear();
            sessionStorage.clear();
            
            alert('Your account has been permanently deleted. You will be redirected to the home page.');
            window.location.href = 'index.html';
        }, 3000);
    } else if (userInput !== null) {
        showSettingsMessage('Account deletion cancelled. Confirmation text did not match.', 'error');
    }
}

function createPasswordChangeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Change Password</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <form id="change-password-form" style="padding: 20px;">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="current-password">Current Password</label>
                    <input type="password" id="current-password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="new-password">New Password</label>
                    <input type="password" id="new-password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="confirm-password">Confirm New Password</label>
                    <input type="password" id="confirm-password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="this.closest('.modal').remove()" style="padding: 10px 20px; background: #ccc; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
                    <button type="submit" style="padding: 10px 20px; background: linear-gradient(45deg, #FFD700, #FFA500); color: white; border: none; border-radius: 5px; cursor: pointer;">Change Password</button>
                </div>
            </form>
        </div>
    `;
    
    // Add form submission handler
    modal.querySelector('#change-password-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters long!');
            return;
        }
        
        // Simulate password change
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            modal.remove();
            showSettingsMessage('Password changed successfully!', 'success');
        }, 1500);
    });
    
    return modal;
}