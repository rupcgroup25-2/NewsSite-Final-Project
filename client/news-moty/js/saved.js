function renderSavedTab(searchTerm = "") {
    const $tab = $('#saved');

    if (!currentUser) {
        $tab.html('<div class="alert alert-info text-center">Please login to view your saved articles.</div>');
        return;
    }

    if (!savedArticles || savedArticles.length === 0) {
        $tab.html('<div class="alert alert-secondary text-center">No saved articles found.</div>');
        return;
    }

    // אם תיבת החיפוש כבר קיימת, עדכן רק את התוכן
    let $articlesContainer = $('#articles-container');
    if ($articlesContainer.length === 0) {
        // יצירת המבנה הראשוני רק פעם אחת
        let html = `
            <div class="container px-2 px-md-4">
                <div class="mb-3">
                    <input type="text" id="savedSearchInput" class="form-control" placeholder="Search saved articles..." value="${searchTerm}">
                </div>
                <div id="articles-container"></div>
            </div>
        `;
        $tab.html(html);
        $articlesContainer = $('#articles-container');
    }

    // עדכון רק תוכן הכרטיסיות
    const highlight = (text) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    };

    let articlesHtml = '';
    savedArticles.forEach(article => {
        const tag = availableTags.find(t => t.name === article.tags[0]) || { color: "secondary", name: "General" };

        articlesHtml += `
        <div class="card mb-4 shadow-sm rounded-4 overflow-hidden border border-secondary-subtle">
            <div class="row g-0">
                <div class="col-md-5">
                    <div style="aspect-ratio: 16 / 9; overflow: hidden;">
                        <img src="${article.urlToImage}" alt="${article.title}" class="img-fluid w-100 h-100 object-fit-cover">
                    </div>
                </div>
                <div class="col-md-7 d-flex flex-column p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-${tag.color}">${tag.name}</span>
                        <span class="text-muted small">${formatDate(article.publishedAt)}</span>
                    </div>

                    <h5 class="fw-semibold mb-2">${highlight(article.title)}</h5>
                    <p class="text-muted small mb-2">${highlight(article.description || article.preview)}</p>
                    <div class="text-secondary small mb-3">Source: ${article.sourceName || article.source || ''}</div>

                    <div class="mt-auto d-flex gap-2">
                            <a href="article.html?id=${article.id}&collection=Saved" class="btn btn-outline-primary" style="text-decoration:none" target="_blank">View</a>
                        <button class="btn btn-outline-danger unsave-btn" data-id="${article.id}">
                            <i class="fas fa-trash-alt me-1"></i>Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    });

    $articlesContainer.html(articlesHtml);
}


$(document).on('click', '.unsave-btn', function () {
    const articleId = $(this).data('id');
    if (!currentUser) {
        alert("Please login to remove saved articles.");
        return;
    }

    ajaxCall("DELETE", serverUrl + `Articles/unsave?userId=${currentUser.id}&articleId=${articleId}`, null,
        function (data) {
            alert(data);
            savedArticles = savedArticles.filter(a => a.id !== articleId);
            renderSavedTab();
        },
        function (xhr) {
            alert(xhr.responseText || "Failed to remove article");
        }
    );
});

// search bar


// Debounced search handler
let debounceTimer;
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
function renderError(message) {
    const $tab = $('#saved');
    
    // אם תיבת החיפוש כבר קיימת, עדכן רק את התוכן
    let $articlesContainer = $('#articles-container');
    if ($articlesContainer.length === 0) {
        const currentSearchTerm = "";
        let html = `
            <div class="container px-2 px-md-4">
                <div class="mb-3">
                    <input type="text" id="savedSearchInput" class="form-control" placeholder="Search saved articles..." value="${currentSearchTerm}">
                </div>
                <div id="articles-container"></div>
            </div>
        `;
        $tab.html(html);
        $articlesContainer = $('#articles-container');
    }
    
    $articlesContainer.html(`<div class="alert alert-danger text-center">${message}</div>`);
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

