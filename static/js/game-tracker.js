/**
 * Game Tracker - Handles game session tracking and API interactions
 * for the new database structure
 */

class GameTracker {
    constructor() {
        this.currentSessionId = null;
        this.gameStartTime = null;
        this.isTracking = false;
    }

    /**
     * Start tracking a new game session
     * @param {Object} gameConfig - Game configuration
     * @param {string} gameConfig.gameId - Game ID (default: 'horsplay')
     * @param {string} gameConfig.gameMode - Game mode ('ranked' or 'freeplay')
     * @param {string} gameConfig.gameDifficulty - Game difficulty ('Easy', 'Medium', 'Hard')
     * @param {Object} gameConfig.modifiers - Game modifiers
     * @param {Object} gameConfig.settings - Additional game settings
     * @returns {Promise<string>} Session ID
     */
    async startGameSession(gameConfig = {}) {
        try {
            const sessionData = {
                game_id: gameConfig.gameId || 'horsplay',
                game_mode: gameConfig.gameMode || 'freeplay',
                game_difficulty: gameConfig.gameDifficulty || 'Easy',
                game_modifier_speed: gameConfig.modifiers?.speed || 1.0,
                game_modifier_power: gameConfig.modifiers?.power || 50,
                game_modifier_size: gameConfig.modifiers?.size || 1.0,
                game_modifier_background: gameConfig.modifiers?.background || 'Unknown',
                game_modifier_type: gameConfig.modifiers?.type || 'Hors',
                settings_json: JSON.stringify(gameConfig.settings || {})
            };

            const response = await fetch('/api/game/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sessionData)
            });

            const result = await response.json();
            
            if (result.success) {
                this.currentSessionId = result.session_id;
                this.gameStartTime = Date.now();
                this.isTracking = true;
                console.log('Game session started:', this.currentSessionId);
                return this.currentSessionId;
            } else {
                throw new Error(result.error || 'Failed to start game session');
            }
        } catch (error) {
            console.error('Error starting game session:', error);
            throw error;
        }
    }

    /**
     * Update the current game session with progress data
     * @param {Object} progressData - Progress data to update
     * @param {number} progressData.targetsPopped - Number of targets popped
     * @param {number} progressData.score - Current score
     * @param {string} gameId - Game ID (default: 'horsplay')
     * @returns {Promise<boolean>} Success status
     */
    async updateGameSession(progressData, gameId = 'horsplay') {
        if (!this.currentSessionId) {
            console.warn('No active game session to update');
            return false;
        }

        try {
            const updateData = {
                session_id: this.currentSessionId,
                game_id: gameId,
                game_targets_popped: progressData.targetsPopped || 0,
                game_score: progressData.score || 0
            };

            const response = await fetch('/api/game/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Game session updated');
                return true;
            } else {
                throw new Error(result.error || 'Failed to update game session');
            }
        } catch (error) {
            console.error('Error updating game session:', error);
            return false;
        }
    }

    /**
     * Finish the current game session and update final stats
     * @param {Object} finalData - Final game data
     * @param {number} finalData.targetsPopped - Total targets popped
     * @param {number} finalData.score - Final score
     * @param {string} gameId - Game ID (default: 'horsplay')
     * @returns {Promise<boolean>} Success status
     */
    async finishGameSession(finalData, gameId = 'horsplay') {
        if (!this.currentSessionId) {
            console.warn('No active game session to finish');
            return false;
        }

        try {
            const durationMs = this.gameStartTime ? Math.floor(Date.now() - this.gameStartTime) : 0;
            const durationSeconds = Math.floor(durationMs / 1000);
            
            const finishData = {
                session_id: this.currentSessionId,
                game_id: gameId,
                game_duration_seconds: durationSeconds, // Keep for backward compatibility
                game_duration_ms: durationMs, // New millisecond precision field
                game_targets_popped: finalData.targetsPopped || 0,
                game_score: finalData.score || 0
            };

            const response = await fetch('/api/game/finish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finishData)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Game session finished:', {
                    sessionId: this.currentSessionId,
                    durationMs: durationMs,
                    durationSeconds: durationSeconds,
                    score: finalData.score,
                    targetsPopped: finalData.targetsPopped
                });
                
                // Reset tracking state
                this.currentSessionId = null;
                this.gameStartTime = null;
                this.isTracking = false;
                
                return true;
            } else {
                throw new Error(result.error || 'Failed to finish game session');
            }
        } catch (error) {
            console.error('Error finishing game session:', error);
            return false;
        }
    }

    /**
     * Get user stats for a specific game
     * @param {string} gameId - Game ID (default: 'horsplay')
     * @returns {Promise<Object>} User stats
     */
    async getUserStats(gameId = 'horsplay') {
        try {
            const response = await fetch(`/api/stats/${gameId}`);
            const result = await response.json();
            
            if (result.success) {
                return result.stats;
            } else {
                throw new Error(result.error || 'Failed to get user stats');
            }
        } catch (error) {
            console.error('Error getting user stats:', error);
            return {};
        }
    }

    /**
     * Get scoreboard for a season
     * @param {string} seasonId - Season ID
     * @param {number} limit - Number of entries to return (default: 100)
     * @returns {Promise<Array>} Scoreboard data
     */
    async getScoreboard(seasonId, limit = 100) {
        try {
            const response = await fetch(`/api/scoreboard/${seasonId}?limit=${limit}`);
            const result = await response.json();
            
            if (result.success) {
                return result.scoreboard;
            } else {
                throw new Error(result.error || 'Failed to get scoreboard');
            }
        } catch (error) {
            console.error('Error getting scoreboard:', error);
            return [];
        }
    }

    /**
     * Update user's username
     * @param {string} newUsername - New username
     * @returns {Promise<boolean>} Success status
     */
    async updateUsername(newUsername) {
        try {
            const response = await fetch('/api/username/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: newUsername })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Username updated successfully:', newUsername);
                return true;
            } else {
                throw new Error(result.error || 'Failed to update username');
            }
        } catch (error) {
            console.error('Error updating username:', error);
            return false;
        }
    }

    /**
     * Initialize the database with basic structure (admin function)
     * @returns {Promise<boolean>} Success status
     */
    async initializeDatabase() {
        try {
            const response = await fetch('/api/database/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Database initialized successfully');
                return true;
            } else {
                throw new Error(result.error || 'Failed to initialize database');
            }
        } catch (error) {
            console.error('Error initializing database:', error);
            return false;
        }
    }

    /**
     * Clear all data from the database (admin function - use with caution!)
     * @returns {Promise<boolean>} Success status
     */
    async clearDatabase() {
        try {
            const response = await fetch('/api/database/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Database cleared successfully');
                return true;
            } else {
                throw new Error(result.error || 'Failed to clear database');
            }
        } catch (error) {
            console.error('Error clearing database:', error);
            return false;
        }
    }

    /**
     * Get current session info
     * @returns {Object} Current session information
     */
    getCurrentSession() {
        return {
            sessionId: this.currentSessionId,
            isTracking: this.isTracking,
            startTime: this.gameStartTime,
            duration: this.gameStartTime ? Math.floor((Date.now() - this.gameStartTime) / 1000) : 0
        };
    }

    /**
     * Reset the current session (useful for error recovery)
     */
    resetSession() {
        this.currentSessionId = null;
        this.gameStartTime = null;
        this.isTracking = false;
        console.log('Game session reset');
    }
}

// Create global instance
window.gameTracker = new GameTracker();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameTracker;
}
