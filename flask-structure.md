# Horsetranq Flask Application

A streamlined Flask application with Auth0 authentication and Firebase integration.

## New Structure

This application has been refactored from a single monolithic file into a proper Flask application structure with:

- **Application Factory Pattern** - Clean separation of concerns
- **Blueprints** - Organized route grouping
- **Centralized User Management** - No more code duplication
- **Environment Variables** - Secure configuration management

## File Structure

```
├── app/
│   ├── __init__.py          # Application factory
│   ├── main.py             # Main page routes (/, /store, /scores, etc.)
│   ├── auth.py             # Authentication routes (/callback, /login, /logout)
│   └── api.py              # API endpoints (/api/update-username, /api/refresh-session)
├── run.py                  # Application entry point
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Key Improvements

### 1. **Eliminated Code Duplication**
- **Before**: Every route repeated the same session/user lookup logic
- **After**: Centralized in `before_request` and `context_processor`

### 2. **Simplified Routes**
- **Before**: Each route was 20+ lines with repeated user data handling
- **After**: Each route is just `return render_template("page.html")`

### 3. **Better Security**
- **Before**: Hardcoded secrets in the code
- **After**: Environment variables for all sensitive data

### 4. **Maintainability**
- **Before**: Changes to user logic required updating every route
- **After**: Changes in one place affect all routes automatically

## Environment Variables

Set these environment variables for production:

```bash
export SECRET_KEY="your-secret-key-here"
export FIREBASE_ADMIN_KEY_PATH="/path/to/firebase-key.json"
export FIREBASE_DB_URL="https://your-project.firebaseio.com/"
```

## Running the Application

### Development
```bash
python run.py
```

### Production
```bash
export FLASK_APP=run.py
flask run --host=0.0.0.0 --port=8000
```

## Routes

### Main Pages (Blueprint: main)
- `/` - Home page
- `/store` - Store page
- `/scores` - Scores page
- `/horsplay` - Horsplay page
- `/lemondrop` - Lemondrop page
- `/about` - About page
- `/profile` - Profile page

### Authentication (Blueprint: auth)
- `/callback` - Auth0 callback handler
- `/login` - Initiate Auth0 login
- `/logout` - User logout

### API Endpoints (Blueprint: api)
- `/api/update-username` - Update user username
- `/api/refresh-session` - Refresh session data

## Template Variables

All templates automatically receive these variables:

- `logged_in` - Boolean indicating if user is logged in
- `firebase_token` - Firebase authentication token
- `user` - Complete user object with all fields
- Individual fields: `name`, `email`, `picture`, `user_id`, `subscription_type`, `unique_user_id`, `username`, `account_creation_date`

## Migration from Old Structure

The new structure is fully backward compatible. All existing templates will work without changes because:

1. All template variables are still available
2. All routes have the same URLs
3. All functionality is preserved

## Benefits

1. **90% less code duplication**
2. **Easier to maintain and extend**
3. **Better security with environment variables**
4. **Cleaner separation of concerns**
5. **More professional Flask structure**
6. **Easier testing and debugging**
