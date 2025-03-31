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
    
    // Update time based on selected format
    if (timeFormat === "24-hour") {
        document.getElementById("time").textContent = date.toLocaleTimeString("en-us", { 
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    } else {
        document.getElementById("time").textContent = date.toLocaleTimeString("en-us", { timeStyle: "medium" });
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
    
    document.querySelector("#date .weekday").textContent = weekday;
    document.querySelector("#date .date-numbers").textContent = formattedDate;
}

// Weather data functions
export function fetchWeatherData() {
    const useCurrentLocation = localStorage.getItem("useCurrentLocation") !== "false";
    const customCity = localStorage.getItem("customCity");
    
    if (useCurrentLocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
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

function updateWeatherUI(data) {
    const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
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
        <img src=${iconUrl} alt="${data.weather[0].description}" />
        <div class="weather-info">
            <p class="weather-temp">${Math.round(data.main.temp)}ºC ${weatherIcon}</p>
            <p class="weather-city">${data.name}</p>
        </div>
    `;
}

// Expose method to manually update the time display
export function updateTime() {
    getCurrentTime();
} 