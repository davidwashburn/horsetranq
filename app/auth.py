from flask import Blueprint, session, redirect, g, request
from authlib.integrations.flask_client import OAuth
from urllib.parse import urlencode
from datetime import datetime
import random
import string
import uuid
import traceback
from firebase_admin import db, auth
from .utils import get_user_database_path, find_user_by_email, link_auth_method_to_user, encode_email_for_firebase, encode_oauth_id_for_firebase

bp = Blueprint("auth", __name__)

def init_oauth(app):
    """Initialize OAuth with the Flask app."""
    try:
        print(f"DEBUG init_oauth: Starting OAuth initialization")
        oauth = OAuth(app)
        print(f"DEBUG init_oauth: OAuth object created: {oauth}")
        
        auth0 = oauth.register(
            'auth0',
            client_id='E8Ow2g6bnBol0q9KQgVcJjbuDhiCaijA',
            client_secret='_-DVXkXDj8a9biZA7DGaphE2nvwAjNN_yyORjQhEC_XxYasJG_8XJjOvxaZPzRk4',
            api_base_url='https://dev-ew2d8mdn6f4hv716.us.auth0.com',
            access_token_url='https://dev-ew2d8mdn6f4hv716.us.auth0.com/oauth/token',
            authorize_url='https://dev-ew2d8mdn6f4hv716.us.auth0.com/authorize',
            client_kwargs={'scope': 'openid profile email'},
            server_metadata_url='https://dev-ew2d8mdn6f4hv716.us.auth0.com/.well-known/openid-configuration',
            jwks_uri='https://dev-ew2d8mdn6f4hv716.us.auth0.com/.well-known/jwks.json'
        )
        print(f"DEBUG init_oauth: Auth0 registered successfully: {auth0}")
        
        return auth0
    except Exception as e:
        print(f"ERROR init_oauth: Failed to initialize OAuth: {e}")
        import traceback
        traceback.print_exc()
        return None

def generate_unique_user_id():
    """Generate a unique user ID using UUID4."""
    while True:
        user_id = str(uuid.uuid4())
        ref = db.reference('user_ids')
        existing_ids = ref.get()
        
        if existing_ids is None or user_id not in existing_ids:
            ref.update({user_id: True})
            return user_id

def generate_unique_username():
    """Generate a unique username in the format 'Horsey-XXXXXX'."""
    while True:
        random_numbers = ''.join(random.choices(string.digits, k=6))
        username = f"Horsey-{random_numbers}"
        
        ref = db.reference('usernames')
        existing_usernames = ref.get()
        
        if existing_usernames is None or username not in existing_usernames:
            ref.update({username: True})
            return username

@bp.route('/callback')
def callback_handling():
    """Handle Auth0 callback and user creation/login."""
    try:
        # Get the OAuth instance from the app
        auth0 = g.get('auth0')
        if not auth0:
            return redirect('/')
            
        auth0.authorize_access_token()
        resp = auth0.get('userinfo')
        userinfo = resp.json()

        # Extract user info
        oauth_user_id = userinfo['sub']
        user_email = userinfo['email'].lower()  # Normalize email
        
        # Determine authentication method based on the user ID format
        if oauth_user_id.startswith('google-oauth2|'):
            auth_method = 'google'
        elif oauth_user_id.startswith('auth0|'):
            auth_method = 'email_password'
        elif oauth_user_id.startswith('facebook|'):
            auth_method = 'facebook'
        else:
            auth_method = 'unknown'
        
        print(f"=== CALLBACK: {user_email} via {auth_method.upper()} ===")
        
        # Check if a user with this email already exists (for account merging)
        existing_user_id = find_user_by_email(user_email)
        print(f"EMAIL LOOKUP: {existing_user_id or 'NOT FOUND'}")
        
        if existing_user_id:
            # User exists with this email - link this auth method to existing account
            print(f"Found existing user {existing_user_id} with email {user_email}")
            user_data = link_auth_method_to_user(existing_user_id, auth_method, oauth_user_id)
            unique_user_id = existing_user_id
        else:
            # Check if this specific OAuth ID already exists (shouldn't happen, but safety check)
            encoded_oauth_id = encode_oauth_id_for_firebase(oauth_user_id)
            oauth_ref = db.reference(f'oauth_to_user_id/{encoded_oauth_id}')
            existing_unique_id = oauth_ref.get()
            print(f"DEBUG callback: OAuth ID lookup result = {existing_unique_id}")
            
            if existing_unique_id:
                # This OAuth ID is already linked to a user
                user_data = db.reference(get_user_database_path(existing_unique_id)).get()
                unique_user_id = existing_unique_id
                print(f"DEBUG callback: OAuth ID {oauth_user_id} already linked to {unique_user_id}")
            else:
                # Completely new user - create new account
                print(f"DEBUG callback: Creating completely new user for {user_email}")
                unique_user_id = generate_unique_user_id()
                unique_username = generate_unique_username()
                user_data = {
                    'name': userinfo['name'],
                    'email': user_email,
                    'picture': userinfo['picture'],
                    'subscription_type': 'free',
                    'account_creation_date': datetime.now().isoformat(),
                    'last_login': datetime.now().isoformat(),
                    'username': unique_username,
                    'auth_methods': {
                        auth_method: oauth_user_id
                    },
                    'primary_auth_method': auth_method
                }
                
                # Save user data with unique_user_id as key
                print(f"DEBUG callback: Saving user data to {get_user_database_path(unique_user_id)}")
                user_ref = db.reference(get_user_database_path(unique_user_id))
                user_ref.set(user_data)
                
                # Create email mapping for account merging
                encoded_email = encode_email_for_firebase(user_email)
                print(f"DEBUG callback: Creating email mapping: {user_email} -> {encoded_email} -> {unique_user_id}")
                email_ref = db.reference(f'email_to_user_id/{encoded_email}')
                email_ref.set(unique_user_id)
                
                # Create OAuth mapping for quick lookups
                encoded_oauth_id = encode_oauth_id_for_firebase(oauth_user_id)
                print(f"DEBUG callback: Creating OAuth mapping: {oauth_user_id} -> {encoded_oauth_id} -> {unique_user_id}")
                oauth_ref = db.reference(f'oauth_to_user_id/{encoded_oauth_id}')
                oauth_ref.set(unique_user_id)
                
                print(f"DEBUG callback: Successfully created new user with unique ID: {unique_user_id} and username: {unique_username}")
        
        # Ensure user_data is properly structured
        if not user_data:
            print("ERROR: user_data is None after processing")
            return redirect('/')

        # Store userinfo in the session
        session['jwt_payload'] = userinfo
        session['profile'] = {
            'user_id': oauth_user_id,  # Keep OAuth ID for backwards compatibility
            'name': user_data.get('name', userinfo['name']),
            'picture': user_data.get('picture', userinfo['picture']),
            'email': user_data.get('email', userinfo['email']),
            'subscription_type': user_data.get('subscription_type', 'free'),
            'unique_user_id': unique_user_id,  # Primary ID for all database operations
            'username': user_data.get('username', 'Unknown')
        }

        # Create Firebase token using unique_user_id as the custom user ID
        firebase_token = auth.create_custom_token(unique_user_id)
        session['firebase_token'] = firebase_token

        return redirect('/')
        
    except Exception as e:
        print(f"Error in callback: {e}")
        traceback.print_exc()
        return redirect('/')

@bp.route('/logout', methods=['GET', 'POST'])
def logout():
    """Handle user logout."""
    # Clear the session
    session.clear()

    # Define the parameters for the logout URL
    params = {'returnTo': 'https://horsetranq.com', 'client_id': 'E8Ow2g6bnBol0q9KQgVcJjbuDhiCaijA'}
    
    # Redirect the user to the Auth0 logout URL
    auth0 = g.get('auth0')
    if auth0:
        return redirect(auth0.api_base_url + '/v2/logout?' + urlencode(params))
    return redirect('/')

@bp.route('/login-test')
def login_test():
    """Test route to verify blueprint is working"""
    return "AUTH BLUEPRINT IS WORKING! This means /login should work too."

@bp.route('/login')
def login():
    """Initiate Auth0 login."""
    print(f"=== LOGIN ROUTE HIT ===")
    auth0 = g.get('auth0')
    print(f"AUTH0 OBJECT: {auth0}")
    
    if auth0:
        print(f"REDIRECTING TO AUTH0...")
        try:
            return auth0.authorize_redirect(redirect_uri='https://horsetranq.com/callback')
        except Exception as e:
            print(f"ERROR IN AUTH0 REDIRECT: {e}")
            import traceback
            traceback.print_exc()
            return f"Auth0 redirect failed: {e}"
    else:
        print(f"NO AUTH0 OBJECT FOUND")
        return "No Auth0 object found. Check OAuth initialization."

# Future: Email/Password Authentication
@bp.route('/register', methods=['POST'])
def register():
    """Register new user with email/password (placeholder for future implementation)"""
    # This would handle email/password registration with the same account merging logic
    # For now, redirect to OAuth login
    return redirect('/login')

@bp.route('/login-email', methods=['POST'])
def login_email():
    """Login with email/password (placeholder for future implementation)"""
    # This would handle email/password login with the same account merging logic
    # For now, redirect to OAuth login
    return redirect('/login')
