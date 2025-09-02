from firebase_admin import db
from datetime import datetime
import uuid
import json
from typing import Dict, Any, Optional, List

class DatabaseService:
    """Service class for managing Firebase Realtime Database operations according to the new schema."""
    
    def __init__(self):
        self.db = db.reference()
    
    # ============================================================================
    # USER MANAGEMENT
    # ============================================================================
    
    def create_or_update_user(self, user_id: str, user_data: Dict[str, Any]) -> bool:
        """Create or update user data in the new schema."""
        try:
            # Ensure required fields
            user_data.update({
                'created_at': user_data.get('created_at', datetime.now().isoformat()),
                'last_login_at': datetime.now().isoformat(),
                'subscription_type': user_data.get('subscription_type', 'free')
            })
            
            # Save to users collection
            self.db.child('users').child(user_id).set(user_data)
            
            # Create username mapping if username exists
            if 'username' in user_data:
                self.db.child('usernames').child(user_id).set({
                    'username': user_data['username'],
                    'active': True
                })
                
                # Create username index for fast lookup
                self.db.child('usernames_index').child(user_data['username']).set({
                    'user_id': user_id,
                    'active': True
                })
            
            # Create email index if email exists
            if 'email' in user_data:
                encoded_email = self._encode_email(user_data['email'])
                self.db.child('email_index').child(encoded_email).set({
                    'user_id': user_id
                })
            
            # Create OAuth index if auth_methods exist
            if 'auth_methods_json' in user_data:
                auth_methods = json.loads(user_data['auth_methods_json'])
                for provider, sub_id in auth_methods.items():
                    encoded_oauth_id = self._encode_oauth_id(f"{provider}|{sub_id}")
                    self.db.child('oauth_index').child(encoded_oauth_id).set({
                        'user_id': user_id
                    })
            
            return True
        except Exception as e:
            print(f"Error creating/updating user: {e}")
            return False
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user data by user_id."""
        try:
            return self.db.child('users').child(user_id).get()
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    def update_username(self, user_id: str, old_username: str, new_username: str) -> bool:
        """Update username and create history record."""
        try:
            # Create history record
            history_id = str(uuid.uuid4())
            self.db.child('username_history').child(user_id).child(history_id).set({
                'old_username': old_username,
                'changed_at': datetime.now().isoformat()
            })
            
            # Update current username
            self.db.child('usernames').child(user_id).update({
                'username': new_username,
                'active': True
            })
            
            # Update username index
            self.db.child('usernames_index').child(old_username).delete()
            self.db.child('usernames_index').child(new_username).set({
                'user_id': user_id,
                'active': True
            })
            
            return True
        except Exception as e:
            print(f"Error updating username: {e}")
            return False
    
    # ============================================================================
    # GAME SESSIONS
    # ============================================================================
    
    def create_game_session(self, user_id: str, game_id: str, session_data: Dict[str, Any]) -> str:
        """Create a new game session with client-generated session_id."""
        try:
            session_id = session_data.get('session_id', str(uuid.uuid4()))
            
            # Ensure required fields
            session_data.update({
                'user_id': user_id,
                'game_id': game_id,
                'created_at': datetime.now().isoformat(),
                'game_completed': False
            })
            
            # Save to both mirrors
            self.db.child('game_sessions_by_user').child(user_id).child(session_id).set(session_data)
            self.db.child('game_sessions_by_game').child(game_id).child(session_id).set(session_data)
            
            return session_id
        except Exception as e:
            print(f"Error creating game session: {e}")
            return None
    
    def update_game_session(self, user_id: str, game_id: str, session_id: str, session_data: Dict[str, Any]) -> bool:
        """Update an existing game session."""
        try:
            # Update both mirrors
            self.db.child('game_sessions_by_user').child(user_id).child(session_id).update(session_data)
            self.db.child('game_sessions_by_game').child(game_id).child(session_id).update(session_data)
            return True
        except Exception as e:
            print(f"Error updating game session: {e}")
            return False
    
    def finalize_game_session(self, user_id: str, game_id: str, session_id: str, final_data: Dict[str, Any]) -> bool:
        """Finalize a game session and update stats."""
        try:
            # Mark as completed
            final_data['game_completed'] = True
            
            # Update session
            success = self.update_game_session(user_id, game_id, session_id, final_data)
            if not success:
                return False
            
            # Update stats
            self._update_user_stats(user_id, game_id, final_data)
            
            # Update HorsPass progress
            self._update_horspass_progress(user_id, game_id, final_data)
            
            # Update scoreboard
            self._update_scoreboard(user_id, game_id, final_data)
            
            return True
        except Exception as e:
            print(f"Error finalizing game session: {e}")
            return False
    
    # ============================================================================
    # STATS MANAGEMENT
    # ============================================================================
    
    def _update_user_stats(self, user_id: str, game_id: str, session_data: Dict[str, Any]) -> bool:
        """Update user stats based on completed game session."""
        try:
            stats_ref = self.db.child('stats').child(user_id).child(game_id)
            current_stats = stats_ref.get() or {}
            
            # Update basic stats
            current_stats['total_sessions'] = current_stats.get('total_sessions', 0) + 1
            current_stats['total_targets_popped'] = current_stats.get('total_targets_popped', 0) + session_data.get('game_targets_popped', 0)
            
            # Update best time
            current_time = session_data.get('game_duration_seconds', 0)
            if current_time > 0:
                best_time = current_stats.get('best_time_seconds', float('inf'))
                if current_time < best_time:
                    current_stats['best_time_seconds'] = current_time
            
            # Update favorites (simplified - you might want more sophisticated logic)
            current_stats['favorite_difficulty'] = session_data.get('game_difficulty', 'Unknown')
            current_stats['favorite_modifier'] = session_data.get('game_modifier_type', 'Unknown')
            current_stats['updated_at'] = datetime.now().isoformat()
            
            stats_ref.set(current_stats)
            
            # Update mode-specific stats if game_mode exists
            game_mode = session_data.get('game_mode')
            if game_mode:
                mode_stats_ref = self.db.child('stats_by_mode').child(user_id).child(game_id).child(game_mode)
                mode_stats = mode_stats_ref.get() or {}
                
                mode_stats['total_sessions'] = mode_stats.get('total_sessions', 0) + 1
                mode_stats['total_targets_popped'] = mode_stats.get('total_targets_popped', 0) + session_data.get('game_targets_popped', 0)
                
                if current_time > 0:
                    mode_best_time = mode_stats.get('best_time_seconds', float('inf'))
                    if current_time < mode_best_time:
                        mode_stats['best_time_seconds'] = current_time
                
                mode_stats['updated_at'] = datetime.now().isoformat()
                mode_stats_ref.set(mode_stats)
            
            return True
        except Exception as e:
            print(f"Error updating user stats: {e}")
            return False
    
    def get_user_stats(self, user_id: str, game_id: str) -> Dict[str, Any]:
        """Get user stats for a specific game."""
        try:
            stats = self.db.child('stats').child(user_id).child(game_id).get() or {}
            
            # Get mode-specific stats
            mode_stats = {}
            stats_by_mode = self.db.child('stats_by_mode').child(user_id).child(game_id).get() or {}
            for mode, mode_data in stats_by_mode.items():
                mode_stats[mode] = mode_data
            
            stats['mode_stats'] = mode_stats
            return stats
        except Exception as e:
            print(f"Error getting user stats: {e}")
            return {}
    
    # ============================================================================
    # HORSPASS SYSTEM
    # ============================================================================
    
    def create_horspass_season(self, game_id: str, season_id: str, season_data: Dict[str, Any]) -> bool:
        """Create a new HorsPass season."""
        try:
            self.db.child('horspass_seasons').child(game_id).child(season_id).set(season_data)
            return True
        except Exception as e:
            print(f"Error creating HorsPass season: {e}")
            return False
    
    def create_horspass_track(self, season_id: str, tier: int, track_data: Dict[str, Any]) -> bool:
        """Create a HorsPass track tier."""
        try:
            self.db.child('horspass_tracks').child(season_id).child(str(tier)).set(track_data)
            return True
        except Exception as e:
            print(f"Error creating HorsPass track: {e}")
            return False
    
    def _update_horspass_progress(self, user_id: str, game_id: str, session_data: Dict[str, Any]) -> bool:
        """Update HorsPass progress based on game session."""
        try:
            # Get current season for the game
            seasons = self.db.child('horspass_seasons').child(game_id).get() or {}
            if not seasons:
                return True  # No active season
            
            # For now, use the first season (you might want more sophisticated season selection)
            season_id = list(seasons.keys())[0]
            
            # Calculate XP from session (simplified - adjust based on your game logic)
            xp_earned = self._calculate_session_xp(session_data)
            
            # Update progress
            progress_ref = self.db.child('horspass_progress').child(user_id).child(season_id)
            current_progress = progress_ref.get() or {'xp_total': 0, 'last_claimed_tier': 0}
            
            current_progress['xp_total'] = current_progress.get('xp_total', 0) + xp_earned
            current_progress['updated_at'] = datetime.now().isoformat()
            
            progress_ref.set(current_progress)
            return True
        except Exception as e:
            print(f"Error updating HorsPass progress: {e}")
            return False
    
    def _calculate_session_xp(self, session_data: Dict[str, Any]) -> int:
        """Calculate XP earned from a game session."""
        # Simplified XP calculation - adjust based on your game design
        base_xp = 10
        targets_bonus = session_data.get('game_targets_popped', 0) * 2
        difficulty_multiplier = {
            'Easy': 1,
            'Medium': 1.5,
            'Hard': 2
        }.get(session_data.get('game_difficulty', 'Easy'), 1)
        
        return int((base_xp + targets_bonus) * difficulty_multiplier)
    
    # ============================================================================
    # SCOREBOARDS
    # ============================================================================
    
    def _update_scoreboard(self, user_id: str, game_id: str, session_data: Dict[str, Any]) -> bool:
        """Update scoreboard with best scores."""
        try:
            # Get current season
            seasons = self.db.child('horspass_seasons').child(game_id).get() or {}
            if not seasons:
                return True  # No active season
            
            season_id = list(seasons.keys())[0]
            
            # Get user's current best
            scoreboard_ref = self.db.child('scoreboards').child(season_id).child('best_score').child(user_id)
            current_best = scoreboard_ref.get() or {}
            
            # Update if this session is better
            current_score = session_data.get('game_score', 0)
            current_time = session_data.get('game_duration_seconds', float('inf'))
            
            best_score = current_best.get('best_score', 0)
            best_time = current_best.get('best_time_seconds', float('inf'))
            
            should_update = False
            if current_score > best_score:
                should_update = True
            elif current_score == best_score and current_time < best_time:
                should_update = True
            
            if should_update:
                # Get username for cache
                username = self.db.child('usernames').child(user_id).child('username').get() or 'Unknown'
                
                scoreboard_ref.set({
                    'best_score': max(best_score, current_score),
                    'best_time_seconds': min(best_time, current_time) if current_time > 0 else best_time,
                    'username_cache': username,
                    'updated_at': datetime.now().isoformat()
                })
            
            return True
        except Exception as e:
            print(f"Error updating scoreboard: {e}")
            return False
    
    def get_scoreboard(self, season_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get scoreboard for a season."""
        try:
            scoreboard_data = self.db.child('scoreboards').child(season_id).child('best_score').get() or {}
            
            # Convert to list and sort by score (descending), then by time (ascending)
            scoreboard_list = []
            for user_id, data in scoreboard_data.items():
                data['user_id'] = user_id
                scoreboard_list.append(data)
            
            scoreboard_list.sort(key=lambda x: (-x.get('best_score', 0), x.get('best_time_seconds', float('inf'))))
            
            return scoreboard_list[:limit]
        except Exception as e:
            print(f"Error getting scoreboard: {e}")
            return []
    
    def get_aggregated_stats(self, game_id: str = 'horsplay') -> Dict[str, Any]:
        """Get aggregated stats across all users for a game."""
        try:
            # Get all user stats for the game
            all_stats = self.db.child('stats').get() or {}
            
            total_games = 0
            total_horses = 0
            best_time_ever = float('inf')
            active_players = 0
            
            for user_id, user_games in all_stats.items():
                if game_id in user_games:
                    game_stats = user_games[game_id]
                    total_games += game_stats.get('total_sessions', 0)
                    total_horses += game_stats.get('total_targets_popped', 0)
                    
                    # Track best time ever
                    user_best_time = game_stats.get('best_time_seconds', float('inf'))
                    if user_best_time < best_time_ever:
                        best_time_ever = user_best_time
                    
                    # Count active players (played in last 7 days)
                    if game_stats.get('updated_at'):
                        active_players += 1
            
            return {
                'total_games': total_games,
                'total_horses': total_horses,
                'best_time_ever': best_time_ever if best_time_ever != float('inf') else None,
                'active_players': active_players
            }
        except Exception as e:
            print(f"Error getting aggregated stats: {e}")
            return {'total_games': 0, 'total_horses': 0, 'best_time_ever': None, 'active_players': 0}
    
    def get_weekly_leaders(self, game_id: str = 'horsplay') -> Dict[str, Any]:
        """Get weekly leader statistics."""
        try:
            # Get all user stats
            all_stats = self.db.child('stats').get() or {}
            
            most_games_user = {'username': 'No data', 'games': 0}
            most_horses_user = {'username': 'No data', 'horses': 0}
            fastest_time_user = {'username': 'No data', 'time': float('inf')}
            
            for user_id, user_games in all_stats.items():
                if game_id in user_games:
                    game_stats = user_games[game_id]
                    
                    # Get username
                    username = self.db.child('usernames').child(user_id).child('username').get() or 'Unknown'
                    
                    # Most games
                    games = game_stats.get('total_sessions', 0)
                    if games > most_games_user['games']:
                        most_games_user = {'username': username, 'games': games}
                    
                    # Most horses
                    horses = game_stats.get('total_targets_popped', 0)
                    if horses > most_horses_user['horses']:
                        most_horses_user = {'username': username, 'horses': horses}
                    
                    # Fastest time
                    time = game_stats.get('best_time_seconds', float('inf'))
                    if time < fastest_time_user['time']:
                        fastest_time_user = {'username': username, 'time': time}
            
            return {
                'most_games': most_games_user,
                'most_horses': most_horses_user,
                'fastest_time': fastest_time_user if fastest_time_user['time'] != float('inf') else {'username': 'No data', 'time': None}
            }
        except Exception as e:
            print(f"Error getting weekly leaders: {e}")
            return {
                'most_games': {'username': 'No data', 'games': 0},
                'most_horses': {'username': 'No data', 'horses': 0},
                'fastest_time': {'username': 'No data', 'time': None}
            }
    
    def get_scoreboard_with_details(self, season_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get scoreboard with full user details for display."""
        try:
            scoreboard = self.get_scoreboard(season_id, limit)
            
            # Enhance each entry with user details
            for entry in scoreboard:
                user_id = entry.get('user_id')
                if user_id:
                    # Get current username (not the cached one from when score was achieved)
                    current_username = self.db.child('usernames').child(user_id).child('username').get() or 'Unknown'
                    entry['username'] = current_username
                    
                    # Get user stats
                    user_stats = self.get_user_stats(user_id, 'horsplay')
                    entry['total_games'] = user_stats.get('total_sessions', 0)
                    entry['total_horses'] = user_stats.get('total_targets_popped', 0)
                    
                    # Get user subscription
                    user_data = self.get_user(user_id)
                    entry['subscription_type'] = user_data.get('subscription_type', 'free') if user_data else 'free'
                    
                    # Get HorsPass level
                    horspass_progress = self.db.child('horspass_progress').child(user_id).child(season_id).get() or {}
                    xp_total = horspass_progress.get('xp_total', 0)
                    # Calculate level (simplified - every 100 XP = 1 level)
                    entry['horspass_level'] = max(1, xp_total // 100)
            
            return scoreboard
        except Exception as e:
            print(f"Error getting scoreboard with details: {e}")
            return []
    
    # ============================================================================
    # STORE & ENTITLEMENTS
    # ============================================================================
    
    def create_store_item(self, sku: str, item_data: Dict[str, Any]) -> bool:
        """Create a store item."""
        try:
            self.db.child('store_items').child(sku).set(item_data)
            return True
        except Exception as e:
            print(f"Error creating store item: {e}")
            return False
    
    def record_purchase(self, user_id: str, purchase_id: str, purchase_data: Dict[str, Any]) -> bool:
        """Record a purchase."""
        try:
            purchase_data['created_at'] = datetime.now().isoformat()
            self.db.child('purchases').child(user_id).child(purchase_id).set(purchase_data)
            return True
        except Exception as e:
            print(f"Error recording purchase: {e}")
            return False
    
    def grant_entitlement(self, user_id: str, sku: str, source: str = 'purchase', meta: Dict[str, Any] = None) -> bool:
        """Grant an entitlement to a user."""
        try:
            entitlement_data = {
                'granted_at': datetime.now().isoformat(),
                'source': source
            }
            
            if meta:
                entitlement_data['meta_json'] = json.dumps(meta)
            
            self.db.child('entitlements').child(user_id).child(sku).set(entitlement_data)
            
            # Update user's subscription type if this is a subscription
            if source == 'purchase':
                self._update_user_subscription_type(user_id)
            
            return True
        except Exception as e:
            print(f"Error granting entitlement: {e}")
            return False
    
    def _update_user_subscription_type(self, user_id: str) -> bool:
        """Update user's subscription type based on entitlements."""
        try:
            entitlements = self.db.child('entitlements').child(user_id).get() or {}
            
            # Determine subscription type based on entitlements
            subscription_type = 'free'
            for sku in entitlements.keys():
                if 'MAX' in sku.upper():
                    subscription_type = 'max'
                    break
                elif 'PLUS' in sku.upper():
                    subscription_type = 'plus'
                elif 'ONE' in sku.upper() and subscription_type == 'free':
                    subscription_type = 'one'
            
            # Update user
            self.db.child('users').child(user_id).update({
                'subscription_type': subscription_type
            })
            
            return True
        except Exception as e:
            print(f"Error updating subscription type: {e}")
            return False
    
    # ============================================================================
    # GAME CATALOG
    # ============================================================================
    
    def create_game(self, game_id: str, game_data: Dict[str, Any]) -> bool:
        """Create a game in the catalog."""
        try:
            game_data['created_at'] = datetime.now().isoformat()
            self.db.child('games').child(game_id).set(game_data)
            return True
        except Exception as e:
            print(f"Error creating game: {e}")
            return False
    
    def get_game(self, game_id: str) -> Optional[Dict[str, Any]]:
        """Get game data."""
        try:
            return self.db.child('games').child(game_id).get()
        except Exception as e:
            print(f"Error getting game: {e}")
            return None
    
    # ============================================================================
    # UTILITY METHODS
    # ============================================================================
    
    def _encode_email(self, email: str) -> str:
        """Encode email for Firebase key safety."""
        return email.replace('@', '_AT_').replace('.', '_DOT_')
    
    def _encode_oauth_id(self, oauth_id: str) -> str:
        """Encode OAuth ID for Firebase key safety."""
        return oauth_id.replace('|', '_PIPE_').replace('.', '_DOT_').replace('@', '_AT_')
    
    def clear_database(self) -> bool:
        """Clear all data from the database (use with caution!)."""
        try:
            self.db.delete()
            return True
        except Exception as e:
            print(f"Error clearing database: {e}")
            return False
    
    def initialize_database(self) -> bool:
        """Initialize the database with basic structure and sample data."""
        try:
            # Create sample games
            self.create_game('horsplay', {
                'key': 'horsplay',
                'name': 'Horsplay',
                'status': 'active',
                'modes': ['ranked', 'freeplay']
            })
            
            # Create sample HorsPass season
            self.create_horspass_season('horsplay', 'HP-S1', {
                'name': 'HorsPass S1',
                'starts_at': '2025-01-01T00:00:00Z',
                'ends_at': '2025-03-31T23:59:59Z'
            })
            
            # Create sample HorsPass tracks
            for tier in range(1, 11):
                self.create_horspass_track('HP-S1', tier, {
                    'xp_required': tier * 100,
                    'reward_json': json.dumps({
                        'type': 'cosmetic',
                        'item': f'TIER_{tier}_REWARD'
                    })
                })
            
            # Create sample store items
            self.create_store_item('HP-PREMIUM-S1', {
                'type': 'horspass_premium',
                'title': 'HorsPass Premium – S1',
                'price_cents': 399,
                'active': True,
                'game_id': 'horsplay'
            })
            
            return True
        except Exception as e:
            print(f"Error initializing database: {e}")
            return False
