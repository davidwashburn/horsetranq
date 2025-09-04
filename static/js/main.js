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
        // Logout button not found - this is normal on pages without account functionality
        // console.log('Logout button not found (this is normal on some pages)');
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

	// Preload critical resources for smoother experience
	function preloadCriticalResources() {
		const criticalImages = [
			'/static/img/branding/legacy/game-horsetranq-alt-large.png',
			'/static/img/games/lemondrop/promo/lemondrop-alt.png'
		];
		
		criticalImages.forEach(src => {
			const img = new Image();
			img.src = src;
		});
	}
	
	// Start preloading immediately
	preloadCriticalResources();
	
	// Page intro animation - using native jQuery
	$(document).ready(function() {
        console.log('Page animation script running...');
        
        // Target all elements with the page-intro animation attribute
        var $content = $('[data-animate="page-intro"]');
        
        console.log('Total content elements to animate:', $content.length);
        
        // Use jQuery's native animate method (CSS already sets initial state)
        setTimeout(function() {
            console.log('Starting animation for', $content.length, 'elements');
            $content.each(function(index) {
                console.log('Animating element', index, ':', this.className || this.tagName);
            });
            
            $content.animate({
                opacity: 1
            }, {
                duration: 500, // 0.5 second animation (50% faster than original)
                step: function(now, tween) {
                    // Calculate slide-up progress based on opacity
                    var slideProgress = now; // opacity goes 0->1, so we use it directly
                    var translateY = 50 * (1 - slideProgress);
                    $(this).css('transform', `translateY(${translateY}px)`);
                },
                complete: function() {
                    // Ensure final state is set correctly
                    $(this).css({
                        'opacity': '1',
                        'transform': 'translateY(0px)'
                    });
                },
                easing: 'swing'
            });
        }, 50); // Reduced delay to 50ms for snappier feel
        
        // Fallback: ensure elements are visible after animation should complete
        setTimeout(function() {
            $content.css({
                'opacity': '1',
                'transform': 'translateY(0px)'
            });
            console.log('Fallback: ensured all elements are visible');
        }, 600); // Slightly longer than animation duration
        
        // Specific fallback for any remaining hidden elements
        setTimeout(function() {
            $('[data-animate="page-intro"]').css({
                'opacity': '1 !important',
                'transform': 'translateY(0px) !important'
            });
            
            // Extra fallback specifically for about page
            $('#about .about-wrapper').css({
                'opacity': '1 !important',
                'transform': 'translateY(0px) !important'
            });
            
            console.log('Universal fallback applied to all animated elements');
        }, 1000);
    });


	// Remove overlay when ranked or free play is selected
	$('#rankedPlayBtn, #freePlayBtn').on('click', function() {
		$('#gameSelectOverlay').removeClass('overlay');
	});

	var target = 'gameSelectModal';
	triggerFilter(target, true);

	var settingsModal = $('#settingsModal');
	var gameSelectModal = $('#gameSelectModal');
	$('.modal-trigger').on('click', function() {
		var target = $(this).data('target');

		if (target == 'settingsModal') {
			gameSelectModal.removeClass('filter-is-visible');
		} else if (target == 'gameSelectModal') {
			settingsModal.removeClass('filter-is-visible');
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
  
  // Index hero image hover effect - timed sequence
  $('#index-hero-button').hover(
    function() {
      var originalSrc = $('#index-hero-img').attr('src');
      var originalOpacity = $('#index-hero-img').css('opacity');
      
      // Reset opacity to 1 and instantly go to image 1
      $('#index-hero-img').css('opacity', '1').attr('src', '/static/img/branding/horsetranq-v3-intensity-1.gif');
      
      var timer2 = setTimeout(function() {
        $('#index-hero-img').attr('src', '/static/img/branding/horsetranq-v3-intensity-2.gif');
      }, 3000);
      var timer3 = setTimeout(function() {
        $('#index-hero-img').attr('src', '/static/img/branding/horsetranq-v3-intensity-3.gif');
      }, 6000);
      var timer4 = setTimeout(function() {
        $('#index-hero-img').attr('src', '/static/img/branding/horsetranq-v3-intensity-4.gif');
      }, 9000);
      var timer5 = setTimeout(function() {
        $('#index-hero-img').attr('src', '/static/img/branding/horsetranq-v3-intensity-5.gif');
      }, 12000);
      var timer6 = setTimeout(function() {
        $('#index-hero-img').attr('src', '/static/img/branding/horsetranq-v3-intensity-6.gif');
      }, 15000);
      var timer7 = setTimeout(function() {
        // After explosion animation, set opacity to 0 while keeping width/height
        $('#index-hero-img').css('opacity', '0');
      }, 18000);
      
      // Store timers and original src on the element for cleanup
      $(this).data('timers', [timer2, timer3, timer4, timer5, timer6, timer7]);
      $(this).data('originalSrc', originalSrc);
      $(this).data('originalOpacity', originalOpacity);
    },
    function() {
      // Clear all timers and restore original image and opacity
      var timers = $(this).data('timers');
      if (timers) {
        timers.forEach(function(timer) {
          clearTimeout(timer);
        });
      }
      var originalSrc = $(this).data('originalSrc');
      var originalOpacity = $(this).data('originalOpacity');
      if (originalSrc) {
        $('#index-hero-img').attr('src', originalSrc);
      }
      if (originalOpacity) {
        $('#index-hero-img').css('opacity', originalOpacity);
      }
    }
  );

