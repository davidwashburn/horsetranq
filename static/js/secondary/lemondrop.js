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
		bear.style.animation = "bear 1.5s infinite linear";
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
	var message = document.getElementById("message");
  
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
	  bear.style.animation = "bear 1.5s infinite linear";
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