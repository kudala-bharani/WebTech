from urllib import request
from django.http import HttpResponse
from django.shortcuts import redirect, render
from .models import User
import requests
from django.contrib.auth import logout
from django.shortcuts import redirect   

API_KEY = "a5ad93f8453458c3bbdca94da885b0ab"
cities = []
# Create your views here.
def home(request):
    # Get the logged-in user's data from the session
    user_id = request.session.get('user_id')  # Get user_id from session
    user = User.objects.get(id=user_id) if user_id else None

    # Fetch weather details for each favorite city
    cities = []
    if user:
        for city_name in [user.city1, user.city2, user.city3, user.city4, user.city5]:
            if city_name:
                city_weather = fetch_weather_for_city(city_name)
           #     print(city_weather)
                if city_weather:
                    cities.append({'city': city_name, 'weather': city_weather})
    return render(request, 'weather/index.html', {'user': user , 'favorites': cities})


def fetch_weather_for_city(city_name):
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city_name}&appid={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data['list'][0]  # Get first forecast item (can adjust as needed)
    return None

def aboutus(request):
    user_id = request.session.get('user_id')
    user = User.objects.get(id=user_id) if user_id else None
    return render(request, 'weather/about.html', {'user': user})

def contactus(request): 
    user_id = request.session.get('user_id')
    user = User.objects.get(id=user_id) if user_id else None
    return render(request, 'weather/contact.html', {'user': user})

def addfav(request):
    if request.method == 'POST':
        city1 = request.POST['city1']
        city2 = request.POST['city2']
        city3 = request.POST['city3']
        city4 = request.POST['city4']
        city5 = request.POST['city5']

        user_id = request.session.get('user_id')
        user = User.objects.get(id=user_id)
        if city1:
            user.city1 = city1
        if city2:
            user.city2 = city2
        if city3:
            user.city3 = city3
        if city4:
            user.city4 = city4
        if city5:
            user.city5 = city5
        user.save()
        return redirect('/home', {'user': user, 'favorites': cities})
        # return redirect(request, '/home', {'user': user, 'favorites': cities})

    else:
        return HttpResponse("Invalid request")

def login(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        try:
            user = User.objects.get(email=email)
            if password == user.password:
                # Save the user's ID in the session
                request.session['user_id'] = user.id
                return redirect('/home')  # Redirect to home
            else:
                return HttpResponse("Invalid password!")
        except User.DoesNotExist:
            return HttpResponse("User does not exist!")
        
    return render(request, 'weather/login.html')

def signup(request):
    if request.method == "POST":
        # Extract form data from the POST request
        name = request.POST.get("name")
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")

        if password != confirm_password:
            return HttpResponse("Passwords do not match!")

        # Add logic for user creation
        user = User.objects.create(name=name, email=email, password=password)
        user.save()
        return redirect('/login')  # Redirect to login page after signup
    else:  
        return render(request, 'weather/signup.html')


def logout_view(request):
    logout(request)
    return redirect("home")


def favourites(request):
    return render(request, 'weather/favourites.html')