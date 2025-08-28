from flask import Blueprint, session, redirect, g
from authlib.integrations.flask_client import OAuth
from urllib.parse import urlencode
from datetime import datetime
import random
import string
import uuid
import traceback
from firebase_admin import db, auth

bp = Blueprint("auth", __name__)

def init_oauth(app):
    """Initialize OAuth with the Flask app."""
    oauth = OAuth(app)
    
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
    
    return auth0

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

        # Get a reference to the user in the database
        ref = db.reference('users/{}'.format(userinfo['sub']))
        user_data = ref.get()

        # If user is not in the database, create a new user
        if user_data is None:
            unique_user_id = generate_unique_user_id()
            unique_username = generate_unique_username()
            user_data = {
                'name': userinfo['name'],
                'email': userinfo['email'],
                'picture': userinfo['picture'],
                'subscription_type': 'free',
                'account_creation_date': datetime.now().isoformat(),
                'last_login': datetime.now().isoformat(),
                'unique_user_id': unique_user_id,
                'username': unique_username
            }
            ref.set(user_data)
            print(f"Created new user with unique ID: {unique_user_id} and username: {unique_username}")
        else:
            # Update the last login timestamp of existing user
            user_data['last_login'] = datetime.now().isoformat()
            
            # Generate unique_user_id and username if they don't exist (for legacy users)
            if 'unique_user_id' not in user_data:
                user_data['unique_user_id'] = generate_unique_user_id()
                print(f"Generated unique ID for existing user: {user_data['unique_user_id']}")
            
            if 'username' not in user_data:
                user_data['username'] = generate_unique_username()
                print(f"Generated username for existing user: {user_data['username']}")
            
            ref.update(user_data)

        # Store userinfo in the session
        session['jwt_payload'] = userinfo
        session['profile'] = {
            'user_id': userinfo['sub'],
            'name': userinfo['name'],
            'picture': userinfo['picture'],
            'email': userinfo['email'],
            'subscription_type': user_data['subscription_type'],
            'unique_user_id': user_data['unique_user_id'],
            'username': user_data['username']
        }

        # Create Firebase token
        firebase_token = auth.create_custom_token(session['profile']['user_id'])
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

@bp.route('/login')
def login():
    """Initiate Auth0 login."""
    auth0 = g.get('auth0')
    if auth0:
        return auth0.authorize_redirect(redirect_uri='https://horsetranq.com/callback')
    return redirect('/')
