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

window.onload = function() {

	document.querySelectorAll('.custom-select').forEach(select => {
		select.querySelector('.optn-select').addEventListener('click', () => {
			select.classList.toggle('open');
		});
	
		select.querySelectorAll('.option').forEach(option => {
			option.addEventListener('click', () => {
				select.querySelector('.optn-select').textContent = option.textContent;
				select.querySelector('.optn-select').dataset.value = option.dataset.value;
				select.classList.remove('open');
			});
		});
	}); 	

	// background and game mechanics //
    var horseImages = [
        '/static/img/assets/hors-1.png',
        '/static/img/assets/hors-2.png',
        '/static/img/assets/hors-3.png',
    ];

    var horseSpeed = 2; // Initialize horse speed

    function setHorseSpeed() {
        var horseElements = document.getElementsByClassName('horse-logo-3x');
        for (var i = 0; i < horseElements.length; i++) {
            var animationDuration = (Math.random() * 3 + 3) / horseSpeed;
            horseElements[i].style.animation = 'move ' + animationDuration + 's linear infinite';
        }
    }
	
    $('#speed-selector').on('change', function() {
        horseSpeed = parseFloat($(this).val());
    });

	// Function to pick a random image
	function getRandomImage() {
		var images = [
			'farm-bg-day.jpg',
			'farm-bg-overcast.jpg',
			'farm-bg-dusk.jpg',
			'farm-bg-night.jpg',
			'farm-bg-day.jpg',
			'farm-bg-day-alt.jpg',
			'farm-bg-peaceful.jpg'
		];
		return images[Math.floor(Math.random() * images.length)];
	}

	// Function to set a background image
	function setBackgroundImage(imageName) {
		var element = document.getElementsByClassName('horseplay-background')[0];
		if (element) {
			element.style.backgroundImage = 'url(./static/img/' + imageName + ')';
		}
	}

	// Initialize with random background on page load
	setBackgroundImage(getRandomImage());

    // Initialize horse intensity
    var intensitySelector = document.getElementById('intensity-selector');
    function adjustHorseIntensity() {
        var intensity = intensitySelector.value || 1;
        var horseContainer = document.getElementById('hors-container');

        // Remove all existing horse elements.
        while (horseContainer.firstChild) {
            horseContainer.removeChild(horseContainer.firstChild);
        }

        // Create new horse elements.
        for (var i = 0; i < intensity; i++) {
            var horseDiv = document.createElement('div');
            horseDiv.className = 'horse-logo-3x float-left';

            var horseImg = document.createElement('img');
            var randomHorse = horseImages[Math.floor(Math.random() * horseImages.length)];

            horseImg.src = randomHorse;
            horseDiv.appendChild(horseImg);

            var horseHeight = Math.random() * 80 + '%';
            horseDiv.style.position = 'absolute';
            horseDiv.style.right = '0';
            horseDiv.style.top = horseHeight;
            horseContainer.appendChild(horseDiv);
        }
        // Apply horse speed to new elements.
        setHorseSpeed();
    }
    adjustHorseIntensity(); // Adjust horse intensity at page load


	$('#settingsSaveBtn').on('click', function() {
		// THEME SELECTOR SETTINGS
		/* var bgSelector = $('#bg-selector')[0]; 
		var selectedOption = bgSelector.options[bgSelector.selectedIndex];
		var selectedImage = selectedOption.value;
		*/

		// THEME SELECTOR SETTINGS
		var bgSelector = document.querySelector('#bg-selector');
		var selectedImage = bgSelector.dataset.value;

		if (selectedImage == 'default.jpg') { 
			// If the default option is selected, set a random image
			selectedImage = getRandomImage();
		}

		var element = document.getElementsByClassName('horseplay-background')[0];

		if (element) {
			element.style.backgroundImage = 'url(./static/img/' + selectedImage + ')';
		}

	
		// HORSE SPEED SETTINGS
		var horseSpeed = parseFloat($('#speed-selector').val());
		setHorseSpeed(); // Update horse speed when the selector changes
	
		// HORSE INTENSITY SETTINGS
		adjustHorseIntensity(); // Adjust horse intensity when the settings are saved
	
		// HORSE SIZE SETTINGS
		var size = $('#size-selector').val();
		$('.horse-logo-3x img').css('transform', 'scale(' + size + ')');
	
		// HORSE TYPE SETTINGS
		var value = $('#selectThis').val();
	
		if (value === '.option3') {
			// Replace horse images with dog images
			var dogImages = ['static/img/assets/dog-1.png', 'static/img/assets/dog-2.png', 'static/img/assets/dog-3.png'];
			changeImage(dogImages);
		} else if (value === '.option1') {
			// Reset back to horse images
			var horseImages = [
				'static/img/assets/hors-1.png',
				'static/img/assets/hors-2.png',
				'static/img/assets/hors-3.png',
			];
			changeImage(horseImages);
		} else if (value === '.option2') {
			// Replace horse images with person images
			var personImages = [
				'static/img/assets/person-1.png',
				'static/img/assets/person-2.png',
				'static/img/assets/person-3.png',
				'static/img/assets/person-4.png',
			];
			changeImage(personImages);
		} else if (value === '.option4') {
			// Replace horse images with idiot horse images
			var idiotHorseImages = [
				'static/img/assets/hors-idiot.png',
				'static/img/assets/hors-tranq.png',
			];
			changeImage(idiotHorseImages);
		} else if (value === '.option5') {
			// Replace horse images with raven images
			var ravenImages = [
				'static/img/assets/ravn-1.png',
				'static/img/assets/ravn-2.png',
				'static/img/assets/ravn-3.png',
				'static/img/assets/ravn-tranq.png',
			];
			changeImage(ravenImages);
		} else if (value === '.option6') {
			// Replace horse images with goose images
			var gooseImages = [
				'static/img/assets/goose-1.png',
			];
			changeImage(gooseImages);
		}
		$('#settingsModal').removeClass('filter-is-visible');  // This will hide the settingsModal.
	});	
	
    // Call updateScore once initially to set the initial score.
    updateScore();
}

// Enable custom settings if checkbox is checked
$('#rankedCheckboxBtn').on('change', function() {
	if ($(this).is(':checked')) {
		// Checkbox is checked, enable the options and disable difficulty selector
		$('#speed-selector').prop('disabled', false);
		$('#intensity-selector').prop('disabled', false);
		$('#size-selector').prop('disabled', false);
		$('#difficulty-selector').prop('disabled', true);
	} else {
		// Checkbox is not checked, disable the options and enable difficulty selector
		$('#speed-selector').prop('disabled', true);
		$('#intensity-selector').prop('disabled', true);
		$('#size-selector').prop('disabled', true);
		$('#difficulty-selector').prop('disabled', false);
	}
});


// Initialize score
var score = 0;

// Function to update score display
function updateScore() {
    $('#scoreBtn').text(" " + score); 
}

$(function() {
	// Centering the dart in the middle of the screen
	var containerWidth = $("#tranq-container").width();
	var containerHeight = $("#tranq-container").height();
	var dartWidth = $("#draggable13").width();
	var dartHeight = $("#draggable13").height();
	var centerX = (containerWidth - dartWidth) / 2;
	var centerY = (containerHeight - dartHeight) / 2;
	
	$("#draggable13").css({
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
	});

	$("#draggable13").draggable({
		drag: function(event, ui) {
			$(".horse-logo-3x img").each(function() {
				if (isCollision(ui.helper, $(this))) {
					// Collision detected, handle the horse
					handleHorse($(this));
				}
			});
		}
	});

	function isCollision($div1, $div2) {
		var x1 = $div1.offset().left;
		var y1 = $div1.offset().top;
		var h1 = $div1.outerHeight(true);
		var w1 = $div1.outerWidth(true);
		var b1 = y1 + h1;
		var r1 = x1 + w1;
		var x2 = $div2.offset().left;
		var y2 = $div2.offset().top;
		var h2 = $div2.outerHeight(true);
		var w2 = $div2.outerWidth(true);
		var b2 = y2 + h2;
		var r2 = x2 + w2;

		if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
		return true;
	}

	function handleHorse($horse) {
		// Get the parent div of the horse image
		var $horseDiv = $horse.parent();

		$horseDiv.animate(
			{
				width: "+=50",
				height: "+=50",
			},
			200
		)
		.animate(
			{
				width: "-=50",
				height: "-=50",
			},
			200
		);
		$horseDiv.fadeOut(400, function() {
			$(this).remove();

			// Increment the score when a horse is removed
			score++;
			// Update the score display
			updateScore();
		});
	}
});


// Reset score on clear //
$('#resetBtn').click(function() {
    // Reset score
    score = 0;
    // Update the score display
    updateScore();
});


function changeImage(imagesArray){
    var elements = document.getElementsByClassName('horse-logo-3x');

    for (var i = 0; i < elements.length; i++) {
        var randomImage = imagesArray[Math.floor(Math.random() * imagesArray.length)];
        var imgElement = elements[i].getElementsByTagName('img')[0];

        if (imgElement) {
            imgElement.src = randomImage;
        }
    }
}


// Reset game (reloads the page) //
$(function() {
	$("#reset-container").click(function() {
		console.log('Button clicked'); // add this line
		window.location.reload(true);
	});
});

// CONTACT FORM - add class to make inputs disappear and make ::after icons visible. //
$("#submit").on("click", function(e) {
    // Add the .visible class to all .input-wrapper elements immediately when the button is clicked
    $(".input-wrapper").addClass("visible");

    // Fade out all the #contactForm children, except for #creditCardLine, after a few seconds (e.g., 2 seconds)
    setTimeout(function() {
        $("#contactForm").children().not("#creditCardLine").fadeOut();
    }, 2000);
});

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



// STUFF I DON'T CARE ABOUT MUCH //
// STUFF I DON'T CARE ABOUT MUCH //
// STUFF I DON'T CARE ABOUT MUCH //
jQuery(document).ready(function($){

	var settingsModal = $('#settingsModal');
    var aboutModal = $('#aboutModal');
    var accountModal = $('#accountModal');

    $('.modal-trigger').on('click', function() {
        var target = $(this).data('target');

        if (target == 'settingsModal') {
            aboutModal.removeClass('filter-is-visible');
            accountModal.removeClass('filter-is-visible');
        } else if (target == 'aboutModal') {
            settingsModal.removeClass('filter-is-visible');
            accountModal.removeClass('filter-is-visible');
        } else if (target == 'accountModal') {
            settingsModal.removeClass('filter-is-visible');
            aboutModal.removeClass('filter-is-visible');
        }

        $('#' + target).toggleClass('filter-is-visible');
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

	//open/close lateral filter
	$('.modal-trigger').on('click', function(){
		var target = $(this).data('target');
		triggerFilter(target, true);
	});
	
	$('.cd-filter .cd-close-filter').on('click', function(){
		var parentModal = $(this).closest('.cd-filter').attr('id');
		triggerFilter(parentModal, false);
	});
	
	function triggerFilter(target, $bool) {
		var elementsToTrigger = $([$('#'+target), $('.cd-tab-filter'), $('.cd-gallery')]);
		elementsToTrigger.each(function(){
			$(this).toggleClass('filter-is-visible', $bool);
		});
	}	

	//mobile version - detect click event on filters tab
	var filter_tab_placeholder = $('.cd-tab-filter .placeholder a'),
		filter_tab_placeholder_default_value = 'Select',
		filter_tab_placeholder_text = filter_tab_placeholder.text();
	
	$('.cd-tab-filter li').on('click', function(event){
		//detect which tab filter item was selected
		var selected_filter = $(event.target).data('type');
			
		//check if user has clicked the placeholder item
		if( $(event.target).is(filter_tab_placeholder) ) {
			(filter_tab_placeholder_default_value == filter_tab_placeholder.text()) ? filter_tab_placeholder.text(filter_tab_placeholder_text) : filter_tab_placeholder.text(filter_tab_placeholder_default_value) ;
			$('.cd-tab-filter').toggleClass('is-open');

		//check if user has clicked a filter already selected 
		} else if( filter_tab_placeholder.data('type') == selected_filter ) {
			filter_tab_placeholder.text($(event.target).text());
			$('.cd-tab-filter').removeClass('is-open');	

		} else {
			//close the dropdown and change placeholder text/data-type value
			$('.cd-tab-filter').removeClass('is-open');
			filter_tab_placeholder.text($(event.target).text()).data('type', selected_filter);
			filter_tab_placeholder_text = $(event.target).text();
			
			//add class selected to the selected filter item
			$('.cd-tab-filter .selected').removeClass('selected');
			$(event.target).addClass('selected');
		}
	});
});

// File#: _1_table
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
  