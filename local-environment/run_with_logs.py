#!/usr/bin/env python3
"""
Run the Flask app with logs captured to a file for easier debugging
"""
import sys
import os
from datetime import datetime

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.main import bp as main_bp
from app.auth import bp as auth_bp
from app.api import bp as api_bp

print("=== STARTING HORSETRANQ V3 APP ===")
print(f"Timestamp: {datetime.now()}")
print(f"Python path: {sys.path[0]}")

app = create_app()

print("=== REGISTERING BLUEPRINTS ===")
# Register blueprints
app.register_blueprint(main_bp)
print("Registered main_bp")
app.register_blueprint(auth_bp)  # No prefix for auth routes (callback, login, logout)
print("Registered auth_bp (includes /login route)")
app.register_blueprint(api_bp, url_prefix="/api")
print("Registered api_bp with /api prefix")

# Add error handler
@app.errorhandler(500)
def handle_500_error(error):
    print(f"500 ERROR: {error}")
    return {'error': 'An unexpected error has occurred.'}, 500

# List all routes for debugging
print("\n=== ALL REGISTERED ROUTES ===")
for rule in app.url_map.iter_rules():
    print(f"  {rule.methods} {rule.rule} -> {rule.endpoint}")

print("\n=== STARTING SERVER ===")
print("App will be available at: http://localhost:8000")
print("Logs will appear below...")
print("=" * 50)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
