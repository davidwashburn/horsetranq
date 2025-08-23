// Account Button functionality
document.addEventListener('DOMContentLoaded', function() {
    const myAccountBtn = document.getElementById('myAccountBtn');
    
    if (myAccountBtn) {
        // Check if hide avatar is enabled
        const hideAvatarCheckbox = document.getElementById('hideAvatarCheckbox');
        const hideAvatar = hideAvatarCheckbox ? hideAvatarCheckbox.checked : false;
        
        // Get the user's avatar URL from the page data
        // The avatar URL is available in the session data passed to the template
        // We can get it from the profile image in the account modal
        const profileImage = document.querySelector('.profile-image img');
        const defaultAvatarUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/480px-Default_pfp.svg.png';
        const avatarUrl = hideAvatar ? defaultAvatarUrl : (profileImage ? profileImage.src : defaultAvatarUrl);
        
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
