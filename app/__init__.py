from flask import Flask, session, g, request
from firebase_admin import db, initialize_app, credentials
from datetime import datetime
import os
from .utils import get_primary_user_id, get_user_database_path

def create_app():
    # Get the absolute path to the templates and static folders
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)  # Go up from app/ to database/
    templates_dir = os.path.join(project_root, '..', 'html', 'templates')
    static_dir = os.path.join(project_root, '..', 'html', 'static')
    
    # Debug: Print the paths to verify they're correct
    print(f"Current directory: {current_dir}")
    print(f"Project root: {project_root}")
    print(f"Templates directory: {templates_dir}")
    print(f"Static directory: {static_dir}")
    print(f"Templates directory exists: {os.path.exists(templates_dir)}")
    print(f"Static directory exists: {os.path.exists(static_dir)}")
    
    app = Flask(__name__, template_folder=templates_dir, static_folder=static_dir)
    
    # Use environment variables for secrets (much safer)
    app.secret_key = os.environ.get("SECRET_KEY", "TwiceAHorseAlwaysAHors1!")
    
    # Firebase configuration - use environment variables or fallback to production paths
    firebase_key_path = os.environ.get("FIREBASE_ADMIN_KEY_PATH", "/var/www/database/keys/horsetranq-firebase-admin-key.json")
    firebase_db_url = os.environ.get("FIREBASE_DB_URL", "https://horsetranq-default-rtdb.firebaseio.com/")
    
    # Only initialize Firebase if the key file exists
    print(f"DEBUG: Checking Firebase key at: {firebase_key_path}")
    print(f"DEBUG: Firebase key exists: {os.path.exists(firebase_key_path)}")
    
    if os.path.exists(firebase_key_path):
        try:
            cred = credentials.Certificate(firebase_key_path)
            initialize_app(cred, {'databaseURL': firebase_db_url})
            print(f"SUCCESS: Firebase initialized with key: {firebase_key_path}")
        except Exception as e:
            print(f"ERROR: Failed to initialize Firebase: {e}")
            import traceback
            traceback.print_exc()
    else:
        print(f"WARNING: Firebase key not found at {firebase_key_path}")
        print("Firebase features will not work. Set FIREBASE_ADMIN_KEY_PATH environment variable if needed.")

    # Initialize OAuth
    from .auth import init_oauth
    auth0 = init_oauth(app)
    
    # Store auth0 in app context for use in routes
    app.auth0 = auth0
    print(f"DEBUG: OAuth initialized successfully: {auth0}")

    @app.before_request
    def load_user():
        """Populate g.user and g.firebase_token once per request."""
        g.user = None
        g.firebase_token = session.get("firebase_token")
        g.auth0 = app.auth0  # Make auth0 available in g
        # Reduce debug spam - only show auth0 status on login routes
        if request.endpoint and 'login' in request.endpoint:
            print(f"AUTH0 STATUS: app.auth0={app.auth0 is not None}, g.auth0={g.auth0 is not None}")
        
        # Only show session debug for auth routes
        if request.endpoint and request.endpoint.startswith('auth'):
            print(f"DEBUG: profile in session = {'profile' in session}")
        if 'profile' in session:
            # Pull firebase user to refresh subscription/account_creation
            user_id = get_primary_user_id(session['profile'])
            print(f"DEBUG load_user: user_id = {user_id}")
            try:
                ref = db.reference(get_user_database_path(user_id))
                user_data = ref.get() or {}
                print(f"DEBUG load_user: Successfully got user_data from Firebase")
            except Exception as e:
                print(f"DEBUG load_user: Error getting user_data from Firebase: {e}")
                user_data = {}
            
            # Keep session light; expose merged view via g.user
            session['profile'].update({
                'subscription_type': user_data.get('subscription_type', session['profile'].get('subscription_type')),
                'unique_user_id': user_data.get('unique_user_id', session['profile'].get('unique_user_id')),
                'username': user_data.get('username', session['profile'].get('username')),
            })
            
            g.user = {
                **session['profile'],
                'account_creation_date': user_data.get('account_creation_date'),
            }
            print(f"DEBUG load_user: g.user set successfully for {user_id}")

    @app.context_processor
    def inject_common():
        """Inject common variables into all templates."""
        user_stats = {}
        if g.user:
            # Get user stats from Firebase
            stats_ref = db.reference(f'users/{g.user["user_id"]}/stats')
            user_stats = stats_ref.get() or {}
        
        return dict(
            logged_in=(g.user is not None),
            firebase_token=g.firebase_token,
            user=g.user,
            user_stats=user_stats,
            # For backward compatibility, also expose individual fields
            name=g.user.get('name') if g.user else None,
            email=g.user.get('email') if g.user else None,
            picture=g.user.get('picture') if g.user else None,
            user_id=g.user.get('user_id') if g.user else None,
            subscription_type=g.user.get('subscription_type') if g.user else None,
            unique_user_id=g.user.get('unique_user_id') if g.user else None,
            username=g.user.get('username') if g.user else None,
            account_creation_date=g.user.get('account_creation_date') if g.user else None,
        )

    # Register blueprints
    from . import main, auth, api
    app.register_blueprint(main.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(api.bp)

    return app
