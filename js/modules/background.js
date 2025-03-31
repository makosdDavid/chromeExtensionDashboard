/**
 * Background Module
 * Handles all functionality related to background image
 */

// Initialize background module
export function initBackground() {
    // Load initial background image
    fetchBackgroundImage();
    
    // Add event listener for next image button
    document.getElementById("next-image").addEventListener("click", fetchBackgroundImage);
}

// Fetch and display a random background image
function fetchBackgroundImage() {
    fetch("https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature")
        .then(res => res.json())
        .then(data => {
            document.body.style.backgroundImage = `url(${data.urls.regular})`;
            document.getElementById("author").textContent = `By: ${data.user.name}`;
        })
        .catch(err => {
            // Fallback image if API fails
            document.body.style.backgroundImage = `url(https://images.unsplash.com/photo-1560008511-11c63416e52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyMTEwMjl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2MjI4NDIxMTc&ixlib=rb-1.2.1&q=80&w=1080)`;
            document.getElementById("author").textContent = `By: Dodi Achmad`;
        });
} 