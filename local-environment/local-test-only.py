from flask import Flask, render_template, redirect, url_for, request, jsonify
from datetime import datetime
import uuid
import random
import string
import os
import sys

# Add the parent directory to sys.path so we can import news_data directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import news_data directly to avoid importing the full app package
import importlib.util
news_data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'app', 'news_data.py')
spec = importlib.util.spec_from_file_location("news_data", news_data_path)
news_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(news_data)

# Now we can use the functions
get_latest_features = news_data.get_latest_features
get_latest_fixes = news_data.get_latest_fixes
get_latest_deprecated = news_data.get_latest_deprecated
NEWS_DATA = news_data.NEWS_DATA

# Get the parent directory (project root) for templates and static files
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
template_dir = os.path.join(project_root, 'templates')
static_dir = os.path.join(project_root, 'static')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

def generate_mock_unique_user_id():
    """Generate a mock UUID for testing"""
    return str(uuid.uuid4())

def generate_mock_username():
    """Generate a mock username for testing"""
    random_numbers = ''.join(random.choices(string.digits, k=6))
    return f"Horsey-{random_numbers}"

# Mock data for development - this would typically come from a database
mock_user_data = {
    'logged_in': True,  # Change to True to test logged-in state
    'user_id': '1883-4836-3848-8348',
    'name': 'Test User',
    'email': 'test@example.com',
    'picture': 'https://via.placeholder.com/100',
    'subscription_type': 'free',
    'firebase_token': 'mock_token',
    'unique_user_id': generate_mock_unique_user_id(),
    'username': generate_mock_username(),
    'hide_avatar': 'No',
    'avatar_type': 'google-profile',
    'account_creation_date': '2024-02-24T11:08:55.902491'
}

# Mock user stats for testing
mock_user_stats = {
    'ranked': {
        'total_games': 5,
        'total_horses_popped': 150,
        'total_time_played': 600,
        'difficulty_breakdown': {
            'Easy': 3,
            'Medium': 2,
            'Hard': 0
        },
        'background_counts': {
            'Moody Moon': 3,
            'Sunset Valley': 2
        },
        'enemy_counts': {
            'Horses': 4,
            'Geese': 1
        },
        'hors_speed_counts': {
            '1x': 2,
            '3x': 2,
            '5x': 1
        },
        'hors_power_counts': {
            '50': 3,
            '100': 2
        },
        'hors_size_counts': {
            '1x': 4,
            '2x': 1
        },
        'favorite_background': 'Moody Moon',
        'favorite_enemy': 'Horses',
        'favorite_hors_speed': '1x',
        'favorite_hors_power': '50',
        'favorite_hors_size': '1x',
        'best_time': 120
    },
    'freeplay': {
        'total_games': 12,
        'total_horses_popped': 450,
        'total_time_played': 1800,
        'difficulty_breakdown': {
            'Easy': 8,
            'Medium': 3,
            'Hard': 1
        },
        'background_counts': {
            'Moody Moon': 5,
            'Sunset Valley': 4,
            'Forest Mist': 3
        },
        'enemy_counts': {
            'Horses': 7,
            'Geese': 3,
            'Dogs': 2
        },
        'hors_speed_counts': {
            '1x': 6,
            '3x': 4,
            '5x': 2
        },
        'hors_power_counts': {
            '50': 8,
            '100': 3,
            '250': 1
        },
        'hors_size_counts': {
            '1x': 9,
            '2x': 2,
            '0.5x': 1
        },
        'favorite_background': 'Moody Moon',
        'favorite_enemy': 'Horses',
        'favorite_hors_speed': '1x',
        'favorite_hors_power': '50',
        'favorite_hors_size': '1x'
    }
}

def get_account_context():
    """Get the context data needed for account-related templates"""
    context = mock_user_data.copy()
    
    # Add mock session structure for compatibility with templates
    if context.get('logged_in'):
        context['session'] = {
            'profile': {
                'user_id': context.get('user_id'),
                'name': context.get('name'),
                'email': context.get('email')
            }
        }
    else:
        context['session'] = {}
    
    # Add user stats for profile page
    context['user_stats'] = mock_user_stats
    
    return context

@app.route('/')
def index():
    context = get_account_context()
    context['current_page'] = 'STABLE'
    context['latest_features'] = get_latest_features(3)
    context['latest_fixes'] = get_latest_fixes(3)
    context['latest_deprecated'] = get_latest_deprecated(3)
    
    # Debug output
    print("DEBUG: latest_features count:", len(context['latest_features']))
    print("DEBUG: latest_fixes count:", len(context['latest_fixes']))
    print("DEBUG: latest_deprecated count:", len(context['latest_deprecated']))
    
    return render_template('index.html', **context)

@app.route('/store')
def store():
    context = get_account_context()
    context['current_page'] = 'STOR'
    return render_template('store.html', **context)

@app.route('/horsplay')
def horsplay():
    context = get_account_context()
    context['current_page'] = 'HORSPLAY'
    return render_template('horsplay.html', **context)

@app.route('/lemondrop')
def lemondrop():
    context = get_account_context()
    context['current_page'] = 'LEMON DROP'
    return render_template('lemondrop.html', **context)

@app.route('/about')
def about():
    context = get_account_context()
    context['current_page'] = 'ABOUT'
    return render_template('about.html', **context)

@app.route('/news')
def news():
    context = get_account_context()
    context['current_page'] = 'NEWS'
    context['news_data'] = NEWS_DATA
    return render_template('news.html', **context)

@app.route('/profile')
def profile():
    context = get_account_context()
    context['current_page'] = 'PROFILE'
    return render_template('profile.html', **context)

@app.route('/scores')
def scores():
    context = get_account_context()
    context['current_page'] = 'SCORES'
    
    # Add mock data for scores page
    context['weekly_leaders'] = {
        'most_games': {
            'username': 'TestPlayer1',
            'games': 42
        },
        'most_horses': {
            'username': 'HorseWrangler',
            'horses': 156
        },
        'fastest_time': {
            'username': 'SpeedDemon',
            'time': 8.3,
            'time_ms': 8300  # 8.300s in milliseconds
        }
    }
    
    context['aggregated_stats'] = {
        'total_games': 1337,
        'total_horses': 9001,
        'best_time_ever': 7,
        'best_time_ever_ms': 7200,  # 7.200s in milliseconds
        'active_players': 23
    }
    
    context['scoreboard'] = [
        {
            'username': 'TopPlayer',
            'total_games': 50,
            'total_horses': 200,
            'best_time_seconds': 7,
            'best_time_ms': 7200,  # 7.200s in milliseconds
            'horspass_level': 5,
            'subscription_type': 'max'
        },
        {
            'username': 'SecondPlace',
            'total_games': 45,
            'total_horses': 180,
            'best_time_seconds': 8,
            'best_time_ms': 8100,  # 8.100s in milliseconds
            'horspass_level': 4,
            'subscription_type': 'plus'
        },
        {
            'username': 'ThirdPlace',
            'total_games': 40,
            'total_horses': 160,
            'best_time_seconds': 9,
            'best_time_ms': 9500,  # 9.500s in milliseconds
            'horspass_level': 3,
            'subscription_type': 'one'
        },
        {
            'username': 'FreePlayer',
            'total_games': 25,
            'total_horses': 100,
            'best_time_seconds': 12,
            'best_time_ms': 12300,  # 12.300s in milliseconds
            'horspass_level': 2,
            'subscription_type': 'free'
        },
        {
            'username': 'NewPlayer',
            'total_games': 10,
            'total_horses': 40,
            'best_time_seconds': 15,
            'best_time_ms': 15800,  # 15.800s in milliseconds
            'horspass_level': 1,
            'subscription_type': 'free'
        }
    ]
    
    return render_template('scores.html', **context)

# Login/logout routes moved to app/auth.py blueprint

# API endpoints for local testing
@app.route('/api/refresh-session', methods=['POST'])
def refresh_session():
    """Mock refresh session endpoint for local testing"""
    user_data = get_account_context()
    return jsonify({
        'success': True,
        'message': 'Session refreshed successfully (mock)',
        'data': user_data
    })

@app.route('/api/update-hide-avatar', methods=['POST'])
def update_hide_avatar():
    """Mock update hide avatar endpoint for local testing"""
    data = request.get_json()
    hide_avatar = data.get('hide_avatar', False)
    
    # Update user data
    mock_user_data['hide_avatar'] = 'Yes' if hide_avatar else 'No'
    
    return jsonify({
        'success': True,
        'hide_avatar': mock_user_data['hide_avatar'],
        'message': 'Avatar visibility updated successfully (mock)'
    })

@app.route('/api/user-profile/<username>', methods=['GET'])
def get_user_profile(username):
    """Mock user profile endpoint for local testing"""
    
    # Mock user profiles based on the scoreboard data
    mock_profiles = {
        'TopPlayer': {
            'username': 'TopPlayer',
            'member_since': 'JAN 2023',
            'subscription_type': 'max',
            'total_games': 50,
            'total_horses': 200,
            'best_time_seconds': 7,
            'best_time_ms': 7200,  # 7.200s in milliseconds
            'horspass_level': 5
        },
        'SecondPlace': {
            'username': 'SecondPlace',
            'member_since': 'MAR 2023',
            'subscription_type': 'plus',
            'total_games': 45,
            'total_horses': 180,
            'best_time_seconds': 8.1,
            'horspass_level': 4
        },
        'ThirdPlace': {
            'username': 'ThirdPlace',
            'member_since': 'MAY 2023',
            'subscription_type': 'one',
            'total_games': 40,
            'total_horses': 160,
            'best_time_seconds': 9.5,
            'horspass_level': 3
        },
        'FreePlayer': {
            'username': 'FreePlayer',
            'member_since': 'JUL 2023',
            'subscription_type': 'free',
            'total_games': 25,
            'total_horses': 100,
            'best_time_seconds': 12.3,
            'horspass_level': 2
        },
        'NewPlayer': {
            'username': 'NewPlayer',
            'member_since': 'SEP 2023',
            'subscription_type': 'free',
            'total_games': 10,
            'total_horses': 40,
            'best_time_seconds': 15.8,
            'horspass_level': 1
        },
        'TestPlayer1': {
            'username': 'TestPlayer1',
            'member_since': 'FEB 2023',
            'subscription_type': 'one',
            'total_games': 42,
            'total_horses': 120,
            'best_time_seconds': 10.2,
            'horspass_level': 3
        },
        'HorseWrangler': {
            'username': 'HorseWrangler',
            'member_since': 'JAN 2023',
            'subscription_type': 'plus',
            'total_games': 38,
            'total_horses': 156,
            'best_time_seconds': 9.8,
            'horspass_level': 4
        },
        'SpeedDemon': {
            'username': 'SpeedDemon',
            'member_since': 'APR 2023',
            'subscription_type': 'max',
            'total_games': 35,
            'total_horses': 140,
            'best_time_seconds': 8.3,
            'horspass_level': 5
        }
    }
    
    if username in mock_profiles:
        return jsonify({
            'success': True,
            'user': mock_profiles[username]
        })
    else:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404

@app.route('/api/user-sessions/<username>', methods=['GET'])
def get_user_sessions(username):
    """Mock user sessions endpoint for local testing"""
    
    # Mock session data for testing
    mock_sessions = {
        'TopPlayer': [
            {
                'created_at': '2024-01-15T10:30:00.000Z',
                'game_duration_seconds': 7,
                'game_duration_ms': 7200,
                'game_targets_popped': 25,
                'game_score': 1250,
                'game_difficulty': 'Hard',
                'game_mode': 'freeplay',
                'game_modifier_speed': 2.0,
                'game_modifier_power': 100,
                'game_modifier_background': 'Moody Moon'
            },
            {
                'created_at': '2024-01-14T15:45:00.000Z',
                'game_duration_seconds': 8,
                'game_duration_ms': 8100,
                'game_targets_popped': 22,
                'game_score': 1100,
                'game_difficulty': 'Medium',
                'game_mode': 'freeplay',
                'game_modifier_speed': 1.5,
                'game_modifier_power': 75,
                'game_modifier_background': 'Sunset Valley'
            },
            {
                'created_at': '2024-01-13T09:20:00.000Z',
                'game_duration_seconds': 9,
                'game_duration_ms': 9500,
                'game_targets_popped': 20,
                'game_score': 950,
                'game_difficulty': 'Easy',
                'game_mode': 'freeplay',
                'game_modifier_speed': 1.0,
                'game_modifier_power': 50,
                'game_modifier_background': 'Forest Mist'
            }
        ],
        'SpeedDemon': [
            {
                'created_at': '2024-01-15T14:20:00.000Z',
                'game_duration_seconds': 8,
                'game_duration_ms': 8300,
                'game_targets_popped': 30,
                'game_score': 1500,
                'game_difficulty': 'Hard',
                'game_mode': 'freeplay',
                'game_modifier_speed': 3.0,
                'game_modifier_power': 100,
                'game_modifier_background': 'Moody Moon'
            },
            {
                'created_at': '2024-01-14T11:15:00.000Z',
                'game_duration_seconds': 9,
                'game_duration_ms': 9100,
                'game_targets_popped': 28,
                'game_score': 1400,
                'game_difficulty': 'Medium',
                'game_mode': 'freeplay',
                'game_modifier_speed': 2.5,
                'game_modifier_power': 75,
                'game_modifier_background': 'Sunset Valley'
            }
        ],
        'HorseWrangler': [
            {
                'created_at': '2024-01-15T16:30:00.000Z',
                'game_duration_seconds': 9,
                'game_duration_ms': 9800,
                'game_targets_popped': 35,
                'game_score': 1750,
                'game_difficulty': 'Hard',
                'game_mode': 'freeplay',
                'game_modifier_speed': 1.0,
                'game_modifier_power': 50,
                'game_modifier_background': 'Forest Mist'
            },
            {
                'created_at': '2024-01-14T13:45:00.000Z',
                'game_duration_seconds': 11,
                'game_duration_ms': 11200,
                'game_targets_popped': 32,
                'game_score': 1600,
                'game_difficulty': 'Medium',
                'game_mode': 'freeplay',
                'game_modifier_speed': 1.5,
                'game_modifier_power': 75,
                'game_modifier_background': 'Moody Moon'
            },
            {
                'created_at': '2024-01-13T10:20:00.000Z',
                'game_duration_seconds': 12,
                'game_duration_ms': 12500,
                'game_targets_popped': 30,
                'game_score': 1500,
                'game_difficulty': 'Easy',
                'game_mode': 'freeplay',
                'game_modifier_speed': 1.0,
                'game_modifier_power': 50,
                'game_modifier_background': 'Sunset Valley'
            }
        ]
    }
    
    if username in mock_sessions:
        return jsonify({
            'success': True,
            'sessions': mock_sessions[username]
        })
    else:
        return jsonify({
            'success': True,
            'sessions': []
        })

@app.route('/api/update-avatar-selection', methods=['POST'])
def update_avatar_selection():
    """Mock update avatar selection endpoint for local testing"""
    data = request.get_json()
    avatar_type = data.get('avatar_type', 'google-profile')
    
    # Update user data
    mock_user_data['avatar_type'] = avatar_type
    
    return jsonify({
        'success': True,
        'avatar_type': avatar_type,
        'message': 'Avatar selection updated successfully (mock)'
    })

@app.route('/api/update-username', methods=['POST'])
def update_username():
    """Mock update username endpoint for local testing"""
    data = request.get_json()
    username = data.get('username', '')
    
    if username and len(username) <= 20:
        # Update user data
        mock_user_data['username'] = username
        
        return jsonify({
            'success': True,
            'username': username,
            'message': 'Username updated successfully (mock)'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid username (mock)'
        }), 400

@app.route('/api/save-game', methods=['POST'])
def save_game():
    """Mock save game endpoint for local testing"""
    data = request.get_json()
    
    # Generate a mock game ID
    game_id = str(uuid.uuid4())
    
    # Mock game data structure
    game_data = {
        'timestamp': datetime.now().isoformat(),
        'username': mock_user_data.get('username', 'Unknown'),
        'game_mode': data.get('gameMode', 'freeplay'),
        'duration': data.get('duration', 0),
        'horses_popped': data.get('horsesPopped', 0),
        'background': data.get('background', 'Random'),
        'enemy': data.get('enemy', 'Horses'),
        'difficulty': data.get('difficulty', 'Easy'),
        'hors_speed': data.get('horsSpeed', '1x'),
        'hors_power': data.get('horsPower', '50'),
        'hors_size': data.get('horsSize', '1x'),
        'completed': True
    }
    
    # Update mock stats (in a real app, this would update Firebase)
    mode = game_data['game_mode']
    if mode not in mock_user_stats:
        mock_user_stats[mode] = {
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
    mock_user_stats[mode]['total_games'] += 1
    mock_user_stats[mode]['total_horses_popped'] += game_data['horses_popped']
    mock_user_stats[mode]['total_time_played'] += game_data['duration']
    
    # Update difficulty breakdown
    difficulty = game_data.get('difficulty', 'easyDifficulty')
    mock_user_stats[mode]['difficulty_breakdown'][difficulty] = \
        mock_user_stats[mode]['difficulty_breakdown'].get(difficulty, 0) + 1
    
    # Update background counts
    background = game_data['background']
    mock_user_stats[mode]['background_counts'][background] = \
        mock_user_stats[mode]['background_counts'].get(background, 0) + 1
    
    # Update enemy counts
    enemy = game_data['enemy']
    mock_user_stats[mode]['enemy_counts'][enemy] = \
        mock_user_stats[mode]['enemy_counts'].get(enemy, 0) + 1
    
    # Update hors speed counts
    hors_speed = game_data.get('hors_speed', '1')
    mock_user_stats[mode]['hors_speed_counts'][hors_speed] = \
        mock_user_stats[mode]['hors_speed_counts'].get(hors_speed, 0) + 1
    
    # Update hors power counts
    hors_power = game_data.get('hors_power', '50')
    mock_user_stats[mode]['hors_power_counts'][hors_power] = \
        mock_user_stats[mode]['hors_power_counts'].get(hors_power, 0) + 1
    
    # Update hors size counts
    hors_size = game_data.get('hors_size', '1')
    mock_user_stats[mode]['hors_size_counts'][hors_size] = \
        mock_user_stats[mode]['hors_size_counts'].get(hors_size, 0) + 1
    
    # Calculate favorites
    if mock_user_stats[mode]['background_counts']:
        mock_user_stats[mode]['favorite_background'] = max(
            mock_user_stats[mode]['background_counts'].items(), 
            key=lambda x: x[1]
        )[0]
    
    if mock_user_stats[mode]['enemy_counts']:
        mock_user_stats[mode]['favorite_enemy'] = max(
            mock_user_stats[mode]['enemy_counts'].items(), 
            key=lambda x: x[1]
        )[0]
    
    if mock_user_stats[mode]['hors_speed_counts']:
        mock_user_stats[mode]['favorite_hors_speed'] = max(
            mock_user_stats[mode]['hors_speed_counts'].items(), 
            key=lambda x: x[1]
        )[0]
    
    if mock_user_stats[mode]['hors_power_counts']:
        mock_user_stats[mode]['favorite_hors_power'] = max(
            mock_user_stats[mode]['hors_power_counts'].items(), 
            key=lambda x: x[1]
        )[0]
    
    if mock_user_stats[mode]['hors_size_counts']:
        mock_user_stats[mode]['favorite_hors_size'] = max(
            mock_user_stats[mode]['hors_size_counts'].items(), 
            key=lambda x: x[1]
        )[0]
    
            # Update best time for ranked mode
        if mode == 'ranked' and game_data['duration'] > 0:
            current_best = mock_user_stats[mode].get('best_time', 'inf')
            if current_best == 'inf' or game_data['duration'] < current_best:
                mock_user_stats[mode]['best_time'] = game_data['duration']
    
    print(f"Mock game saved: {game_data}")
    print(f"Updated stats: {mock_user_stats}")
    
    return jsonify({
        'success': True,
        'gameId': game_id,
        'message': 'Game saved successfully (mock)'
    })

if __name__ == '__main__':
    app.run(debug=True, port=8000)
