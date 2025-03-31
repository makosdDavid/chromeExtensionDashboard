/**
 * Cryptocurrency Module
 * Handles all functionality related to cryptocurrency display and search
 */

let cryptocurrencies = [];
let currentCrypto = localStorage.getItem("preferredCrypto") || "bitcoin";
let searchTimeout;
let cryptocurrenciesFetched = false;

// Initialize crypto module
export function initCrypto() {
    console.log("Initializing cryptocurrency module");
    
    const cryptoSearch = document.getElementById("crypto-search");
    const cryptoDropdown = document.getElementById("crypto-dropdown");
    const cryptoNotFound = document.getElementById("crypto-not-found");
    const searchIcon = document.querySelector(".crypto-search-icon");
    
    // Fetch initial cryptocurrency data
    fetchCryptocurrenciesList();
    fetchCryptoData(currentCrypto);
    
    // Add event listeners for input (moved to separate function)
    cryptoSearch.addEventListener("input", handleCryptoSearch);
    
    // Add click handler to crypto-top to allow changing cryptocurrency
    document.getElementById("crypto-top").addEventListener("click", function() {
        // Focus the search field
        cryptoSearch.focus();
    });
    
    cryptoSearch.addEventListener("focus", function() {
        // Clear the input field when focusing
        this.value = "";
        
        // Hide "not found" message
        cryptoNotFound.style.display = "none";
        
        // Show dropdown with top cryptocurrencies when focusing
        if (cryptocurrencies.length > 0) {
            // Display top cryptocurrencies
            cryptoDropdown.style.display = "block";
            cryptoDropdown.classList.add("show");
            
            // Show top cryptocurrencies (limited to 8)
            renderCryptocurrencyOptions(cryptocurrencies.slice(0, 8));
        } else {
            // Show loading if cryptocurrencies aren't loaded yet
            cryptoDropdown.style.display = "block";
            cryptoDropdown.classList.add("show");
            cryptoDropdown.innerHTML = '<div class="crypto-loading">Loading cryptocurrencies...</div>';
            
            // Try to fetch cryptocurrencies if not already loaded
            if (!cryptocurrenciesFetched) {
                fetchCryptocurrenciesList();
            }
        }
    });
    
    // Add event listener to search icon button
    searchIcon.addEventListener("click", function(e) {
        e.stopPropagation(); // Prevent bubbling
        const searchTerm = cryptoSearch.value.trim();
        if (searchTerm) {
            searchCryptocurrency(searchTerm);
        }
    });
    
    // Handle Enter key press in search input
    cryptoSearch.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const searchTerm = this.value.trim();
            if (searchTerm) {
                searchCryptocurrency(searchTerm);
            }
        }
    });
    
    // Click outside to close dropdown
    document.addEventListener("click", function(e) {
        if (!cryptoSearch.contains(e.target) && 
            !cryptoDropdown.contains(e.target) && 
            !searchIcon.contains(e.target) &&
            !document.getElementById("crypto-top").contains(e.target)) {
            cryptoDropdown.classList.remove("show");
            cryptoDropdown.style.display = "none";
            cryptoNotFound.style.display = "none";
        }
    });
}

// Search for cryptocurrency by name or symbol
function searchCryptocurrency(searchTerm) {
    console.log("Searching for:", searchTerm); // Debug
    
    const cryptoDropdown = document.getElementById("crypto-dropdown");
    const cryptoNotFound = document.getElementById("crypto-not-found");
    
    if (!searchTerm || cryptocurrencies.length === 0) {
        console.log("No search term or no cryptocurrencies available");
        return;
    }
    
    const filteredCoins = cryptocurrencies.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log("Found coins:", filteredCoins.length); // Debug
    
    if (filteredCoins.length > 0) {
        // If we have matches, use the first one
        const selectedCoin = filteredCoins[0];
        console.log("Selected coin:", selectedCoin.name); // Debug
        
        currentCrypto = selectedCoin.id;
        localStorage.setItem("preferredCrypto", selectedCoin.id);
        
        // Update search box with selected coin
        document.getElementById("crypto-search").value = selectedCoin.name;
        
        // Fetch and display data
        fetchCryptoData(selectedCoin.id);
        
        // Hide dropdown and not found message
        cryptoDropdown.classList.remove("show");
        cryptoDropdown.style.display = "none";
        cryptoNotFound.style.display = "none";
    } else {
        // No matches found
        cryptoDropdown.classList.remove("show");
        cryptoDropdown.style.display = "none";
        cryptoNotFound.style.display = "block";
    }
}

// Fetch list of cryptocurrencies
function fetchCryptocurrenciesList() {
    console.log("Fetching cryptocurrencies list");
    
    const cryptoDropdown = document.getElementById("crypto-dropdown");
    cryptoDropdown.innerHTML = '<div class="crypto-loading">Loading cryptocurrencies...</div>';
    
    // Using CoinGecko API to get top 250 cryptocurrencies by market cap
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false", {
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(res => {
            if (!res.ok) {
                throw Error("Failed to load cryptocurrencies list");
            }
            return res.json();
        })
        .then(data => {
            console.log(`Loaded ${data.length} cryptocurrencies`);
            cryptocurrencies = data;
            cryptocurrenciesFetched = true; // Set the flag
            
            // Set initial text in search box to current crypto
            const currentCryptoData = data.find(coin => coin.id === currentCrypto);
            if (currentCryptoData) {
                document.getElementById("crypto-search").value = currentCryptoData.name;
            }
            
            // If the dropdown is open, update it with the loaded cryptocurrencies
            if (cryptoDropdown.classList.contains("show")) {
                renderCryptocurrencyOptions(cryptocurrencies.slice(0, 8));
            }
        })
        .catch(err => {
            console.error("Error fetching cryptocurrencies:", err);
            cryptoDropdown.innerHTML = '<div class="crypto-loading">Failed to load cryptocurrencies. Please try again.</div>';
            cryptocurrenciesFetched = false; // Reset the flag on error
        });
}

// Handle search input
function handleCryptoSearch() {
    const cryptoDropdown = document.getElementById("crypto-dropdown");
    const cryptoNotFound = document.getElementById("crypto-not-found");
    const searchTerm = this.value.trim().toLowerCase();
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // If search field is empty after clearing (e.g., when user deletes all text)
    if (searchTerm === "") {
        // Show top cryptocurrencies
        cryptoDropdown.style.display = "block";
        cryptoDropdown.classList.add("show");
        renderCryptocurrencyOptions(cryptocurrencies.slice(0, 8));
        cryptoNotFound.style.display = "none";
        return;
    }
    
    // Set a small timeout to avoid excessive rendering while typing
    searchTimeout = setTimeout(() => {
        if (searchTerm.length > 0) {
            const filteredCoins = cryptocurrencies.filter(coin => 
                coin.name.toLowerCase().includes(searchTerm) || 
                coin.symbol.toLowerCase().includes(searchTerm)
            );
            
            if (filteredCoins.length > 0) {
                cryptoDropdown.style.display = "block";
                cryptoDropdown.classList.add("show");
                renderCryptocurrencyOptions(filteredCoins, searchTerm);
                cryptoNotFound.style.display = "none";
            } else {
                cryptoDropdown.style.display = "none";
                cryptoDropdown.classList.remove("show");
                cryptoNotFound.style.display = "block";
            }
        } else {
            // If search term is empty, show top cryptocurrencies
            cryptoDropdown.style.display = "block";
            cryptoDropdown.classList.add("show");
            renderCryptocurrencyOptions(cryptocurrencies.slice(0, 8));
            cryptoNotFound.style.display = "none";
        }
    }, 100); // Reduced delay for faster feedback
}

// Render cryptocurrency options in dropdown
function renderCryptocurrencyOptions(coins, searchTerm = "") {
    const cryptoDropdown = document.getElementById("crypto-dropdown");
    const cryptoNotFound = document.getElementById("crypto-not-found");
    
    if (!coins || coins.length === 0) {
        cryptoDropdown.innerHTML = '<div class="crypto-loading">No cryptocurrencies found</div>';
        cryptoDropdown.style.display = "none";
        cryptoNotFound.style.display = "block";
        return;
    }
    
    cryptoNotFound.style.display = "none";
    
    let html = '';
    
    // Function to highlight the search term in text
    const highlightText = (text, term) => {
        if (!term) return text;
        const lowerText = text.toLowerCase();
        const lowerTerm = term.toLowerCase();
        const index = lowerText.indexOf(lowerTerm);
        
        if (index === -1) return text;
        
        const beforeMatch = text.substring(0, index);
        const match = text.substring(index, index + term.length);
        const afterMatch = text.substring(index + term.length);
        
        return `${beforeMatch}<strong>${match}</strong>${afterMatch}`;
    };
    
    // Show a search icon in the first option
    html += `
        <div class="crypto-option-header">
            <span class="crypto-search-label">Search results</span>
        </div>
    `;
    
    coins.slice(0, 8).forEach(coin => {
        // Try to highlight the search term in either name or symbol
        const displayName = searchTerm && coin.name.toLowerCase().includes(searchTerm.toLowerCase()) 
            ? highlightText(coin.name, searchTerm)
            : coin.name;
            
        html += `
            <div class="crypto-option" data-id="${coin.id}">
                <img src="${coin.image}" alt="${coin.symbol}" class="crypto-image" />
                <div class="crypto-option-content">
                    <span class="crypto-name">${displayName}</span>
                    <span class="crypto-symbol">${coin.symbol.toUpperCase()}</span>
                </div>
            </div>
        `;
    });
    
    cryptoDropdown.innerHTML = html;
    
    // Add event listeners to options
    document.querySelectorAll(".crypto-option").forEach(option => {
        option.addEventListener("click", function(e) {
            e.stopPropagation(); // Prevent event bubbling
            const coinId = this.dataset.id;
            
            // Find the selected coin
            const selectedCoin = cryptocurrencies.find(coin => coin.id === coinId);
            if (selectedCoin) {
                console.log("Selected cryptocurrency:", selectedCoin.name);
                
                // Update global state
                currentCrypto = coinId;
                localStorage.setItem("preferredCrypto", coinId);
                
                // Update search field
                const cryptoSearch = document.getElementById("crypto-search");
                cryptoSearch.value = selectedCoin.name;
                
                // Fetch data for selected cryptocurrency
                fetchCryptoData(selectedCoin.id);
                
                // Hide dropdown
                cryptoDropdown.classList.remove("show");
                cryptoDropdown.style.display = "none";
            }
        });
    });
}

// Format numbers with commas
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: price > 1 ? 2 : 8
    }).format(price);
}

// Fetch cryptocurrency data based on selection
function fetchCryptoData(cryptoId) {
    console.log("Fetching data for:", cryptoId);
    
    // Keep the original structure intact, just show loading state
    document.getElementById("crypto-top").innerHTML = `<div class="loading">Loading...</div>`;
    
    // Fallback data in case API fails
    const fallbackData = {
        bitcoin: {
            name: "Bitcoin",
            symbol: "BTC",
            image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
            current_price: 48265.32,
            high_24h: 48897.15,
            low_24h: 47650.28
        },
        ethereum: {
            name: "Ethereum",
            symbol: "ETH",
            image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
            current_price: 2585.67,
            high_24h: 2612.39,
            low_24h: 2532.18
        },
        floki: {
            name: "FLOKI",
            symbol: "FLOKI",
            image: "https://assets.coingecko.com/coins/images/16746/small/FLOKI.png",
            current_price: 0.00005775,
            high_24h: 0.00005907,
            low_24h: 0.00005565
        },
        dogecoin: {
            name: "Dogecoin",
            symbol: "DOGE",
            image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
            current_price: 0.1389,
            high_24h: 0.1405,
            low_24h: 0.1375
        },
        solana: {
            name: "Solana",
            symbol: "SOL",
            image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
            current_price: 157.32,
            high_24h: 159.74,
            low_24h: 154.87
        }
    };
    
    // Get fallback data for this crypto or use bitcoin as default
    const fallback = fallbackData[cryptoId] || fallbackData.bitcoin;
    
    fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`, {
        headers: {
            'Accept': 'application/json'
        },
        // Add timeout to avoid waiting too long
        signal: AbortSignal.timeout(5000) // 5 second timeout
    })
        .then(res => {
            if (!res.ok) {
                throw Error("Something went wrong with crypto data");
            }
            return res.json();
        })
        .then(data => {
            // Update only the top part with icon and name
            document.getElementById("crypto-top").innerHTML = `
                <img src=${data.image.small} alt="${data.name}" />
                <span>${data.name}</span>
            `;
            
            // Style crypto-top to look clickable
            document.getElementById("crypto-top").style.cursor = "pointer";
            
            // Add price information as separate elements, preserving the search and chart
            const priceInfoHTML = `
                <p>Current: $${formatPrice(data.market_data.current_price.usd)}</p>
                <p>High: $${formatPrice(data.market_data.high_24h.usd)}</p>
                <p>Low: $${formatPrice(data.market_data.low_24h.usd)}</p>
            `;
            
            // Remove any existing price paragraphs
            const paragraphs = document.querySelectorAll("#crypto > p");
            paragraphs.forEach(p => p.remove());
            
            // Insert new price info after the top element
            const topElement = document.getElementById("crypto-top");
            topElement.insertAdjacentHTML('afterend', priceInfoHTML);
            
            // Now fetch and update chart
            fetchCryptoChartData(cryptoId);
        })
        .catch(err => {
            console.error("Error fetching crypto data:", err);
            
            // Use fallback data
            document.getElementById("crypto-top").innerHTML = `
                <img src="${fallback.image}" alt="${fallback.name}" />
                <span>${fallback.name}</span>
            `;
            
            // Style crypto-top to look clickable
            document.getElementById("crypto-top").style.cursor = "pointer";
            
            // Add fallback price information
            const priceInfoHTML = `
                <p>Current: $${formatPrice(fallback.current_price)}</p>
                <p>High: $${formatPrice(fallback.high_24h)}</p>
                <p>Low: $${formatPrice(fallback.low_24h)}</p>
            `;
            
            // Remove any existing price paragraphs
            const paragraphs = document.querySelectorAll("#crypto > p");
            paragraphs.forEach(p => p.remove());
            
            // Insert fallback info
            const topElement = document.getElementById("crypto-top");
            topElement.insertAdjacentHTML('afterend', priceInfoHTML);
            
            // Use fallback chart data
            renderFallbackChart(fallback.name);
        });
}

// Fetch and display chart data
function fetchCryptoChartData(cryptoId) {
    console.log("Fetching chart data for:", cryptoId);
    
    // Show loading state
    document.getElementById("crypto-chart").innerHTML = '<div class="crypto-loading">Loading chart...</div>';
    
    fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=1&interval=hourly`, {
        headers: {
            'Accept': 'application/json'
        },
        // Add timeout to avoid waiting too long
        signal: AbortSignal.timeout(5000) // 5 second timeout
    })
        .then(res => {
            if (!res.ok) {
                throw Error("Failed to load chart data");
            }
            return res.json();
        })
        .then(data => {
            if (data && data.prices && data.prices.length > 0) {
                renderSimpleChart(data.prices);
            } else {
                throw Error("No chart data available");
            }
        })
        .catch(err => {
            console.error("Error fetching chart data:", err);
            renderFallbackChart(cryptoId);
        });
}

// Generate and render a fallback chart with dummy data
function renderFallbackChart(cryptoId) {
    console.log("Using fallback chart for:", cryptoId);
    
    // Generate fake price data based on crypto name for some variety
    const seed = cryptoId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const fakePriceData = [];
    
    // Create 24 data points (hourly for one day)
    const baseValue = 100 + (seed % 100);
    for (let i = 0; i < 24; i++) {
        // Generate slightly random but trending prices
        const randomFactor = Math.sin(i / 3) * 10 + ((Math.random() - 0.5) * 5);
        fakePriceData.push([Date.now() - (24 - i) * 3600000, baseValue + randomFactor]);
    }
    
    // Render the chart with fake data
    renderSimpleChart(fakePriceData);
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

// Expose methods for external use (like settings)
export function updateCrypto() {
    fetchCryptoData(currentCrypto);
} 