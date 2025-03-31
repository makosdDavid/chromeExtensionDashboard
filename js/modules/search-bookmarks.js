/**
 * Search and Bookmarks Module
 * Handles all functionality related to search bar and bookmarks
 */

// Initialize search and bookmarks
export function initSearchBookmarks() {
    // Initialize search engine functionality
    initSearchEngine();
    
    // Initialize search suggestions
    initSearchSuggestions();
    
    // Initialize bookmarks
    initBookmarks();
    
    // Add keyboard shortcut for search
    document.addEventListener("keydown", function(e) {
        if (e.ctrlKey && e.code === "Space") {
            e.preventDefault();
            document.getElementById("search-input").focus();
        }
    });
}

// Search engine functionality
function initSearchEngine() {
    const searchForm = document.getElementById("search-form");
    const currentEngine = document.getElementById("current-engine");
    const searchEnginesDropdown = document.getElementById("search-engines-dropdown");
    const engineIcon = document.getElementById("engine-icon");
    const engineText = document.querySelector(".engine-text");
    const searchInput = document.getElementById("search-input");
    
    // Default search engine configuration
    const searchEngines = {
        google: {
            url: "https://www.google.com/search",
            icon: "https://www.google.com/favicon.ico",
            name: "Google",
            paramName: "q"
        },
        bing: {
            url: "https://www.bing.com/search",
            icon: "https://www.bing.com/favicon.ico",
            name: "Bing",
            paramName: "q"
        },
        yahoo: {
            url: "https://search.yahoo.com/search",
            icon: "https://www.yahoo.com/favicon.ico",
            name: "Yahoo",
            paramName: "p"
        },
        duckduckgo: {
            url: "https://duckduckgo.com/",
            icon: "https://duckduckgo.com/favicon.ico",
            name: "DuckDuckGo",
            paramName: "q"
        }
    };
    
    // Load saved search engine preference or default to Google
    const savedEngine = localStorage.getItem("preferredSearchEngine") || "google";
    
    // Set initial engine
    setSearchEngine(savedEngine);
    
    // Simple toggle for dropdown
    currentEngine.onclick = function(e) {
        e.stopPropagation();
        searchEnginesDropdown.style.display = searchEnginesDropdown.style.display === "block" ? "none" : "block";
    };
    
    // Close dropdown when clicking elsewhere
    document.addEventListener("click", function() {
        searchEnginesDropdown.style.display = "none";
    });
    
    // Setup search engine options
    document.querySelectorAll(".search-engine-option").forEach(option => {
        option.onclick = function(e) {
            e.stopPropagation();
            const engine = this.getAttribute("data-engine");
            setSearchEngine(engine);
            localStorage.setItem("preferredSearchEngine", engine);
            searchEnginesDropdown.style.display = "none";
        };
    });
    
    // Set search engine
    function setSearchEngine(engine) {
        const config = searchEngines[engine];
        if (!config) return;
        
        // Update form action and parameter
        searchForm.action = config.url;
        searchInput.name = config.paramName;
        
        // Update icon and name
        engineIcon.src = config.icon;
        engineIcon.alt = config.name;
        
        // Update display text
        if (engineText) {
            engineText.textContent = config.name;
        }
    }
}

// Search suggestions functionality
function initSearchSuggestions() {
    const searchInput = document.getElementById("search-input");
    const searchForm = document.getElementById("search-form");
    
    // Create suggestions container if it doesn't exist
    let suggestionsContainer = document.getElementById("search-suggestions");
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement("div");
        suggestionsContainer.id = "search-suggestions";
        suggestionsContainer.className = "search-suggestions";
        searchForm.appendChild(suggestionsContainer);
    }
    
    // Sample suggestions
    const suggestions = [
        "weather forecast", 
        "news today",
        "stock market",
        "cryptocurrency prices",
        "local restaurants",
        "movie showtimes",
        "best recipes",
        "technology news",
        "travel destinations",
        "fitness tips"
    ];
    
    // Show suggestions when typing
    searchInput.oninput = function() {
        const query = this.value.trim().toLowerCase();
        
        if (query.length > 0) {
            const matches = suggestions.filter(s => s.toLowerCase().includes(query));
            displaySuggestions(matches, query);
        } else {
            // Show popular suggestions when input is empty
            displaySuggestions(suggestions.slice(0, 5));
        }
    };
    
    // Show default suggestions on focus
    searchInput.onfocus = function() {
        displaySuggestions(suggestions.slice(0, 5));
    };
    
    // Hide suggestions when clicking elsewhere
    document.addEventListener("click", function(e) {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = "none";
        }
    });
    
    // Handle keyboard navigation
    searchInput.onkeydown = function(e) {
        const items = suggestionsContainer.querySelectorAll(".suggestion-item");
        if (items.length === 0) return;
        
        const selected = suggestionsContainer.querySelector(".suggestion-item.selected");
        let index = -1;
        
        if (selected) {
            for (let i = 0; i < items.length; i++) {
                if (items[i] === selected) {
                    index = i;
                    break;
                }
            }
        }
        
        // Arrow navigation
        if (e.key === "ArrowDown") {
            e.preventDefault();
            index = (index + 1) % items.length;
            selectSuggestion(items, index);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            index = (index - 1 + items.length) % items.length;
            selectSuggestion(items, index);
        } else if (e.key === "Enter" && selected) {
            e.preventDefault();
            searchInput.value = selected.textContent;
            suggestionsContainer.style.display = "none";
            searchForm.submit();
        } else if (e.key === "Escape") {
            suggestionsContainer.style.display = "none";
        }
    };
    
    // Display suggestions
    function displaySuggestions(items, query = "") {
        if (items.length === 0) {
            suggestionsContainer.style.display = "none";
            return;
        }
        
        let html = '';
        items.forEach(item => {
            if (query) {
                const index = item.toLowerCase().indexOf(query.toLowerCase());
                if (index >= 0) {
                    const before = item.substring(0, index);
                    const match = item.substring(index, index + query.length);
                    const after = item.substring(index + query.length);
                    html += `<div class="suggestion-item">${before}<strong>${match}</strong>${after}</div>`;
                } else {
                    html += `<div class="suggestion-item">${item}</div>`;
                }
            } else {
                html += `<div class="suggestion-item">${item}</div>`;
            }
        });
        
        suggestionsContainer.innerHTML = html;
        suggestionsContainer.style.display = "block";
        
        // Add click handlers to suggestions
        suggestionsContainer.querySelectorAll(".suggestion-item").forEach(item => {
            item.onclick = function() {
                searchInput.value = this.textContent;
                suggestionsContainer.style.display = "none";
                searchForm.submit();
            };
            
            item.onmouseenter = function() {
                suggestionsContainer.querySelectorAll(".suggestion-item").forEach(s => {
                    s.classList.remove("selected");
                });
                this.classList.add("selected");
            };
        });
    }
    
    // Select a suggestion
    function selectSuggestion(items, index) {
        items.forEach(item => item.classList.remove("selected"));
        items[index].classList.add("selected");
        searchInput.value = items[index].textContent;
    }
}

// Bookmarks functionality
function initBookmarks() {
    const bookmarkItems = document.querySelectorAll(".bookmark-item");
    const savedBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    
    // If we have saved bookmarks, load them
    if (savedBookmarks.length > 0) {
        for (let i = 0; i < savedBookmarks.length && i < bookmarkItems.length; i++) {
            const bookmark = savedBookmarks[i];
            setBookmark(bookmarkItems[i], bookmark.name, bookmark.url);
        }
    }
    
    // Add click event listeners to all bookmark items
    bookmarkItems.forEach(item => {
        item.addEventListener("click", handleBookmarkClick);
        
        // Right-click to delete bookmark
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
    const bookmarkItems = document.querySelectorAll(".bookmark-item");
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