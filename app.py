from flask import Flask, render_template, redirect, url_for, request, jsonify
import uuid
import random
import string

app = Flask(__name__)

def generate_mock_unique_user_id():
    """Generate a mock UUID for testing"""
    return str(uuid.uuid4())

def generate_mock_username():
    """Generate a mock username for testing"""
    random_numbers = ''.join(random.choices(string.digits, k=6))
    return f"Horsey-{random_numbers}"

# Mock data for development - this would typically come from a database
mock_user_data = {
    'logged_in': True,  # Change to True to test logged-in state
    'user_id': 'test_user_123',
    'name': 'Test User',
    'email': 'test@example.com',
    'picture': 'https://via.placeholder.com/100',
    'subscription_type': 'free',
    'firebase_token': 'mock_token',
    'unique_user_id': generate_mock_unique_user_id(),
    'username': generate_mock_username(),
    'hide_avatar': 'No',
    'avatar_type': 'google-profile',
    'account_creation_date': '2024-02-24T11:08:55.902491'
}

def get_account_context():
    """Get the context data needed for account-related templates"""
    context = mock_user_data.copy()
    
    # Add mock session structure for compatibility with templates
    if context.get('logged_in'):
        context['session'] = {
            'profile': {
                'user_id': context.get('user_id'),
                'name': context.get('name'),
                'email': context.get('email')
            }
        }
    else:
        context['session'] = {}
    
    return context

@app.route('/')
def index():
    context = get_account_context()
    context['current_page'] = 'STABLE'
    return render_template('index.html', **context)

@app.route('/store')
def store():
    context = get_account_context()
    context['current_page'] = 'STOR'
    return render_template('store.html', **context)

@app.route('/horsplay')
def horsplay():
    context = get_account_context()
    context['current_page'] = 'HORSPLAY'
    return render_template('horsplay.html', **context)

@app.route('/lemondrop')
def lemondrop():
    context = get_account_context()
    context['current_page'] = 'LEMON DROP'
    return render_template('lemondrop.html', **context)

@app.route('/about')
def about():
    context = get_account_context()
    context['current_page'] = 'ABOUT'
    return render_template('about.html', **context)

@app.route('/scores')
def scores():
    context = get_account_context()
    context['current_page'] = 'STATS'
    return render_template('in-progres/scores.html', **context)

@app.route('/login')
def login():
    # Mock login - just redirect back to home
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    # Mock logout - just redirect back to home
    return redirect(url_for('index'))

# API endpoints for local testing
@app.route('/api/refresh-session', methods=['POST'])
def refresh_session():
    """Mock refresh session endpoint for local testing"""
    user_data = get_account_context()
    return jsonify({
        'success': True,
        'message': 'Session refreshed successfully (mock)',
        'data': user_data
    })

@app.route('/api/update-hide-avatar', methods=['POST'])
def update_hide_avatar():
    """Mock update hide avatar endpoint for local testing"""
    data = request.get_json()
    hide_avatar = data.get('hide_avatar', False)
    
    # Update user data
    mock_user_data['hide_avatar'] = 'Yes' if hide_avatar else 'No'
    
    return jsonify({
        'success': True,
        'hide_avatar': mock_user_data['hide_avatar'],
        'message': 'Avatar visibility updated successfully (mock)'
    })

@app.route('/api/update-avatar-selection', methods=['POST'])
def update_avatar_selection():
    """Mock update avatar selection endpoint for local testing"""
    data = request.get_json()
    avatar_type = data.get('avatar_type', 'google-profile')
    
    # Update user data
    mock_user_data['avatar_type'] = avatar_type
    
    return jsonify({
        'success': True,
        'avatar_type': avatar_type,
        'message': 'Avatar selection updated successfully (mock)'
    })

@app.route('/api/update-username', methods=['POST'])
def update_username():
    """Mock update username endpoint for local testing"""
    data = request.get_json()
    username = data.get('username', '')
    
    if username and len(username) <= 20:
        # Update user data
        mock_user_data['username'] = username
        
        return jsonify({
            'success': True,
            'username': username,
            'message': 'Username updated successfully (mock)'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid username (mock)'
        }), 400

if __name__ == '__main__':
    app.run(debug=True, port=8000)
