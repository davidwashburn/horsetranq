from flask import Blueprint, request, jsonify, g, session
from .database_service import DatabaseService
import uuid
from datetime import datetime

bp = Blueprint("api", __name__)

@bp.route('/game/start', methods=['POST'])
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

@bp.route('/game/update', methods=['POST'])
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
        for field in ['game_duration_seconds', 'game_duration_ms', 'game_targets_popped', 'game_score']:
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

@bp.route('/game/finish', methods=['POST'])
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
            'game_duration_ms': data.get('game_duration_ms', 0),  # New millisecond precision field
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

@bp.route('/stats/<game_id>', methods=['GET'])
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

@bp.route('/scoreboard/<season_id>', methods=['GET'])
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

@bp.route('/username/update', methods=['POST'])
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

@bp.route('/user-profile/<username>', methods=['GET'])
def get_user_profile(username):
    """Get public user profile data by username."""
    try:
        db_service = DatabaseService()
        
        # Look up user by username
        username_index = db_service.db.child('usernames_index').child(username).get()
        if not username_index:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        user_id = username_index.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Get user data
        user_data = db_service.get_user(user_id)
        if not user_data:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Get user stats
        stats = db_service.get_user_stats(user_id, 'horsplay')
        
        # Get HorsPass progress (if available)
        horspass_level = 1
        try:
            horspass_progress = db_service.db.child('horspass_progress').child(user_id).child('HP-S1').get()
            if horspass_progress:
                xp_total = horspass_progress.get('xp_total', 0)
                # Simple level calculation - adjust as needed
                horspass_level = min(max(1, xp_total // 100), 10)
        except:
            pass
        
        # Format member since date
        member_since = 'UNKNOWN'
        if user_data.get('created_at'):
            try:
                from datetime import datetime
                created_date = datetime.fromisoformat(user_data['created_at'].replace('Z', '+00:00'))
                member_since = created_date.strftime('%b %Y').upper()
            except:
                pass
        
        # Get report statistics for this user
        report_stats = db_service.db.child('stats_user_reports').child('by_reported_user').child(user_id).get()
        cheatin_reports = 0
        turd_reports = 0
        
        if report_stats:
            cheatin_reports = report_stats.get('cheatin_count', 0)
            turd_reports = report_stats.get('is_a_turd_count', 0)
        
        # Return only public information
        public_profile = {
            'username': user_data.get('username', username),
            'member_since': member_since,
            'subscription_type': user_data.get('subscription_type', 'free'),
            'total_games': stats.get('total_sessions', 0) if stats else 0,
            'total_horses': stats.get('total_targets_popped', 0) if stats else 0,
            'best_time_seconds': stats.get('best_time_seconds') if stats else None,
            'horspass_level': horspass_level,
            'cheatin_reports': cheatin_reports,
            'turd_reports': turd_reports
        }
        
        return jsonify({
            'success': True,
            'user': public_profile
        })
        
    except Exception as e:
        print(f"Error getting user profile: {e}")
        return jsonify({
            'success': False,
            'message': 'Error loading profile'
        }), 500

@bp.route('/user-sessions/<username>', methods=['GET'])
def get_user_sessions(username):
    """Get recent game sessions for a user by username."""
    try:
        db_service = DatabaseService()
        
        # Look up user by username
        username_index = db_service.db.child('usernames_index').child(username).get()
        if not username_index:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        user_id = username_index.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Get recent sessions
        sessions = db_service.get_user_sessions(user_id, 'horsplay', 5)
        
        return jsonify({
            'success': True,
            'sessions': sessions
        })
        
    except Exception as e:
        print(f"Error getting user sessions: {e}")
        return jsonify({
            'success': False,
            'message': 'Error loading sessions'
        }), 500

@bp.route('/report-player', methods=['POST'])
def report_player():
    """Submit a player report for analytics tracking."""
    try:
        if not g.user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        reported_username = data.get('reported_username')
        report_type = data.get('report_type')
        
        if not reported_username or not report_type:
            return jsonify({'error': 'Missing required fields'}), 400
        
        if report_type not in ['CHEATIN', 'IS A TURD']:
            return jsonify({'error': 'Invalid report type'}), 400
        
        db_service = DatabaseService()
        reporter_user_id = g.user.get('unique_user_id')
        reporter_username = g.user.get('username', 'Unknown')
        
        if not reporter_user_id:
            return jsonify({'error': 'Reporter user ID not found'}), 400
        
        # Look up reported user
        username_index = db_service.db.child('usernames_index').child(reported_username).get()
        if not username_index:
            return jsonify({'error': 'Reported user not found'}), 404
        
        reported_user_id = username_index.get('user_id')
        
        # Prevent self-reporting
        if reporter_user_id == reported_user_id:
            return jsonify({'error': 'Cannot report yourself'}), 400
        
        # Create report record
        report_id = str(uuid.uuid4())
        report_data = {
            'reported_user_id': reported_user_id,
            'reported_username': reported_username,
            'reporter_user_id': reporter_user_id,
            'reporter_username': reporter_username,
            'report_type': report_type,
            'created_at': datetime.utcnow().isoformat() + 'Z',
            'context': data.get('context', 'unknown')
        }
        
        # Save report
        db_service.db.child('user_reports').child(report_id).set(report_data)
        
        # Update analytics aggregations
        _update_report_analytics(db_service, reported_user_id, reporter_user_id, report_type)
        
        return jsonify({
            'success': True,
            'message': f'Reported {reported_username} for {report_type}',
            'report_id': report_id
        })
        
    except Exception as e:
        print(f"Error submitting report: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def _update_report_analytics(db_service, reported_user_id, reporter_user_id, report_type):
    """Update analytics aggregations for reports."""
    try:
        # Update reported user analytics
        reported_analytics_ref = db_service.db.child('stats_user_reports').child('by_reported_user').child(reported_user_id)
        reported_analytics = reported_analytics_ref.get() or {}
        
        reported_analytics['total_reports'] = reported_analytics.get('total_reports', 0) + 1
        reported_analytics[f'{report_type.lower().replace(" ", "_")}_count'] = reported_analytics.get(f'{report_type.lower().replace(" ", "_")}_count', 0) + 1
        
        if not reported_analytics.get('first_reported'):
            reported_analytics['first_reported'] = datetime.utcnow().isoformat() + 'Z'
        reported_analytics['last_reported'] = datetime.utcnow().isoformat() + 'Z'
        
        reported_analytics_ref.set(reported_analytics)
        
        # Update reporter analytics
        reporter_analytics_ref = db_service.db.child('stats_user_reports').child('by_reporter').child(reporter_user_id)
        reporter_analytics = reporter_analytics_ref.get() or {}
        
        reporter_analytics['total_reports_made'] = reporter_analytics.get('total_reports_made', 0) + 1
        reporter_analytics[f'{report_type.lower().replace(" ", "_")}_reports_made'] = reporter_analytics.get(f'{report_type.lower().replace(" ", "_")}_reports_made', 0) + 1
        
        if not reporter_analytics.get('first_report_made'):
            reporter_analytics['first_report_made'] = datetime.utcnow().isoformat() + 'Z'
        reporter_analytics['last_report_made'] = datetime.utcnow().isoformat() + 'Z'
        
        reporter_analytics_ref.set(reporter_analytics)
        
    except Exception as e:
        print(f"Error updating report analytics: {e}")

@bp.route('/report-analytics', methods=['GET'])
def get_report_analytics():
    """Get report analytics data."""
    try:
        db_service = DatabaseService()
        
        # Get query parameters
        analytics_type = request.args.get('type', 'summary')  # summary, top_reported, top_reporters
        limit = request.args.get('limit', 10, type=int)
        
        if analytics_type == 'summary':
            # Get overall summary stats
            all_reports = db_service.db.child('user_reports').get() or {}
            
            total_reports = len(all_reports)
            cheatin_reports = sum(1 for r in all_reports.values() if r.get('report_type') == 'CHEATIN')
            turd_reports = sum(1 for r in all_reports.values() if r.get('report_type') == 'IS A TURD')
            
            # Get unique users
            reported_users = set(r.get('reported_user_id') for r in all_reports.values())
            reporters = set(r.get('reporter_user_id') for r in all_reports.values())
            
            return jsonify({
                'success': True,
                'analytics': {
                    'total_reports': total_reports,
                    'cheatin_reports': cheatin_reports,
                    'turd_reports': turd_reports,
                    'unique_reported_users': len(reported_users),
                    'unique_reporters': len(reporters)
                }
            })
            
        elif analytics_type == 'top_reported':
            # Get most reported users
            reported_analytics = db_service.db.child('stats_user_reports').child('by_reported_user').get() or {}
            
            top_reported = []
            for user_id, stats in reported_analytics.items():
                top_reported.append({
                    'user_id': user_id,
                    'total_reports': stats.get('total_reports', 0),
                    'cheatin_count': stats.get('cheatin_count', 0),
                    'is_a_turd_count': stats.get('is_a_turd_count', 0),
                    'first_reported': stats.get('first_reported'),
                    'last_reported': stats.get('last_reported')
                })
            
            # Sort by total reports
            top_reported.sort(key=lambda x: x['total_reports'], reverse=True)
            
            return jsonify({
                'success': True,
                'analytics': top_reported[:limit]
            })
            
        elif analytics_type == 'top_reporters':
            # Get most active reporters
            reporter_analytics = db_service.db.child('stats_user_reports').child('by_reporter').get() or {}
            
            top_reporters = []
            for user_id, stats in reporter_analytics.items():
                top_reporters.append({
                    'user_id': user_id,
                    'total_reports_made': stats.get('total_reports_made', 0),
                    'cheatin_reports_made': stats.get('cheatin_reports_made', 0),
                    'is_a_turd_reports_made': stats.get('is_a_turd_reports_made', 0),
                    'first_report_made': stats.get('first_report_made'),
                    'last_report_made': stats.get('last_report_made')
                })
            
            # Sort by total reports made
            top_reporters.sort(key=lambda x: x['total_reports_made'], reverse=True)
            
            return jsonify({
                'success': True,
                'analytics': top_reporters[:limit]
            })
        
        else:
            return jsonify({'error': 'Invalid analytics type'}), 400
            
    except Exception as e:
        print(f"Error getting report analytics: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/database/initialize', methods=['POST'])
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

@bp.route('/database/clear', methods=['POST'])
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

@bp.route('/database/create_session', methods=['POST'])
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

@bp.route('/database/create_stats', methods=['POST'])
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

@bp.route('/database/create_scoreboard_entry', methods=['POST'])
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

@bp.route('/database/create_horspass_progress', methods=['POST'])
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

@bp.route('/database/create_user', methods=['POST'])
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