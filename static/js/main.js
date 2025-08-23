// ACCOUNT FUNCTIONS AND AUTH0 IMPLEMENTATION //
import { set } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { auth, getUserDataRef } from './firebase.js';
import { onValue } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// Get the user's Auth0 ID (from window object)
var auth0UserId = window.auth0UserId;
console.log('Auth0 user ID:', auth0UserId);

// Get a reference to the user's data in Realtime Database.
var userRef = getUserDataRef(auth0UserId);
console.log('User ref:', userRef);

// Listen for data changes and update the UI accordingly.
onValue(userRef, (snapshot) => {
	var userData = snapshot.val();
	var userDataDiv = document.getElementById('user-data');
  
	if (userData) {
	  console.log('User data:', userData);
	  // You can now access and use userData.name, userData.email, and userData.picture in your frontend application.
  
	  // Display user data in the HTML page
	  var userDataHTML = `
		<p>Name: ${userData.name}</p>
		<p>Email: ${userData.email}</p>
		<img src="${userData.picture}" alt="User profile picture" width="100" height="100">
	  `;
	  userDataDiv.innerHTML = userDataHTML;
	} else {
		console.warn('No user data found in Realtime Database for user:', auth0UserId);
		userDataDiv.innerHTML = '<p>No user data found</p>';
	
		// Create new user data
		var newUserData = {
		  name: 'John Doe',  // replace with actual user name
		  email: 'john.doe@example.com',  // replace with actual user email
		  picture: 'https://example.com/profile-pic.jpg'  // replace with actual user profile picture URL
		};
		set(userRef, newUserData).then(() => {
		  console.log('New user data has been written to the database.');
		}).catch((error) => {
		  console.error('Failed to write new user data to the database:', error);
		});
	}
  });

  // Log the firebase token for the web client
  console.log('Web Client Firebase token:', window.firebaseToken);

// Auth0 logout function
document.addEventListener("DOMContentLoaded", function() {
    const logoutBtn = document.getElementById('accountSignOutBtn');
    
    if(logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.assign('/logout');
        });
    } else {
        console.error('Logout button not found');
    }
});

/*
// account delete from database option //
$("#accountDeleteBtn").click(function() {
    var result = confirm("Are you sure you want to delete your account?");
    if (result) {
        // User clicked 'OK', send AJAX request to delete account
        $.ajax({
            url: '/api/delete-user',
            method: 'POST',
            success: function(response) {
                console.log(response.message);
                // Account deleted successfully, clear user data from local storage and redirect user
                localStorage.removeItem('user');
                window.location.href = '/'; // Redirect to home page
            },
            error: function(response) {
                console.log(response.message);
                // Do something if there was an error deleting the account
            }
        });
    }
});
*/

// DOCUMENT READY FUNCTIONS AND ONLOAD SCRIPTS //
jQuery(document).ready(function($){

	// OPTIMIZED LOADING SCREEN PERFORMANCE
	
	// Preload critical resources for smoother experience
	function preloadCriticalResources() {
		const criticalImages = [
			'/static/img/branding/game-horsetranq-alt-large.png',
			'/static/img/games/lemondrop/promo/lemondrop-alt.png',
			// Preload the loading screen background for instant display
			'/static/img/games/horsplay/backgrounds/peaceful-alt.png'
		];
		
		criticalImages.forEach(src => {
			const img = new Image();
			img.src = src;
		});
	}
	
	// Start preloading immediately
	preloadCriticalResources();
	
	// Function to use lightweight CSS spinner instead of heavy GIF
	function useLightweightLoader() {
		const container = document.getElementById('loading-img-container');
		if (container) {
			// Replace GIF with CSS spinner - natural background visibility
			container.innerHTML = '<div class="horse-spinner"></div>';
		}
	}
	
	// Function to use optimized GIF loader
	function useOptimizedGifLoader() {
		const container = document.getElementById('loading-img-container');
		if (container && container.querySelector('img')) {
			const img = container.querySelector('img');
			// Use the smallest GIF and lazy load
			img.src = '/static/img/loading/hors-load-3.gif'; // 386KB - smallest one
			img.loading = 'eager';
			img.style.width = '150px'; // Even smaller for better performance
			// Natural background - no white box
		}
	}
	
	// Auto-detect performance and choose best loading method
	function autoOptimizeLoader() {
		// Check connection speed or device performance
		if ('connection' in navigator) {
			const connection = navigator.connection;
			if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
				useLightweightLoader();
				return;
			}
		}
		
		// Check if user prefers reduced motion
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			useLightweightLoader();
			return;
		}
		
		// Default to optimized GIF
		useOptimizedGifLoader();
	}
	
	// Apply optimization
	autoOptimizeLoader();
	
	// Remove the loading screen after DOM and initial resources load
	// Reduced time for better UX
	setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }, 1200); // Reduced from 1750ms to 1200ms


	// Remove overlay when ranked or free play is selected
	$('#rankedPlayBtn, #freePlayBtn, #myAccountBtn').on('click', function() {
		$('#gameSelectOverlay').removeClass('overlay');
	});

	var target = 'gameSelectModal';
	triggerFilter(target, true);

	var settingsModal = $('#settingsModal');
	var gameSelectModal = $('#gameSelectModal');
	var accountModal = $('#accountModal');

	$('.modal-trigger').on('click', function() {
		var target = $(this).data('target');

		if (target == 'settingsModal') {
			gameSelectModal.removeClass('filter-is-visible');
			accountModal.removeClass('filter-is-visible');
		} else if (target == 'gameSelectModal') {
			settingsModal.removeClass('filter-is-visible');
			accountModal.removeClass('filter-is-visible');
		} else if (target == 'accountModal') {
			settingsModal.removeClass('filter-is-visible');
			gameSelectModal.removeClass('filter-is-visible');
		}

		$('#' + target).toggleClass('filter-is-visible');
		triggerFilter(target, true);
	});

	$('.cd-filter .cd-custom-close-modal').on('click', function() {
		var parentModal = $(this).closest('.cd-filter').attr('id');
		triggerFilter(parentModal, false);
	});

	$('.cd-close-filter').on('click', function() {
		var parentModal = $(this).closest('.cd-filter').attr('id');
		triggerFilter(parentModal, false);
	});

	function triggerFilter(target, $bool) {
		var elementsToTrigger = $([$('#' + target), $('.cd-tab-filter'), $('.cd-gallery')]);
		elementsToTrigger.each(function() {
			$(this).toggleClass('filter-is-visible', $bool);
		});
	}

	// open/close lateral filter
	$('.modal-trigger').on('click', function() {
		var target = $(this).data('target');
		triggerFilter(target, true);
	});

	$('.cd-filter .cd-close-filter').on('click', function() {
		var parentModal = $(this).closest('.cd-filter').attr('id');
		triggerFilter(parentModal, false);
	});

	function triggerFilter(target, $bool) {
		var elementsToTrigger = $([$('#' + target), $('.cd-tab-filter'), $('.cd-gallery')]);
		elementsToTrigger.each(function() {
			$(this).toggleClass('filter-is-visible', $bool);
		});
	}

	// mobile version - detect click event on filters tab
	var filter_tab_placeholder = $('.cd-tab-filter .placeholder a'),
	filter_tab_placeholder_default_value = 'Select',
	filter_tab_placeholder_text = filter_tab_placeholder.text();

	$('.cd-tab-filter li').on('click', function(event) {
	// detect which tab filter item was selected
	var selected_filter = $(event.target).data('type');

	// check if user has clicked the placeholder item
	if ($(event.target).is(filter_tab_placeholder)) {
		if (filter_tab_placeholder_default_value == filter_tab_placeholder.text()) {
			filter_tab_placeholder.text(filter_tab_placeholder_text);
		} else {
			filter_tab_placeholder.text(filter_tab_placeholder_default_value);
		}
		$('.cd-tab-filter').toggleClass('is-open');

	// check if user has clicked a filter already selected
	} else if (filter_tab_placeholder.data('type') == selected_filter) {
		filter_tab_placeholder.text($(event.target).text());
		$('.cd-tab-filter').removeClass('is-open');
	} else {
		// close the dropdown and change placeholder text/data-type value
		$('.cd-tab-filter').removeClass('is-open');
		filter_tab_placeholder.text($(event.target).text()).data('type', selected_filter);
		filter_tab_placeholder_text = $(event.target).text();

		// add class selected to the selected filter item
		$('.cd-tab-filter .selected').removeClass('selected');
		$(event.target).addClass('selected');
	}
	});

});



// TABLES AND FORMATTING //
// Usage: codyhouse.co/license
(function() {
	function initTable(table) {
	  checkTableLayour(table); // switch from a collapsed to an expanded layout
	  table.classList.add('table--loaded'); // show table
  
	  // custom event emitted when window is resized
	  table.addEventListener('update-table', function(event){
		checkTableLayour(table);
	  });
	};
  
	function checkTableLayour(table) {
	  var layout = getComputedStyle(table, ':before').getPropertyValue('content').replace(/\'|"/g, '');
	  table.classList.toggle(tableExpandedLayoutClass, layout != 'collapsed');
	};
  
	var tables = document.getElementsByClassName('js-table'),
	  tableExpandedLayoutClass = 'table--expanded';
	if( tables.length > 0 ) {
	  var j = 0;
	  for( var i = 0; i < tables.length; i++) {
		var beforeContent = getComputedStyle(tables[i], ':before').getPropertyValue('content');
		if(beforeContent && beforeContent !='' && beforeContent !='none') {
		  (function(i){initTable(tables[i]);})(i);
		  j = j + 1;
		} else {
		  tables[i].classList.add('table--loaded');
		}
	  }
	  
	  if(j > 0) {
		var resizingId = false,
		  customEvent = new CustomEvent('update-table');
		window.addEventListener('resize', function(event){
		  clearTimeout(resizingId);
		  resizingId = setTimeout(doneResizing, 300);
		});
  
		function doneResizing() {
		  for( var i = 0; i < tables.length; i++) {
			(function(i){tables[i].dispatchEvent(customEvent)})(i);
		  };
		};
  
		(window.requestAnimationFrame) // init table layout
		  ? window.requestAnimationFrame(doneResizing)
		  : doneResizing();
	  }
	}
  }());
  