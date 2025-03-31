// Background image function
function fetchBackgroundImage() {
    fetch("https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature")
        .then(res => res.json())
        .then(data => {
            document.body.style.backgroundImage = `url(${data.urls.regular})`
            document.getElementById("author").textContent = `By: ${data.user.name}`
        })
        .catch(err => {
            document.body.style.backgroundImage = `url(https://images.unsplash.com/photo-1560008511-11c63416e52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyMTEwMjl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2MjI4NDIxMTc&ixlib=rb-1.2.1&q=80&w=1080
)`
            document.getElementById("author").textContent = `By: Dodi Achmad`
        })
}

// Initial background image load
fetchBackgroundImage();

// Add event listener for next image button
document.getElementById("next-image").addEventListener("click", fetchBackgroundImage);

// Search engine selector functionality
const searchForm = document.getElementById("search-form");
const currentEngine = document.getElementById("current-engine");
const searchEnginesDropdown = document.getElementById("search-engines-dropdown");
const engineIcon = document.getElementById("engine-icon");
const searchEngineOptions = document.querySelectorAll(".search-engine-option");

// Default search engine configuration
const searchEngines = {
    google: {
        url: "https://www.google.com/search",
        icon: "https://www.google.com/favicon.ico",
        paramName: "q"
    },
    bing: {
        url: "https://www.bing.com/search",
        icon: "https://www.bing.com/favicon.ico",
        paramName: "q"
    },
    yahoo: {
        url: "https://search.yahoo.com/search",
        icon: "https://www.yahoo.com/favicon.ico",
        paramName: "p"
    },
    duckduckgo: {
        url: "https://duckduckgo.com/",
        icon: "https://duckduckgo.com/favicon.ico",
        paramName: "q"
    }
};

// Load saved search engine preference or default to Google
let currentSearchEngine = localStorage.getItem("preferredSearchEngine") || "google";

// Initialize search form with the current engine
function initializeSearchEngine() {
    const engine = searchEngines[currentSearchEngine];
    searchForm.action = engine.url;
    engineIcon.src = engine.icon;
    engineIcon.alt = currentSearchEngine;
    
    // Update the input name parameter based on the search engine
    document.getElementById("search-input").name = engine.paramName;
}

// Toggle dropdown visibility
currentEngine.addEventListener("click", function() {
    searchEnginesDropdown.classList.toggle("show");
});

// Handle search engine selection
searchEngineOptions.forEach(option => {
    option.addEventListener("click", function() {
        const engineName = this.dataset.engine;
        const engineUrl = this.dataset.url;
        
        // Update current engine
        currentSearchEngine = engineName;
        localStorage.setItem("preferredSearchEngine", engineName);
        
        // Update form
        searchForm.action = engineUrl;
        engineIcon.src = this.querySelector("img").src;
        engineIcon.alt = this.querySelector("span").textContent;
        
        // Update input name parameter based on the search engine
        document.getElementById("search-input").name = searchEngines[engineName].paramName;
        
        // Hide dropdown
        searchEnginesDropdown.classList.remove("show");
    });
});

// Close dropdown when clicking outside
document.addEventListener("click", function(e) {
    if (!currentEngine.contains(e.target) && !searchEnginesDropdown.contains(e.target)) {
        searchEnginesDropdown.classList.remove("show");
    }
});

// Initialize search engine
initializeSearchEngine();

// Cryptocurrency data
const cryptoSearch = document.getElementById("crypto-search");
const cryptoDropdown = document.getElementById("crypto-dropdown");
const cryptoNotFound = document.getElementById("crypto-not-found");
let cryptocurrencies = [];
let currentCrypto = localStorage.getItem("preferredCrypto") || "bitcoin";
let searchTimeout;

// Fetch list of cryptocurrencies
function fetchCryptocurrenciesList() {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1")
        .then(res => {
            if (!res.ok) {
                throw Error("Failed to load cryptocurrencies list");
            }
            return res.json();
        })
        .then(data => {
            cryptocurrencies = data;
            // Pre-populate dropdown with top cryptocurrencies
            renderCryptocurrencyOptions(data.slice(0, 10));
        })
        .catch(err => {
            console.error(err);
            document.querySelector(".crypto-loading").textContent = "Failed to load cryptocurrencies. Please try again.";
        });
}

// Render cryptocurrency options in dropdown
function renderCryptocurrencyOptions(coins, filter = "") {
    const filteredCoins = filter 
        ? coins.filter(coin => 
            coin.name.toLowerCase().includes(filter.toLowerCase()) || 
            coin.symbol.toLowerCase().includes(filter.toLowerCase()))
        : coins;
    
    let html = '';
    
    if (filteredCoins.length === 0) {
        cryptoDropdown.innerHTML = '<div class="crypto-loading">No cryptocurrencies found</div>';
        cryptoDropdown.style.display = "none";
        cryptoNotFound.style.display = "block";
        return;
    } else {
        cryptoNotFound.style.display = "none";
        
        filteredCoins.slice(0, 10).forEach(coin => {
            html += `
                <div class="crypto-option" data-id="${coin.id}">
                    <img src="${coin.image}" alt="${coin.symbol}" />
                    <span>${coin.name} (${coin.symbol.toUpperCase()})</span>
                </div>
            `;
        });
    }
    
    cryptoDropdown.innerHTML = html;
    
    // Add event listeners to options
    document.querySelectorAll(".crypto-option").forEach(option => {
        option.addEventListener("click", function() {
            const coinId = this.dataset.id;
            currentCrypto = coinId;
            localStorage.setItem("preferredCrypto", coinId);
            cryptoSearch.value = this.textContent.trim();
            cryptoDropdown.classList.remove("show");
            fetchCryptoData(coinId);
        });
    });
}

// Fetch cryptocurrency data based on selection
function fetchCryptoData(cryptoId) {
    document.getElementById("crypto-top").innerHTML = `<div class="loading">Loading...</div>`;
    document.getElementById("crypto").innerHTML = document.getElementById("crypto").innerHTML.replace(/<p>.*<\/p>/g, "");
    
    fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}`)
        .then(res => {
            if (!res.ok) {
                throw Error("Something went wrong with crypto data")
            }
            return res.json()
        })
        .then(data => {
            document.getElementById("crypto-top").innerHTML = `
                <img src=${data.image.small} />
                <span>${data.name}</span>
            `
            document.getElementById("crypto").innerHTML += `
                <p>Current: $${data.market_data.current_price.usd}</p>
                <p>High: $${data.market_data.high_24h.usd}</p>
                <p>Low: $${data.market_data.low_24h.usd}</p>
            `
            fetchCryptoChartData(cryptoId);
        })
        .catch(err => {
            console.error(err);
            document.getElementById("crypto-top").innerHTML = `<div>Failed to load crypto data</div>`;
        })
}

// Fetch and display chart data
function fetchCryptoChartData(cryptoId) {
    fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=1`)
        .then(res => {
            if (!res.ok) {
                throw Error("Failed to load chart data");
            }
            return res.json();
        })
        .then(data => {
            renderSimpleChart(data.prices);
        })
        .catch(err => {
            console.error(err);
            document.getElementById("crypto-chart").innerHTML = `<div class="chart-error">Chart unavailable</div>`;
        });
}

// Render a simple line chart
function renderSimpleChart(priceData) {
    const chartContainer = document.getElementById("crypto-chart");
    chartContainer.innerHTML = '<canvas class="chart-container"></canvas>';
    
    const canvas = chartContainer.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    // Resize canvas to container
    canvas.width = chartContainer.clientWidth;
    canvas.height = chartContainer.clientHeight;
    
    // Extract price values
    const prices = priceData.map(point => point[1]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    
    // Calculate normalized points
    const points = prices.map((price, index) => ({
        x: index / (prices.length - 1) * canvas.width,
        y: canvas.height - ((price - min) / range * canvas.height)
    }));
    
    // Determine line color (green if price went up, red if down)
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const lineColor = endPrice >= startPrice ? 'rgba(0, 255, 120, 0.8)' : 'rgba(255, 70, 70, 0.8)';
    
    // Draw the chart
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw subtle area under the line
    ctx.lineTo(points[points.length - 1].x, canvas.height);
    ctx.lineTo(points[0].x, canvas.height);
    ctx.closePath();
    ctx.fillStyle = lineColor.replace('0.8', '0.2');
    ctx.fill();
}

// Search functionality
cryptoSearch.addEventListener("input", function() {
    const searchTerm = this.value.trim();
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Set a small timeout to avoid excessive rendering while typing
    searchTimeout = setTimeout(() => {
        if (searchTerm.length > 0) {
            cryptoDropdown.classList.add("show");
            const filteredCoins = cryptocurrencies.filter(coin => 
                coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            renderCryptocurrencyOptions(filteredCoins, searchTerm);
        } else {
            renderCryptocurrencyOptions(cryptocurrencies.slice(0, 10));
            cryptoNotFound.style.display = "none";
        }
    }, 300);
});

cryptoSearch.addEventListener("focus", function() {
    if (cryptocurrencies.length > 0) {
        cryptoDropdown.classList.add("show");
        if (this.value.trim().length > 0) {
            renderCryptocurrencyOptions(cryptocurrencies, this.value.trim());
        } else {
            renderCryptocurrencyOptions(cryptocurrencies.slice(0, 10));
        }
    }
});

// Click outside to close dropdown
document.addEventListener("click", function(e) {
    if (!cryptoSearch.contains(e.target) && !cryptoDropdown.contains(e.target)) {
        cryptoDropdown.classList.remove("show");
        cryptoNotFound.style.display = "none";
    }
});

// Initial data load
fetchCryptocurrenciesList();
fetchCryptoData(currentCrypto);

// Clock functionality
function getCurrentTime() {
    const date = new Date()
    
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

setInterval(getCurrentTime, 1000)

// Weather data
function fetchWeatherData() {
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

function fetchWeatherByCity(city) {
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

// Initialize weather
fetchWeatherData();

// Bookmarks functionality
const bookmarkItems = document.querySelectorAll(".bookmark-item");
const savedBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

// Initialize bookmarks from localStorage
function initializeBookmarks() {
    // If we have saved bookmarks, load them
    if (savedBookmarks.length > 0) {
        for (let i = 0; i < savedBookmarks.length && i < bookmarkItems.length; i++) {
            const bookmark = savedBookmarks[i];
            setBookmark(bookmarkItems[i], bookmark.name, bookmark.url);
        }
    }
}

// Set bookmark data
function setBookmark(element, name, url) {
    if (name && url) {
        element.dataset.name = name;
        element.dataset.url = url;
        
        // Try to get favicon or use first letter as icon
        const domain = new URL(url).hostname;
        const icon = element.querySelector(".bookmark-icon");
        icon.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${domain}" alt="${name[0]}" onerror="this.outerHTML='${name[0]}'">`;
        
        // Set name
        element.querySelector(".bookmark-name").textContent = name;
    }
}

// Reset bookmark to default state
function resetBookmark(element) {
    element.dataset.url = "";
    element.dataset.name = "";
    element.querySelector(".bookmark-icon").textContent = "➕";
    element.querySelector(".bookmark-name").textContent = "Quick Access";
}

// Handle bookmark click - either open URL or add new bookmark
function handleBookmarkClick(e) {
    const item = e.currentTarget;
    const url = item.dataset.url;
    
    if (url) {
        // If bookmark has URL, open it
        window.open(url, "_blank");
    } else {
        // Otherwise prompt to add new bookmark
        const newName = prompt("Enter bookmark name:");
        if (!newName) return;
        
        let newUrl = prompt("Enter bookmark URL:");
        if (!newUrl) return;
        
        // Add https if missing
        if (!newUrl.startsWith('http')) {
            newUrl = 'https://' + newUrl;
        }
        
        // Set the bookmark
        setBookmark(item, newName, newUrl);
        
        // Save to localStorage
        saveBookmarks();
    }
}

// Save bookmarks to localStorage
function saveBookmarks() {
    const bookmarksToSave = [];
    
    bookmarkItems.forEach(item => {
        const name = item.dataset.name;
        const url = item.dataset.url;
        
        if (name && url) {
            bookmarksToSave.push({ name, url });
        }
    });
    
    localStorage.setItem("bookmarks", JSON.stringify(bookmarksToSave));
}

// Initialize bookmarks and add event listeners
initializeBookmarks();

bookmarkItems.forEach(item => {
    item.addEventListener("click", handleBookmarkClick);
});

// Right-click to delete bookmark
bookmarkItems.forEach(item => {
    item.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        
        if (item.dataset.url) {
            if (confirm("Delete this bookmark?")) {
                resetBookmark(item);
                saveBookmarks();
            }
        }
    });
});

// Search form focus on keyboard shortcut (Ctrl+Space)
document.addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        document.getElementById("search-input").focus();
    }
});

// Settings Modal Functionality
const modal = document.getElementById("settings-modal");
const settingsBtn = document.getElementById("settings-button");
const closeBtn = document.querySelector(".close");
const saveBtn = document.getElementById("save-settings");
const useLocationCheckbox = document.getElementById("use-location");
const manualLocationContainer = document.getElementById("manual-location-container");
const cityInput = document.getElementById("city-input");
const applyLocationBtn = document.getElementById("apply-location");
const timeFormatSelect = document.getElementById("time-format");
const dateFormatSelect = document.getElementById("date-format");
const importBookmarksBtn = document.getElementById("import-bookmarks");
const clearBookmarksBtn = document.getElementById("clear-bookmarks");

// Open modal when settings button is clicked
settingsBtn.addEventListener("click", function() {
    // Load current settings into form
    loadCurrentSettings();
    modal.style.display = "block";
});

// Close modal when close button is clicked
closeBtn.addEventListener("click", function() {
    modal.style.display = "none";
});

// Close modal when clicking outside of it
window.addEventListener("click", function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Toggle manual location input visibility
useLocationCheckbox.addEventListener("change", function() {
    if (this.checked) {
        manualLocationContainer.style.display = "none";
    } else {
        manualLocationContainer.style.display = "flex";
    }
});

// Apply location button functionality
applyLocationBtn.addEventListener("click", function() {
    const city = cityInput.value.trim();
    if (city) {
        localStorage.setItem("customCity", city);
        localStorage.setItem("useCurrentLocation", "false");
        fetchWeatherByCity(city);
    }
});

// Save settings
saveBtn.addEventListener("click", function() {
    // Save time and date format settings
    localStorage.setItem("timeFormat", timeFormatSelect.value);
    localStorage.setItem("dateFormat", dateFormatSelect.value);
    
    // Save location settings
    localStorage.setItem("useCurrentLocation", useLocationCheckbox.checked);
    if (!useLocationCheckbox.checked && cityInput.value.trim()) {
        localStorage.setItem("customCity", cityInput.value.trim());
        fetchWeatherByCity(cityInput.value.trim());
    } else if (useLocationCheckbox.checked) {
        fetchWeatherData();
    }
    
    // Update time display with new format
    getCurrentTime();
    
    // Close modal
    modal.style.display = "none";
});

// Load current settings into form
function loadCurrentSettings() {
    // Load time and date format settings
    const timeFormat = localStorage.getItem("timeFormat") || "12-hour";
    const dateFormat = localStorage.getItem("dateFormat") || "dd/mm/yy";
    timeFormatSelect.value = timeFormat;
    dateFormatSelect.value = dateFormat;
    
    // Load location settings
    const useCurrentLocation = localStorage.getItem("useCurrentLocation") !== "false";
    const customCity = localStorage.getItem("customCity") || "";
    useLocationCheckbox.checked = useCurrentLocation;
    cityInput.value = customCity;
    
    // Show/hide manual location input based on checkbox
    if (useCurrentLocation) {
        manualLocationContainer.style.display = "none";
    } else {
        manualLocationContainer.style.display = "flex";
    }
}

// Import bookmarks functionality
importBookmarksBtn.addEventListener("click", function() {
    // This is simulated as extensions can't directly access browser bookmarks
    // In a real extension, this would use chrome.bookmarks API
    alert("For a real Chrome extension, this would use chrome.bookmarks API to import bookmarks. This is a simulation.");
    
    // For demo, we'll add some sample bookmarks
    const sampleBookmarks = [
        { name: "Google", url: "https://google.com" },
        { name: "YouTube", url: "https://youtube.com" },
        { name: "GitHub", url: "https://github.com" },
        { name: "Gmail", url: "https://mail.google.com" }
    ];
    
    // Simulate importing bookmarks
    const currentBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    const newBookmarks = [...currentBookmarks, ...sampleBookmarks.slice(0, 8 - currentBookmarks.length)];
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
    
    // Reload the page to show new bookmarks
    if (confirm("Sample bookmarks added. Reload page to see them?")) {
        window.location.reload();
    }
});

// Clear all bookmarks
clearBookmarksBtn.addEventListener("click", function() {
    if (confirm("Are you sure you want to clear all bookmarks?")) {
        localStorage.removeItem("bookmarks");
        alert("All bookmarks cleared. Page will reload.");
        window.location.reload();
    }
});

