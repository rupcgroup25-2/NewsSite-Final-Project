
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

function renderHomeTab() {
    $("#home").html(`
    <div class="mb-4">
      <h2 class="h4">Welcome to News Hub</h2>
      <p class="text-muted">Stay updated with the latest news tailored to your interests.</p>
    </div>
    <div class="mb-3">
      <div class="btn-group" role="group" aria-label="Category filter">
        <button class="btn btn-outline-secondary btn-sm" data-category="all">All</button>
        ${availableTags.map(tag => `
          <button class="btn btn-outline-secondary btn-sm" data-category="${tag.id}">
            ${tag.name}
          </button>`).join("")}
      </div>
    </div>
    <div class="row" id="articles-list"></div>
  `);

    // Render all articles by default
    renderArticles("all");
}

// Renders the articles list filtered by a specific category
function renderArticles(category) {
    let filtered = sampleArticles;
    if (category !== "all") {
        filtered = filtered.filter(article => article.category === category);
    }

    const $list = $("#articles-list");
    $list.empty();

    filtered.forEach(article => {
        const isSaved = savedArticles.includes(article.id);
        const tagColor = availableTags.find(t => t.id === article.category)?.color || 'secondary';

        $list.append(`
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${article.imageUrl}" class="card-img-top" alt="${article.title}">
          <div class="card-body">
            <h5 class="card-title">${article.title}</h5>
            <p class="card-text">${article.preview}</p>
            <span class="badge bg-${tagColor}">${article.category}</span>
            <div class="mt-2 text-muted small">${formatDate(article.publishedAt)}</div>
            <div class="mt-3 d-flex gap-2">
              <button class="btn btn-outline-primary btn-sm flex-fill">
                <a href="article.html?id=${article.id}" style="text-decoration:none" target="_blank">View</a>
              </button>
              <button class="btn btn-${isSaved ? 'success' : 'outline-success'} btn-sm save-article-btn" data-id="${article.id}">
                ${isSaved ? 'Saved' : 'Save'}
              </button>
              <button class="btn btn-outline-info btn-sm share-article-btn" data-id="${article.id}">Share</button>
              <button class="btn btn-outline-danger btn-sm report-article-btn" data-id="${article.id}">Report</button>
            </div>
          </div>
        </div>
      </div>
    `);
    });
}

// Event handlers
$(document).ready(function () {
    renderHomeTab();
})

// Category filter
$(document).on('click', '[data-category]', function () {
    const cat = $(this).data('category');
    
    // Clear search results when switching categories
    clearSearchResults();
    
    // Render articles for the selected category
    renderArticles(cat);
});

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
let currentCategory = "all";

function renderHomeTab() {
    // Render the hero section placeholder
    $("#home").html(`
        <div id="hero-article"></div>
        <div class="mb-4">
            <ul class="nav nav-pills flex-wrap gap-2 justify-content-center justify-content-md-start" id="category-pills" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" data-category="all" type="button" role="tab">All</button>
                </li>
                ${availableTags.map(tag => `
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-category="${tag.id}" type="button" role="tab">${tag.name}</button>
                    </li>
                `).join("")}
            </ul>
        </div>
        <div class="mb-4">
            <div class="row">
                <div class="col-md-6">
                    <input type="text" id="archiveQuery" class="form-control" placeholder="Search articles by topic...">
                </div>
                <div class="col-md-2">
                    <input type="date" id="fromDate" class="form-control">
                </div>
                <div class="col-md-2">
                    <input type="date" id="toDate" class="form-control">
                </div>
                <div class="col-md-2">
                    <button class="btn btn-primary w-100" onclick="searchArchive()">
                        <i class="bi bi-search"></i> Search
                    </button>
                </div>
            </div>
        </div>
        <div id="archiveResults" class="mb-4"></div>
        <div class="row" id="articles-list"></div>`);
    // Fetch and render hero + articles
    renderArticlesWithHero("all");
}
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
    const tag = availableTags.find(t => t.id === article.category) || { color: "secondary", name: "General" };
    $("#hero-article").html(`
        <div class="card mb-4 shadow-lg border-0 overflow-hidden">
            <div class="row g-0 align-items-stretch flex-md-row flex-column-reverse">
                <div class="col-md-7 d-flex flex-column justify-content-center p-4">
                    <div class="mb-2">
                        <span class="badge bg-${tag.color} me-2">${tag.name}</span>
                        <span class="text-muted small">${formatDate(article.publishedAt)}</span>
                    </div>
                    <h2 class="card-title display-6 fw-bold mb-3">${article.title}</h2>
                    <p class="card-text lead mb-4">${article.preview}</p>
                    <div>
                        <a href="${article.url}" target="_blank" class="btn btn-primary btn-lg px-4">
                            <i class="bi bi-box-arrow-up-right me-1"></i>Read Full Article
                        </a>
                    </div>
                </div>
                <div class="col-md-5 d-flex align-items-stretch">
                    <img src="${article.imageUrl}" class="img-fluid w-100 object-fit-cover" alt="${article.title}" style="min-height: 280px;">
                </div>
            </div>
        </div>
    `);
}

function renderArticles(category) {
    fetchArticlesByCategory(category);
}

async function fetchAllArticlesOncePerDay() {

    // Check cache
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
        const apiCategory = categoryMapping[cat];
        let url = serverUrl + `Articles/top-headlines/pageSize/12/language/en/country/us`;
        if (apiCategory) {
            url += `/category/${apiCategory}`;
        }

        return $.ajax({ url, method: "GET" })
            .then(response => {
                if (response.articles && Array.isArray(response.articles)) {
                    const rawArticles = response.articles;
                    const filtered = rawArticles.filter(article => article.title && article.description && article.urlToImage);
                    let output = filtered.map((article, index) => ({
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
                    return output;
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
    // Only save to cache if articles exist
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


// Replace fetchArticlesByCategory to use cache
function fetchArticlesByCategory(category) {
    const $list = $("#articles-list");
    $list.html('<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');
    currentCategory = category;
    // Update category pills highlighting
    $('#category-pills .nav-link').removeClass('active');
    $(`#category-pills .nav-link[data-category="${category}"]`).addClass('active');

    // Try cache first
    let articles = getCachedArticles();
    if (articles) {
        renderHeroAndArticles(filterArticlesByCategory(articles, category));
        return;
    }
    // If not cached, fetch and then render
    fetchAllArticlesOncePerDay().then(allArticles => {
        renderHeroAndArticles(filterArticlesByCategory(allArticles, category));
    }).catch(() => {
        showError("Failed to fetch articles. Please try again later.");
    });
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
                <div class="card shadow-sm rounded-4 h-100 border-0 overflow-hidden">
                    <div class="position-relative">
                        <img src="${article.imageUrl}" class="card-img-top object-fit-cover" alt="${article.title}" style="height: 220px;">
                        <div class="position-absolute top-0 start-0 w-100 px-3 pt-3 d-flex justify-content-between align-items-start" style="z-index:2;">
                            <span class="badge bg-${tag.color} fs-6 shadow">${tag.name}</span>
                            <span class="badge bg-dark bg-opacity-75 text-light small">${formatDate(article.publishedAt)}</span>
                        </div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title mb-2">${article.title}</h5>
                        <p class="card-text text-muted flex-grow-1">${article.preview}</p>
                        <div class="mb-2 text-end small text-secondary">Source: ${article.source}</div>
                        <div class="d-flex flex-wrap gap-2 mt-auto">
                            
                            <a href="article.html?id=${article.id}" class="btn btn-outline-primary flex-fill" style="text-decoration:none" target="_blank">View</a>
                            
                            <button class="btn btn-${isSaved ? 'success' : 'outline-success'} save-article-btn flex-fill" data-id="${article.id}">
                                <i class="fas fa-bookmark me-1"></i>${isSaved ? 'Saved' : 'Save'}
                            </button>
                            <button class="btn btn-outline-info share-article-btn flex-fill" data-id="${article.id}">
                                <i class="fas fa-share me-1"></i>Share
                            </button>
                            <button class="btn btn-outline-danger report-article-btn flex-fill" data-id="${article.id}">
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

// --- Save Article ---
function saveSCB(responseText) {
    alert(responseText);
    renderArticles(currentCategory);
}

function saveECB() {
    alert("Failed to save article");
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
    alert(responseText);
    renderArticles(currentCategory);
}

function shareECB(xhr) {
    alert(xhr.responseText || "Failed to share article.");
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
    alert("Report submitted successfully.");
    // המודל והשדות יתנקו ב-articleActions.js
}

function reportECB(xhr) {
    alert(xhr.responseText || "Failed to submit report.");
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

// Guardian API search function
async function searchArchive() {
    const query = $('#archiveQuery').val().trim();
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    const fromDate = $('#fromDate').val();
    const toDate = $('#toDate').val();
    
    $('#archiveResults').html('<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');
    
    try {
        const results = await searchGuardianAPI(query, fromDate, toDate);
        displayArchiveResults(results);
        // Hide regular articles when showing search results
        $('#articles-list').hide();
        $('#hero-article').hide();
    } catch (error) {
        $('#archiveResults').html('<div class="alert alert-danger">Search failed. Please try again.</div>');
    }
}

async function searchGuardianAPI(query, fromDate = null, toDate = null) {
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

function displayArchiveResults(articles) {
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
        const tag = { color: "secondary", name: "Archive" }; // Default tag for search results
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
            category: "Archive",
            fullText: article.description || article.content || '' // Add fullText field
        };
        
        // Store the article in searchArticles array
        searchArticles.push(articleObj);
        
        html += `
            <div class="col-md-6 col-lg-4 mb-4 d-flex align-items-stretch">
                <div class="card shadow-sm rounded-4 h-100 border-0 overflow-hidden">
                    <div class="position-relative">
                        <img src="${article.urlToImage || 'https://via.placeholder.com/300x200'}" class="card-img-top object-fit-cover" alt="${article.title}" style="height: 220px;">
                        <div class="position-absolute top-0 start-0 w-100 px-3 pt-3 d-flex justify-content-between align-items-start" style="z-index:2;">
                            <span class="badge bg-${tag.color} fs-6 shadow">${tag.name}</span>
                            <span class="badge bg-dark bg-opacity-75 text-light small">${formatDate(article.publishedAt)}</span>
                        </div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title mb-2">${article.title}</h5>
                        <p class="card-text text-muted flex-grow-1">${article.description || 'No description available'}</p>
                        <div class="mb-2 text-end small text-secondary">Source: ${article.source || 'Unknown'}</div>
                        <div class="d-flex flex-wrap gap-2 mt-auto">
                            
                            <a href="article.html?id=${articleId}" class="btn btn-outline-primary flex-fill" style="text-decoration:none" target="_blank">View</a>
                            
                            <button class="btn btn-${isSaved ? 'success' : 'outline-success'} save-article-btn flex-fill" data-id="${articleId}">
                                <i class="fas fa-bookmark me-1"></i>${isSaved ? 'Saved' : 'Save'}
                            </button>
                            <button class="btn btn-outline-info share-article-btn flex-fill" data-id="${articleId}">
                                <i class="fas fa-share me-1"></i>Share
                            </button>
                            <button class="btn btn-outline-danger report-article-btn flex-fill" data-id="${articleId}">
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
    currentCategory = "all";
}
