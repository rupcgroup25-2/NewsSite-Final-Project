
// Renders the Home tab: welcome message, category filter buttons, and the articles container
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
                <div class="col-md-5 bg-dark d-flex align-items-center justify-content-center" style="min-height:260px;">
                    <img src="${article.imageUrl}" class="img-fluid w-100 h-100 object-fit-cover" alt="${article.title}" style="max-height:340px; object-fit:cover;">
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
        } catch (e) { /* ignore */ }
    }

    // Fetch all categories
    let allArticles = [];
    for (const cat of NEWS_CATEGORIES) {
        let url = `https://newsapi.org/v2/top-headlines?apiKey=${NEWS_API_KEY}&pageSize=12&language=en&country=us`;
        const apiCategory = categoryMapping[cat];
        if (apiCategory) url += `&category=${apiCategory}`;
        try {
            // eslint-disable-next-line no-await-in-loop
            const response = await $.ajax({ url, method: "GET" });
            if (response.status === "ok" && response.articles) {
                const articles = response.articles
                    .filter(article => article.title && article.description && article.urlToImage)
                    .map((article, index) => ({
                        id: `api_${cat}_${Date.now()}_${index}`,
                        title: article.title,
                        content: article.content || article.description,
                        preview: article.description,
                        category: cat,
                        publishedAt: article.publishedAt,
                        imageUrl: article.urlToImage,
                        url: article.url,
                        source: article.source.name
                    }));
                allArticles = allArticles.concat(articles);
            }
        } catch (e) {
            // Optionally handle per-category error
        }
    }
    // Save to cache
    fetchedArticles = allArticles;
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ date: new Date().toISOString(), articles: allArticles }));
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

//Saving the clicked article to the user
$(document).on('click', '.save-article-btn', function () {
    const articleId = $(this).data('id');
    const article = getArticleById(articleId);
    saveArticle(article);
});


function saveSCB(responseText) {
    alert(responseText);
    savedArticles.push(article.id);
    renderArticles(currentCategory);
}

function saveECB() {
    alert("Failed to save article");
}

function getArticleById(id) {
    return fetchedArticles.find(a => a.id === id);
}

//to save the article id on the other share button
$(document).on('click', '.share-article-btn', function () {
    const articleId = $(this).data("id");
    $('#btnShareArticle').data("id", articleId);
    $('#shareModal').modal('show');
});

//Sharing the clicked article to the user

$(document).on('click', '#btnShareArticle', function () {
    if (!currentUser) {
        alert("Please login to share articles.");
        return;
    }

    const articleId = $(this).data("id");
    const comment = $("#shareComment").val()?.trim() || ""; 
    const article = getArticleById(articleId);

    if (!article) {
        alert("Article not found.");
        return;
    }

    const articleToSend = {
        comment: comment,
        id: 0, 
        title: article.title || "",
        description: article.preview || "",
        url: article.url || "",
        urlToImage: article.imageUrl || "",
        publishedAt: article.publishedAt || new Date().toISOString(),
        sourceName: article.source || "",
        author: article.author || "",
        sharedById: 0,
        sharedByName: "string"
    };

    ajaxCall(
        "POST",
        serverUrl + `Articles/ShareArticle?userId=${currentUser.id}`,
        JSON.stringify(articleToSend),
        function success(responseText) {
            alert(responseText);
            sharedArticles.push(article.id);
            renderArticles(currentCategory);
        },
        function error(xhr) {
            alert(xhr.responseText || "Failed to share article.");
        }
    );
});

//report the article by the user
$(document).on('click', '.report-article-btn', function () {
    const articleId = $(this).data("id");
    $('#btnReportArticle').data("id", articleId); // שמירת ID
    $('#reportModal').modal('show');
});

$(document).on('click', '#btnReportArticle', function () {
    if (!currentUser) {
        alert("Please login to report articles.");
        return;
    }

    const articleId = $(this).data("id"); 
    const reason = $("#reportReason").val();
    const comment = $("#reportComment").val()?.trim() || "";

    if (!reason) {
        alert("Please select a reason for reporting.");
        return;
    }

    const article = getArticleById(articleId);
    if (!article) {
        alert("Article not found.");
        return;
    }

    const reportToSend = {
        id: 0,
        reporterId: currentUser.id,
        articleId: 0,
        sharedArticleId: null,
        comment: reason + (comment ? ` - ${comment}` : ""),
        reportedAt: new Date().toISOString()
    };

    const articleToSend = {
        comment: "",
        id: 0,
        title: article.title || "",
        description: article.preview || "",
        url: article.url || "",
        urlToImage: article.imageUrl || "",
        publishedAt: article.publishedAt || new Date().toISOString(),
        sourceName: article.source || "",
        author: article.author || "",
        sharedById: 0,
        sharedByName: "string"
    };

    const data = {
        Report: reportToSend,
        Article: articleToSend
    };

    ajaxCall(
        "POST",
        serverUrl + "Reports",
        JSON.stringify(data),
        function success(responseText) {
            alert("Report submitted successfully.");
            $('#reportModal').modal('hide');
            $("#reportComment").val("");
            $("#reportReason").val("");
        },
        function error(xhr) {
            alert(xhr.responseText || "Failed to submit report.");
        }
    );
});