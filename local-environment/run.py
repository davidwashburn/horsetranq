import sys
import os

# Add the parent directory to Python path so we can import the app module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.main import bp as main_bp
from app.auth import bp as auth_bp
from app.api import bp as api_bp

app = create_app()

# Register blueprints
app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)  # No prefix for auth routes (callback, login, logout)
app.register_blueprint(api_bp, url_prefix="/api")

# Debug: Print all registered routes
print("=== REGISTERED ROUTES ===")
for rule in app.url_map.iter_rules():
    print(f"{rule.endpoint}: {rule.rule}")

# Add error handler
@app.errorhandler(500)
def handle_500_error(error):
    return {'error': 'An unexpected error has occurred.'}, 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)