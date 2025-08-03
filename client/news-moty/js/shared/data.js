// Sample data and state
if (typeof articlesDict === 'undefined') {
    const articlesDict = {
        "All" : [],
        "sports": [],
        "business": []
    };
    window.articlesDict = articlesDict;
}

availableTags = [
    { id: "recommended", name: "Recommended", color: "dark" },
    { id: "technology", name: "Technology", color: "primary" },
    { id: "health", name: "Health", color: "success" },
    { id: "sports", name: "Sports", color: "warning" },
    { id: "business", name: "Business", color: "info" },
    { id: "entertainment", name: "Entertainment", color: "danger" },
    { id: "environment", name: "Environment", color: "secondary" },
];

let currentUser = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('currentUser'));
console.log('Initial currentUser loaded:', currentUser);
let savedArticles = [];
let sharedArticles = [];
let userTags = [];

// Function to update current user when it changes
function updateCurrentUser() {
    currentUser = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('currentUser'));
    console.log('Current user updated:', currentUser);
}

// Listen for storage changes to update currentUser
window.addEventListener('storage', function(e) {
    if (e.key === 'user' || e.key === 'currentUser') {
        updateCurrentUser();
    }
});
let users = [/* ... */];
let articleComments = {};
let articleReports = [];

const NEWS_CACHE_KEY = "newsApiCacheV2";
const NEWS_CATEGORIES = ["recommended", "technology", "health", "sports", "business", "entertainment", "environment"];

function getCachedArticles() {
    const cacheRaw = localStorage.getItem(NEWS_CACHE_KEY);
    if (cacheRaw) {
        try {
            const cache = JSON.parse(cacheRaw);
            if (cache.articles && isToday(cache.date)) {
                fetchedArticles = cache.articles;
                return cache.articles;
            }
        } catch (e) { /* ignore */ }
    }
    return null;
}