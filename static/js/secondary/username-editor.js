// Username Editor functionality
document.addEventListener('DOMContentLoaded', function() {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const usernameEditBtn = document.getElementById('usernameEditBtn');
    const usernameInput = document.getElementById('usernameInput');
    const usernameSaveBtn = document.getElementById('usernameSaveBtn');
    const usernameCancelBtn = document.getElementById('usernameCancelBtn');
    const usernameEditControls = document.querySelector('.username-edit-controls');
    
    let originalUsername = '';
    let isEditing = false;
    
    // Show edit mode
    function showEditMode() {
        if (!usernameDisplay || !usernameEditControls) return;
        
        originalUsername = usernameInput.value;
        usernameDisplay.style.display = 'none';
        usernameEditBtn.style.display = 'none';
        usernameEditControls.style.display = 'flex';
        usernameInput.focus();
        usernameInput.select();
        isEditing = true;
        
        // Clear any previous error/success messages
        hideMessages();
    }
    
    // Show display mode
    function showDisplayMode() {
        if (!usernameDisplay || !usernameEditControls) return;
        
        usernameDisplay.style.display = 'block';
        usernameEditBtn.style.display = 'inline-block';
        usernameEditControls.style.display = 'none';
        isEditing = false;
        
        // Clear any previous error/success messages
        hideMessages();
    }
    
    // Show error message
    function showError(message) {
        hideMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'username-error';
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        usernameEditControls.appendChild(errorDiv);
    }
    
    // Show success message
    function showSuccess(message) {
        hideMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'username-success';
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        usernameEditControls.appendChild(successDiv);
    }
    
    // Hide all messages
    function hideMessages() {
        const messages = usernameEditControls.querySelectorAll('.username-error, .username-success');
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
        usernameSaveBtn.textContent = 'Saving...';
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
                       // Update the display
                       usernameDisplay.textContent = newUsername;
                       showSuccess(data.message || 'Username updated successfully!');
                       
                       // Update the input value for future edits
                       usernameInput.value = newUsername;
                       originalUsername = newUsername;
                       
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
                               // Update the account button text if it exists
                               const myAccountBtn = document.getElementById('myAccountBtn');
                               if (myAccountBtn) {
                                   myAccountBtn.textContent = newUsername;
                               }
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
            usernameSaveBtn.textContent = 'Save';
            usernameSaveBtn.disabled = false;
        }
    }
    
    // Cancel editing
    function cancelEdit() {
        usernameInput.value = originalUsername;
        showDisplayMode();
    }
    
    // Event listeners
    if (usernameEditBtn) {
        usernameEditBtn.addEventListener('click', showEditMode);
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
