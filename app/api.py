from flask import Blueprint, request, jsonify, session, g
from datetime import datetime
import re
import uuid
from firebase_admin import db

bp = Blueprint("api", __name__)

@bp.route('/update-username', methods=['POST'])
def update_username():
    """Update the username for the current user."""
    try:
        if not g.user:
            return jsonify({'error': 'Not logged in'}), 401
        
        data = request.get_json()
        new_username = data.get('username', '').strip()
        
        if not new_username:
            return jsonify({'error': 'Username cannot be empty'}), 400
        
        # Validate username format (alphanumeric, hyphens, underscores only)
        if not re.match(r'^[a-zA-Z0-9_-]+$', new_username):
            return jsonify({'error': 'Username can only contain letters, numbers, hyphens, and underscores'}), 400
        
        if len(new_username) < 3 or len(new_username) > 20:
            return jsonify({'error': 'Username must be between 3 and 20 characters'}), 400
        
        user_id = g.user['user_id']
        current_username = g.user.get('username', '')
        
        # Check if username is already taken (current usernames)
        usernames_ref = db.reference('usernames')
        existing_usernames = usernames_ref.get() or {}
        
        if new_username in existing_usernames and new_username != current_username:
            return jsonify({'error': 'Username is already taken'}), 409
        
        # Check if username was previously used by this user
        former_usernames_ref = db.reference(f'former_usernames/{user_id}')
        user_former_usernames = former_usernames_ref.get() or {}
        
        if new_username in user_former_usernames:
            return jsonify({'error': 'You cannot reuse a previous username'}), 409
        
        # Check if username was used by any other user
        all_former_usernames_ref = db.reference('former_usernames')
        all_former_usernames = all_former_usernames_ref.get() or {}
        
        for other_user_id, other_former_usernames in all_former_usernames.items():
            if other_user_id != user_id and new_username in other_former_usernames:
                return jsonify({'error': 'Username was previously used by another user'}), 409
        
        # Update the user's record
        user_ref = db.reference(f'users/{user_id}')
        user_data = user_ref.get() or {}
        
        # Store the old username in former_usernames if it exists
        if current_username and current_username != new_username:
            former_usernames_ref.update({
                current_username: datetime.now().isoformat()
            })
        
        # Update user data
        user_data['username'] = new_username
        user_ref.update(user_data)
        
        # Update usernames table
        if current_username and current_username != new_username:
            # Remove old username from active usernames
            usernames_ref.update({current_username: None})
        
        # Add new username to active usernames
        usernames_ref.update({new_username: True})
        
        # Update session
        session['profile']['username'] = new_username
        
        return jsonify({
            'success': True,
            'username': new_username,
            'message': 'Username updated successfully'
        })
        
    except Exception as e:
        print(f"Error updating username: {e}")
        return jsonify({'error': 'An error occurred while updating username'}), 500

@bp.route('/refresh-session', methods=['POST'])
def refresh_session():
    """Refresh session data from Firebase database."""
    try:
        if not g.user:
            return jsonify({'error': 'Not logged in'}), 401
        
        user_id = g.user['user_id']
        
        # Get fresh data from Firebase
        ref = db.reference(f'users/{user_id}')
        user_data = ref.get()
        
        if user_data:
            # Update session with fresh data
            session['profile'].update({
                'name': user_data.get('name', session['profile'].get('name')),
                'email': user_data.get('email', session['profile'].get('email')),
                'picture': user_data.get('picture', session['profile'].get('picture')),
                'subscription_type': user_data.get('subscription_type', session['profile'].get('subscription_type')),
                'unique_user_id': user_data.get('unique_user_id', session['profile'].get('unique_user_id')),
                'username': user_data.get('username', session['profile'].get('username'))
            })
            
            return jsonify({
                'success': True,
                'message': 'Session refreshed successfully',
                'data': session['profile']
            })
        else:
            return jsonify({'error': 'User data not found'}), 404
            
    except Exception as e:
        print(f"Error refreshing session: {e}")
        return jsonify({'error': 'An error occurred while refreshing session'}), 500

@bp.route('/save-game', methods=['POST'])
def save_game():
    """Save a completed game to Firebase"""
    try:
        if not g.user:
            return jsonify({'error': 'Not logged in'}), 401
        
        data = request.get_json()
        user_id = g.user['user_id']
        username = g.user.get('username', 'Unknown')
        
        # Generate unique game ID
        game_id = str(uuid.uuid4())
        
        # Prepare game data
        game_data = {
            'timestamp': datetime.now().isoformat(),
            'username': username,  # username at time of game
            'game_mode': data.get('gameMode', 'freeplay'),
            'duration': data.get('duration', 0),
            'horses_popped': data.get('horsesPopped', 0),
            'background': data.get('background', 'default.jpg'),
            'enemy': data.get('enemy', 'image-hors'),
            'difficulty': data.get('difficulty', 'easyDifficulty'),
            'hors_speed': data.get('horsSpeed', '1'),
            'hors_power': data.get('horsPower', '50'),
            'hors_size': data.get('horsSize', '1'),
            'completed': True
        }
        
        # Save to Firebase
        ref = db.reference(f'users/{user_id}/games/{game_id}')
        ref.set(game_data)
        
        # Update user stats
        update_user_stats(user_id, game_data)
        
        return jsonify({'success': True, 'gameId': game_id})
        
    except Exception as e:
        print(f"Error saving game: {e}")
        return jsonify({'error': 'An error occurred while saving game'}), 500

def update_user_stats(user_id, game_data):
    """Update aggregated user statistics"""
    try:
        stats_ref = db.reference(f'users/{user_id}/stats')
        current_stats = stats_ref.get() or {'ranked': {}, 'freeplay': {}}
        
        mode = game_data['game_mode']
        if mode not in current_stats:
            current_stats[mode] = {
                'total_games': 0,
                'total_horses_popped': 0,
                'total_time_played': 0,
                'difficulty_breakdown': {},
                'background_counts': {},
                'enemy_counts': {},
                'hors_speed_counts': {},
                'hors_power_counts': {},
                'hors_size_counts': {}
            }
        
        # Update basic stats
        current_stats[mode]['total_games'] += 1
        current_stats[mode]['total_horses_popped'] += game_data['horses_popped']
        current_stats[mode]['total_time_played'] += game_data['duration']
        
        # Update difficulty breakdown
        difficulty = game_data.get('difficulty', 'easyDifficulty')
        current_stats[mode]['difficulty_breakdown'][difficulty] = \
            current_stats[mode]['difficulty_breakdown'].get(difficulty, 0) + 1
        
        # Update background counts
        background = game_data['background']
        current_stats[mode]['background_counts'][background] = \
            current_stats[mode]['background_counts'].get(background, 0) + 1
        
        # Update enemy counts
        enemy = game_data['enemy']
        current_stats[mode]['enemy_counts'][enemy] = \
            current_stats[mode]['enemy_counts'].get(enemy, 0) + 1
        
        # Update hors speed counts
        hors_speed = game_data.get('hors_speed', '1')
        current_stats[mode]['hors_speed_counts'][hors_speed] = \
            current_stats[mode]['hors_speed_counts'].get(hors_speed, 0) + 1
        
        # Update hors power counts
        hors_power = game_data.get('hors_power', '50')
        current_stats[mode]['hors_power_counts'][hors_power] = \
            current_stats[mode]['hors_power_counts'].get(hors_power, 0) + 1
        
        # Update hors size counts
        hors_size = game_data.get('hors_size', '1')
        current_stats[mode]['hors_size_counts'][hors_size] = \
            current_stats[mode]['hors_size_counts'].get(hors_size, 0) + 1
        
        # Calculate favorites
        if current_stats[mode]['background_counts']:
            current_stats[mode]['favorite_background'] = max(
                current_stats[mode]['background_counts'].items(), 
                key=lambda x: x[1]
            )[0]
        else:
            current_stats[mode]['favorite_background'] = 'N/A'
        
        if current_stats[mode]['enemy_counts']:
            current_stats[mode]['favorite_enemy'] = max(
                current_stats[mode]['enemy_counts'].items(), 
                key=lambda x: x[1]
            )[0]
        else:
            current_stats[mode]['favorite_enemy'] = 'N/A'
        
        if current_stats[mode]['hors_speed_counts']:
            current_stats[mode]['favorite_hors_speed'] = max(
                current_stats[mode]['hors_speed_counts'].items(), 
                key=lambda x: x[1]
            )[0]
        else:
            current_stats[mode]['favorite_hors_speed'] = 'N/A'
        
        if current_stats[mode]['hors_power_counts']:
            current_stats[mode]['favorite_hors_power'] = max(
                current_stats[mode]['hors_power_counts'].items(), 
                key=lambda x: x[1]
            )[0]
        else:
            current_stats[mode]['favorite_hors_power'] = 'N/A'
        
        if current_stats[mode]['hors_size_counts']:
            current_stats[mode]['favorite_hors_size'] = max(
                current_stats[mode]['hors_size_counts'].items(), 
                key=lambda x: x[1]
            )[0]
        else:
            current_stats[mode]['favorite_hors_size'] = 'N/A'
        
        # Update best time for ranked mode
        if mode == 'ranked' and game_data['duration'] > 0:
            current_best = current_stats[mode].get('best_time', 'inf')
            if current_best == 'inf' or game_data['duration'] < current_best:
                current_stats[mode]['best_time'] = game_data['duration']
        
        stats_ref.set(current_stats)
        
    except Exception as e:
        print(f"Error updating user stats: {e}")
        raise e
