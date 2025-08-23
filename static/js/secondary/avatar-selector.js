// Avatar Selector Dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const avatarSelector = document.getElementById('avatar-selector');
    const customSelect = avatarSelector ? avatarSelector.closest('.custom-select') : null;
    
    if (avatarSelector && customSelect) {
        // Toggle dropdown on click
        avatarSelector.addEventListener('click', function(e) {
            e.preventDefault();
            customSelect.classList.toggle('open');
        });
        
        // Handle option selection
        const options = customSelect.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                const text = this.querySelector('.avatar-option-text').textContent;
                const image = this.querySelector('.avatar-option-image');
                
                // Update the selector display
                avatarSelector.setAttribute('data-value', value);
                avatarSelector.querySelector('.avatar-option-text').textContent = text;
                avatarSelector.querySelector('.avatar-option-image').src = image.src;
                avatarSelector.querySelector('.avatar-option-image').alt = image.alt;
                
                // Close dropdown
                customSelect.classList.remove('open');
                
                // Update the profile image display
                updateProfileImage(value);
                
                // Save selection to Firebase (to be implemented)
                saveAvatarSelection(value);
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('open');
            }
        });
    }
    
    function updateProfileImage(avatarType) {
        const profileImage = document.querySelector('.profile-image img');
        if (!profileImage) return;
        
        let newImageSrc = '';
        
        switch (avatarType) {
            case 'google-profile':
                // Keep the current Google profile image
                newImageSrc = profileImage.src;
                break;
            case 'default-avatar':
                newImageSrc = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/480px-Default_pfp.svg.png';
                break;
            case 'hors-foundation':
                newImageSrc = '/static/img/branding/season-1.png';
                break;
            case 'hors-season-1':
                newImageSrc = '/static/img/branding/season-1.png';
                break;
            case 'hors-season-2':
                newImageSrc = '/static/img/branding/season-2.png';
                break;
            default:
                return;
        }
        
        profileImage.src = newImageSrc;
        
        // Update the account button avatar if not hidden
        const hideAvatarCheckbox = document.getElementById('hideAvatarCheckbox');
        if (hideAvatarCheckbox && !hideAvatarCheckbox.checked) {
            const myAccountBtn = document.getElementById('myAccountBtn');
            if (myAccountBtn) {
                myAccountBtn.style.setProperty('--avatar-url', `url('${newImageSrc}')`);
                updateAvatarCSS();
            }
        }
    }
    
    function updateAvatarCSS() {
        // Remove existing style if it exists
        const existingStyle = document.getElementById('avatar-css-rule');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Add new style
        const style = document.createElement('style');
        style.id = 'avatar-css-rule';
        style.textContent = `
            #myAccountBtn::before {
                background-image: var(--avatar-url) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    async function saveAvatarSelection(avatarType) {
        try {
            const response = await fetch('/api/update-avatar-selection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    avatar_type: avatarType
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log('Avatar selection updated successfully:', data.message);
            } else {
                console.error('Failed to update avatar selection:', data.error);
            }
        } catch (error) {
            console.error('Error updating avatar selection:', error);
        }
    }
});
