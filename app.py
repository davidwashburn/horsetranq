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

# Mock data for development
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
    'avatar_type': 'google-profile'
}

@app.route('/')
def index():
    return render_template('index.html', **mock_user_data)

@app.route('/store')
def store():
    return render_template('store.html', **mock_user_data)

@app.route('/horsplay')
def horsplay():
    return render_template('horsplay.html', **mock_user_data)

@app.route('/lemondrop')
def lemondrop():
    return render_template('lemondrop.html', **mock_user_data)

@app.route('/about')
def about():
    return render_template('about.html', **mock_user_data)

@app.route('/scores')
def scores():
    return render_template('scores.html', **mock_user_data)

@app.route('/login')
def login():
    # Mock login - just redirect back to home
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    # Mock logout - just redirect back to home
    return redirect(url_for('index'))

@app.route('/api/refresh-session', methods=['POST'])
def refresh_session():
    """Mock refresh session endpoint for local testing"""
    return jsonify({
        'success': True,
        'message': 'Session refreshed successfully (mock)',
        'data': mock_user_data
    })

@app.route('/api/update-hide-avatar', methods=['POST'])
def update_hide_avatar():
    """Mock update hide avatar endpoint for local testing"""
    data = request.get_json()
    hide_avatar = data.get('hide_avatar', False)
    
    # Update mock data
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
    
    # Update mock data
    mock_user_data['avatar_type'] = avatar_type
    
    return jsonify({
        'success': True,
        'avatar_type': avatar_type,
        'message': 'Avatar selection updated successfully (mock)'
    })

if __name__ == '__main__':
    app.run(debug=True, port=8000)
