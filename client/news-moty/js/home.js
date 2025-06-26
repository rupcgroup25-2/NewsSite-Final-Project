availableTags = [
    { id: "technology", name: "Technology", color: "primary" },
    { id: "health", name: "Health", color: "success" },
    { id: "sports", name: "Sports", color: "warning" },
    { id: "business", name: "Business", color: "info" },
    { id: "entertainment", name: "Entertainment", color: "danger" },
    { id: "environment", name: "Environment", color: "secondary" },
];

// Add NewsAPI category mapping
const categoryMapping = {
    technology: "technology",
    health: "health",
    sports: "sports",
    business: "business",
    entertainment: "entertainment",
    environment: "science", // NewsAPI does not have 'environment', use 'science' as closest
};



function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

// Render user actions (login/register/logout)
function renderUserActions() {
    const $actions = $("#user-actions");
    $actions.empty();
    if (currentUser) {
        $actions.append(
            `<span class="me-3">${getGreeting()}, <strong>${currentUser.name}</strong>!</span>
      <button class="btn btn-secondary btn-sm" id="logout-btn">Logout</button>`
        );
    } else {
        $actions.append(
            `<button class="btn btn-primary btn-sm me-2" data-bs-toggle="modal" data-bs-target="#loginModal">Login</button>
      <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#registerModal">Register</button>`
        );
    }
}

// Render all tabs
function renderTabs() {
    renderHomeTab();
    renderSavedTab();
    renderSharedTab();
    renderInterestsTab();
    renderAdminTab();
}

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

function renderSavedTab() {
    const $tab = $('#saved');
    if (!currentUser) {
        $tab.html('<div class="alert alert-info text-center">Please login to view your saved articles.</div>');
        return;
    }
    if (!savedArticles.length) {
        $tab.html('<div class="alert alert-secondary text-center">No saved articles yet.</div>');
        return;
    }
    let html = '<div class="row">';
    savedArticles.forEach(id => {
        const article = sampleArticles.find(a => a.id === id);
        if (article) {
            html += `<div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${article.imageUrl}" class="card-img-top" alt="${article.title}">
          <div class="card-body">
            <h5 class="card-title">${article.title}</h5>
            <p class="card-text">${article.preview}</p>
            <button class="btn btn-danger btn-sm unsave-btn" data-id="${article.id}">Remove</button>
          </div>
        </div>
      </div>`;
        }
    });
    html += '</div>';
    $tab.html(html);
}

function renderSharedTab() {
    const $tab = $('#shared');
    if (!sharedArticles.length) {
        $tab.html('<div class="alert alert-secondary text-center">No shared articles yet.</div>');
        return;
    }
    let html = '<div class="row">';
    sharedArticles.forEach(share => {
        const article = sampleArticles.find(a => a.id === share.articleId);
        if (article) {
            html += `<div class="col-md-6 mb-4">
        <div class="card h-100">
          <img src="${article.imageUrl}" class="card-img-top" alt="${article.title}">
          <div class="card-body">
            <h5 class="card-title">${article.title}</h5>
            <p class="card-text">${article.preview}</p>
            <div class="mb-2"><span class="badge bg-info">Shared by ${share.userName}</span></div>
            <div class="text-muted small">${formatDate(share.sharedAt)}</div>
            <div class="mt-2"><em>"${share.comment}"</em></div>
          </div>
        </div>
      </div>`;
        }
    });
    html += '</div>';
    $tab.html(html);
}

function renderInterestsTab() {
    const $tab = $('#interests');
    if (!currentUser) {
        $tab.html('<div class="alert alert-info text-center">Please login to manage your interests.</div>');
        return;
    }
    let html = '<div class="mb-3">Select your interests:</div><div class="row">';
    availableTags.forEach(tag => {
        const checked = userTags.includes(tag.id) ? 'checked' : '';
        html += `<div class="col-6 col-md-4 mb-2">
      <div class="form-check">
        <input class="form-check-input interest-checkbox" type="checkbox" value="${tag.id}" id="interest-${tag.id}" ${checked}>
        <label class="form-check-label" for="interest-${tag.id}">${tag.name}</label>
      </div>
    </div>`;
    });
    html += '</div><button class="btn btn-primary mt-3" id="save-interests-btn">Save Preferences</button>';
    $tab.html(html);
}

function renderAdminTab() {
    const $tab = $('#admin');
    if (!currentUser || currentUser.email !== 'admin@newshub.com') {
        $tab.html('<div class="alert alert-warning text-center">Admin access only.</div>');
        $('#admin-tab-li').addClass('d-none');
        return;
    }
    $('#admin-tab-li').removeClass('d-none');
    let html = `<div class="row mb-4">
    <div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted">Total Users</div><div class="h3">${users.length}</div></div></div></div>
    <div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted">Articles</div><div class="h3">${sampleArticles.length}</div></div></div></div>
    <div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted">Shared</div><div class="h3">${sharedArticles.length}</div></div></div></div>
    <div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted">Blocked Users</div><div class="h3">${users.filter(u => u.isBlocked).length}</div></div></div></div>
  </div>`;
    // Reported articles
    html += '<h5>Reported Articles</h5>';
    if (!articleReports.length) {
        html += '<div class="alert alert-secondary">No reported articles.</div>';
    } else {
        html += '<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>Article</th><th>Reason</th><th>Comment</th><th>Reporter</th><th>Date</th><th>Action</th></tr></thead><tbody>';
        articleReports.forEach((r, i) => {
            const article = sampleArticles.find(a => a.id === r.articleId);
            html += `<tr><td>${article ? article.title : r.articleId}</td><td>${r.reason}</td><td>${r.comment}</td><td>${r.reporter}</td><td>${formatDate(r.date)}</td><td><button class="btn btn-sm btn-danger clear-report-btn" data-index="${i}">Clear</button></td></tr>`;
        });
        html += '</tbody></table></div>';
    }
    // User management
    html += '<h5>User Management</h5><div class="table-responsive"><table class="table table-bordered"><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Sharing</th><th>Actions</th></tr></thead><tbody>';
    users.forEach(user => {
        html += `<tr><td>${user.name}</td><td>${user.email}</td><td>${user.isBlocked ? '<span class="badge bg-danger">Blocked</span>' : '<span class="badge bg-success">Active</span>'}</td><td>${user.canShare ? 'Allowed' : 'Blocked'}</td><td><button class="btn btn-sm btn-warning toggle-block-btn" data-id="${user.id}">${user.isBlocked ? 'Unblock' : 'Block'}</button> <button class="btn btn-sm btn-secondary toggle-share-btn" data-id="${user.id}">${user.canShare ? 'Block Sharing' : 'Allow Sharing'}</button></td></tr>`;
    });
    html += '</tbody></table></div>';
    $tab.html(html);
}

// Login/Register logic
$(document).on('submit', '#loginForm', function (e) {
    e.preventDefault();
    const email = $('#loginEmail').val();
    const password = $('#loginPassword').val();
    if (email && password) {
        // Simple mock login
        let user = users.find(u => u.email === email);
        if (!user) {
            user = { id: String(users.length + 1), name: email.split('@')[0], email, isBlocked: false, canShare: true };
            users.push(user);
        }
        currentUser = user;
        $('#loginModal').modal('hide');
        renderUserActions();
        renderTabs();
        $('#loginError').addClass('d-none');
    } else {
        $('#loginError').removeClass('d-none').text('Please enter email and password.');
    }
});

$(document).on('submit', '#registerForm', function (e) {
    e.preventDefault();
    const name = $('#registerName').val();
    const email = $('#registerEmail').val();
    const password = $('#registerPassword').val();
    const confirm = $('#registerConfirmPassword').val();
    if (password !== confirm) {
        $('#registerError').removeClass('d-none').text('Passwords do not match.');
        return;
    }
    if (name && email && password) {
        let user = users.find(u => u.email === email);
        if (!user) {
            user = { id: String(users.length + 1), name, email, isBlocked: false, canShare: true };
            users.push(user);
        }
        currentUser = user;
        $('#registerModal').modal('hide');
        renderUserActions();
        renderTabs();
        $('#registerError').addClass('d-none');
    } else {
        $('#registerError').removeClass('d-none').text('Please fill all fields.');
    }
});

// Save/Unsave articles
$(document).on('click', '.unsave-btn', function () {
    const id = $(this).data('id');
    savedArticles = savedArticles.filter(aid => aid !== id);
    renderSavedTab();
});

// Save interests
$(document).on('click', '#save-interests-btn', function () {
    userTags = [];
    $('.interest-checkbox:checked').each(function () {
        userTags.push($(this).val());
    });
    renderInterestsTab();
});

// Admin actions
$(document).on('click', '.toggle-block-btn', function () {
    const id = $(this).data('id');
    users = users.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u);
    renderAdminTab();
});
$(document).on('click', '.toggle-share-btn', function () {
    const id = $(this).data('id');
    users = users.map(u => u.id === id ? { ...u, canShare: !u.canShare } : u);
    renderAdminTab();
});

// Tab switching logic (refresh content on tab shown)
$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
    renderTabs();
});

// Event handlers
$(document).ready(function () {
    renderUserActions();
    renderTabs();

    // Category filter
    $(document).on('click', '[data-category]', function () {
        const cat = $(this).data('category');
        renderArticles(cat);
    });

    // Logout
    $(document).on('click', '#logout-btn', function () {
        console.log("Logout clicked");
        currentUser = null;
        localStorage.removeItem('user');
        renderUserActions();
        renderTabs();
    });

    // --- Save/Unsave Article ---
    $(document).on('click', '.save-article-btn', function () {
        if (!currentUser) {
            $('#loginModal').modal('show');
            return;
        }
        const id = $(this).data('id');
        if (savedArticles.includes(id)) {
            savedArticles = savedArticles.filter(aid => aid !== id);
        } else {
            savedArticles.push(id);
        }
        renderTabs();
    });

    // --- View Article Modal (with comments, save/share/report) ---
    $(document).on('click', '.view-article-btn', function () {
        const id = $(this).data('id');
        const article = sampleArticles.find(a => a.id === id);
        if (!article) return;
        let html = `<h3>${article.title}</h3>
      <img src="${article.imageUrl}" class="img-fluid mb-3" alt="${article.title}">
      <div class="mb-2"><span class="badge bg-${availableTags.find(t => t.id === article.category)?.color || 'secondary'}">${article.category}</span> <span class="text-muted small ms-2">${formatDate(article.publishedAt)}</span></div>
      <p>${article.content}</p>
      <div class="mb-3 d-flex gap-2">
        <button class="btn btn-${savedArticles.includes(id) ? 'success' : 'outline-success'} btn-sm save-article-btn" data-id="${id}">${savedArticles.includes(id) ? 'Saved' : 'Save'}</button>
        <button class="btn btn-info btn-sm share-article-btn" data-id="${id}">Share</button>
        <button class="btn btn-danger btn-sm report-article-btn" data-id="${id}">Report</button>
      </div>
      <hr>
      <h5>Comments</h5>
      <div id="comments-list"></div>
      ${currentUser ? `<form id="commentForm"><div class="input-group mb-2"><input type="text" class="form-control" id="commentInput" placeholder="Add a comment..." required><button class="btn btn-primary" type="submit">Post</button></div></form>` : '<div class="alert alert-info">Login to comment.</div>'}
    `;
        $('#articleModalLabel').text(article.title);
        $('#articleModalBody').html(html);
        renderComments(id);
        $('#articleModal').modal('show');
        $('#commentForm').off('submit').on('submit', function (e) {
            e.preventDefault();
            const text = $('#commentInput').val();
            if (text && currentUser) {
                if (!articleComments[id]) articleComments[id] = [];
                articleComments[id].push({ user: currentUser.name, text, date: new Date() });
                renderComments(id);
                $('#commentInput').val('');
            }
        });
    });

    function renderComments(articleId) {
        const $list = $('#comments-list');
        $list.empty();
        const comments = articleComments[articleId] || [];
        if (!comments.length) {
            $list.html('<div class="text-muted">No comments yet.</div>');
            return;
        }
        comments.forEach(c => {
            $list.append(`<div class="mb-2"><strong>${c.user}</strong> <span class="text-muted small">${formatDate(c.date)}</span><br>${c.text}</div>`);
        });
    }

    // --- Share Article ---
    let shareArticleId = null;
    $(document).on('click', '.share-article-btn', function () {
        if (!currentUser) {
            $('#loginModal').modal('show');
            return;
        }
        shareArticleId = $(this).data('id');
        $('#shareComment').val('');
        $('#shareError').addClass('d-none');
        $('#shareModal').modal('show');
    });
    $('#shareForm').on('submit', function (e) {
        e.preventDefault();
        if (!currentUser || !shareArticleId) return;
        const comment = $('#shareComment').val();
        sharedArticles.push({
            id: String(sharedArticles.length + 1),
            articleId: shareArticleId,
            userName: currentUser.name,
            comment,
            sharedAt: new Date()
        });
        $('#shareModal').modal('hide');
        renderTabs();
    });

    // --- Report Article ---
    let reportArticleId = null;
    $(document).on('click', '.report-article-btn', function () {
        if (!currentUser) {
            $('#loginModal').modal('show');
            return;
        }
        reportArticleId = $(this).data('id');
        $('#reportReason').val('');
        $('#reportComment').val('');
        $('#reportError').addClass('d-none');
        $('#reportModal').modal('show');
    });
    $('#reportForm').on('submit', function (e) {
        e.preventDefault();
        if (!currentUser || !reportArticleId) return;
        const reason = $('#reportReason').val();
        const comment = $('#reportComment').val();
        if (!reason) {
            $('#reportError').removeClass('d-none').text('Please select a reason.');
            return;
        }
        articleReports.push({
            articleId: reportArticleId,
            reason,
            comment,
            reporter: currentUser.name,
            date: new Date()
        });
        $('#reportModal').modal('hide');
        renderTabs();
    });

    // --- Admin: Show reported articles, allow clearing reports ---
    $(document).on('click', '.clear-report-btn', function () {
        const idx = $(this).data('index');
        articleReports.splice(idx, 1);
        renderAdminTab();
    });

    // TODO: Add login/register modal logic and other tab logic
});

// fetch articles to home page

let fetchedArticles = [];
let currentCategory = "all";

const NEWS_API_KEY = "7c45000aa11241f2bed13189e946fb47";
const NEWS_CACHE_KEY = "newsApiCacheV2";
const NEWS_CATEGORIES = ["technology", "health", "sports", "business", "entertainment", "environment"];

function isToday(dateString) {
    const today = new Date();
    const date = new Date(dateString);
    return today.toDateString() === date.toDateString();
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
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ date: new Date().toISOString(), articles: allArticles }));
    return allArticles;
}

function getCachedArticles() {
    const cacheRaw = localStorage.getItem(NEWS_CACHE_KEY);
    if (cacheRaw) {
        try {
            const cache = JSON.parse(cacheRaw);
            if (cache.articles && isToday(cache.date)) {
                return cache.articles;
            }
        } catch (e) { /* ignore */ }
    }
    return null;
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
                            <a href="${article.url}" target="_blank" class="btn btn-primary btn-sm flex-fill">
                                <i class="fas fa-external-link-alt me-1"></i>Read More
                            </a>
                            <button class="btn btn-${isSaved ? 'success' : 'outline-success'} btn-sm save-article-btn flex-fill" data-id="${article.id}">
                                <i class="fas fa-bookmark me-1"></i>${isSaved ? 'Saved' : 'Save'}
                            </button>
                            <button class="btn btn-outline-info btn-sm share-article-btn flex-fill" data-id="${article.id}">
                                <i class="fas fa-share me-1"></i>Share
                            </button>
                            <button class="btn btn-outline-danger btn-sm report-article-btn flex-fill" data-id="${article.id}">
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

