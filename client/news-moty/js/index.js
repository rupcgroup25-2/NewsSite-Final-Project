
// Renders the Home tab: welcome message, category filter buttons, and the articles container
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user == 'admin@newshub.com')
        return true;
    else return false
}

function AdminLinkIfNeeded() {
    if (isAdmin()) {
        // מוסיף ל־navbar
        const navList = document.querySelector('.navbar-nav');
        const adminItem = document.createElement('li');
        adminItem.className = 'nav-item';
        adminItem.innerHTML = '<a class="nav-link" href="admin.html">Admin</a>';
        navList.appendChild(adminItem);

        // מוסיף גם ל־footer
        const footerNav = document.querySelector('footer ul.nav');
        if (footerNav) {
            const footerItem = document.createElement('li');
            footerItem.className = 'nav-item';
            footerItem.innerHTML = '<a class="nav-link text-muted" href="admin.html">Admin</a>';
            footerNav.appendChild(footerItem);
        }
    }
}

document.addEventListener('DOMContentLoaded', AdminLinkIfNeeded);

// Renders the articles list filtered by a specific category
// Add NewsAPI category mapping
const categoryMapping = {
    technology: "technology",
    health: "health",
    sports: "sports",
    business: "business",
    entertainment: "entertainment",
    environment: "science", // NewsAPI does not have 'environment', use 'science' as closest
};

let fetchedArticles = [];
let searchArticles = []; // Store search results articles
let currentCategory = (currentUser && currentUser.tags && currentUser.tags.length !== 0) ? "recommended" : "all";

function renderHomeTab() {
    console.log('current user tags', currentUser ? currentUser.tags : 'No user logged in');
    // Render the hero section placeholder
    $("#home").html(`
        <div id="hero-article"></div>
        <div class="category-pills mb-4">
            <ul class="nav nav-pills flex-wrap gap-2 justify-content-center justify-content-md-start" id="category-pills" role="tablist">
                ${(currentUser && currentUser.tags && currentUser.tags.length === 0) || !currentUser ? `<li class="nav-item" role="presentation">
                    <button class="nav-link category-pill active" data-category="all" type="button" role="tab">All</button>
                </li>`
                :
                `<li class="nav-item" role="presentation">
                    <button class="nav-link category-pill active" data-category="recommended" type="button" role="tab">Recommended</button>
                </li>`}
                ${availableTags.filter(tag => tag.name.toLowerCase() !== 'recommended').map(tag => `
                <li class="nav-item" role="presentation">
                    <button class="nav-link category-pill" data-category="${tag.id}" type="button" role="tab">${tag.name}</button>
                </li>`).join("")}

            </ul>
        </div>
        <div class="search-section mb-4">
            <div class="row g-3">
                <div class="col-12 col-md-6">
                    <label for="archiveQuery" class="form-label fw-bold">Search Topic</label>
                    <input type="text" id="archiveQuery" class="form-control search-input" placeholder="Search articles by topic...">
                </div>
                <div class="col-6 col-md-2">
                    <label for="fromDate" class="form-label fw-bold">From Date</label>
                    <input type="date" id="fromDate" class="form-control search-date-input">
                </div>
                <div class="col-6 col-md-2">
                    <label for="toDate" class="form-label fw-bold">To Date</label>
                    <input type="date" id="toDate" class="form-control search-date-input">
                </div>
                <div class="col-12 col-md-2">
                    <label class="form-label d-none d-md-block">&nbsp;</label>
                    <button class="btn search-btn w-100" onclick="searchArchive()">
                        <i class="bi bi-search"></i> Search
                    </button>
                </div>
            </div>
            <div id="tagArea" class="mb-3"></div>
        </div>
        <div id="archiveResults" class="mb-4"></div>
        <div class="row" id="articles-list"></div>
        <div id="load-more-container" class="text-center mt-3"></div>`);
    // Fetch and render hero + articles
    renderArticlesWithHero((currentUser && currentUser.tags && currentUser.tags.length !== 0) ? "recommended" : "all");
}

// Event handlers
$(document).ready(function () {
    renderHomeTab();
    loadFiveTrendingTags("United States");
});

// Category filter
$(document).on('click', '[data-category]', function () {
    const cat = $(this).data('category');
    // Clear search results when switching categories
    clearSearchResults();
    
    // Render articles for the selected category
    fetchArticlesByCategory(cat);
});

function renderArticlesWithHero(category) {
    // Try cache first
    let articles = getCachedArticles();
    if (articles) {
        renderHeroAndArticles(filterArticlesByCategory(articles, category));
        return;
    }
    fetchAllArticlesOncePerDay().then(allArticles => {
        renderHeroAndArticles(filterArticlesByCategory(allArticles, category));
    }).catch(() => {
        showError("Failed to fetch articles. Please try again later.");
    });
}

function renderHeroAndArticles(articles) {
    if (!articles || articles.length === 0) {
        $("#hero-article").html("");
        renderExternalArticles([]);
        return;
    }
    // Show the first article as hero
    renderHeroArticle(articles[0]);
    // Render the rest as cards
    renderExternalArticles(articles.slice(1));
}

function renderHeroArticle(article) {
    if (!article) {
        $("#hero-article").html("");
        return;
    }
    const tag = availableTags.find(t => t.id === article.category) || { color: "secondary", name: "Recommended" };
    $("#hero-article").html(`
        <div class="card mb-4 shadow-lg border-0 overflow-hidden hero-article-card">
            <div class="row g-0 align-items-stretch flex-md-row flex-column-reverse">
                <div class="col-md-7 d-flex flex-column justify-content-center p-4 hero-content">
                    <div class="mb-3">
                        <span class="badge bg-${tag.color} me-2 hero-tag">${tag.name}</span>
                        <span class="text-muted small hero-date">${formatDate(article.publishedAt)}</span>
                    </div>
                    <h2 class="card-title display-5 fw-bold mb-3 hero-title">${article.title}</h2>
                    <p class="card-text lead mb-4 hero-preview">${article.preview}</p>
                    <div>
                        <a href="${article.url}" target="_blank" class="btn btn-lg px-4 hero-btn">
                            <i class="bi bi-box-arrow-up-right me-2"></i>Read Full Article
                        </a>
                    </div>
                </div>
                <div class="col-md-5 d-flex align-items-stretch">
                    <img src="${article.imageUrl}" class="img-fluid w-100 hero-article-image" alt="${article.title}">
                </div>
            </div>
        </div>
    `);
}

async function fetchAllArticlesOncePerDay() {
    const cacheRaw = localStorage.getItem(NEWS_CACHE_KEY);
    if (cacheRaw) {
        try {
            const cache = JSON.parse(cacheRaw);
            if (cache.articles && isToday(cache.date)) {
                return cache.articles;
            }
        } catch (e) {
            // ignore cache parse errors
        }
    }

    const timestamp = Date.now();

    const ajaxPromises = NEWS_CATEGORIES.map(cat => {
        if (cat === "recommended") {
            // Send POST request with tags
            const tags = currentUser?.tags || [];
            return $.ajax({
                url: serverUrl + `Articles/recommendedArticles/pageSize/100/language/en`,
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(tags)
            }).then(response => {
                const filtered = response.filter(article => article.title && article.description && article.urlToImage);
                return filtered.map((article, index) => ({
                    id: `recommended_${timestamp}_${index}`,
                    title: article.title,
                    content: article.content || article.description,
                    preview: article.description,
                    category: cat,
                    publishedAt: article.publishedAt,
                    imageUrl: article.urlToImage,
                    url: article.url,
                    source: article.source
                }));
            }).catch(e => {
                console.error("Failed to fetch recommended articles", e);
                return [];
            });
        }

        // Normal category request
        const apiCategory = categoryMapping[cat];
        let url = `${serverUrl}Articles/top-headlines?pageSize=12&language=en&country=us`;
        if (apiCategory) {
            url += `&category=${encodeURIComponent(apiCategory)}`;
        }

        return $.ajax({ url, method: "GET" })
            .then(response => {
                if (response.articles && Array.isArray(response.articles)) {
                    const filtered = response.articles.filter(article => article.title && article.description && article.urlToImage);
                    return filtered.map((article, index) => ({
                        id: `api_${cat}_${timestamp}_${index}`,
                        title: article.title,
                        content: article.content || article.description,
                        preview: article.description,
                        category: cat,
                        publishedAt: article.publishedAt,
                        imageUrl: article.urlToImage,
                        url: article.url,
                        source: article.source.name
                    }));
                }
                return [];
            })
            .catch(e => {
                console.error(`Failed to fetch articles for category: ${cat}`, e);
                return [];
            });
    });

    const results = await Promise.all(ajaxPromises);
    const allArticles = results.flat();

    if (allArticles.length > 0) {
        const cacheValue = {
            date: new Date().toISOString(),
            articles: allArticles
        };
        localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(cacheValue));
    } else {
        console.log("No articles were fetched — skipping localStorage caching.");
    }

    fetchedArticles = allArticles;
    return allArticles;
}

function filterArticlesByCategory(articles, category) {
    if (category === "all") return articles;
    return articles.filter(a => a.category === category);
}

function renderExternalArticles(articles) {
    const $list = $("#articles-list");
    $list.empty();

    if (!articles || articles.length === 0) {
        $list.html('<div class="col-12"><div class="alert alert-warning text-center">No articles found for this category.</div></div>');
        return;
    }

    articles.forEach(article => {
        const isSaved = savedArticles.includes(article.id);
        const tag = availableTags.find(t => t.id === article.category) || { color: "secondary", name: "General" };

        $list.append(`
            <div class="col-md-6 col-lg-4 mb-4 d-flex align-items-stretch">
                <div class="card article-card">
                    <div class="position-relative">
                        <img src="${article.imageUrl}" class="card-img-top article-card-image" alt="${article.title}">
                        <div class="article-card-overlay">
                            <span class="badge bg-${tag.color} article-card-tag">${tag.name}</span>
                            <span class="badge article-card-date">${formatDate(article.publishedAt)}</span>
                        </div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="article-card-title">${article.title}</h5>
                        <p class="article-card-preview">${article.preview}</p>
                        <div class="article-card-source">Source: ${article.source}</div>
                        <div class="article-actions">
                            
                            <a href="article.html?id=${article.id}" class="btn article-action-btn article-view-btn" target="_blank">View</a>
                            
                            <button class="btn article-action-btn article-save-btn ${isSaved ? 'saved' : ''} save-article-btn" data-id="${article.id}">
                                <i class="fas fa-bookmark me-1"></i>${isSaved ? 'Saved' : 'Save'}
                            </button>
                            <button class="btn article-action-btn article-share-btn share-article-btn" data-id="${article.id}">
                                <i class="fas fa-share me-1"></i>Share
                            </button>
                            <button class="btn article-action-btn article-report-btn report-article-btn" data-id="${article.id}">
                                <i class="fas fa-flag me-1"></i>Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    });
}

function showError(message) {
    const $list = $("#articles-list");
    $list.html(`
        <div class="col-12">
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        </div>
    `);
}

function getArticleById(id) {
    // First try to find in regular articles
    let article = fetchedArticles.find(a => a.id === id);
    // If not found, try search articles
    if (!article) {
        article = searchArticles.find(a => a.id === id);
    }
    return article;
}

// --- Trending Tags ---
function loadFiveTrendingTags(country) {
    ajaxCall(
        "GET",
        serverUrl + `Tags/twitterTrends/${country}`,
        null,
        function (response) {
            $("#tagArea").empty();

            // Safely access the trends array
            const trends = response?.trending?.trends || [];

            // Take top 5 and extract 'name' field
            const topFive = trends.slice(0, 5).map(t => t.name.replace(/^#/, ""));

            $("#tagArea").text("Trending tags: ");
            // Create and append buttons
            topFive.forEach(tag => {
                const button = $(`<button class="btn btn-outline-primary m-1 hashtag-button">#${tag}</button>`);
                $("#tagArea").append(button);
            });

            const mapButton = $(`<button id="btnChooseCountry" class="btn btn-outline-secondary ms-2" title="Select Country"><i class="bi bi-globe2"></i></button>`);
            $("#tagArea").append(mapButton);
        },
        function (err) {
            console.error("Failed to load trending tags:", err);
        }
    );
}

function showCountryMapModal() {
    // removing existing map
    if ($('#countryMapModal').length) {
        $('#countryMapModal').remove();
        $('.jqvmap-label').remove();
    }

    const mapModal = `
    <div class="modal fade" id="countryMapModal" tabindex="-1" aria-labelledby="countryMapLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="countryMapLabel">Select a Country</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <div id="countryMapContainer" class="country-map-container"></div>
                    <p class="mt-2 text-muted">Click a country to load trending tags.</p>
                </div>
            </div>
        </div>
    </div>`;

    $('body').append(mapModal);

    // Wait for modal to be fully shown before rendering map
    $('#countryMapModal').on('shown.bs.modal', function () {

        $('#countryMapContainer').vectorMap({
            map: 'world_en',
            backgroundColor: 'transparent',
            hoverOpacity: 0,
            hoverColor: '#88c',
            onRegionClick: function (event, code) {
                $('#countryMapModal').modal('hide');
                loadFiveTrendingTags(countryCodeToName[code.toUpperCase()]); // Call your existing function
            }
        });
    });

    $('#countryMapModal').modal('show');
}

$(document).on('click', '#btnChooseCountry', function () {
    showCountryMapModal();
});


window.addEventListener('message', function (event) {
    const countryName = event.data?.countryName;
    if (countryName) {
        $('#countryMapModal').modal('hide');
        loadFiveTrendingTags(countryName);
    }
});

// Delegate click event for dynamic hashtag buttons
$(document).on('click', '.hashtag-button', function () {
    const tagText = $(this).text().replace(/^#/, ""); // remove '#' if exists
    $('#archiveQuery').val(tagText); // set the query input
    searchArchive(); // trigger search
});

// --- Save Article ---
function saveSCB(responseText) {
    showSuccessToast(responseText, "Article Saved");
    fetchArticlesByCategory(currentCategory);
}

function saveECB() {
    showErrorToast("Failed to save article", "Save Error");
}

$(document).on('click', '.save-article-btn', function () {
    const articleId = $(this).data('id');
    const article = getArticleById(articleId);
    saveArticle(article, saveSCB, saveECB);
});


// --- Share Article ---
$(document).on('click', '.share-article-btn', function () { //inserting the article id to the modal share button
    const articleId = $(this).data("id");
    $('#btnShareArticle').data("id", articleId);
    $('#shareModal').modal('show');
});

function shareSCB(responseText) {
    showSuccessToast(responseText, "Article Shared");
    fetchArticlesByCategory(currentCategory);
}

function shareECB(xhr) {
    showErrorToast(xhr.responseText || "Failed to share article.", "Share Error");
}

$(document).on('click', '#btnShareArticle', function () {
    const articleId = $(this).data("id");
    const comment = $("#shareComment").val()?.trim() || "";
    const article = getArticleById(articleId);
    shareArticle(article, comment, shareSCB, shareECB);
});

// --- Report Article ---
$(document).on('click', '.report-article-btn', function () { //inserting the article id to the modal report button
    const articleId = $(this).data("id");
    $('#btnReportArticle').data("id", articleId);
    $('#reportModal').modal('show');
});

function reportSCB(responseText) {
    showSuccessToast("Report submitted successfully.", "Report Submitted");
    // המודל והשדות יתנקו ב-articleActions.js
}

function reportECB(xhr) {
    showErrorToast(xhr.responseText || "Failed to submit report.", "Report Error");
    // המודל והשדות יתנקו ב-articleActions.js
}

$(document).on('click', '#btnReportArticle', function (e) {
    e.preventDefault(); // מנע submit רגיל של הטופס
    const articleId = $(this).data("id");
    const article = getArticleById(articleId);
    reportArticle(article, reportSCB, reportECB);
});

// מנע submit רגיל של טופס הדיווח
$(document).on('submit', '#reportForm', function (e) {
    e.preventDefault();
    $('#btnReportArticle').click();
});

// NewsApi search function
async function searchArchive() {
    const query = $('#archiveQuery').val().trim();
    if (!query) {
        showWarningToast('Please enter a search term', 'Search Required');
        return;
    }
    
    const fromDate = $('#fromDate').val();
    const toDate = $('#toDate').val();
    
    $('#archiveResults').html('<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');
    
    try {
        const results = await searchNewsAPI(query, fromDate, toDate);
        displayArchiveResults(results, query);
        // Hide regular articles when showing search results
        $('#articles-list').hide();
        $('#hero-article').hide();
    } catch (error) {
        $('#archiveResults').html('<div class="alert alert-danger">Search failed. Please try again.</div>');
    }
}

async function searchNewsAPI(query, fromDate = null, toDate = null) {
    const encodedQuery = encodeURIComponent(query);
    const fromSegment = fromDate ? `/${encodeURIComponent(fromDate)}` : "";
    const toSegment = toDate ? `/${encodeURIComponent(toDate)}` : "";
    const url = `${serverUrl}Articles/searchArticles/${encodedQuery}${fromSegment}${toSegment}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Search failed.");
        const articles = await response.json();
        return articles;
    } catch (error) {
        console.error("Error searching articles:", error);
        return [];
    }
}

function displayArchiveResults(articles, query) {
    if (!articles || articles.length === 0) {
        $('#archiveResults').html('<div class="alert alert-info">No articles found.</div>');
        return;
    }
    
    // Clear previous search articles
    searchArticles = [];
    
    let html = '<div class="d-flex justify-content-between align-items-center mb-3">';
    html += '<h5 class="mb-0">Archive Search Results</h5>';
    html += '<button class="btn btn-outline-secondary btn-sm" onclick="clearSearchResults()">Clear Search</button>';
    html += '</div>';
    html += '<div class="row">';
    
    articles.forEach((article, index) => {
        const articleId = `search_${index}_${Date.now()}`;
        const isSaved = savedArticles.includes(articleId);
        const tag = { color: "primary", name: query }; // Changed to primary for better visibility
        console.log(article.source);
        // Create article object for the action buttons
        const articleObj = {
            id: articleId,
            title: article.title,
            content: article.description,
            preview: article.description,
            description: article.description, // Add description field
            imageUrl: article.urlToImage,
            urlToImage: article.urlToImage, // Add urlToImage field  
            publishedAt: article.publishedAt,
            url: article.url,
            source: article.source || 'Unknown',
            sourceName: article.source || 'Unknown', // Add sourceName field
            author: article.author || 'Unknown',
            category: query,
            fullText: article.description || article.content || '' // Add fullText field
        };
        
        // Store the article in searchArticles array
        searchArticles.push(articleObj);
        
        html += `
            <div class="col-md-6 col-lg-4 mb-4 d-flex align-items-stretch">
                <div class="card article-card">
                    <div class="position-relative">
                        <img src="${article.urlToImage || 'https://via.placeholder.com/300x200'}" class="card-img-top article-card-image" alt="${article.title}">
                        <div class="article-card-overlay">
                            <span class="badge bg-primary text-white article-card-tag">${tag.name}</span>
                            <span class="badge article-card-date">${formatDate(article.publishedAt)}</span>
                        </div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="article-card-title">${article.title}</h5>
                        <p class="article-card-preview">${article.description || 'No description available'}</p>
                        <div class="article-card-source">Source: ${article.source || 'Unknown'}</div>
                        <div class="article-actions">
                            
                            <a href="article.html?id=${articleId}" class="btn article-action-btn article-view-btn" target="_blank">View</a>
                            
                            <button class="btn article-action-btn article-save-btn ${isSaved ? 'saved' : ''} save-article-btn" data-id="${articleId}">
                                <i class="fas fa-bookmark me-1"></i>${isSaved ? 'Saved' : 'Save'}
                            </button>
                            <button class="btn article-action-btn article-share-btn share-article-btn" data-id="${articleId}">
                                <i class="fas fa-share me-1"></i>Share
                            </button>
                            <button class="btn article-action-btn article-report-btn report-article-btn" data-id="${articleId}">
                                <i class="fas fa-flag me-1"></i>Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    // Store search articles in localStorage so articlePage can access them
    localStorage.setItem('searchArticles', JSON.stringify(searchArticles));
    
    console.log("Stored search articles:", searchArticles.length, "articles");
    
    $('#archiveResults').html(html);
}

function clearSearchResults() {
    $('#archiveResults').html('');
    $('#articles-list').show();
    $('#hero-article').show();
    $('#archiveQuery').val('');
    $('#fromDate').val('');
    $('#toDate').val('');
    searchArticles = []; // Clear search articles array
    localStorage.removeItem('searchArticles'); // Clear from localStorage
    
    // Reset category pills to show "All" as active
    $('#category-pills .nav-link').removeClass('active');
    $('#category-pills .nav-link[data-category="all"]').addClass('active');
    currentCategory = (currentUser && currentUser.tags && currentUser.tags.length !== 0) ? "recommended" : "all";
}

// Initialize Firebase and notifications when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Index page loaded, initializing notifications...');
    
    // הפעל את המערכת החדשה להתראות
    if (typeof window.initNotificationsOnPageLoad === 'function') {
        console.log('🔔 Using new notification system...');
        window.initNotificationsOnPageLoad();
    } else {
        console.log('⚠️ Notification system not found, will be initialized when available...');
    }
});

// ניהול מצב כמה מאמרים מוצגים כרגע בקטגוריה
let displayedCountByCategory = {};

function fetchArticlesByCategory(category) {
    const $list = $("#articles-list");
    $list.html('<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');
    currentCategory = category;
    displayedCountByCategory[category] = 0; // אפס ספירה כשמשנים קטגוריה
    // עדכון UI
    $('#category-pills .nav-link').removeClass('active');
    $(`#category-pills .nav-link[data-category="${category}"]`).addClass('active');

    let articles = getCachedArticles();
    if (articles) {
        renderArticlesPage(category, articles);
        return;
    }

    fetchMoreArticlesFromAPI().then(allArticles => {
        renderArticlesPage(category, allArticles);
    }).catch(() => {
        showError("Failed to fetch articles. Please try again later.");
    });
}

// פונקציה שמציגה עד 12 מאמרים נוספים
function renderArticlesPage(category, allArticles) {
    const PAGE_SIZE = 12;
    let filtered = filterArticlesByCategory(allArticles, category);
    let start = displayedCountByCategory[category] || 12;
    let end = start + PAGE_SIZE;

    let articlesToShow = filtered.slice(0, end);
    displayedCountByCategory[category] = articlesToShow.length;

    renderHeroAndArticles(articlesToShow);

    renderLoadMoreButton(category, filtered.length);
}

function renderLoadMoreButton(category) {
    const $container = $("#load-more-container");
    
    if (category !== "recommended") {
        $container.html(`<button id="load-more-btn" class="btn btn-primary">Load more articles</button>`);
        $("#load-more-btn").off("click").on("click", () => loadMoreArticles(category));
    } else {
        $container.html(''); // הסתרת הכפתור ב recommended
    }
}

async function loadMoreArticles(category) {
    const articles = getCachedArticles() || [];
    const categoryArticles = articles.filter(a => a.category === category);

    const currentlyDisplayed = displayedCountByCategory[category] || 12;
    const nextBatch = categoryArticles.slice(currentlyDisplayed, currentlyDisplayed + 12);

    if (nextBatch.length > 0) {
        // עדכן ספירה והצג מחדש
        displayedCountByCategory[category] = currentlyDisplayed + nextBatch.length;
        renderHeroAndArticles(categoryArticles.slice(0, displayedCountByCategory[category]));
    } else {
        // אם אין מספיק בלוקל, נסה למשוך מה־API
        try {
            const newArticles = await fetchMoreArticlesFromAPI(category, currentlyDisplayed, 12);
            if (newArticles.length > 0) {
                // עדכון הלוקל סטורג
                const updatedArticles = [...articles, ...newArticles];
                const cacheValue = {
                    date: new Date().toISOString(),
                    articles: updatedArticles
                };
                localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(cacheValue));

                // עדכן ספירה והצג
                displayedCountByCategory[category] = currentlyDisplayed + newArticles.length;
                renderHeroAndArticles(updatedArticles.filter(a => a.category === category).slice(0, displayedCountByCategory[category]));
            } else {
                alert("No more articles to load.");
            }
        } catch {
            showError("Error loading more articles.");
        }
    }
}

async function fetchMoreArticlesFromAPI(category, offset, limit) {
    const apiCategory = categoryMapping[category];
    const page = Math.floor(offset / limit) + 1;

    // בונים את ה-URL עם כל הפרמטרים בשורת השאילתה (query string)
    let url = `${serverUrl}Articles/top-headlines?pageSize=${limit}&language=en&country=us&page=${page}`;

    if (apiCategory) {
        url += `&category=${apiCategory}`;
    }

    try {
        const response = await $.ajax({ url, method: "GET" });
        console.log("API response:", response);
        if (response.articles && Array.isArray(response.articles)) {
            const filtered = response.articles.filter(article => article.title && article.description && article.urlToImage);
            const timestamp = Date.now();
            return filtered.map((article, index) => ({
                id: `api_${category}_${timestamp}_${index + offset}`,
                title: article.title,
                content: article.content || article.description,
                preview: article.description,
                category,
                publishedAt: article.publishedAt,
                imageUrl: article.urlToImage,
                url: article.url,
                source: article.source.name
            }));
        } else {
            console.error("No articles array in response");
            return [];
        }
    } catch (e) {
        console.error("API fetch failed", e);
        return [];
    }
}







