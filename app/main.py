from flask import Blueprint, render_template

bp = Blueprint("main", __name__)

@bp.get("/")
def home():
    return render_template("index.html")

@bp.get("/store")
def store():
    return render_template("store.html")

@bp.get("/scores")
def scores():
    return render_template("scores.html")

@bp.get("/horsplay")
def horsplay():
    return render_template("horsplay.html")

@bp.get("/lemondrop")
def lemondrop():
    return render_template("lemondrop.html")

@bp.get("/about")
def about():
    return render_template("about.html")

@bp.get("/profile")
def profile():
    return render_template("profile.html")
