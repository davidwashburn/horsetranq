from flask import Flask, render_template, redirect, url_for

app = Flask(__name__)

# Mock data for development
mock_user_data = {
    'logged_in': False,  # Change to True to test logged-in state
    'user_id': 'test_user_123',
    'name': 'Test User',
    'email': 'test@example.com',
    'picture': 'https://via.placeholder.com/100',
    'subscription_type': 'free',
    'firebase_token': 'mock_token'
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

@app.route('/login')
def login():
    # Mock login - just redirect back to home
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    # Mock logout - just redirect back to home
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=8000)
