// working settings save configuration //
$('#settingsSaveBtn').on('click', function() {
	// THEME SELECTOR SETTINGS
	var selectedImage = $('#bg-selector').val();
	var element = document.getElementsByClassName('horseplay-background')[0];

	if (element) {
		element.style.backgroundImage = 'url(./img/' + selectedImage + ')';
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
		var dogImages = ['img/assets/dog-1.png', 'img/assets/dog-2.png', 'img/assets/dog-3.png'];
		changeImage(dogImages);
	} else if (value === '.option1') {
		// Reset back to horse images
		var horseImages = [
			'img/assets/hors-1.png',
			'img/assets/hors-2.png',
			'img/assets/hors-3.png',
		];
		changeImage(horseImages);
	} else if (value === '.option2') {
		// Replace horse images with person images
		var personImages = [
			'img/assets/person-1.png',
			'img/assets/person-2.png',
			'img/assets/person-3.png',
			'img/assets/person-4.png',
		];
		changeImage(personImages);
	} else if (value === '.option4') {
		// Replace horse images with idiot horse images
		var idiotHorseImages = [
			'img/assets/hors-idiot.png',
			'img/assets/hors-tranq.png',
		];
		changeImage(idiotHorseImages);
	} else if (value === '.option5') {
		// Replace horse images with raven images
		var ravenImages = [
			'img/assets/ravn-1.png',
			'img/assets/ravn-2.png',
			'img/assets/ravn-3.png',
			'img/assets/ravn-tranq.png',
		];
		changeImage(ravenImages);
	} else if (value === '.option6') {
		// Replace horse images with goose images
		var gooseImages = [
			'img/assets/goose-1.png',
		];
		changeImage(gooseImages);
	}
});	









window.onload = function() {
    var images = [
        './img/farm-bg-day.jpg',
        './img/farm-bg-overcast.jpg',
        './img/farm-bg-dusk.jpg',
        './img/farm-bg-night.jpg',
        './img/farm-bg-night.jpg',
        './img/farm-bg-day.jpg',
		'./img/farm-bg-day-alt.jpg',
    ];

    var randomImage = images[Math.floor(Math.random() * images.length)];
    var element = document.getElementsByClassName('horseplay-background')[0];

    if (element) {
        element.style.backgroundImage = 'url(' + randomImage + ')';
    }

    var horseImages = [
        'img/assets/hors-1.png',
        'img/assets/hors-2.png',
        'img/assets/hors-3.png',
    ];

	// SETTINGS OPTIONS AND LOCAL STORAGE //
	// SETTINGS OPTIONS AND LOCAL STORAGE //
			// THEME SELECTOR SETTINGS
			$('#bg-selector').on('change', function() {
				var selectedImage = $(this).val();
				var element = document.getElementsByClassName('horseplay-background')[0];

				if (element) {
					element.style.backgroundImage = 'url(./img/' + selectedImage + ')';
				}
			});
			
			// HORSE SPEED SETTINGS
			var horseSpeed = 1; // Initialize horse speed
			$('#speed-selector').on('change', function() {
				horseSpeed = parseFloat($(this).val());
				setHorseSpeed(); // Update horse speed when the selector changes
			});
			function setHorseSpeed() {
				var horseElements = document.getElementsByClassName('horse-logo-3x');
				for (var i = 0; i < horseElements.length; i++) {
					var animationDuration = (Math.random() * 3 + 3) / horseSpeed;
					horseElements[i].style.animation = 'move ' + animationDuration + 's linear infinite';
				}
			}

			// HORSE INTESITY SETTINGS
			var intensitySelector = document.getElementById('intensity-selector');
			intensitySelector.addEventListener('change', adjustHorseIntensity);
			adjustHorseIntensity(); // Adjust horse intensity at page load
		
			// Trigger the 'change' event manually
			intensitySelector.dispatchEvent(new Event('change'));
		
			function adjustHorseIntensity() {
			var intensity = intensitySelector.value || 1;
			var horseContainer = document.getElementById('hors-container');

			// HORSE SIZE SETTINGS
			$('#size-selector').on('change', function() {
				var size = $(this).val();
				$('.horse-logo-3x img').css('transform', 'scale(' + size + ')');
			});

			// Horse Type settings
			$('#selectThis').on('change', function() {
				var value = $(this).val();
			
				if (value === '.option3') {
					// Replace horse images with dog images
					var dogImages = ['img/assets/dog-1.png', 'img/assets/dog-2.png', 'img/assets/dog-3.png'];
					changeImage(dogImages);
				} else if (value === '.option1') {
					// Reset back to horse images
					var horseImages = [
						'img/assets/hors-1.png',
						'img/assets/hors-2.png',
						'img/assets/hors-3.png',
					];
					changeImage(horseImages);
				} else if (value === '.option4') {
					// Replace horse images with idiot horse images
					var idiotHorseImages = ['img/assets/hors-idiot.png', 'img/assets/hors-tranq.png'];
					changeImage(idiotHorseImages);
				} else if (value === '.option2') {
					// Replace horse images with person images
					var personImages = ['img/assets/person-1.png', 'img/assets/person-2.png', 'img/assets/person-3.png', 'img/assets/person-4.png'];
					changeImage(personImages);
				} else if (value === '.option5') {
					// Replace horse images with person images
					var personImages = ['img/assets/ravn-1.png', 'img/assets/ravn-2.png', 'img/assets/ravn-3.png', 'img/assets/ravn-tranq.png'];
					changeImage(personImages);
				} else if (value === '.option6') {
					// Replace horse images with person images
					var personImages = ['img/assets/goose-1.png'];
					changeImage(personImages);
				}
			});
    // SETTINGS OPTIONS AND LOCAL STORAGE //
	// SETTINGS OPTIONS AND LOCAL STORAGE //


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
    // Call updateScore once initially to set the initial score.
    updateScore();
}

// Initialize score
var score = 0;

// Function to update score display
function updateScore() {
    $('#score').text(" " + score); 
}

$(function() {
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
		$horse.animate(
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
		$horse.fadeOut(400, function() {
			$(this).remove();
	
			// Increment the score when a horse is removed
			score++;
			// Update the score display
			updateScore();
		});
	}	
});

// Reset score on clear //
$('#tools').click(function() {
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




// Close settings or about modal if the other is already open //
jQuery(document).ready(function($){

    var settingsModal = $('#settingsModal');
    var aboutModal = $('#aboutModal');

    $('.cd-filter-trigger').on('click', function() {
        var target = $(this).data('target');

        if (target == 'settingsModal') {
            aboutModal.removeClass('filter-is-visible');
        } else if (target == 'aboutModal') {
            settingsModal.removeClass('filter-is-visible');
        }

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
});


// STUFF I DON'T CARE ABOUT MUCH //
// STUFF I DON'T CARE ABOUT MUCH //
// STUFF I DON'T CARE ABOUT MUCH //
// STUFF I DON'T CARE ABOUT MUCH //
// STUFF I DON'T CARE ABOUT MUCH //
jQuery(document).ready(function($){

	var settingsModal = document.getElementById("settingsModal");
	var settingsBtn = document.getElementById("settingsBtn");
	var settingsClose = document.getElementById("settings-close");

	settingsBtn.onclick = function() {
		settingsModal.style.display = "block";
	}

	settingsClose.onclick = function() {
		settingsModal.style.display = "none";
	}

	//open/close lateral filter
	$('.cd-filter-trigger').on('click', function(){
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
	
	//close filter dropdown inside lateral .cd-filter 
	$('.cd-filter-block h4').on('click', function(){
		$(this).toggleClass('closed').siblings('.cd-filter-content').slideToggle(300);
	})

	//fix lateral filter and gallery on scrolling
	$(window).on('scroll', function(){
		(!window.requestAnimationFrame) ? fixGallery() : window.requestAnimationFrame(fixGallery);
	});

	function fixGallery() {
		var offsetTop = $('.cd-main-content').offset().top,
			scrollTop = $(window).scrollTop();
		( scrollTop >= offsetTop ) ? $('.cd-main-content').addClass('is-fixed') : $('.cd-main-content').removeClass('is-fixed');
	}

	/************************************
		MitItUp filter settings
		More details: 
		https://mixitup.kunkalabs.com/
		or:
		http://codepen.io/patrickkunka/
	*************************************/

	buttonFilter.init();
	$('.cd-gallery ul').mixItUp({
	    controls: {
	    	enable: false
	    },
	    callbacks: {
	    	onMixStart: function(){
	    		$('.cd-fail-message').fadeOut(200);
	    	},
	      	onMixFail: function(){
	      		$('.cd-fail-message').fadeIn(200);
	    	}
	    }
	});

	//search filtering
	//credits http://codepen.io/edprats/pen/pzAdg
	var inputText;
	var $matching = $();

	var delay = (function(){
		var timer = 0;
		return function(callback, ms){
			clearTimeout (timer);
		    timer = setTimeout(callback, ms);
		};
	})();

	$(".cd-filter-content input[type='search']").keyup(function(){
	  	// Delay function invoked to make sure user stopped typing
	  	delay(function(){
	    	inputText = $(".cd-filter-content input[type='search']").val().toLowerCase();
	   		// Check to see if input field is empty
	    	if ((inputText.length) > 0) {            
	      		$('.mix').each(function() {
		        	var $this = $(this);
		        
		        	// add item to be filtered out if input text matches items inside the title   
		        	if($this.attr('class').toLowerCase().match(inputText)) {
		          		$matching = $matching.add(this);
		        	} else {
		          		// removes any previously matched item
		          		$matching = $matching.not(this);
		        	}
	      		});
	      		$('.cd-gallery ul').mixItUp('filter', $matching);
	    	} else {
	      		// resets the filter to show all item if input is empty
	      		$('.cd-gallery ul').mixItUp('filter', 'all');
	    	}
	  	}, 200 );
	});

	//final width --> this is the quick view image slider width
	//maxQuickWidth --> this is the max-width of the quick-view panel
	var sliderFinalWidth = 400,
		maxQuickWidth = 900;

	//open the quick view panel
	$('.cd-trigger').on('click', function(event){
		var selectedImage = $(this).parent('.cd-item').children('img'),
			slectedImageUrl = selectedImage.attr('src');

		$('body').addClass('overlay-layer');
		animateQuickView(selectedImage, sliderFinalWidth, maxQuickWidth, 'open');

		//update the visible slider image in the quick view panel
		//you don't need to implement/use the updateQuickView if retrieving the quick view data with ajax
		updateQuickView(slectedImageUrl);
	});

	//close the quick view panel
	$('body').on('click', function(event){
		if( $(event.target).is('.cd-close') || $(event.target).is('body.overlay-layer')) {
			closeQuickView( sliderFinalWidth, maxQuickWidth);
		}
	});
	$(document).keyup(function(event){
		//check if user has pressed 'Esc'
    	if(event.which=='27'){
			closeQuickView( sliderFinalWidth, maxQuickWidth);
		}
	});

	//quick view slider implementation
	$('.cd-quick-view').on('click', '.cd-slider-navigation a', function(){
		updateSlider($(this));
	});

	//center quick-view on window resize
	$(window).on('resize', function(){
		if($('.cd-quick-view').hasClass('is-visible')){
			window.requestAnimationFrame(resizeQuickView);
		}
	});

	function updateSlider(navigation) {
		var sliderConatiner = navigation.parents('.cd-slider-wrapper').find('.cd-slider'),
			activeSlider = sliderConatiner.children('.selected').removeClass('selected');
		if ( navigation.hasClass('cd-next') ) {
			( !activeSlider.is(':last-child') ) ? activeSlider.next().addClass('selected') : sliderConatiner.children('li').eq(0).addClass('selected'); 
		} else {
			( !activeSlider.is(':first-child') ) ? activeSlider.prev().addClass('selected') : sliderConatiner.children('li').last().addClass('selected');
		} 
	}

	function updateQuickView(url) {
		$('.cd-quick-view .cd-slider li').removeClass('selected').find('img[src="'+ url +'"]').parent('li').addClass('selected');
	}

	function resizeQuickView() {
		var quickViewLeft = ($(window).width() - $('.cd-quick-view').width())/2,
			quickViewTop = ($(window).height() - $('.cd-quick-view').height())/2;
		$('.cd-quick-view').css({
		    "top": quickViewTop,
		    "left": quickViewLeft,
		});
	} 

	function closeQuickView(finalWidth, maxQuickWidth) {
		var close = $('.cd-close'),
			activeSliderUrl = close.siblings('.cd-slider-wrapper').find('.selected img').attr('src'),
			selectedImage = $('.empty-box').find('img');
		//update the image in the gallery
		if( !$('.cd-quick-view').hasClass('velocity-animating') && $('.cd-quick-view').hasClass('add-content')) {
			selectedImage.attr('src', activeSliderUrl);
			animateQuickView(selectedImage, finalWidth, maxQuickWidth, 'close');
		} else {
			closeNoAnimation(selectedImage, finalWidth, maxQuickWidth);
		}
	}

	function animateQuickView(image, finalWidth, maxQuickWidth, animationType) {
		//store some image data (width, top position, ...)
		//store window data to calculate quick view panel position
		var parentListItem = image.parent('.cd-item'),
			topSelected = image.offset().top - $(window).scrollTop(),
			leftSelected = image.offset().left,
			widthSelected = image.width(),
			heightSelected = image.height(),
			windowWidth = $(window).width(),
			windowHeight = $(window).height(),
			finalLeft = (windowWidth - finalWidth)/2,
			finalHeight = finalWidth * heightSelected/widthSelected,
			finalTop = (windowHeight - finalHeight)/2,
			quickViewWidth = ( windowWidth * .8 < maxQuickWidth ) ? windowWidth * .8 : maxQuickWidth ,
			quickViewLeft = (windowWidth - quickViewWidth)/2;

		if( animationType == 'open') {
			//hide the image in the gallery
			parentListItem.addClass('empty-box');
			//place the quick view over the image gallery and give it the dimension of the gallery image
			$('.cd-quick-view').css({
			    "top": topSelected,
			    "left": leftSelected,
			    "width": widthSelected,
			}).velocity({
				//animate the quick view: animate its width and center it in the viewport
				//during this animation, only the slider image is visible
			    'top': finalTop+ 'px',
			    'left': finalLeft+'px',
			    'width': finalWidth+'px',
			}, 1000, [ 400, 20 ], function(){
				//animate the quick view: animate its width to the final value
				$('.cd-quick-view').addClass('animate-width').velocity({
					'left': quickViewLeft+'px',
			    	'width': quickViewWidth+'px',
				}, 300, 'ease' ,function(){
					//show quick view content
					$('.cd-quick-view').addClass('add-content');
				});
			}).addClass('is-visible');
		} else {
			//close the quick view reverting the animation
			$('.cd-quick-view').removeClass('add-content').velocity({
			    'top': finalTop+ 'px',
			    'left': finalLeft+'px',
			    'width': finalWidth+'px',
			}, 300, 'ease', function(){
				$('body').removeClass('overlay-layer');
				$('.cd-quick-view').removeClass('animate-width').velocity({
					"top": topSelected,
				    "left": leftSelected,
				    "width": widthSelected,
				}, 500, 'ease', function(){
					$('.cd-quick-view').removeClass('is-visible');
					parentListItem.removeClass('empty-box');
				});
			});
		}
	}
	function closeNoAnimation(image, finalWidth, maxQuickWidth) {
		var parentListItem = image.parent('.cd-item'),
			topSelected = image.offset().top - $(window).scrollTop(),
			leftSelected = image.offset().left,
			widthSelected = image.width();

		//close the quick view reverting the animation
		$('body').removeClass('overlay-layer');
		parentListItem.removeClass('empty-box');
		$('.cd-quick-view').velocity("stop").removeClass('add-content animate-width is-visible').css({
			"top": topSelected,
		    "left": leftSelected,
		    "width": widthSelected,
		});
	}
});

/*****************************************************
	MixItUp - Define a single object literal 
	to contain all filter custom functionality
*****************************************************/
var buttonFilter = {
  	// Declare any variables we will need as properties of the object
  	$filters: null,
  	groups: [],
  	outputArray: [],
  	outputString: '',
  
  	// The "init" method will run on document ready and cache any jQuery objects we will need.
  	init: function(){
    	var self = this; // As a best practice, in each method we will asign "this" to the variable "self" so that it remains scope-agnostic. We will use it to refer to the parent "buttonFilter" object so that we can share methods and properties between all parts of the object.
    
    	self.$filters = $('.cd-main-content');
    	self.$container = $('.cd-gallery ul');
    
	    self.$filters.find('.cd-filters').each(function(){
	      	var $this = $(this);
	      
		    self.groups.push({
		        $inputs: $this.find('.filter'),
		        active: '',
		        tracker: false
		    });
	    });
	    
	    self.bindHandlers();
  	},
  
  	// The "bindHandlers" method will listen for whenever a button is clicked. 
  	bindHandlers: function(){
    	var self = this;

    	self.$filters.on('click', 'a', function(e){
	      	self.parseFilters();
    	});
	    self.$filters.on('change', function(){
	      self.parseFilters();           
	    });
  	},
  
  	parseFilters: function(){
	    var self = this;
	 
	    // loop through each filter group and grap the active filter from each one.
	    for(var i = 0, group; group = self.groups[i]; i++){
	    	group.active = [];
	    	group.$inputs.each(function(){
	    		var $this = $(this);
	    		if($this.is('input[type="radio"]') || $this.is('input[type="checkbox"]')) {
	    			if($this.is(':checked') ) {
	    				group.active.push($this.attr('data-filter'));
	    			}
	    		} else if($this.is('select')){
	    			group.active.push($this.val());
	    		} else if( $this.find('.selected').length > 0 ) {
	    			group.active.push($this.attr('data-filter'));
	    		}
	    	});
	    }
	    self.concatenate();
  	},
  
  	concatenate: function(){
    	var self = this;
    
    	self.outputString = ''; // Reset output string
    
	    for(var i = 0, group; group = self.groups[i]; i++){
	      	self.outputString += group.active;
	    }
    
	    // If the output string is empty, show all rather than none:    
	    !self.outputString.length && (self.outputString = 'all'); 
	
    	// Send the output string to MixItUp via the 'filter' method:    
		if(self.$container.mixItUp('isLoaded')){
	    	self.$container.mixItUp('filter', self.outputString);
		}
  	}
};