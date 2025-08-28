// Game tracking functionality for horsplay
class GameTracker {
    constructor() {
        this.gameStartTime = null;
        this.gameMode = 'freeplay'; // default
        this.currentBackground = 'default.jpg';
        this.currentEnemy = 'image-hors';
        this.currentDifficulty = 'easyDifficulty';
        this.currentHorsSpeed = '1';
        this.currentHorsPower = '50';
        this.currentHorsSize = '1';
        this.horsesPopped = 0;
        this.gameActive = false;
    }

    startGame(gameMode = 'freeplay') {
        this.gameStartTime = Date.now();
        this.gameMode = gameMode;
        this.horsesPopped = 0;
        this.gameActive = true;
        
        // Capture current settings from the DOM
        this.captureCurrentSettings();
        
        console.log(`Game started: ${gameMode} mode`);
    }

    incrementHorsesPopped() {
        if (this.gameActive) {
            this.horsesPopped++;
        }
    }

    endGame() {
        if (!this.gameActive || !this.gameStartTime) {
            console.log('No active game to end');
            return;
        }

        const gameDuration = Math.floor((Date.now() - this.gameStartTime) / 1000); // seconds
        
        const gameData = {
            gameMode: this.gameMode,
            duration: gameDuration,
            horsesPopped: this.horsesPopped,
            background: this.currentBackground,
            enemy: this.currentEnemy,
            difficulty: this.currentDifficulty,
            horsSpeed: this.currentHorsSpeed,
            horsPower: this.currentHorsPower,
            horsSize: this.currentHorsSize
        };

        console.log('Game ended:', gameData);
        
        // Save game data if user is logged in
        if (window.loggedIn && window.currentUser) {
            this.saveGameData(gameData);
        }

        // Reset game state
        this.gameActive = false;
        this.gameStartTime = null;
    }

    saveGameData(gameData) {
        fetch('/api/save-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(gameData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Game saved successfully:', data.gameId);
            } else {
                console.error('Failed to save game:', data.error);
            }
        })
        .catch(error => {
            console.error('Error saving game:', error);
        });
    }

    // Capture current settings from the DOM
    captureCurrentSettings() {
        // Helper function to get the selected option text
        const getSelectedOptionText = (selectorId) => {
            const selector = document.getElementById(selectorId);
            if (!selector) return 'Unknown';
            
            const dataValue = selector.getAttribute('data-value');
            if (!dataValue) return 'Unknown';
            
            // Find the option with matching data-value
            const optionsContainer = selector.closest('.custom-select');
            if (optionsContainer) {
                const selectedOption = optionsContainer.querySelector(`.option[data-value="${dataValue}"]`);
                if (selectedOption) {
                    return selectedOption.textContent.trim();
                }
            }
            
            return 'Unknown';
        };
        
        // Get background (Theme) - get text from selected option
        this.currentBackground = getSelectedOptionText('bg-selector');
        
        // Get enemy (Hors type) - get text from selected option
        this.currentEnemy = getSelectedOptionText('type-selector');
        
        // Get difficulty - get text from selected option
        this.currentDifficulty = getSelectedOptionText('difficulty-selector');
        
        // Get hors speed - get text from selected option
        this.currentHorsSpeed = getSelectedOptionText('speed-selector');
        
        // Get hors power - get text from selected option
        this.currentHorsPower = getSelectedOptionText('power-selector');
        
        // Get hors size - get text from selected option
        this.currentHorsSize = getSelectedOptionText('size-selector');
        
        console.log('Captured settings:', {
            background: this.currentBackground,
            enemy: this.currentEnemy,
            difficulty: this.currentDifficulty,
            horsSpeed: this.currentHorsSpeed,
            horsPower: this.currentHorsPower,
            horsSize: this.currentHorsSize
        });
    }
}

// Global game tracker instance
window.gameTracker = new GameTracker();

// Example integration with existing horsplay code:
/*
// When starting a new game (in your game select modal):
window.gameTracker.startGame('ranked'); // or 'freeplay'

// When a horse is popped:
window.gameTracker.incrementHorsesPopped();

// When the game ends (in your success modal or game over):
window.gameTracker.endGame();
*/
