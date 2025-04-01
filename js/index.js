/**
 * Dashboard Application - Main Entry Point
 * Initializes all modules and manages their interactions
 */

// Import modules
import { initCrypto } from './modules/crypto.js';
import { initWeatherTime } from './modules/weather-time.js';
import { initSettings } from './modules/settings.js';
import { initSearchBookmarks } from './modules/search-bookmarks.js';
import { initBackground } from './modules/background.js';
import { initNotes } from './modules/notes.js';
import { initNews } from './modules/news.js';

// Initialize the application
function initApp() {
    initBackground();
    initCrypto();
    initWeatherTime();
    initSearchBookmarks();
    initSettings();
    initNotes();
    initNews();
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp); 