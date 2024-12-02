from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect  # Import redirect
from . import views

urlpatterns = [
    path("", lambda request: redirect("home")),  # Redirect empty path to 'home'
    path("home", views.home, name="home"),
    path("signup", views.signup, name="signup"),
    path("login", views.login, name="login"),
    path("aboutus", views.aboutus, name="aboutus"),
    path("contactus", views.contactus, name="contactus"),
    path("addfav", views.addfav, name="addfav"),
    path("logout/", views.logout_view, name="logout"),
    path("favourites/", views.favourites, name="favourites"),
]
