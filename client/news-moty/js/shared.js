function renderSharedTab() {
    const $tab = $('#shared');

    if (!currentUser) {
        $tab.html(`
            <div class="access-required-container">
                <div class="access-required-card">
                    <div class="access-icon">
                        <i class="bi bi-people-fill"></i>
                    </div>
                    <h4>Access Required</h4>
                    <p>Please log in to view and share articles with the community.</p>
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

    if (!sharedArticles || sharedArticles.length === 0) {
        $tab.html('<div class="shared-alert alert-secondary"><i class="bi bi-share"></i>No shared articles yet.</div>');
        return;
    }

    let html = '<div class="shared-container">';
    sharedArticles.forEach((article, index) => {
        const tag = availableTags.find(t => t.name === article.tags[0]) || { color: "secondary", name: "General" };
        const isMyArticle = article.sharedById === currentUser.id;
        const cardClass = isMyArticle ? 'shared-article-card my-shared-article' : 'shared-article-card';

        html += `
        <div class="${cardClass}">
            ${isMyArticle ? '<div class="my-article-badge"><i class="bi bi-star-fill me-1"></i>My Share</div>' : ''}
            <div class="row g-0">
                <div class="col-md-5">
                    <div class="shared-article-image">
                        <img src="${article.urlToImage}" alt="${article.title}">
                    </div>
                </div>
                <div class="col-md-7 shared-article-content">
                    <div class="shared-article-header">
                        <span class="shared-article-tag badge bg-${tag.color}">${tag.name}</span>
                        <span class="shared-article-date">${formatDate(article.publishedAt)}</span>
                    </div>

                    <div class="shared-by-badge">
                        <i class="bi bi-person-fill me-1"></i>
                        Shared by: ${article.sharedByName || (article.sharedById === currentUser.id ? currentUser.name : "Unknown")}
                    </div>

                    <h5 class="shared-article-title">${article.title}</h5>
                    <p class="shared-article-description">${article.description || article.preview}</p>
                    <div class="shared-article-source">Source: ${article.sourceName || article.source || ''}</div>

                    <div class="shared-article-comment">
                        ${article.comment || '(No comment provided)'}
                    </div>

                    <div class="shared-article-actions">
                        <div class="shared-article-buttons">
                            <a href="article.html?id=${article.id}&collection=Shared" class="shared-btn shared-btn-view" data-id="${article.id}" target="_blank">
                                <i class="bi bi-eye"></i>View
                            </a>
                            ${article.sharedById === currentUser.id
                                ? `<button class="shared-btn shared-btn-remove unshare-btn" data-id="${article.id}">
                                    <i class="bi bi-trash-alt"></i>Remove
                                   </button>`
                                : ''
                            }
                        </div>
                        ${article.sharedById !== currentUser.id
                            ? `<button class="shared-btn shared-btn-report report-article-btn" data-id="${article.id}" data-sharerId="${article.sharedById}" title="Report Article">
                                <i class="bi bi-flag-fill"></i>
                            </button>`
                            : ''
                        }
                    </div>
                </div>
            </div>
        </div>`;
    });

    html += '</div>';
    $tab.html(html);
}
function getArticleById(id) {
    // First try to find in shared articles (since we're in shared tab)
    let article = sharedArticles.find(a => a.id == id);

    // If not found, try regular articles as fallback
    if (!article && fetchedArticles) {
        article = fetchedArticles.find(a => a.id == id);
    }

    // If not found, try search articles as fallback
    if (!article && searchArticles) {
        article = searchArticles.find(a => a.id == id);
    }

    return article;
}
function loadSharedArticles(userId) {
    ajaxCall("GET", serverUrl + `Articles/shared/${userId}`, null,

        function (articles) {
            sharedArticles = articles;
            renderSharedTab();
        },
        function () {
            $("#shared").html('<div class="alert alert-danger text-center">Failed to load shared articles.</div>');
        }
    );
}
$(document).on('click', '.report-article-btn', function () { //inserting the article id to the modal report button
    const articleId = $(this).data("id");
    // Store the article ID globally so the submit handler can access it
    window.currentReportArticleId = articleId;
    $('#btnReportArticle').data("id", articleId);
    $('#reportModal').modal('show');
});

function reportSCB(responseText) {
    showSuccessToast("Report submitted successfully.", "Report Submitted");
    $('#reportModal').modal('hide');
    $("#reportComment").val("");
    $("#reportReason").val("");
}

function reportECB(xhr) {
    showErrorToast(xhr.responseText || "Failed to submit report.", "Report Error");
}

// Handle the submit button click from the modal
$(document).on('submit', '#reportForm', function (e) {
    e.preventDefault();    
    // Get article ID from the stored global variable
    const articleId = window.currentReportArticleId;
    
    if (!articleId) {
        showWarningToast("No article selected for reporting", "Selection Required");
        return;
    }
    
    const article = getArticleById(articleId);
    console.log("Found article:", article);
    
    if (!article) {
        showErrorToast("Article not found", "Error");
        return;
    }
    console.log("Calling reportArticle function");
    reportArticle(article, reportSCB, reportECB, true); // true = isFromShared
});

$(document).on('click', '.unshare-btn', function () {
    const articleId = $(this).data('id');
    if (!currentUser) {
        showWarningToast("Please login to remove shared articles.", "Authentication Required");
        return;
    }

    ajaxCall("DELETE", serverUrl + `Articles/unshare?userId=${currentUser.id}&articleId=${articleId}`, null,
        function (data) {
            showSuccessToast(data, "Article Removed");
            sharedArticles = sharedArticles.filter(a => a.id !== articleId);
            renderSharedTab();
        },
        function (xhr) {
            showErrorToast(xhr.responseText || "Failed to remove shared article", "Error");
        }
    );
});

$(document).ready(function () {
    renderUserActions();
    if (currentUser) {
        loadSharedArticles(currentUser.id); // 🛠️ זה מה שהיה חסר!
    } else {
        renderSharedTab();
    }
});