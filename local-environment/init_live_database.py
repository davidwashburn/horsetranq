#!/usr/bin/env python3
"""
Live Database Initialization Script
This script will initialize the new database structure on your live beta site.
"""

import requests
import json

def init_live_database():
    """Initialize the database on the live site."""
    
    base_url = "https://horsetranq.com"
    
    print("🚀 Initializing Horsetranq Live Database...")
    print("=" * 50)
    print(f"Target: {base_url}")
    print()
    
    try:
        # Step 1: Clear the database
        print("1. Clearing existing database...")
        response = requests.post(f"{base_url}/api/database/clear", timeout=30)
        if response.status_code == 200:
            print("   ✅ Database cleared successfully")
        else:
            print(f"   ❌ Failed to clear database: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
        
        # Step 2: Initialize with basic structure
        print("2. Initializing database structure...")
        response = requests.post(f"{base_url}/api/database/initialize", timeout=30)
        if response.status_code == 200:
            print("   ✅ Database structure initialized")
        else:
            print(f"   ❌ Failed to initialize database: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
        
        print("\n🎉 Database initialization completed successfully!")
        print("\n📊 What was created:")
        print("   • Game catalog with 'horsplay' game")
        print("   • HorsPass Season 1 (HP-S1)")
        print("   • 10 HorsPass track tiers")
        print("   • Sample store item (HorsPass Premium)")
        print("\n🔧 Next steps:")
        print("   1. Test user registration/login")
        print("   2. Test game session tracking")
        print("   3. Verify stats are being recorded")
        print("   4. Check scoreboard functionality")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the live site.")
        print("   Make sure your site is accessible and try again.")
        return False
    except requests.exceptions.Timeout:
        print("❌ Error: Request timed out.")
        print("   The site might be slow or overloaded. Try again.")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_live_endpoints():
    """Test the API endpoints on the live site."""
    
    base_url = "https://horsetranq.com"
    
    print("\n🧪 Testing Live API Endpoints...")
    print("=" * 30)
    
    # Test scoreboard endpoint
    try:
        response = requests.get(f"{base_url}/api/scoreboard/HP-S1", timeout=10)
        if response.status_code == 200:
            print("✅ Scoreboard endpoint working")
        else:
            print(f"❌ Scoreboard endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Scoreboard endpoint error: {e}")
    
    # Test stats endpoint (should work even without user)
    try:
        response = requests.get(f"{base_url}/api/stats/horsplay", timeout=10)
        if response.status_code == 401:  # Expected for unauthenticated user
            print("✅ Stats endpoint working (properly requires authentication)")
        else:
            print(f"⚠️  Stats endpoint returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Stats endpoint error: {e}")

if __name__ == "__main__":
    print("Horsetranq Live Database Initialization Tool")
    print("=" * 40)
    print("⚠️  WARNING: This will clear ALL existing data!")
    print("   Make sure you want to do this on your live site.")
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
        print("   Please check your internet connection and try again.")
        exit(1)
    except requests.exceptions.Timeout:
        print("❌ Site is not responding (timeout)")
        print("   Please try again later.")
        exit(1)
    
    # Ask for confirmation
    confirm = input("\nDo you want to proceed with database initialization? (yes/no): ")
    if confirm.lower() not in ['yes', 'y']:
        print("❌ Database initialization cancelled.")
        exit(0)
    
    # Initialize database
    if init_live_database():
        # Test endpoints
        test_live_endpoints()
        
        print("\n🎯 Ready to test!")
        print("   Open https://horsetranq.com in your browser")
        print("   Try logging in and playing a game to test the new system")
    else:
        print("\n❌ Database initialization failed!")
        exit(1)
