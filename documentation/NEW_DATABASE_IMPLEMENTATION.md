# New Database Implementation Guide

## Overview

This document describes the new Firebase Realtime Database implementation that follows the schema defined in `database-structure.md`. The new system provides a complete foundation for game session tracking, user management, stats, HorsPass, leaderboards, and store functionality.

## What's New

### 🗄️ Database Structure
- **Canonical Schema**: Follows the exact structure from `database-structure.md`
- **User Management**: Proper user creation, authentication linking, and username management
- **Game Sessions**: Dual-mirror session tracking (by user and by game)
- **Stats Rollups**: Automatic stats calculation and mode-specific tracking
- **HorsPass System**: Season-based progression with XP tracking
- **Scoreboards**: Real-time scoreboard updates
- **Store & Entitlements**: Purchase tracking and subscription management

### 🔧 Backend Changes
- **DatabaseService**: New service class for all database operations
- **Updated Auth**: Modified authentication to use new user structure
- **New API Routes**: Complete API for game session management
- **Profile Integration**: Updated profile page to use new stats structure

### 🎮 Frontend Changes
- **GameTracker**: New JavaScript class for session tracking
- **API Integration**: Updated username editor and other components
- **Session Management**: Proper game session lifecycle handling

## Quick Start

### 1. Initialize the Database

First, start your Flask app:
```bash
cd local-environment
python run.py
```

Then initialize the database:
```bash
python initialize_database.py
```

This will:
- Clear any existing data
- Create the basic database structure
- Add sample games, seasons, and store items
- Test the API endpoints

### 2. Test User Registration

1. Go to `http://localhost:5000`
2. Click "SIGN IN" to register/login
3. Check your profile page to see the new structure

### 3. Test Game Session Tracking

The new system automatically tracks game sessions. To test:

1. Start a game in Horsplay
2. The system will create a session automatically
3. Play the game and pop some targets
4. End the game to see stats updated

## API Endpoints

### Game Session Management

#### Start Game Session
```javascript
// Start a new game session
const sessionId = await window.gameTracker.startGameSession({
    gameId: 'horsplay',
    gameMode: 'ranked',
    gameDifficulty: 'Easy',
    modifiers: {
        speed: 1.0,
        power: 50,
        size: 1.0,
        background: 'Forest',
        type: 'Hors'
    },
    settings: {
        spawn_rate: 1.0,
        wind: 'on'
    }
});
```

#### Update Game Session
```javascript
// Update session with progress
await window.gameTracker.updateGameSession({
    targetsPopped: 25,
    score: 250
});
```

#### Finish Game Session
```javascript
// Finish the session and update stats
await window.gameTracker.finishGameSession({
    targetsPopped: 50,
    score: 500
});
```

### User Management

#### Get User Stats
```javascript
// Get stats for a specific game
const stats = await window.gameTracker.getUserStats('horsplay');
console.log(stats);
```

#### Update Username
```javascript
// Update user's username
const success = await window.gameTracker.updateUsername('NewUsername');
```

### Scoreboards

#### Get Scoreboard
```javascript
// Get scoreboard for a season
const scoreboard = await window.gameTracker.getScoreboard('HP-S1', 100);
console.log(scoreboard);
```

## Database Structure

### Users
```
/users/{user_id}
  email, name, picture_url,
  primary_auth_method, created_at, last_login_at,
  subscription_type, auth_methods_json
```

### Game Sessions
```
/game_sessions_by_user/{user_id}/{session_id}
/game_sessions_by_game/{game_id}/{session_id}
  user_id, game_id, username_snapshot,
  game_mode, game_difficulty, game_modifier_*,
  game_duration_seconds, game_targets_popped,
  game_score, game_completed, created_at
```

### Stats
```
/stats/{user_id}/{game_id}
  total_sessions, total_targets_popped,
  best_time_seconds, favorite_difficulty,
  favorite_modifier, updated_at

/stats_by_mode/{user_id}/{game_id}/{game_mode}
  total_sessions, total_targets_popped,
  best_time_seconds, updated_at
```

### HorsPass
```
/horspass_seasons/{game_id}/{season_id}
  name, starts_at, ends_at

/horspass_progress/{user_id}/{season_id}
  xp_total, last_claimed_tier, updated_at
```

### Scoreboards
```
/scoreboards/{season_id}/best_score/{user_id}
  best_score, best_time_seconds,
  username_cache, updated_at
```

## Integration with Existing Code

### Horsplay Integration

To integrate with your existing Horsplay game:

1. **Start Session**: Call `startGameSession()` when the game begins
2. **Update Progress**: Call `updateGameSession()` periodically during gameplay
3. **Finish Session**: Call `finishGameSession()` when the game ends

Example integration:
```javascript
// In your game start function
async function startGame() {
    try {
        await window.gameTracker.startGameSession({
            gameMode: 'ranked',
            gameDifficulty: getCurrentDifficulty(),
            modifiers: {
                speed: getCurrentSpeed(),
                power: getCurrentPower(),
                size: getCurrentSize(),
                background: getCurrentBackground(),
                type: getCurrentEnemy()
            }
        });
        // Start your game logic
    } catch (error) {
        console.error('Failed to start game session:', error);
    }
}

// In your target hit function
async function onTargetHit() {
    // Update your game state
    targetsPopped++;
    score += 10;
    
    // Update session
    await window.gameTracker.updateGameSession({
        targetsPopped: targetsPopped,
        score: score
    });
}

// In your game end function
async function endGame() {
    try {
        await window.gameTracker.finishGameSession({
            targetsPopped: targetsPopped,
            score: score
        });
        // Show results, etc.
    } catch (error) {
        console.error('Failed to finish game session:', error);
    }
}
```

## Migration from Old System

### What Changed
- **User IDs**: Now using UUID4 instead of Auth0 sub
- **Stats Structure**: Completely new stats schema with mode-specific tracking
- **Session Tracking**: New dual-mirror session system
- **API Endpoints**: All new RESTful API endpoints

### What's Compatible
- **Authentication**: Still uses Auth0, but with new user structure
- **Profile Page**: Updated to work with new stats format
- **Username System**: Enhanced with proper history tracking

## Testing

### Manual Testing
1. **User Registration**: Test login/logout and profile creation
2. **Game Sessions**: Play games and verify stats are recorded
3. **Scoreboards**: Check that scores appear in scoreboards
4. **Username Changes**: Test username updates and history

### API Testing
Use the provided endpoints to test:
- `GET /api/stats/horsplay` - Get user stats
- `GET /api/scoreboard/HP-S1` - Get scoreboard
- `POST /api/game/start` - Start game session
- `POST /api/game/finish` - Finish game session

## Troubleshooting

### Common Issues

1. **Profile Page Errors**: Make sure the template uses bracket notation for dictionary access
2. **Session Not Starting**: Check that user is authenticated and has `unique_user_id`
3. **Stats Not Updating**: Verify the game session is properly finalized
4. **Database Errors**: Check Firebase permissions and connection

### Debug Tools

1. **Browser Console**: Check for JavaScript errors
2. **Server Logs**: Look for Python errors in the Flask app
3. **Firebase Console**: Verify data is being written correctly
4. **Network Tab**: Check API request/response status

## Next Steps

1. **Integrate with Horsplay**: Update your game code to use the new session tracking
2. **Add More Games**: Extend the system for additional games
3. **Implement HorsPass UI**: Create the user interface for HorsPass progression
4. **Add Store Integration**: Implement the store and purchase system
5. **Performance Optimization**: Add caching and optimize database queries

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify the database structure in Firebase Console
3. Test the API endpoints manually
4. Check that all required fields are being provided

The new system provides a solid foundation for all your game features and can be extended as needed.
