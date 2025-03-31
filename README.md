# Chrome Extension Dashboard

A customizable dashboard for Chrome browser with various widgets and features.

## Project Structure

The project is organized in a modular way to make it maintainable and extensible:

```
.
├── index.html        # Main HTML file
├── index.css         # Main CSS styles
├── js/               # JavaScript files
│   ├── index.js      # Main entry point that imports and initializes all modules
│   └── modules/      # Individual feature modules
│       ├── background.js      # Background image functionality
│       ├── crypto.js          # Cryptocurrency display and search
│       ├── news.js            # News feed functionality (future feature)
│       ├── notes.js           # Notes functionality (future feature)
│       ├── search-bookmarks.js # Search bar and bookmarks
│       ├── settings.js        # Settings and preferences
│       └── weather-time.js    # Weather display and clock
```

## Features

Current features:
- Random nature background images
- Cryptocurrency price tracking with chart
- Weather display with location customization
- Time and date display with format options
- Search bar with multiple search engine options
- Bookmarks with quick access
- Settings for customizing display preferences

Future features:
- Notes functionality
- News feed
- Additional customization options

## Modular Design

The dashboard uses a modular JavaScript architecture where:
- Each feature is contained in its own module
- Modules export initialization functions and APIs
- The main index.js file orchestrates the interaction between modules
- This structure makes it easy to add new features or modify existing ones without affecting other parts of the application

## Development

To add a new feature:
1. Create a new module in js/modules/
2. Export an initialization function
3. Import and call the initialization function in index.js

## Usage

Simply open index.html in a browser to use the dashboard. For a Chrome extension, additional manifest.json configuration is required.
