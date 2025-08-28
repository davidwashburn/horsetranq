// Username Editor functionality
document.addEventListener('DOMContentLoaded', function() {
    // New elements for inline editing in profile username label
    const changeNameBtn = document.getElementById('changeNameBtn');
    const profileUsernameLabel = document.getElementById('profile-username');
    const usernameDisplay = profileUsernameLabel ? profileUsernameLabel.querySelector('#usernameDisplay') : null;
    const usernameInput = profileUsernameLabel ? profileUsernameLabel.querySelector('#usernameInput') : null;
    const usernameEditControls = document.getElementById('usernameEditControls');
    const usernameMessages = document.getElementById('usernameMessages');
    const usernameSaveBtn = document.getElementById('usernameSaveBtn');
    const usernameCancelBtn = document.getElementById('usernameCancelBtn');
    
    let originalUsername = '';
    let isEditing = false;
    
    // Show edit mode
    function showEditMode() {
        if (!usernameDisplay || !usernameEditControls || !usernameInput) return;
        
        // Get current username text and set as original
        originalUsername = usernameDisplay.textContent.trim();
        usernameInput.value = originalUsername;
        
        // Hide display, show input and controls
        usernameDisplay.style.display = 'none';
        usernameInput.style.display = 'block';
        usernameEditControls.style.display = 'flex';
        
        // Focus and select the input text
        usernameInput.focus();
        usernameInput.select();
        isEditing = true;
        
        // Clear any previous error/success messages
        hideMessages();
    }
    
    // Show display mode
    function showDisplayMode() {
        if (!usernameDisplay || !usernameEditControls || !usernameInput) return;
        
        usernameDisplay.style.display = 'block';
        usernameInput.style.display = 'none';
        usernameEditControls.style.display = 'none';
        isEditing = false;
        
        // Clear any previous error/success messages
        hideMessages();
    }
    
    // Show error message
    function showError(message) {
        hideMessages();
        if (!usernameMessages) return;
        const errorDiv = document.createElement('div');
        errorDiv.className = 'username-error color-primary-darkest font-size-sm margin-sm-desktop margin-sm-phone margin-sm-tablet';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'display: block;';
        usernameMessages.appendChild(errorDiv);
    }
    
    // Show success message
    function showSuccess(message) {
        hideMessages();
        if (!usernameMessages) return;
        const successDiv = document.createElement('div');
        successDiv.className = 'username-success color-primary-darkest font-size-sm margin-sm-desktop margin-sm-phone margin-sm-tablet';
        successDiv.textContent = message;
        successDiv.style.cssText = 'display: block;';
        usernameMessages.appendChild(successDiv);
    }
    
    // Hide all messages
    function hideMessages() {
        if (!usernameMessages) return;
        const messages = usernameMessages.querySelectorAll('.username-error, .username-success');
        messages.forEach(msg => msg.remove());
    }
    
    // Validate username format
    function validateUsername(username) {
        if (!username || username.trim() === '') {
            return 'Username cannot be empty';
        }
        
        if (username.length < 3) {
            return 'Username must be at least 3 characters long';
        }
        
        if (username.length > 20) {
            return 'Username must be 20 characters or less';
        }
        
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return 'Username can only contain letters, numbers, hyphens, and underscores';
        }
        
        return null; // No error
    }
    
    // Save username
    async function saveUsername() {
        const newUsername = usernameInput.value.trim();
        
        // Client-side validation
        const validationError = validateUsername(newUsername);
        if (validationError) {
            showError(validationError);
            return;
        }
        
        // Don't save if username hasn't changed
        if (newUsername === originalUsername) {
            showDisplayMode();
            return;
        }
        
        // Show loading state
        const saveSpan = usernameSaveBtn.querySelector('span');
        if (saveSpan) saveSpan.textContent = 'SAVING...';
        usernameSaveBtn.disabled = true;
        
        try {
            const response = await fetch('/api/update-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: newUsername })
            });
            
            const data = await response.json();
            
                               if (response.ok) {
                       // Update the profile username display (uppercase for the label)
                       usernameDisplay.textContent = newUsername.toUpperCase();
                       showSuccess(data.message || 'Username updated successfully!');
                       
                       // Update the input value for future edits
                       usernameInput.value = newUsername;
                       originalUsername = newUsername;
                       
                       // Update any other username displays on the page
                       const usernameDataItems = document.querySelectorAll('.data-item');
                       usernameDataItems.forEach(item => {
                           const label = item.querySelector('h4');
                           if (label && label.textContent.includes('Username')) {
                               const valueElement = item.querySelector('p');
                               if (valueElement && valueElement.textContent.trim() !== 'Not logged in') {
                                   valueElement.textContent = newUsername;
                               }
                           }
                       });
                       
                       // Update the navigation username immediately
                       const profileNavItem = document.getElementById('profile-nav-item');
                       if (profileNavItem) {
                           const navUsernameSpan = profileNavItem.querySelector('.nav-toggle-trigger');
                           if (navUsernameSpan) {
                               navUsernameSpan.textContent = newUsername;
                           }
                       }
                       
                       // Refresh session data from Firebase
                       try {
                           const refreshResponse = await fetch('/api/refresh-session', {
                               method: 'POST',
                               headers: {
                                   'Content-Type': 'application/json',
                               }
                           });
                           
                           if (refreshResponse.ok) {
                               console.log('Session refreshed successfully');
                           }
                       } catch (refreshError) {
                           console.error('Error refreshing session:', refreshError);
                       }
                       
                       // Hide success message after 2 seconds
                       setTimeout(() => {
                           showDisplayMode();
                       }, 2000);
                   } else {
                       showError(data.error || 'Failed to update username');
                   }
        } catch (error) {
            console.error('Error updating username:', error);
            showError('Network error. Please try again.');
        } finally {
            // Reset button state
            const saveSpan = usernameSaveBtn.querySelector('span');
            if (saveSpan) saveSpan.textContent = 'SAVE';
            usernameSaveBtn.disabled = false;
        }
    }
    
    // Cancel editing
    function cancelEdit() {
        usernameInput.value = originalUsername;
        // Restore original username display (uppercase for the label)
        if (usernameDisplay) {
            usernameDisplay.textContent = originalUsername.toUpperCase();
        }
        showDisplayMode();
    }
    
    // Event listeners
    if (changeNameBtn) {
        changeNameBtn.addEventListener('click', showEditMode);
    }
    
    if (usernameSaveBtn) {
        usernameSaveBtn.addEventListener('click', saveUsername);
    }
    
    if (usernameCancelBtn) {
        usernameCancelBtn.addEventListener('click', cancelEdit);
    }
    
    if (usernameInput) {
        // Handle Enter key
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveUsername();
            }
        });
        
        // Handle Escape key
        usernameInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
        
        // Real-time validation
        usernameInput.addEventListener('input', function() {
            const username = this.value.trim();
            const error = validateUsername(username);
            
            if (error) {
                this.style.borderColor = 'var(--color-error)';
            } else {
                this.style.borderColor = 'var(--color-contrast-lower)';
            }
        });
    }
});
