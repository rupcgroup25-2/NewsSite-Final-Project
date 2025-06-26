// index.js — for index.html

// --- BEGIN: Copied/Adapted from home.js ---
const NEWS_API_KEY = "7c45000aa11241f2bed13189e946fb47";
const availableTags = [
    { id: "technology", name: "Technology", color: "primary" },
    { id: "health", name: "Health", color: "success" },
    { id: "sports", name: "Sports", color: "warning" },
    { id: "business", name: "Business", color: "info" },
    { id: "entertainment", name: "Entertainment", color: "danger" },
    { id: "environment", name: "Environment", color: "secondary" },
];
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
let savedArticles = [];

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function renderHomeTab() {
    $("#home").html(`
    <div class="mb-4">
      <h2 class="h4">Welcome to News Hub</h2>
      <p class="text-muted">Stay updated with the latest news tailored to your interests.</p>
    </div>
    <div class="mb-3">
      <div class="btn-group" role="group" aria-label="Category filter">
        <button class="btn btn-secondary btn-sm" data-category="all">All</button>
        ${availableTags.map(tag => `<button class="btn btn-outline-secondary btn-sm" data-category="${tag.id}">${tag.name}</button>`).join("")}
      </div>
    </div>
    <div class="row" id="articles-list"></div>
  `);
    fetchArticlesByCategory("all");
}

function fetchArticlesByCategory(category) {
    // Show loading spinner
    const $list = $("#articles-list");
    $list.html('<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');

    currentCategory = category;

    // Update category button styles
    $('[data-category]').removeClass('btn-secondary').addClass('btn-outline-secondary');
    $(`[data-category="${category}"]`).removeClass('btn-outline-secondary').addClass('btn-secondary');

    let url = `https://newsapi.org/v2/top-headlines?apiKey=${NEWS_API_KEY}&pageSize=12&language=en&country=us`;

    // If not "all", add category param
    if (category && category !== "all") {
        const apiCategory = categoryMapping[category];
        if (apiCategory) {
            url += `&category=${apiCategory}`;
        }
    }

    $.ajax({
        url: url,
        method: "GET",
        success: function (response) {
            if (response.status === "ok" && response.articles) {
                fetchedArticles = response.articles
                    .filter(article => article.title && article.description && article.urlToImage)
                    .map((article, index) => ({
                        id: `api_${Date.now()}_${index}`,
                        title: article.title,
                        content: article.content || article.description,
                        preview: article.description,
                        category: category === "all" ? "general" : category,
                        publishedAt: article.publishedAt,
                        imageUrl: article.urlToImage,
                        url: article.url,
                        source: article.source.name
                    }));

                renderExternalArticles(fetchedArticles);
            } else {
                showError("No articles found for this category.");
            }
        },
        error: function (xhr, status, error) {
            console.error("News API error:", error);
            if (xhr.status === 429) {
                showError("API rate limit exceeded. Please try again later.");
            } else if (xhr.status === 401) {
                showError("API key is invalid. Please check your API key.");
            } else {
                showError("Failed to fetch articles. Please try again later.");
            }
        }
    });
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
            <div class="col-md-4 mb-4">
                <div class="card h-100 article-card">
                    <img src="${article.imageUrl}" class="card-img-top" alt="${article.title}" onerror="this.src='public/placeholder.svg';">
                    <div class="card-body">
                        <h5 class="card-title article-title">${article.title}</h5>
                        <p class="card-text article-preview">${article.preview}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-${tag.color}">${tag.name}</span>
                            <small class="text-muted">${formatDate(article.publishedAt)}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">Source: ${article.source}</small>
                        </div>
                        <div class="d-flex gap-2 flex-wrap">
                            <a href="${article.url}" target="_blank" class="btn btn-primary btn-sm">
                                <i class="fas fa-external-link-alt me-1"></i>Read More
                            </a>
                            <button class="btn btn-${isSaved ? 'success' : 'outline-success'} btn-sm save-article-btn" data-id="${article.id}">
                                <i class="fas fa-bookmark me-1"></i>${isSaved ? 'Saved' : 'Save'}
                            </button>
                            <button class="btn btn-outline-info btn-sm share-article-btn" data-id="${article.id}">
                                <i class="fas fa-share me-1"></i>Share
                            </button>
                            <button class="btn btn-outline-danger btn-sm report-article-btn" data-id="${article.id}">
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

// --- END: Copied/Adapted from home.js ---

// Setup category filter click events for API-based logic
$(document).on("click", "[data-category]", function () {
    const category = $(this).data("category");
    fetchArticlesByCategory(category);
});
