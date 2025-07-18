// Sample data and state
const articlesDict = {
    "All" : [],
    "sports": [],
    "business": []
};

availableTags = [
    { id: "technology", name: "Technology", color: "primary" },
    { id: "health", name: "Health", color: "success" },
    { id: "sports", name: "Sports", color: "warning" },
    { id: "business", name: "Business", color: "info" },
    { id: "entertainment", name: "Entertainment", color: "danger" },
    { id: "environment", name: "Environment", color: "secondary" },
];

let currentUser = JSON.parse(localStorage.getItem('user'));
let savedArticles = [];
let sharedArticles = [];
let userTags = [];
let users = [/* ... */];
let articleComments = {};
let articleReports = [];

const NEWS_API_KEY = "7c45000aa11241f2bed13189e946fb47";
const NEWS_CACHE_KEY = "newsApiCacheV2";
const NEWS_CATEGORIES = ["technology", "health", "sports", "business", "entertainment", "environment"];

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