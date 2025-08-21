// Get the character and object elements
var lemon = document.getElementById("lemon");
var bear = document.getElementById("bear");
var counter = 0;  // Declare and initialize the counter variable

// Initialize checkDead as null
var checkDead = null;

// Initialize the game state and counter
var gameState = "not started";
var counter = 0;

// Function to make the character jump
function jump() {
  if (gameState === "running" && lemon.classList != "animate") {
    lemon.classList.add("animate");
  }
  setTimeout(function () {
    lemon.classList.remove("animate");
  }, 500);
}

// Event listener for keydown events to detect spacebar, up arrow, or W key press
document.addEventListener("keydown", handleKeyPress);

// Event listener for click events to detect left mouse button click
document.addEventListener("click", handleClick);

// Function to handle keydown events
function handleKeyPress(event) {
  if (
    event.code === "Space" ||
    event.code === "ArrowUp" ||
    event.code === "KeyW"
  ) {
    jump();
  }
}

// Function to handle click events
function handleClick(event) {
	if (event.button === 0) {
	  event.stopPropagation();
	  if (gameState === "not started" || gameState === "game over") {
		// Reset the game
		gameState = "running";
		counter = 0;
		document.getElementById("scoreBtn").innerHTML = 0;
		bear.style.animation = "bear " + bearSpeed + "s infinite linear";
		lemon.style.animation = ""; // Remove the 'grow' animation
		message.style.display = "none";
		if (checkDead === null) {
		  checkDead = setInterval(checkCollision, 10);
		}
	  } else if (gameState === "running") {
		jump();
	  }
	}
  }

// Collision detection function
function checkCollision() {
	var lemonRect = lemon.getBoundingClientRect();
	var bearRect = bear.getBoundingClientRect();
	var message = document.getElementById("game-over");
  
	if (
	  lemonRect.right >= bearRect.left &&
	  lemonRect.left <= bearRect.right &&
	  lemonRect.bottom >= bearRect.top &&
	  lemonRect.top <= bearRect.bottom
	) {
	  gameState = "game over";
	  bear.style.animation = "none";
	  lemon.style.animation = "grow 2s forwards"; // Add the 'grow' animation
	  clearInterval(checkDead); // Stop the interval
	  message.style.display = "block";  // Show the popup
	  message.textContent = "Gam ovar ur score: " + Math.floor(counter / 100);
	  counter = 0;
	  bear.style.animation = "bear " + bearSpeed + "s infinite linear";
	  checkDead = null;
	} else {
	  counter++;
	  document.getElementById("scoreBtn").innerHTML = Math.floor(counter / 100);
	}
}
  
// Event listeners
document.addEventListener("keydown", handleKeyPress);
document.addEventListener("click", handleClick);
  
// Get the bear element
var bear = document.getElementById("bear");

// Function to adjust the bear animation duration
function adjustBearAnimation() {
  // Get the screen width
  var screenWidth = window.innerWidth || 
    document.documentElement.clientWidth || 
    document.body.clientWidth;

  // Calculate the desired animation duration
  // (you may need to adjust the calculation to get the speed you want)
  var duration = screenWidth / 150; // this assumes 200px/s speed
  
  // Set the animation duration
  bear.style.animationDuration = duration + "s";
}

// Adjust the bear animation when the page loads
adjustBearAnimation();

// Initialize bear settings on page load
setBearSpeed(bearSpeed);
setBearSize(bearSize);

// Adjust the bear animation whenever the window is resized
window.addEventListener("resize", adjustBearAnimation);


// Reset score on clear //
$('#resetBtn').click(function() {
    // Reset score
    score = 0;
    // Update the score display
    updateScore();
});

// Reset game (reloads the page) //
$(function() {
	$("#reset-container").click(function() {
		console.log('Button clicked'); // add this line
		window.location.reload(true);
	});
});

// SETTINGS FUNCTIONALITY (copied from horsplay) //

// Function for custom settings dropdowns //
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

// Initialize bear settings variables
var bearSpeed = 1.5; // Default bear speed (seconds)
var bearSize = 1; // Default bear size (scale)

// Function to set bear speed
function setBearSpeed(speed) {
	bearSpeed = parseFloat(speed);
	bear.style.animationDuration = bearSpeed + "s";
	console.log('Bear speed set to:', bearSpeed + "s");
}

// Function to set bear size  
function setBearSize(size) {
	bearSize = parseFloat(size);
	bear.style.transform = 'scale(' + bearSize + ')';
	console.log('Bear size set to:', bearSize + "x");
}

// Settings save button functionality
$('#settingsSaveBtn').on('click', function() {
	// BEAR SPEED SETTINGS
	var selectedSpeed = parseFloat(document.querySelector('#bear-speed-selector').dataset.value);
	setBearSpeed(selectedSpeed);

	// BEAR SIZE SETTINGS  
	var selectedSize = parseFloat(document.querySelector('#bear-size-selector').dataset.value);
	setBearSize(selectedSize);

	// Close the settings modal
	$('#settingsModal').removeClass('filter-is-visible');
	
	console.log('Settings saved - Speed:', selectedSpeed + 's', 'Size:', selectedSize + 'x');
});

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

// Modal trigger functionality (copied from main.js pattern)
$('.modal-trigger').on('click', function() {
	var target = $(this).data('target');
	$('#' + target).toggleClass('filter-is-visible');
});

$('.cd-close-filter').on('click', function() {
	var parentModal = $(this).closest('.cd-filter').attr('id');
	$('#' + parentModal).removeClass('filter-is-visible');
});


// Function to handle click events
function handleClick(event) {
	if (event.button === 0) {
	  event.stopPropagation();
	  if (gameState === "not started" || gameState === "game over") {
		// Reset the game
		gameState = "running";
		counter = 0;
		document.getElementById("scoreBtn").innerHTML = 0;
		bear.style.animation = "bear " + bearSpeed + "s infinite linear";
		lemon.style.animation = ""; // Remove the 'grow' animation
		
		var gameOverDisplay = document.querySelector('#game-over');
		gameOverDisplay.style.display = "none";
  
		if (checkDead === null) {
		  // Start collision checks after 5 seconds
		  setTimeout(function() {
			checkDead = setInterval(checkCollision, 10);
		  }, 5000);
		}
		
		// Display countdown
		var countdown = 3;
		var countdownDisplay = document.querySelector('#countdown');
		countdownDisplay.textContent = countdown; // Set initial countdown display
		countdownDisplay.style.display = "block";
		var countdownInterval = setInterval(function() {
		  countdown--;
		  countdownDisplay.textContent = countdown > 0 ? countdown : "JUMP!";
		  if (countdown <= 0) {
			clearInterval(countdownInterval);
			// Hide the countdown display after "JUMP!" is displayed
			setTimeout(function() {
			  countdownDisplay.style.display = "none";
			}, 1000);
		  }
		}, 1000);
	  } else if (gameState === "running") {
		jump();
	  }
	}
  }
  