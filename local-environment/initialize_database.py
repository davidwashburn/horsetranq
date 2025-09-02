#!/usr/bin/env python3
"""
Database Initialization Script
This script will clear the existing database and set up the new structure
with sample data for testing.
"""

import sys
import os
import requests
import json

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

def initialize_database():
    """Initialize the database with the new structure."""
    
    # Base URL for your live beta site
    base_url = "https://horsetranq.com"
    
    print("🚀 Initializing Horsetranq Database...")
    print("=" * 50)
    
    try:
        # Step 1: Clear the database
        print("1. Clearing existing database...")
        response = requests.post(f"{base_url}/api/database/clear")
        if response.status_code == 200:
            print("   ✅ Database cleared successfully")
        else:
            print(f"   ❌ Failed to clear database: {response.text}")
            return False
        
        # Step 2: Initialize with basic structure
        print("2. Initializing database structure...")
        response = requests.post(f"{base_url}/api/database/initialize")
        if response.status_code == 200:
            print("   ✅ Database structure initialized")
        else:
            print(f"   ❌ Failed to initialize database: {response.text}")
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
        print("❌ Error: Could not connect to the server.")
        print("   Make sure your Flask app is running on http://localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_api_endpoints():
    """Test the API endpoints to make sure they're working."""
    
    base_url = "https://horsetranq.com"
    
    print("\n🧪 Testing API Endpoints...")
    print("=" * 30)
    
    # Test scoreboard endpoint
    try:
        response = requests.get(f"{base_url}/api/scoreboard/HP-S1")
        if response.status_code == 200:
            print("✅ Scoreboard endpoint working")
        else:
            print(f"❌ Scoreboard endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Scoreboard endpoint error: {e}")
    
    # Test stats endpoint (should work even without user)
    try:
        response = requests.get(f"{base_url}/api/stats/horsplay")
        if response.status_code == 401:  # Expected for unauthenticated user
            print("✅ Stats endpoint working (properly requires authentication)")
        else:
            print(f"⚠️  Stats endpoint returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Stats endpoint error: {e}")

if __name__ == "__main__":
    print("Horsetranq Database Initialization Tool")
    print("=" * 40)
    
    # Check if server is running
    try:
        response = requests.get("https://horsetranq.com/")
        if response.status_code == 200:
            print("✅ Live site is accessible")
        else:
            print(f"⚠️  Site responded with status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to live site!")
        print("   Please check your internet connection and try again.")
        sys.exit(1)
    
    # Initialize database
    if initialize_database():
        # Test endpoints
        test_api_endpoints()
        
        print("\n🎯 Ready to test!")
        print("   Open https://horsetranq.com in your browser")
        print("   Try logging in and playing a game to test the new system")
    else:
        print("\n❌ Database initialization failed!")
        sys.exit(1)
