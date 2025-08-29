from firebase_admin import db
from datetime import datetime

def get_primary_user_id(session_profile):
    """Get the primary user ID - using unique_user_id as primary key"""
    return session_profile.get('unique_user_id')

def get_user_database_path(user_id):
    """Get the database path for a user - using unique_user_id as key"""
    return f'users/{user_id}'

def encode_email_for_firebase(email):
    """Encode email to be Firebase-safe (no @ or . characters)"""
    return email.replace('@', '_AT_').replace('.', '_DOT_')

def encode_oauth_id_for_firebase(oauth_id):
    """Encode OAuth ID to be Firebase-safe (no | characters)"""
    return oauth_id.replace('|', '_PIPE_').replace('.', '_DOT_').replace('@', '_AT_')

def find_user_by_email(email):
    """Find existing user by email address for account merging"""
    try:
        normalized_email = email.lower().strip()
        encoded_email = encode_email_for_firebase(normalized_email)
        print(f"LOOKING FOR: {normalized_email} -> {encoded_email}")
        
        email_mapping_ref = db.reference('email_to_user_id')
        email_mappings = email_mapping_ref.get() or {}
        
        result = email_mappings.get(encoded_email)
        print(f"EMAIL MAPPINGS: {email_mappings}")
        return result
    except Exception as e:
        print(f"ERROR find_user_by_email: {e}")
        import traceback
        traceback.print_exc()
        return None

def link_auth_method_to_user(unique_user_id, auth_method, auth_id):
    """Link an authentication method to an existing user"""
    try:
        print(f"LINKING: {auth_method} to existing user {unique_user_id}")
        user_ref = db.reference(get_user_database_path(unique_user_id))
        user_data = user_ref.get() or {}
        
        if 'auth_methods' not in user_data:
            user_data['auth_methods'] = {}
        
        user_data['auth_methods'][auth_method] = auth_id
        user_data['last_login'] = datetime.now().isoformat()
        
        user_ref.update(user_data)
        
        # Also create OAuth mapping for future lookups
        encoded_auth_id = encode_oauth_id_for_firebase(auth_id)
        oauth_ref = db.reference(f'oauth_to_user_id/{encoded_auth_id}')
        oauth_ref.set(unique_user_id)
        print(f"OAUTH MAPPING: {auth_id} -> {encoded_auth_id} -> {unique_user_id}")
        
        return user_data
    except Exception as e:
        print(f"ERROR link_auth_method: {e}")
        import traceback
        traceback.print_exc()
        return None

def get_user_auth_methods(unique_user_id):
    """Get all authentication methods for a user"""
    try:
        user_ref = db.reference(get_user_database_path(unique_user_id))
        user_data = user_ref.get() or {}
        
        auth_methods = user_data.get('auth_methods', {})
        primary_method = user_data.get('primary_auth_method', 'unknown')
        
        return {
            'auth_methods': auth_methods,
            'primary_auth_method': primary_method,
            'total_methods': len(auth_methods)
        }
    except Exception as e:
        print(f"ERROR get_user_auth_methods: {e}")
        return None
