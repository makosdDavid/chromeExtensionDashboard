/**
 * Weather and Time Module
 * Handles all functionality related to weather display and time/date
 */

// Initialize weather and time
export function initWeatherTime() {
    // Initialize clock functionality
    setInterval(getCurrentTime, 1000);
    getCurrentTime(); // Call immediately to avoid initial delay
    
    // Initialize weather
    fetchWeatherData();
}

// Clock functionality
function getCurrentTime() {
    const date = new Date();
    
    // Get settings for time format
    const timeFormat = localStorage.getItem("timeFormat") || "12-hour";
    
    // Format time based on selected format
    let formattedTime;
    if (timeFormat === "24-hour") {
        formattedTime = date.toLocaleTimeString("en-us", { 
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    } else {
        formattedTime = date.toLocaleTimeString("en-us", { timeStyle: "medium" });
    }
    
    // Get day of week
    const weekday = date.toLocaleDateString("en-us", { weekday: 'long' });
    
    // Get settings for date format
    const dateFormat = localStorage.getItem("dateFormat") || "dd/mm/yy";
    
    // Update date based on selected format
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const shortYear = String(date.getFullYear()).slice(-2);
    const fullYear = String(date.getFullYear());
    
    let formattedDate;
    switch(dateFormat) {
        case "mm/dd/yy":
            formattedDate = `${month}/${day}/${shortYear}`;
            break;
        case "yy/mm/dd":
            formattedDate = `${shortYear}/${month}/${day}`;
            break;
        case "yyyy/mm/dd":
            formattedDate = `${fullYear}/${month}/${day}`;
            break;
        case "yyyymmdd":
            formattedDate = `${fullYear}${month}${day}`;
            break;
        case "yyyy-mm-dd":
            formattedDate = `${fullYear}-${month}-${day}`;
            break;
        default: // dd/mm/yy
            formattedDate = `${day}/${month}/${shortYear}`;
    }
    
    // If we have a weather widget, update time and date inside it
    const timeEl = document.getElementById("time");
    const weekdayEl = document.querySelector("#date .weekday");
    const dateNumbersEl = document.querySelector("#date .date-numbers");
    
    if (timeEl) timeEl.textContent = formattedTime;
    if (weekdayEl) weekdayEl.textContent = weekday;
    if (dateNumbersEl) dateNumbersEl.textContent = formattedDate;
}

// Weather data functions
export function fetchWeatherData() {
    const useCurrentLocation = localStorage.getItem("useCurrentLocation") !== "false";
    const customCity = localStorage.getItem("customCity");
    
    if (useCurrentLocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            fetchWeatherForecast(position.coords.latitude, position.coords.longitude);
        }, error => {
            console.error("Error getting location:", error);
            document.getElementById("weather").innerHTML = `
                <div class="weather-info">
                    <p>Weather data unavailable</p>
                    <p>Please enable location services</p>
                </div>
            `;
        });
    } else if (customCity) {
        fetchWeatherByCity(customCity);
        fetchWeatherForecastByCity(customCity);
    }
}

function fetchWeatherByCoords(lat, lon) {
    fetch(`https://apis.scrimba.com/openweathermap/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric`)
        .then(res => {
            if (!res.ok) {
                throw Error("Weather data not available");
            }
            return res.json();
        })
        .then(data => updateWeatherUI(data))
        .catch(err => console.error(err));
}

export function fetchWeatherByCity(city) {
    fetch(`https://apis.scrimba.com/openweathermap/data/2.5/weather?q=${city}&units=metric`)
        .then(res => {
            if (!res.ok) {
                throw Error("City not found");
            }
            return res.json();
        })
        .then(data => updateWeatherUI(data))
        .catch(err => {
            console.error(err);
            document.getElementById("weather").innerHTML = `
                <div class="weather-info">
                    <p>City not found</p>
                    <p>Please check the spelling</p>
                </div>
            `;
        });
}

// Fetch 5-day forecast by coordinates
function fetchWeatherForecast(lat, lon) {
    fetch(`https://apis.scrimba.com/openweathermap/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric`)
        .then(res => {
            if (!res.ok) {
                throw Error("Forecast data not available");
            }
            return res.json();
        })
        .then(data => updateForecastUI(data))
        .catch(err => console.error(err));
}

// Fetch 5-day forecast by city name
function fetchWeatherForecastByCity(city) {
    fetch(`https://apis.scrimba.com/openweathermap/data/2.5/forecast?q=${city}&units=metric`)
        .then(res => {
            if (!res.ok) {
                throw Error("City forecast not found");
            }
            return res.json();
        })
        .then(data => updateForecastUI(data))
        .catch(err => console.error(err));
}

function updateWeatherUI(data) {
    const weatherCondition = data.weather[0].main;
    let weatherIcon = "☀️"; // Default sunny icon
    
    // Map weather conditions to appropriate emoji icons
    switch(weatherCondition.toLowerCase()) {
        case "clear":
            weatherIcon = "☀️";
            break;
        case "clouds":
            weatherIcon = "☁️";
            break;
        case "rain":
        case "drizzle":
            weatherIcon = "🌧️";
            break;
        case "thunderstorm":
            weatherIcon = "⛈️";
            break;
        case "snow":
            weatherIcon = "❄️";
            break;
        case "mist":
        case "smoke":
        case "haze":
        case "dust":
        case "fog":
            weatherIcon = "🌫️";
            break;
        default:
            weatherIcon = "🌤️";
    }
    
    document.getElementById("weather").innerHTML = `
        <div class="weather-info">
            <p class="weather-temp">${Math.round(data.main.temp)}ºC ${weatherIcon}</p>
            <p class="weather-city">${data.name}</p>
        </div>
        <div id="weather-forecast" class="weather-forecast">
            <!-- Forecast will be populated here -->
        </div>
        <div class="datetime-container">
            <h1 id="time" class="time">TIME HERE</h1>
            <p id="date" class="date">
                <span class="weekday">DAY</span>
                <span class="date-numbers">DATE HERE</span>
            </p>
        </div>
    `;
    
    // Initialize time display immediately
    getCurrentTime();
}

// New function to process and display forecast data
function updateForecastUI(data) {
    // Get forecast element
    const forecastEl = document.getElementById("weather-forecast");
    if (!forecastEl) return;
    
    // Process the forecast data to get one forecast per day
    const dailyForecasts = {};
    
    // OpenWeatherMap returns forecasts in 3-hour blocks
    data.list.forEach(forecast => {
        // Get the date without time
        const date = new Date(forecast.dt * 1000);
        const day = date.toISOString().split('T')[0];
        
        // Only store one forecast per day (noon forecast preferred)
        const hour = date.getHours();
        
        // If we don't have this day yet, or if this forecast is closer to noon than our current one
        if (!dailyForecasts[day] || Math.abs(hour - 12) < Math.abs(dailyForecasts[day].hour - 12)) {
            dailyForecasts[day] = {
                temp: Math.round(forecast.main.temp),
                weather: forecast.weather[0].main,
                icon: forecast.weather[0].icon,
                hour: hour,
                date: date
            };
        }
    });
    
    // Convert to array and get next 5 days (or however many we have)
    const forecastArray = Object.values(dailyForecasts).slice(0, 5);
    
    // Create the forecast HTML
    let forecastHTML = `<div class="forecast-container">`;
    
    forecastArray.forEach(forecast => {
        // Get day abbreviation (M, T, W, etc.)
        const dayAbbrev = forecast.date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
        
        // Map weather conditions to appropriate emoji icons (reusing same mapping as current weather)
        let weatherIcon = "☀️"; // Default sunny icon
        
        switch(forecast.weather.toLowerCase()) {
            case "clear":
                weatherIcon = "☀️";
                break;
            case "clouds":
                weatherIcon = "☁️";
                break;
            case "rain":
            case "drizzle":
                weatherIcon = "🌧️";
                break;
            case "thunderstorm":
                weatherIcon = "⛈️";
                break;
            case "snow":
                weatherIcon = "❄️";
                break;
            case "mist":
            case "smoke":
            case "haze":
            case "dust":
            case "fog":
                weatherIcon = "🌫️";
                break;
            default:
                weatherIcon = "🌤️";
        }
        
        forecastHTML += `
            <div class="forecast-day">
                <div class="forecast-day-abbrev">${dayAbbrev}</div>
                <div class="forecast-icon">${weatherIcon}</div>
                <div class="forecast-temp">${forecast.temp}°</div>
            </div>
        `;
    });
    
    forecastHTML += `</div>`;
    forecastEl.innerHTML = forecastHTML;
}

// Expose method to manually update the time display
export function updateTime() {
    getCurrentTime();
} 