#!/usr/bin/env python3
"""
Direct Fake Data Generator for Horsetranq Database
This script creates realistic fake data directly in the database structure.
"""

import requests
import json
import uuid
import random
from datetime import datetime, timedelta

def create_fake_data_direct():
    """Create comprehensive fake data directly in the database."""
    
    base_url = "https://horsetranq.com"
    
    print("🎭 Creating Fake Data Directly in Database...")
    print("=" * 50)
    print(f"Target: {base_url}")
    print()
    
    # Fake user data
    fake_users = [
        {
            "email": "testuser1@example.com",
            "name": "Test Player One",
            "username": "HorseMaster",
            "picture_url": "https://via.placeholder.com/150"
        },
        {
            "email": "testuser2@example.com", 
            "name": "Test Player Two",
            "username": "DartSniper",
            "picture_url": "https://via.placeholder.com/150"
        },
        {
            "email": "testuser3@example.com",
            "name": "Test Player Three", 
            "username": "TargetHunter",
            "picture_url": "https://via.placeholder.com/150"
        },
        {
            "email": "testuser4@example.com",
            "name": "Test Player Four",
            "username": "SpeedDemon",
            "picture_url": "https://via.placeholder.com/150"
        },
        {
            "email": "testuser5@example.com",
            "name": "Test Player Five",
            "username": "AccuracyKing",
            "picture_url": "https://via.placeholder.com/150"
        }
    ]
    
    # Game modes and difficulties
    game_modes = ["ranked", "freeplay"]
    difficulties = ["Easy", "Medium", "Hard"]
    modifiers = ["Hors", "Dragon", "Phoenix", "Unicorn"]
    backgrounds = ["Forest", "Desert", "Ocean", "Mountain", "City"]
    
    created_users = []
    
    try:
        print("1. Creating fake users directly...")
        for i, user_data in enumerate(fake_users):
            user_id = str(uuid.uuid4())
            
            print(f"   Creating user {i+1}/5: {user_data['username']}")
            
            # Create user data structure
            user_record = {
                "user_id": user_id,
                "email": user_data["email"],
                "name": user_data["name"],
                "username": user_data["username"],
                "picture_url": user_data["picture_url"],
                "primary_auth_method": "google",
                "created_at": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                "last_login_at": datetime.now().isoformat(),
                "subscription_type": random.choice(["free", "one", "plus"]),
                "auth_methods_json": json.dumps({"google": f"google-oauth2|{random.randint(100000000, 999999999)}"})
            }
            
            # Create user in database
            try:
                response = requests.post(f"{base_url}/api/database/create_user", 
                                      json=user_record, timeout=10)
                if response.status_code == 200:
                    created_users.append(user_record)
                    print(f"   ✅ Created user: {user_data['username']}")
                else:
                    print(f"   ❌ Failed to create user: {response.status_code}")
            except Exception as e:
                print(f"   ❌ Error creating user: {e}")
        
        print("   ✅ Fake users created")
        
        print("\n2. Creating fake game sessions directly...")
        total_sessions = 0
        
        for user in created_users:
            # Create 3-8 game sessions per user
            num_sessions = random.randint(3, 8)
            
            for session_num in range(num_sessions):
                session_id = str(uuid.uuid4())
                game_mode = random.choice(game_modes)
                difficulty = random.choice(difficulties)
                modifier = random.choice(modifiers)
                background = random.choice(backgrounds)
                
                # Generate realistic game data
                targets_popped = random.randint(10, 100)
                duration_seconds = random.randint(30, 300)
                score = targets_popped * random.randint(8, 15)
                
                # Create session data
                session_data = {
                    "user_id": user["user_id"],
                    "game_id": "horsplay",
                    "username_snapshot": user["username"],
                    "game_mode": game_mode,
                    "game_difficulty": difficulty,
                    "game_modifier_speed": round(random.uniform(0.8, 1.5), 2),
                    "game_modifier_power": random.randint(30, 80),
                    "game_modifier_size": round(random.uniform(0.7, 1.3), 2),
                    "game_modifier_background": background,
                    "game_modifier_type": modifier,
                    "game_duration_seconds": duration_seconds,
                    "game_targets_popped": targets_popped,
                    "game_score": score,
                    "game_completed": True,
                    "created_at": (datetime.now() - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))).isoformat(),
                    "settings_json": json.dumps({
                        "spawn_rate": round(random.uniform(0.8, 1.2), 2),
                        "wind": random.choice(["on", "off"]),
                        "sound": random.choice(["on", "off"])
                    })
                }
                
                # Create session directly via database endpoint
                try:
                    # Use a special endpoint that bypasses auth for testing
                    response = requests.post(f"{base_url}/api/database/create_session", 
                                          json=session_data, timeout=10)
                    if response.status_code == 200:
                        total_sessions += 1
                    else:
                        print(f"   ⚠️  Failed to create session: {response.status_code}")
                        
                except Exception as e:
                    print(f"   ⚠️  Error creating session: {e}")
        
        print(f"   ✅ Created {total_sessions} game sessions")
        
        print("\n3. Creating fake stats directly...")
        
        for user in created_users:
            # Create stats for each user
            total_sessions = random.randint(5, 20)
            total_targets = random.randint(100, 1000)
            best_time = random.randint(20, 120)
            
            stats_data = {
                "user_id": user["user_id"],
                "game_id": "horsplay",
                "total_sessions": total_sessions,
                "total_targets_popped": total_targets,
                "best_time_seconds": best_time,
                "favorite_difficulty": random.choice(difficulties),
                "favorite_modifier": random.choice(modifiers),
                "updated_at": datetime.now().isoformat()
            }
            
            try:
                response = requests.post(f"{base_url}/api/database/create_stats", 
                                      json=stats_data, timeout=10)
                if response.status_code == 200:
                    print(f"   Created stats for {user['username']}: {total_sessions} sessions, {total_targets} targets")
                else:
                    print(f"   ⚠️  Failed to create stats: {response.status_code}")
            except Exception as e:
                print(f"   ⚠️  Error creating stats: {e}")
        
        print("\n4. Creating fake scoreboard entries directly...")
        
        for user in created_users:
            # Create a high score entry
            high_score = random.randint(500, 2000)
            fast_time = random.randint(20, 120)
            
            scoreboard_data = {
                "user_id": user["user_id"],
                "season_id": "HP-S1",
                "best_score": high_score,
                "best_time_seconds": fast_time,
                "username_cache": user["username"],
                "updated_at": datetime.now().isoformat()
            }
            
            try:
                response = requests.post(f"{base_url}/api/database/create_scoreboard_entry", 
                                      json=scoreboard_data, timeout=10)
                if response.status_code == 200:
                    print(f"   Created scoreboard entry for {user['username']}: {high_score} points")
                else:
                    print(f"   ⚠️  Failed to create scoreboard entry: {response.status_code}")
            except Exception as e:
                print(f"   ⚠️  Error creating scoreboard entry: {e}")
        
        print("\n5. Creating fake HorsPass progress directly...")
        
        for user in created_users:
            # Create HorsPass progress
            xp_total = random.randint(100, 1500)
            last_claimed_tier = random.randint(1, 10)
            
            horspass_data = {
                "user_id": user["user_id"],
                "season_id": "HP-S1",
                "xp_total": xp_total,
                "last_claimed_tier": last_claimed_tier,
                "updated_at": datetime.now().isoformat()
            }
            
            try:
                response = requests.post(f"{base_url}/api/database/create_horspass_progress", 
                                      json=horspass_data, timeout=10)
                if response.status_code == 200:
                    print(f"   Created HorsPass progress for {user['username']}: {xp_total} XP, Tier {last_claimed_tier}")
                else:
                    print(f"   ⚠️  Failed to create HorsPass progress: {response.status_code}")
            except Exception as e:
                print(f"   ⚠️  Error creating HorsPass progress: {e}")
        
        print("\n🎉 Fake data creation completed!")
        print("\n📊 What was created:")
        print(f"   • {len(created_users)} fake users")
        print(f"   • {total_sessions} game sessions")
        print(f"   • Stats for all users")
        print(f"   • Scoreboard entries for all users")
        print(f"   • HorsPass progress for all users")
        print("\n🔧 Test the system:")
        print("   1. Visit https://horsetranq.com")
        print("   2. Check the scoreboard at /scores")
        print("   3. Try logging in with a real account")
        print("   4. Play a game to see session tracking")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the live site.")
        return False
    except requests.exceptions.Timeout:
        print("❌ Error: Request timed out.")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_fake_data():
    """Test the created fake data."""
    
    base_url = "https://horsetranq.com"
    
    print("\n🧪 Testing Fake Data...")
    print("=" * 30)
    
    # Test scoreboard
    try:
        response = requests.get(f"{base_url}/api/scoreboard/HP-S1", timeout=10)
        if response.status_code == 200:
            scoreboard = response.json()
            print(f"✅ Scoreboard working: {len(scoreboard)} entries")
        else:
            print(f"❌ Scoreboard failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Scoreboard error: {e}")
    
    # Test stats endpoint
    try:
        response = requests.get(f"{base_url}/api/stats/horsplay", timeout=10)
        if response.status_code == 401:  # Expected for unauthenticated user
            print("✅ Stats endpoint working (requires authentication)")
        else:
            print(f"⚠️  Stats endpoint returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Stats endpoint error: {e}")

if __name__ == "__main__":
    print("Horsetranq Direct Fake Data Generator")
    print("=" * 40)
    print("⚠️  This will create fake users and game data directly in the database.")
    print()
    
    # Check if site is accessible
    try:
        response = requests.get("https://horsetranq.com/", timeout=10)
        if response.status_code == 200:
            print("✅ Live site is accessible")
        else:
            print(f"⚠️  Site responded with status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to live site!")
        exit(1)
    except requests.exceptions.Timeout:
        print("❌ Site is not responding (timeout)")
        exit(1)
    
    # Ask for confirmation
    confirm = input("\nDo you want to create fake data? (yes/no): ")
    if confirm.lower() not in ['yes', 'y']:
        print("❌ Fake data creation cancelled.")
        exit(0)
    
    # Create fake data
    if create_fake_data_direct():
        # Test the data
        test_fake_data()
        
        print("\n🎯 Ready to test!")
        print("   Open https://horsetranq.com in your browser")
        print("   Check the scoreboard and try the new features")
    else:
        print("\n❌ Fake data creation failed!")
        exit(1)
