from flask import Flask, session, g
from firebase_admin import db, initialize_app, credentials
import os

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
    
    # Firebase configuration
    firebase_key_path = os.environ.get("FIREBASE_ADMIN_KEY_PATH", "/var/www/database/keys/horsetranq-firebase-admin-key.json")
    firebase_db_url = os.environ.get("FIREBASE_DB_URL", "https://horsetranq-default-rtdb.firebaseio.com/")
    
    cred = credentials.Certificate(firebase_key_path)
    initialize_app(cred, {'databaseURL': firebase_db_url})

    # Initialize OAuth
    from .auth import init_oauth
    auth0 = init_oauth(app)
    
    # Store auth0 in app context for use in routes
    app.auth0 = auth0

    @app.before_request
    def load_user():
        """Populate g.user and g.firebase_token once per request."""
        g.user = None
        g.firebase_token = session.get("firebase_token")
        g.auth0 = app.auth0  # Make auth0 available in g
        
        if 'profile' in session:
            # Pull firebase user to refresh subscription/account_creation
            user_id = session['profile']['user_id']
            ref = db.reference(f'users/{user_id}')
            user_data = ref.get() or {}
            
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

    return app
