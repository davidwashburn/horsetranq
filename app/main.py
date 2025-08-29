from flask import Blueprint, render_template, session, g

bp = Blueprint("main", __name__)

@bp.get("/")
def home():
    return render_template("index.html")

@bp.get("/store")
def store():
    return render_template("store.html")

@bp.get("/scores")
@bp.get("/leaderboard") 
def scores():
    return render_template("scores.html",
                         logged_in=g.user is not None,
                         session=session,
                         email=session.get('profile', {}).get('email'),
                         username=g.user.get('username') if g.user else None,
                         name=session.get('profile', {}).get('name'),
                         subscription_type=g.user.get('subscription_type', 'free') if g.user else 'free',
                         current_page='SCORES')

@bp.get("/horsplay")
def horsplay():
    return render_template("horsplay.html",
                         logged_in=g.user is not None,
                         session=session,
                         email=session.get('profile', {}).get('email'),
                         username=g.user.get('username') if g.user else None,
                         name=session.get('profile', {}).get('name'),
                         subscription_type=g.user.get('subscription_type', 'free') if g.user else 'free')

@bp.get("/lemondrop")
def lemondrop():
    return render_template("lemondrop.html")

@bp.get("/about")
def about():
    return render_template("about.html")

@bp.get("/profile")
def profile():
    return render_template("profile.html",
                         logged_in=g.user is not None,
                         session=session,
                         email=session.get('profile', {}).get('email'),
                         username=g.user.get('username') if g.user else None,
                         name=session.get('profile', {}).get('name'),
                         user_stats=g.user.get('stats', {}) if g.user else {},
                         subscription_type=g.user.get('subscription_type', 'free') if g.user else 'free')
