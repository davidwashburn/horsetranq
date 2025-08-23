// Hide Avatar Checkbox functionality
document.addEventListener('DOMContentLoaded', function() {
    const hideAvatarCheckbox = document.getElementById('hideAvatarCheckbox');
    const myAccountBtn = document.getElementById('myAccountBtn');
    
    if (hideAvatarCheckbox && myAccountBtn) {
        // Add event listener for checkbox changes
        hideAvatarCheckbox.addEventListener('change', function() {
            const hideAvatar = this.checked;
            
            // Update the avatar display immediately
            updateAvatarDisplay(hideAvatar);
            
            // Send update to server
            updateHideAvatarSetting(hideAvatar);
        });
        
        // Initialize avatar display based on current checkbox state
        updateAvatarDisplay(hideAvatarCheckbox.checked);
    }
    
    function updateAvatarDisplay(hideAvatar) {
        if (!myAccountBtn) return;
        
        if (hideAvatar) {
            // Use default avatar
            const defaultAvatarUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/480px-Default_pfp.svg.png';
            myAccountBtn.style.setProperty('--avatar-url', `url('${defaultAvatarUrl}')`);
        } else {
            // Use user's avatar
            const profileImage = document.querySelector('.profile-image img');
            const avatarUrl = profileImage ? profileImage.src : 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/480px-Default_pfp.svg.png';
            myAccountBtn.style.setProperty('--avatar-url', `url('${avatarUrl}')`);
        }
        
        // Update CSS rule
        updateAvatarCSS();
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
    
    async function updateHideAvatarSetting(hideAvatar) {
        try {
            const response = await fetch('/api/update-hide-avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hide_avatar: hideAvatar
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log('Avatar visibility updated successfully:', data.message);
                
                // Refresh session data to ensure consistency
                try {
                    const refreshResponse = await fetch('/api/refresh-session', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    
                    if (refreshResponse.ok) {
                        console.log('Session refreshed after avatar visibility update');
                    }
                } catch (refreshError) {
                    console.error('Error refreshing session:', refreshError);
                }
            } else {
                console.error('Failed to update avatar visibility:', data.error);
                // Revert checkbox state on error
                hideAvatarCheckbox.checked = !hideAvatar;
                updateAvatarDisplay(!hideAvatar);
            }
        } catch (error) {
            console.error('Error updating avatar visibility:', error);
            // Revert checkbox state on error
            hideAvatarCheckbox.checked = !hideAvatar;
            updateAvatarDisplay(!hideAvatar);
        }
    }
});
