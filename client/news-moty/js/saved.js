function renderSavedTab() {
    const $tab = $('#saved');

    if (!currentUser) {
        $tab.html('<div class="alert alert-info text-center">Please login to view your saved articles.</div>');
        return;
    }

    if (!savedArticles || savedArticles.length === 0) {
        $tab.html('<div class="alert alert-secondary text-center">No saved articles yet.</div>');
        return;
    }

    let html = '<div class="container px-2 px-md-4">';
    savedArticles.forEach(article => {
        const tag = availableTags.find(t => t.id === article.category) || { color: "secondary", name: "General" };

        html += `
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

                    <h5 class="fw-semibold mb-2">${article.title}</h5>
                    <p class="text-muted small mb-2">${article.description || article.preview}</p>
                    <div class="text-secondary small mb-3">Source: ${article.sourceName || article.source || ''}</div>

                    <div class="mt-auto d-flex gap-2">
                        <a href="${article.url}" target="_blank" class="btn btn-sm btn-primary">
                            <i class="fas fa-external-link-alt me-1"></i>View
                        </a>
                        <button class="btn btn-sm btn-outline-danger unsave-btn" data-id="${article.id}">
                            <i class="fas fa-trash-alt me-1"></i>Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    });

    html += '</div>';
    $tab.html(html);
}


//Load all saved articles for current user
function loadSavedArticles(userId) {
    ajaxCall("GET", serverUrl + `Articles/saved/${userId}`, null,
        function (articles) {
            savedArticles = articles;
            renderSavedTab();
        },
        function () {
            $("#saved").html('<div class="alert alert-danger text-center">Failed to load saved articles.</div>');
        }
    );
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



// Event handlers
$(document).ready(function () {
    renderUserActions();
    if (currentUser) {
        loadSavedArticles(currentUser.id); 
    }
});

