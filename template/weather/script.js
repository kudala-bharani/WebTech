// Improved script.js
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const loadingIndicator = document.createElement('div');

const API_KEY = "a5ad93f8453458c3bbdca94da885b0ab";

// Create loading indicator
loadingIndicator.classList.add('loading-indicator');
loadingIndicator.innerHTML = `
    <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
    </div>
`;

// Utility functions
const showLoading = (container) => {
    container.innerHTML = '';
    container.appendChild(loadingIndicator);
};

const hideLoading = () => {
    if (loadingIndicator.parentElement) {
        loadingIndicator.parentElement.removeChild(loadingIndicator);
    }
};

const displayErrorMessage = (message, container) => {
    container.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
};

// Input validation
const validateCityInput = (cityName) => {
    if (!cityName) return false;
    // Remove any non-alphabetic characters and check length
    const sanitizedName = cityName.replace(/[^a-zA-Z\s]/g, '').trim();
    return sanitizedName.length >= 2 && sanitizedName.length <= 50;
};

const createWeatherCard = (cityName, weatherItem, index) => {
    // Format date to be more readable
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Helper function to convert pressure from hPa to mmHg
    const convertPressure = (pressureHpa) => {
        return (pressureHpa * 0.750062).toFixed(1);
    };

    // Helper function to format time
    const formatTime = (timestamp, timezone) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if(index === 0) { // Main weather card
        return `<div class="details">
                    <h2>${cityName} (${formatDate(weatherItem.dt_txt)})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(1)}°C</h6>
                    <h6>Feels Like: ${(weatherItem.main.feels_like - 273.15).toFixed(1)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed.toFixed(1)} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                    <h6>Pressure: ${convertPressure(weatherItem.main.pressure)} mmHg</h6>
                    <h6>Wind Direction: ${getWindDirection(weatherItem.wind.deg)}</h6>
                    ${weatherItem.rain ? `<h6>Precipitation: ${(weatherItem.rain['1h'] || weatherItem.rain['3h'] || 0).toFixed(1)} mm</h6>` : ''}
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                    <h6>Detailed: ${getDetailedWeatherDescription(weatherItem.weather[0].description)}</h6>
                </div>`;
    } else { // Forecast cards
        return `<li class="card">
                    <h3>${formatDate(weatherItem.dt_txt)}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(1)}°C</h6>
                    <h6>Feels Like: ${(weatherItem.main.feels_like - 273.15).toFixed(1)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed.toFixed(1)} M/S</h6>
                    <h6>Wind Direction: ${getWindDirection(weatherItem.wind.deg)}</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                    ${weatherItem.rain ? `<h6>Precipitation: ${(weatherItem.rain['1h'] || weatherItem.rain['3h'] || 0).toFixed(1)} mm</h6>` : ''}
                </li>`;
    }
};

// New helper functions
function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function getDetailedWeatherDescription(description) {
    const descriptions = {
        'clear sky': 'Perfect clear conditions, great for outdoor activities',
        'few clouds': 'Mostly sunny with minimal cloud cover',
        'scattered clouds': 'Partially cloudy with some sun',
        'broken clouds': 'Significant cloud coverage',
        'overcast clouds': 'Completely cloudy',
        'light rain': 'Light precipitation, carry an umbrella',
        'moderate rain': 'Steady rainfall expected',
        'heavy rain': 'Heavy rainfall, potential for disruptions',
        'thunderstorm': 'Electrical storm with potential heavy rain',
        'snow': 'Snowy conditions, dress warmly',
        'mist': 'Reduced visibility due to moisture',
        'fog': 'Dense atmospheric moisture limiting visibility'
    };

    return descriptions[description.toLowerCase()] || 'Variable weather conditions';
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    // Show loading indicator
    showLoading(currentWeatherDiv);
    showLoading(weatherCardsDiv);

    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    // Implement caching mechanism
    const cacheKey = `weather_${latitude}_${longitude}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(`${cacheKey}_timestamp`);

    // Check if cached data exists and is less than 30 minutes old
    if (cachedData && cacheTime && 
        (Date.now() - parseInt(cacheTime) < 30 * 60 * 1000)) {
        processWeatherData(JSON.parse(cachedData), cityName);
        return;
    }

    fetch(WEATHER_API_URL)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Cache the data
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

        processWeatherData(data, cityName);
    })
    .catch(error => {
        console.error('Error:', error);
        displayErrorMessage('Failed to fetch weather data. Please try again.', currentWeatherDiv);
    });
};

const processWeatherData = (data, cityName) => {
    // Filter the forecasts to get only one forecast per day
    const uniqueForecastDays = [];
    const fiveDaysForecast = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
            return uniqueForecastDays.push(forecastDate);
        }
    });

    // Clearing previous weather data
    cityInput.value = "";
    currentWeatherDiv.innerHTML = "";
    weatherCardsDiv.innerHTML = "";

    // Creating weather cards and adding them to the DOM
    fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
            currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
            weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
    });

    // Hide loading indicator
    hideLoading();
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    
    // Validate input
    if (!validateCityInput(cityName)) {
        displayErrorMessage('Please enter a valid city name (2-50 alphabetic characters).', currentWeatherDiv);
        return;
    }

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Show loading
    showLoading(currentWeatherDiv);

    // Get entered city coordinates
    fetch(API_URL)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (!data.length) {
            displayErrorMessage(`No coordinates found for ${cityName}`, currentWeatherDiv);
            return;
        }
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    })
    .catch(error => {
        console.error('Error:', error);
        displayErrorMessage('Failed to fetch city coordinates. Please try again.', currentWeatherDiv);
    });
};

const getUserCoordinates = () => {
    // Show loading
    showLoading(currentWeatherDiv);

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            })
            .catch(error => {
                console.error('Error:', error);
                displayErrorMessage('Failed to fetch city name. Please try again.', currentWeatherDiv);
            });
        },
        error => {
            let errorMessage = 'Unknown geolocation error.';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Location access denied. Please enable location permissions.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Location information is unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Location request timed out.";
                    break;
            }
            displayErrorMessage(errorMessage, currentWeatherDiv);
        }
    );
};

// Event Listeners
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => {
    if (e.key === "Enter") {
        e.preventDefault(); // Prevent form submission
        getCityCoordinates();
    }
});

// Function to convert temperature
const convertTemperature = (temp, unit) => {
    return unit === "F" ? (temp * 9/5 + 32).toFixed(1) : temp.toFixed(1);
};

// Listen for unit changes
document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', () => {
        updateTemperatureUnit();
    });
});

const updateTemperatureUnit = () => {
    const selectedUnit = document.querySelector('input[name="unit"]:checked').value;

    // Update current weather
    const tempElements = document.querySelectorAll(".current-weather h6");
    tempElements.forEach(element => {
        const match = element.textContent.match(/([-+]?\d*\.?\d+)°C/);
        if (match) {
            const tempCelsius = parseFloat(match[1]);
            const newTemp = convertTemperature(tempCelsius, selectedUnit);
            element.textContent = element.textContent.replace(
                /([-+]?\d*\.?\d+)°C/,
                `${newTemp}°${selectedUnit}`
            );
        }
    });

    // Update forecast
    const forecastElements = document.querySelectorAll(".weather-cards .card h6");
    forecastElements.forEach(element => {
        const match = element.textContent.match(/Temp: ([-+]?\d*\.?\d+)°C/);
        if (match) {
            const tempCelsius = parseFloat(match[1]);
            const newTemp = convertTemperature(tempCelsius, selectedUnit);
            element.textContent = element.textContent.replace(
                /Temp: ([-+]?\d*\.?\d+)°C/,
                `Temp: ${newTemp}°${selectedUnit}`
            );
        }
    });
};
