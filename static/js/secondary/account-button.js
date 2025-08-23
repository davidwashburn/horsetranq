// Account Button functionality
document.addEventListener('DOMContentLoaded', function() {
    const myAccountBtn = document.getElementById('myAccountBtn');
    
    if (myAccountBtn) {
        // Check if hide avatar is enabled
        const hideAvatarCheckbox = document.getElementById('hideAvatarCheckbox');
        const hideAvatar = hideAvatarCheckbox ? hideAvatarCheckbox.checked : false;
        
        // Get the user's avatar URL from the avatar selector
        const avatarSelector = document.getElementById('avatar-selector');
        const defaultAvatarUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/480px-Default_pfp.svg.png';
        
        let avatarUrl = defaultAvatarUrl;
        if (!hideAvatar && avatarSelector) {
            const avatarType = avatarSelector.getAttribute('data-value');
            
            switch (avatarType) {
                case 'google-profile':
                    const googleImage = avatarSelector.querySelector('.avatar-option-image');
                    avatarUrl = googleImage ? googleImage.src : defaultAvatarUrl;
                    break;
                case 'default-avatar':
                    avatarUrl = defaultAvatarUrl;
                    break;
                case 'hors-foundation':
                case 'hors-season-1':
                    avatarUrl = '/static/img/branding/season-1.png';
                    break;
                case 'hors-season-2':
                    avatarUrl = '/static/img/branding/season-2.png';
                    break;
                default:
                    avatarUrl = defaultAvatarUrl;
            }
        }
        
        // Set the background image for the ::before pseudo-element
        // We need to use CSS custom properties since we can't directly access ::before
        myAccountBtn.style.setProperty('--avatar-url', `url('${avatarUrl}')`);
        
        // Add CSS rule to set the background image
        const style = document.createElement('style');
        style.textContent = `
            #myAccountBtn::before {
                background-image: var(--avatar-url) !important;
            }
        `;
        document.head.appendChild(style);
        
        // Refresh session data on page load to ensure we have the latest data
        // This is a lightweight operation that only happens once per page load
        if (window.loggedIn) { // Only if user is logged in
            fetch('/api/refresh-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Session refreshed on page load');
                    // Update the account button text if username changed
                    if (data.data && data.data.username && myAccountBtn.textContent !== data.data.username) {
                        myAccountBtn.textContent = data.data.username;
                    }
                }
            })
            .catch(error => {
                console.error('Error refreshing session on page load:', error);
            });
        }
    }
});
