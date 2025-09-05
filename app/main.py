from flask import Blueprint, render_template, session, g
from .database_service import DatabaseService
from .news_data import get_latest_features, get_latest_fixes, get_latest_deprecated, NEWS_DATA

bp = Blueprint("main", __name__)

@bp.get("/")
def home():
    latest_features = get_latest_features(3)
    latest_fixes = get_latest_fixes(3)
    latest_deprecated = get_latest_deprecated(3)
    return render_template("index.html", current_page='STABLE', latest_features=latest_features, latest_fixes=latest_fixes, latest_deprecated=latest_deprecated)

@bp.get("/store")
def store():
    return render_template("store.html", current_page='STOR')

@bp.get("/scores")
@bp.get("/scoreboard") 
def scores():
    print("DEBUG: Scores route called - NEW VERSION WITH REPORT STATS")
    db_service = DatabaseService()
    
    # Get real data from database
    weekly_leaders = db_service.get_weekly_leaders('horsplay')
    aggregated_stats = db_service.get_aggregated_stats('horsplay')
    scoreboard = db_service.get_scoreboard_with_details('HP-S1', 10)
    
    # Get report stats with error handling
    try:
        report_stats = db_service.get_report_stats()
    except Exception as e:
        print(f"Error getting report stats: {e}")
        # Provide fallback data
        report_stats = {
            'total_reports': 0,
            'most_reported_player': None,
            'cheat_reports': 0,
            'turd_reports': 0
        }
    
    return render_template("scores.html",
                         logged_in=g.user is not None,
                         session=session,
                         email=session.get('profile', {}).get('email'),
                         username=g.user.get('username') if g.user else None,
                         name=session.get('profile', {}).get('name'),
                         subscription_type=g.user.get('subscription_type', 'free') if g.user else 'free',
                         current_page='SCORES',
                         weekly_leaders=weekly_leaders,
                         aggregated_stats=aggregated_stats,
                         scoreboard=scoreboard,
                         report_stats=report_stats)

@bp.get("/horsplay")
def horsplay():
    return render_template("horsplay.html",
                         logged_in=g.user is not None,
                         session=session,
                         email=session.get('profile', {}).get('email'),
                         username=g.user.get('username') if g.user else None,
                         name=session.get('profile', {}).get('name'),
                         subscription_type=g.user.get('subscription_type', 'free') if g.user else 'free',
                         current_page='HORSPLAY')

@bp.get("/lemondrop")
def lemondrop():
    return render_template("lemondrop.html", current_page='LEMON DROP')

@bp.get("/about")
def about():
    return render_template("about.html", current_page='ABOUT')

@bp.get("/news")
def news():
    return render_template("news.html", current_page='NEWS', news_data=NEWS_DATA)

@bp.get("/profile") 
def profile():
    db_service = DatabaseService()
    user_stats = {}
    
    if g.user:
        # Get user stats from the new database structure
        user_id = g.user.get('unique_user_id')
        if user_id:
            stats = db_service.get_user_stats(user_id, 'horsplay')
            # Transform stats to match the expected format in the template
            user_stats = {
                'ranked': stats.get('mode_stats', {}).get('ranked', {}),
                'freeplay': stats.get('mode_stats', {}).get('freeplay', {})
            }
    
    return render_template("profile.html",
                         logged_in=g.user is not None,
                         session=session,
                         email=session.get('profile', {}).get('email'),
                         username=g.user.get('username') if g.user else None,
                         name=session.get('profile', {}).get('name'),
                         user_id=g.user.get('unique_user_id') if g.user else None,
                         account_creation_date=session.get('profile', {}).get('created_at'),
                         user_stats=user_stats,
                         subscription_type=g.user.get('subscription_type', 'free') if g.user else 'free',
                         current_page='PROFILE')
