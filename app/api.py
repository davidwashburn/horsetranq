from flask import Blueprint, request, jsonify, g, session
from .database_service import DatabaseService
import uuid
from datetime import datetime

bp = Blueprint("api", __name__)

@bp.route('/api/game/start', methods=['POST'])
def start_game_session():
    """Start a new game session."""
    try:
        if not g.user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract required fields
        game_id = data.get('game_id', 'horsplay')  # Default to horsplay
        game_mode = data.get('game_mode', 'freeplay')
        game_difficulty = data.get('game_difficulty', 'Easy')
        
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Prepare session data
        session_data = {
            'session_id': session_id,
            'username_snapshot': g.user.get('username', 'Unknown'),
            'game_mode': game_mode,
            'game_difficulty': game_difficulty,
            'game_modifier_speed': data.get('game_modifier_speed', 1.0),
            'game_modifier_power': data.get('game_modifier_power', 50),
            'game_modifier_size': data.get('game_modifier_size', 1.0),
            'game_modifier_background': data.get('game_modifier_background', 'Unknown'),
            'game_modifier_type': data.get('game_modifier_type', 'Hors'),
            'settings_json': data.get('settings_json', '{}')
        }
        
        # Create session
        db_service = DatabaseService()
        user_id = g.user.get('unique_user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID not found'}), 400
        
        created_session_id = db_service.create_game_session(user_id, game_id, session_data)
        
        if not created_session_id:
            return jsonify({'error': 'Failed to create session'}), 500
        
        return jsonify({
            'success': True,
            'session_id': created_session_id,
            'message': 'Game session started'
        })
        
    except Exception as e:
        print(f"Error starting game session: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/game/update', methods=['POST'])
def update_game_session():
    """Update an ongoing game session."""
    try:
        if not g.user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        session_id = data.get('session_id')
        if not session_id:
            return jsonify({'error': 'Session ID required'}), 400
        
        # Prepare update data
        update_data = {}
        for field in ['game_duration_seconds', 'game_targets_popped', 'game_score']:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Update session
        db_service = DatabaseService()
        user_id = g.user.get('unique_user_id')
        game_id = data.get('game_id', 'horsplay')
        
        if not user_id:
            return jsonify({'error': 'User ID not found'}), 400
        
        success = db_service.update_game_session(user_id, game_id, session_id, update_data)
        
        if not success:
            return jsonify({'error': 'Failed to update session'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Game session updated'
        })
        
    except Exception as e:
        print(f"Error updating game session: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/game/finish', methods=['POST'])
def finish_game_session():
    """Finish a game session and update stats."""
    try:
        if not g.user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        session_id = data.get('session_id')
        if not session_id:
            return jsonify({'error': 'Session ID required'}), 400
        
        # Prepare final data
        final_data = {
            'game_duration_seconds': data.get('game_duration_seconds', 0),
            'game_targets_popped': data.get('game_targets_popped', 0),
            'game_score': data.get('game_score', 0),
            'game_completed': True
        }
        
        # Finalize session
        db_service = DatabaseService()
        user_id = g.user.get('unique_user_id')
        game_id = data.get('game_id', 'horsplay')
        
        if not user_id:
            return jsonify({'error': 'User ID not found'}), 400
        
        success = db_service.finalize_game_session(user_id, game_id, session_id, final_data)
        
        if not success:
            return jsonify({'error': 'Failed to finalize session'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Game session finished and stats updated'
        })
        
    except Exception as e:
        print(f"Error finishing game session: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/stats/<game_id>', methods=['GET'])
def get_user_stats(game_id):
    """Get user stats for a specific game."""
    try:
        if not g.user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        db_service = DatabaseService()
        user_id = g.user.get('unique_user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID not found'}), 400
        
        stats = db_service.get_user_stats(user_id, game_id)
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        print(f"Error getting user stats: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/scoreboard/<season_id>', methods=['GET'])
def get_scoreboard(season_id):
    """Get scoreboard for a season."""
    try:
        limit = request.args.get('limit', 100, type=int)
        
        db_service = DatabaseService()
        scoreboard = db_service.get_scoreboard(season_id, limit)
        
        return jsonify({
            'success': True,
            'scoreboard': scoreboard
        })
        
    except Exception as e:
        print(f"Error getting scoreboard: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/username/update', methods=['POST'])
def update_username():
    """Update user's username."""
    try:
        if not g.user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        new_username = data.get('username')
        if not new_username:
            return jsonify({'error': 'Username required'}), 400
        
        # Validate username format
        if len(new_username) < 3 or len(new_username) > 20:
            return jsonify({'error': 'Username must be 3-20 characters'}), 400
        
        if not new_username.replace('-', '').replace('_', '').isalnum():
            return jsonify({'error': 'Username can only contain letters, numbers, hyphens, and underscores'}), 400
        
        db_service = DatabaseService()
        user_id = g.user.get('unique_user_id')
        old_username = g.user.get('username', 'Unknown')
        
        if not user_id:
            return jsonify({'error': 'User ID not found'}), 400
        
        # Check if username is already taken
        username_index = db_service.db.child('usernames_index').child(new_username).get()
        if username_index and username_index.get('user_id') != user_id:
            return jsonify({'error': 'Username already taken'}), 409
        
        # Update username
        success = db_service.update_username(user_id, old_username, new_username)
        
        if not success:
            return jsonify({'error': 'Failed to update username'}), 500
        
        # Update user data
        user_data = db_service.get_user(user_id)
        if user_data:
            user_data['username'] = new_username
            db_service.create_or_update_user(user_id, user_data)
        
        return jsonify({
            'success': True,
            'message': 'Username updated successfully',
            'new_username': new_username
        })
        
    except Exception as e:
        print(f"Error updating username: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/database/initialize', methods=['POST'])
def initialize_database():
    """Initialize the database with basic structure (admin only)."""
    try:
        # Add authentication check for admin users if needed
        # For now, this is open - you might want to add admin checks
        
        db_service = DatabaseService()
        success = db_service.initialize_database()
        
        if not success:
            return jsonify({'error': 'Failed to initialize database'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Database initialized successfully'
        })
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/database/clear', methods=['POST'])
def clear_database():
    """Clear all data from the database (use with caution!)."""
    try:
        # Add authentication check for admin users if needed
        # For now, this is open - you might want to add admin checks
        
        db_service = DatabaseService()
        success = db_service.clear_database()
        
        if not success:
            return jsonify({'error': 'Failed to clear database'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Database cleared successfully'
        })
        
    except Exception as e:
        print(f"Error clearing database: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# ============================================================================
# TESTING ENDPOINTS (Bypass authentication for fake data creation)
# ============================================================================

@bp.route('/api/database/create_session', methods=['POST'])
def create_test_session():
    """Create a game session directly for testing (bypasses auth)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        db_service = DatabaseService()
        session_id = db_service.create_game_session(
            data.get('user_id'),
            data.get('game_id', 'horsplay'),
            data
        )
        
        if session_id:
            return jsonify({'session_id': session_id, 'success': True}), 200
        else:
            return jsonify({'error': 'Failed to create session'}), 500
            
    except Exception as e:
        print(f"Error creating test session: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/database/create_stats', methods=['POST'])
def create_test_stats():
    """Create stats directly for testing (bypasses auth)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        db_service = DatabaseService()
        success = db_service._update_user_stats(
            data.get('user_id'),
            data.get('game_id', 'horsplay'),
            data
        )
        
        if success:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Failed to create stats'}), 500
            
    except Exception as e:
        print(f"Error creating test stats: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/database/create_scoreboard_entry', methods=['POST'])
def create_test_scoreboard_entry():
    """Create scoreboard entry directly for testing (bypasses auth)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        db_service = DatabaseService()
        success = db_service._update_scoreboard(
            data.get('user_id'),
            data.get('game_id', 'horsplay'),
            data
        )
        
        if success:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Failed to create scoreboard entry'}), 500
            
    except Exception as e:
        print(f"Error creating test scoreboard entry: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/database/create_horspass_progress', methods=['POST'])
def create_test_horspass_progress():
    """Create HorsPass progress directly for testing (bypasses auth)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        db_service = DatabaseService()
        success = db_service._update_horspass_progress(
            data.get('user_id'),
            data.get('game_id', 'horsplay'),
            data
        )
        
        if success:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Failed to create HorsPass progress'}), 500
            
    except Exception as e:
        print(f"Error creating test HorsPass progress: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/database/create_user', methods=['POST'])
def create_test_user():
    """Create a user directly for testing (bypasses auth)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        db_service = DatabaseService()
        user_id = data.get('user_id')
        user_data = {
            'email': data.get('email'),
            'name': data.get('name'),
            'username': data.get('username'),
            'picture_url': data.get('picture_url'),
            'primary_auth_method': data.get('primary_auth_method', 'google'),
            'created_at': data.get('created_at'),
            'last_login_at': data.get('last_login_at'),
            'subscription_type': data.get('subscription_type', 'free'),
            'auth_methods_json': data.get('auth_methods_json', '{}')
        }
        
        success = db_service.create_or_update_user(user_id, user_data)
        
        if success:
            return jsonify({'success': True, 'user_id': user_id}), 200
        else:
            return jsonify({'error': 'Failed to create user'}), 500
            
    except Exception as e:
        print(f"Error creating test user: {e}")
        return jsonify({'error': 'Internal server error'}), 500