
// Initialize game mode selected flag
var gameModeSelected = false;
var gameStarted = false;
var gamePaused = false;
var pausedTimerTime = null;
var currentGameMode = 'freeplay'; // Track whether playing freeplay or ranked

// When Free Play is selected disable all Ranked Play settings
var freePlayBtn = document.getElementById('freePlayBtn');
if (freePlayBtn) {
    freePlayBtn.addEventListener('click', function() {
        document.querySelectorAll('#rankedPlaySettings .optn-select').forEach(function(element) {
            element.classList.add('disabled');
        });
        gameModeSelected = true;
        gameStarted = true;
        currentGameMode = 'freeplay'; // Set game mode for score tracking
        // Start game tracker
        if (window.gameTracker) {
            window.gameTracker.startGame('freeplay');
        }
        // Start timer now that game mode is selected
        startTimer();
    });
}
// When Ranked Play is selected disable all Free Play settings
var rankedPlayBtn = document.getElementById('rankedPlayBtn');
if (rankedPlayBtn) {
    rankedPlayBtn.addEventListener('click', function() {
        document.querySelectorAll('#freePlaySettings .optn-select').forEach(function(element) {
            element.classList.add('disabled');
        });
        gameModeSelected = true;
        gameStarted = true;
        currentGameMode = 'ranked'; // Set game mode for score tracking
        // Start game tracker
        if (window.gameTracker) {
            window.gameTracker.startGame('ranked');
        }
        // Start timer now that game mode is selected
        startTimer();
    });
}


window.onload = function() {

	// Function for custom settings dropdowns with live preview //
	document.querySelectorAll('.custom-select').forEach(select => {
		const selectButton = select.querySelector('.optn-select');
		const selectorId = selectButton.id; // Get ID from the optn-select element
		
		selectButton.addEventListener('click', () => {
			select.classList.toggle('open');
		});
	
		select.querySelectorAll('.option').forEach(option => {
			option.addEventListener('click', () => {
				console.log('Option clicked:', selectorId, option.dataset.value); // Debug log
				selectButton.textContent = option.textContent;
				selectButton.dataset.value = option.dataset.value;
				select.classList.remove('open');
				
				// Apply changes immediately based on which selector was changed
				setTimeout(() => {
					applySettingChange(selectorId, option.dataset.value);
				}, 10); // Small delay to ensure DOM updates
			});
		});
	}); 	

	// background and game mechanics //
    var horseImages = [
        '/static/img/games/horsplay/assets/hors-1.png',
        '/static/img/games/horsplay/assets/hors-2.png',
        '/static/img/games/horsplay/assets/hors-3.png',
    ];

	// Initialize horse speed
	var horseSpeed = 2; // Initialize horse speed

	// Calculate horse speed based on settings input //
	function setHorseSpeed(speed) {
        horseSpeed = parseFloat(speed);
        var horseElements = document.getElementsByClassName('horse-logo-3x');
        for (var i = 0; i < horseElements.length; i++) {
            var animationDuration = (Math.random() * 3 + 3) / horseSpeed;
            horseElements[i].style.animation = 'move ' + animationDuration + 's linear infinite';
        }
    }
	
	// Start moving the horses at page load
    setHorseSpeed(horseSpeed);

	// Horse speed is now handled by the main dropdown handler above

	// Function to pick a random image
	function getRandomImage() {
		var images = [
			// Retro images removed from rotation
			//'farm-bg-day.jpg',
			//'farm-bg-overcast.jpg',
			//'farm-bg-dusk.jpg',
			//'farm-bg-night.jpg',
			//'farm-bg-day.jpg',
			//'farm-bg-day-alt.jpg',
			//'farm-bg-peaceful.jpg',
			'mood-bg-1.png',
			'mood-bg-2.png',
			'mood-bg-3.png',
			'mood-bg-4.png',
			'mood-bg-5.png',
			'mood-bg-6.png'
		];
		return images[Math.floor(Math.random() * images.length)];
	}

	// Function to set a background image
	function setBackgroundImage(imageName) {
		var element = document.getElementsByClassName('horseplay-background')[0];
		if (element) {
			element.style.backgroundImage = 'url(./static/img/games/horsplay/backgrounds/' + imageName + ')';
		}
	}

	// Initialize with random background on page load
	setBackgroundImage(getRandomImage());

    
	// Initialize horse intensity
	var powerSelector = document.getElementById('power-selector');
    function adjustHorseIntensity() {
		var intensity = powerSelector.dataset.value;
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
        setHorseSpeed(horseSpeed);
        
        // Only start timer if game mode has been selected and horses are created
        if (intensity > 0 && gameModeSelected) {
            startTimer();
        }
    }
    adjustHorseIntensity(); // Adjust horse intensity at page load


	$('#settingsSaveBtn').on('click', function() {
		// Reset game state to prevent cheating/score stacking
		score = 0;
		resetTimer();
		gameModeSelected = false;
		gameStarted = false;
		currentGameMode = 'freeplay'; // Reset to freeplay
		updateScore();

		// Apply all current settings (they've already been previewed)
		applyAllSettings();

		// Resume game and close settings
		resumeGame();
		$('#settingsModal').removeClass('filter-is-visible');  // This will hide the settingsModal.
	});	
	
    // Call updateScore once initially to set the initial score and timer display.
    updateScore();
    
    // Settings modal event handlers
    $('#settings-container').on('click', function() {
        pauseGame();
    });
    
    // Handle settings modal close via close button
    $('#settingsModal .cd-close-filter').on('click', function() {
        resumeGame();
    });
    
    // Handle settings modal close via clicking outside (if that functionality exists)
    $(document).on('click', function(event) {
        if ($('#settingsModal').hasClass('filter-is-visible') && !$(event.target).closest('#settingsModal').length && !$(event.target).closest('#settings-container').length) {
            resumeGame();
            $('#settingsModal').removeClass('filter-is-visible');
        }
    });
}

// Initialize score
var score = 0;

// Initialize timer variables
var gameStartTime = null;
var timerInterval = null;
var gameCompleted = false;

// Function to update score display
function updateScore() {
    if (gameStartTime !== null && !gameCompleted) {
        // If timer is running, don't update - let updateTimer handle it
        updateTimer();
    } else {
        // No timer running, show score and inactive timer
        $('#scoreBtn').html('<span class="score-section">' + score + '</span><span class="timer-section"><span class="clock-icon"></span>0s</span>'); 
    }
}

// Function to start the timer
function startTimer() {
    if (gameStartTime === null && !gameCompleted && gameModeSelected) {
        gameStartTime = new Date().getTime();
        timerInterval = setInterval(updateTimer, 1000); // Update every second since we're showing seconds
    }
}

// Function to update timer display
function updateTimer() {
    if (gameStartTime !== null && !gameCompleted && !gamePaused) {
        var currentTime = new Date().getTime();
        var elapsedTime = currentTime - gameStartTime;
        var totalSeconds = Math.floor(elapsedTime / 1000);
        
        var displayTime;
        if (totalSeconds >= 120) { // Over 2 minutes
            displayTime = "u stank";
        } else if (totalSeconds >= 60) { // 1-2 minutes
            var minutes = Math.floor(totalSeconds / 60);
            var remainingSeconds = totalSeconds % 60;
            displayTime = minutes + "m " + remainingSeconds + "s";
        } else { // Under 1 minute
            displayTime = totalSeconds + "s";
        }
        
        // Update score display to include timer with clock icon (no pipe separator)
        $('#scoreBtn').html('<span class="score-section">' + score + '</span><span class="timer-section"><span class="clock-icon"></span>' + displayTime + '</span>');
    }
}

// Function to stop the timer and show success
function stopTimer() {
    if (timerInterval !== null && !gameCompleted) {
        clearInterval(timerInterval);
        gameCompleted = true;
        var currentTime = new Date().getTime();
        var elapsedTime = currentTime - gameStartTime;
        var totalSeconds = Math.floor(elapsedTime / 1000);
        
        var displayTime;
        if (totalSeconds >= 120) {
            displayTime = "over 2 minutes (u stank at dis)";
        } else if (totalSeconds >= 60) {
            var minutes = Math.floor(totalSeconds / 60);
            var remainingSeconds = totalSeconds % 60;
            displayTime = minutes + "m " + remainingSeconds + "s";
        } else {
            displayTime = totalSeconds + "s";
        }
        
        // Show success modal instead of alert
        showSuccessModal(displayTime);
    }
}

// Function to reset timer
function resetTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
    }
    gameStartTime = null;
    timerInterval = null;
    gameCompleted = false;
    gamePaused = false;
    pausedTimerTime = null;
    // Reset score display with inactive timer
    $('#scoreBtn').html('<span class="score-section">' + score + '</span><span class="timer-section"><span class="clock-icon"></span>0s</span>');
}

// Function to check if all horses are popped
function checkGameCompletion() {
    var remainingHorses = $('.horse-logo-3x').length;
    if (remainingHorses === 0 && gameStartTime !== null && !gameCompleted) {
        stopTimer();
    }
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

	// Make tranq follow mouse cursor AND touch for mobile support
	$("#game-container").css('cursor', 'none'); // Hide cursor over game area
	
	// Function to update tranq position and check collisions
	function updateTranqPosition(clientX, clientY) {
		$("#draggable13").css({
			position: "fixed",
			left: clientX - ($("#draggable13").width() / 2),
			top: clientY - ($("#draggable13").height() / 2),
			transform: "none", // Remove the center transform since we're positioning manually
			zIndex: 9999, // Ensure tranq stays on top
			pointerEvents: 'none' // Allow clicks to pass through tranq
		});
		
		// Check for collisions with horses only if game has started and is not paused
		if (gameStarted && !gamePaused) {
			$(".horse-logo-3x img").each(function() {
				if (isCollision($("#draggable13"), $(this))) {
					// Collision detected, handle the horse
					handleHorse($(this));
				}
			});
		}
	}
	
	// Desktop mouse support
	$(document).on('mousemove', function(event) {
		updateTranqPosition(event.clientX, event.clientY);
	});
	
	// Mobile touch support
	$(document).on('touchstart touchmove', function(event) {
		event.preventDefault(); // Prevent scrolling and other default behaviors
		
		if (event.originalEvent.touches && event.originalEvent.touches.length > 0) {
			var touch = event.originalEvent.touches[0];
			updateTranqPosition(touch.clientX, touch.clientY);
		}
	});
	
	// Handle touch end (when finger lifts off screen)
	$(document).on('touchend', function(event) {
		// Keep tranq at last position when finger lifts
		// Could add special behavior here if needed
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
			// Increment game tracker
			if (window.gameTracker) {
				window.gameTracker.incrementHorsesPopped();
			}
			// Update the score display
			updateScore();
			
			// Check if all horses are popped
			checkGameCompletion();
		});
		
		// Score tracking moved to game completion - no individual horse tracking needed
	}
});


// Reset score on clear //
$('#resetBtn').click(function() {
    // Reset score
    score = 0;
    // Update the score display
    updateScore();
    // Reset timer
    resetTimer();
    // Reset game mode selection
    gameModeSelected = false;
    gameStarted = false;
    gamePaused = false;
    currentGameMode = 'freeplay'; // Reset to freeplay
    // Reset game tracker
    if (window.gameTracker) {
        window.gameTracker.gameActive = false;
        window.gameTracker.gameStartTime = null;
        window.gameTracker.horsesPopped = 0;
    }
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

// Function to apply individual setting changes immediately (live preview)
function applySettingChange(selectorId, value) {
    console.log('Applying setting change:', selectorId, value); // Debug log
    
    switch(selectorId) {
        case 'bg-selector':
            var selectedImage = value;
            if (selectedImage == 'default.jpg') { 
                selectedImage = getRandomImage();
            }
            var element = document.getElementsByClassName('horseplay-background')[0];
            if (element) {
                element.style.backgroundImage = 'url(./static/img/games/horsplay/backgrounds/' + selectedImage + ')';
                console.log('Background changed to:', selectedImage);
            }
            break;
            
        case 'speed-selector':
            var selectedSpeed = parseFloat(value);
            setHorseSpeed(selectedSpeed);
            console.log('Speed changed to:', selectedSpeed);
            break;
            
        case 'power-selector':
            console.log('Adjusting horse intensity to:', value);
            adjustHorseIntensity();
            break;
            
        case 'size-selector':
            var scale = parseFloat(value);
            $('.horse-logo-3x img').css('transform', 'scale(' + scale + ')');
            console.log('Size changed to scale:', scale);
            break;
            
        case 'type-selector':
            console.log('Changing horse type to:', value);
            if (value === 'image-hors') {
                var horseImages = [
                    '/static/img/games/horsplay/assets/hors-1.png',
                    '/static/img/games/horsplay/assets/hors-2.png',
                    '/static/img/games/horsplay/assets/hors-3.png',
                ];
                changeImage(horseImages);
            } else if (value === 'image-people') {
                var personImages = [
                    '/static/img/games/horsplay/assets/person-1.png',
                    '/static/img/games/horsplay/assets/person-2.png',
                    '/static/img/games/horsplay/assets/person-3.png',
                    '/static/img/games/horsplay/assets/person-4.png',
                ];
                changeImage(personImages);
            } else if (value === 'image-dog') {
                var dogImages = [
                    '/static/img/games/horsplay/assets/dog-1.png',
                    '/static/img/games/horsplay/assets/dog-2.png',
                    '/static/img/games/horsplay/assets/dog-3.png',
                ];
                changeImage(dogImages);
            } else if (value === 'image-idiot-hors') {
                var idiotHorseImages = [
                    '/static/img/games/horsplay/assets/hors-idiot.png',
                    '/static/img/games/horsplay/assets/hors-tranq.png',
                ];
                changeImage(idiotHorseImages);
            } else if (value === 'image-raven') {
                var ravenImages = [
                    '/static/img/games/horsplay/assets/ravn-1.png',
                    '/static/img/games/horsplay/assets/ravn-2.png',
                    '/static/img/games/horsplay/assets/ravn-3.png',
                    '/static/img/games/horsplay/assets/ravn-tranq.png',
                ];
                changeImage(ravenImages);
            } else if (value === 'image-goose') {
                var gooseImages = [
                    '/static/img/games/horsplay/assets/goose-1.png',
                ];
                changeImage(gooseImages);
            }
            break;
            
        default:
            console.log('Unknown selector:', selectorId);
    }
}

// Function to apply all current settings (used by save button)
function applyAllSettings() {
    // Apply all current dropdown values
    var bgSelector = document.querySelector('#bg-selector');
    if (bgSelector) applySettingChange('bg-selector', bgSelector.dataset.value);
    
    var speedSelector = document.querySelector('#speed-selector');
    if (speedSelector) applySettingChange('speed-selector', speedSelector.dataset.value);
    
    var powerSelector = document.querySelector('#power-selector');
    if (powerSelector) applySettingChange('power-selector', powerSelector.dataset.value);
    
    var sizeSelector = document.querySelector('#size-selector');
    if (sizeSelector) applySettingChange('size-selector', sizeSelector.dataset.value);
    
    var typeSelector = document.querySelector('#type-selector');
    if (typeSelector) applySettingChange('type-selector', typeSelector.dataset.value);
}

// When opening custom settings dropdown close other dropdowns //
document.addEventListener('click', function(event) {
	var target = event.target;
  
	// Check if the clicked element is within a custom dropdown
	if (!target.closest('.custom-select')) {
	  // If not, close all custom dropdowns
	  document.querySelectorAll('.custom-select').forEach(function(select) {
		select.classList.remove('open');
	  });
	} else {
	  // If it is, close other custom dropdowns except the one that was clicked
	  var clickedDropdown = target.closest('.custom-select');
	  document.querySelectorAll('.custom-select').forEach(function(select) {
		if (select !== clickedDropdown) {
		  select.classList.remove('open');
		}
	  });
	}
  });
  

// Reset game (reloads the page) //
$(function() {
	$("#reset-container").click(function() {
		console.log('Button clicked'); // add this line
		window.location.reload(true);
	});
});

// Score Submission Function
function saveGameScore(finalScore, completionTime) {
    // Only save if user is logged in
    if (!window.currentUser) {
        console.log('No user logged in - score not saved');
        return;
    }
    
    // Use the current game mode set when user clicked Free Play or Ranked
    var gameMode = currentGameMode;
    
    // Get current time details
    var currentTime = new Date().getTime();
    var elapsedTimeMs = currentTime - gameStartTime;
    var totalSeconds = Math.floor(elapsedTimeMs / 1000);
    
    // Create score data object
    var scoreData = {
        user_id: window.currentUser.id,
        user_name: window.currentUser.name,
        score: finalScore,
        completion_time_seconds: totalSeconds,
        completion_time_display: completionTime,
        game_mode: gameMode,
        timestamp: new Date().toISOString(),
        game_settings: {
            horse_speed: document.getElementById('speed-selector').dataset.value,
            horse_count: document.getElementById('power-selector').dataset.value,
            background: document.getElementById('bg-selector').dataset.value,
            target_type: document.getElementById('type-selector').dataset.value
        }
    };
    
    console.log('Saving game score:', scoreData);
    
    // Save to Firebase Realtime Database
    $.ajax({
        url: "https://horsetranq-default-rtdb.firebaseio.com/scores/" + gameMode + ".json",
        type: "POST", 
        data: JSON.stringify(scoreData),
        contentType: 'application/json',
        success: function(response) {
            console.log("Score saved successfully:", response);
            
            // Also update user's personal best if this is better
            updatePersonalBest(finalScore, totalSeconds, gameMode);
        },
        error: function(xhr, status, error) {
            console.error("Error saving score:", {
                status: xhr.status,
                error: error,
                response: xhr.responseText
            });
        }
    });
}

// Function to update personal best scores
function updatePersonalBest(newScore, newTime, gameMode) {
    var userScoresPath = "users/" + window.currentUser.id + "/personal_bests/" + gameMode;
    
    // Get current personal best
    $.ajax({
        url: "https://horsetranq-default-rtdb.firebaseio.com/" + userScoresPath + ".json",
        type: "GET",
        success: function(currentBest) {
            var shouldUpdate = false;
            
            if (!currentBest) {
                // No previous record - this is the new best
                shouldUpdate = true;
            } else {
                // Check if this score is better (higher score = better, or same score but faster time)
                if (newScore > currentBest.best_score || 
                    (newScore === currentBest.best_score && newTime < currentBest.best_time_seconds)) {
                    shouldUpdate = true;
                }
            }
            
            if (shouldUpdate) {
                var bestData = {
                    best_score: newScore,
                    best_time_seconds: newTime,
                    best_time_display: formatTime(newTime),
                    achieved_date: new Date().toISOString()
                };
                
                // Update personal best
                $.ajax({
                    url: "https://horsetranq-default-rtdb.firebaseio.com/" + userScoresPath + ".json",
                    type: "PUT",
                    data: JSON.stringify(bestData),
                    contentType: 'application/json',
                    success: function(response) {
                        console.log("Personal best updated:", response);
                    },
                    error: function(xhr, status, error) {
                        console.error("Error updating personal best:", error);
                    }
                });
            }
        },
        error: function(xhr, status, error) {
            console.error("Error fetching current personal best:", error);
        }
    });
}

// Helper function to format time consistently
function formatTime(totalSeconds) {
    if (totalSeconds >= 120) {
        return "over 2 minutes (u stank at dis)";
    } else if (totalSeconds >= 60) {
        var minutes = Math.floor(totalSeconds / 60);
        var remainingSeconds = totalSeconds % 60;
        return minutes + "m " + remainingSeconds + "s";
    } else {
        return totalSeconds + "s";
    }
}

// Game Pause/Resume Functions
function pauseGame() {
    gamePaused = true;
    // Store the current timer time when pausing
    if (gameStartTime !== null) {
        pausedTimerTime = new Date().getTime() - gameStartTime;
    }
    
    // Show overlay and change cursor
    document.getElementById('settingsOverlay').style.display = 'block';
    document.body.style.cursor = 'default !important';
    $("#game-container").css('cursor', 'default !important');
    // Also target the main content area
    $(".cd-main-content").css('cursor', 'default !important');
}

function resumeGame() {
    gamePaused = false;
    // Adjust game start time to account for paused time
    if (pausedTimerTime !== null) {
        gameStartTime = new Date().getTime() - pausedTimerTime;
        pausedTimerTime = null;
    }
    
    // Hide overlay and restore tranq cursor if game is active
    document.getElementById('settingsOverlay').style.display = 'none';
    if (gameStarted) {
        document.body.style.cursor = '';
        $("#game-container").css('cursor', 'none');
        $(".cd-main-content").css('cursor', '');
    } else {
        document.body.style.cursor = '';
        $("#game-container").css('cursor', '');
        $(".cd-main-content").css('cursor', '');
    }
}

// Success Modal Functions
function showSuccessModal(displayTime) {
    document.getElementById('successTime').textContent = 'Time: ' + displayTime;
    document.getElementById('successOverlay').style.display = 'block';
    document.getElementById('successModal').classList.add('filter-is-visible');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // End game tracker (this handles saving game data via our new API)
    if (window.gameTracker) {
        window.gameTracker.endGame();
    }
    
    // Note: Game data is now saved via the game tracker's endGame() method
    // which calls our /api/save-game endpoint instead of direct Firebase calls
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('filter-is-visible');
    document.getElementById('successOverlay').style.display = 'none';
    document.body.style.overflow = ''; // Re-enable scrolling
    // Reset game state for play again
    window.location.reload(true);
}