/**
 * Settings Module
 * Handles all functionality related to settings modal and preferences
 */

import { fetchWeatherData, fetchWeatherByCity, updateTime } from './weather-time.js';
import { updateCrypto } from './crypto.js';

// Initialize settings functionality
export function initSettings() {
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
        updateTime();
        
        // Update crypto display (if needed)
        updateCrypto();
        
        // Close modal
        modal.style.display = "none";
    });
    
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
}

// Load current settings into form
function loadCurrentSettings() {
    const timeFormatSelect = document.getElementById("time-format");
    const dateFormatSelect = document.getElementById("date-format");
    const useLocationCheckbox = document.getElementById("use-location");
    const manualLocationContainer = document.getElementById("manual-location-container");
    const cityInput = document.getElementById("city-input");
    
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