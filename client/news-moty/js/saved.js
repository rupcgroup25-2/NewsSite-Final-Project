// ================================================
// ================ SAVED ARTICLES ================
// ================================================

// Renders saved articles tab with search functionality
function renderSavedTab(searchTerm = "") {
    const $tab = $('#saved');

    if (!currentUser) {
        $tab.html(`
            <div class="access-required-container">
                <div class="access-required-card">
                    <div class="access-icon">
                        <i class="bi bi-bookmark-fill"></i>
                    </div>
                    <h4>Access Required</h4>
                    <p>Please log in to view your saved articles and manage your personal news collection.</p>
                    <div class="access-actions">
                        <button class="btn modern-btn-primary me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
                            <i class="bi bi-box-arrow-in-right me-2"></i>Login
                        </button>
                        <button class="btn modern-btn-outline" data-bs-toggle="modal" data-bs-target="#registerModal">
                            <i class="bi bi-person-plus me-2"></i>Sign Up
                        </button>
                    </div>
                </div>
            </div>
        `);
        return;
    }

    if (!savedArticles || savedArticles.length === 0) {
        $tab.html('<div class="saved-alert alert-secondary"><i class="bi bi-bookmark"></i> No saved articles found.</div>');
        return;
    }

    // If search box already exists, update only the content
    let $articlesContainer = $('#articles-container');
    if ($articlesContainer.length === 0) {
        // Create initial structure only once
        let html = `
            <div class="saved-container">
                <div class="saved-search-container">
                    <input type="text" id="savedSearchInput" class="form-control" placeholder="Search saved articles..." value="${searchTerm}">
                </div>
                <div id="articles-container" class="saved-articles-container"></div>
            </div>
        `;
        $tab.html(html);
        $articlesContainer = $('#articles-container');
    }

    // Update only card content
    const highlight = (text) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    };

    let articlesHtml = '';
    savedArticles.forEach((article, index) => {
        const tag = availableTags.find(t => t.name === (article.tags?.[0] || article.category)) || { color: "secondary", name: "General" };

        articlesHtml += `
        <div class="saved-article-card">
            <div class="row g-0">
                <div class="col-md-5">
                    <div class="saved-article-image">
                        <img src="${article.urlToImage}" alt="${article.title}">
                    </div>
                </div>
                <div class="col-md-7 saved-article-content">
                    <div class="saved-article-header">
                        <span class="saved-article-tag badge bg-${tag.color}">${tag.name}</span>
                        <span class="saved-article-date">${formatDate(article.publishedAt)}</span>
                    </div>

                    <h5 class="saved-article-title">${highlight(article.title)}</h5>
                    <p class="saved-article-description">${highlight(article.description || article.preview)}</p>
                    <div class="saved-article-source">Source: ${article.sourceName || article.source || ''}</div>

                    <div class="saved-article-actions">
                        <a href="article.html?id=${article.id}&collection=Saved" class="saved-btn saved-btn-view" target="_blank">
                            <i class="bi bi-eye"></i>View
                        </a>
                        <button class="saved-btn saved-btn-remove unsave-btn" data-id="${article.id}">
                            <i class="bi bi-trash-alt"></i>Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    });

    $articlesContainer.html(articlesHtml);
}

// ================================================
// ================ ARTICLE MANAGEMENT ============
// ================================================

// Handles removal of saved articles
$(document).on('click', '.unsave-btn', function () {
    const articleId = $(this).data('id');
    if (!currentUser) {
        showWarningToast("Please login to remove saved articles.", "Authentication Required");
        return;
    }

    ajaxCall("DELETE", serverUrl + `Articles/unsave?userId=${currentUser.id}&articleId=${articleId}`, null,
        function (data) {
            showSuccessToast(data, "Article Removed");
            savedArticles = savedArticles.filter(a => a.id !== articleId);
            renderSavedTab();
        },
        function (xhr) {
            showErrorToast(xhr.responseText || "Failed to remove article", "Error");
        }
    );
});

// ================================================
// ================ SEARCH FUNCTIONALITY ==========
// ================================================

// Debounced search handler for saved articles
if (typeof debounceTimer === 'undefined') {
    var debounceTimer;
}
$(document).on('input', '#savedSearchInput', function () {
    const searchTerm = $(this).val(); 

    clearTimeout(debounceTimer); 

    debounceTimer = setTimeout(() => {
        const trimmed = searchTerm.trim();
        if (currentUser) {
            if (trimmed.length >= 3) {
                loadSavedArticles(currentUser.id, trimmed);
            } else if (trimmed.length === 0) {
                loadSavedArticles(currentUser.id);
            }
        }
    }, 400);
});

// Load saved articles (with optional search)
function loadSavedArticles(userId, searchTerm = "") {
    const trimmedSearch = searchTerm.trim();
    const encodedSearch = encodeURIComponent(trimmedSearch);

    const url = trimmedSearch.length > 0
        ? `${serverUrl}Articles/search?userId=${userId}&word=${encodedSearch}`
        : `${serverUrl}Articles/saved/${userId}`;

    ajaxCall("GET", url, null,
        function (articles) {
            savedArticles = articles;
            renderSavedTab(searchTerm);
        },
        function () {
            renderError("Not found..");
        }
    );
}

// Renders error messages for saved articles section
function renderError(message) {
    const $tab = $('#saved');
    
    // If search box already exists, update only the content
    let $articlesContainer = $('#articles-container');
    if ($articlesContainer.length === 0) {
        const currentSearchTerm = "";
        let html = `
            <div class="saved-container">
                <div class="saved-search-container">
                    <input type="text" id="savedSearchInput" class="form-control" placeholder="Search saved articles..." value="${currentSearchTerm}">
                </div>
                <div id="articles-container" class="saved-articles-container"></div>
            </div>
        `;
        $tab.html(html);
        $articlesContainer = $('#articles-container');
    }
    
    // Modern server-style error card
    $articlesContainer.html(`
        <div class="d-flex justify-content-center align-items-center" style="min-height: 250px;">
            <div class="card text-center shadow-sm p-4" style="max-width: 400px; width: 100%;">
                <div class="card-body">
                    <div class="mb-3">
                        <i class="bi bi-search text-warning" style="font-size: 2.5rem;"></i>
                    </div>
                    <h5 class="card-title mb-2">No Results Found</h5>
                    <p class="card-text text-muted">${message}</p>
                    <small class="text-muted">Try adjusting your search terms or browse all saved articles.</small>
                </div>
            </div>
        </div>
    `);
}

// Event handlers
$(document).ready(function () {
    renderUserActions();
    if (currentUser) {
        loadSavedArticles(currentUser.id, "");
    }
    else {
        renderSavedTab();
    }
});

