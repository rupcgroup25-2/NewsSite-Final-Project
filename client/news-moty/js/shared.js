function renderSharedTab() {
    const $tab = $('#shared');

    if (!currentUser) {
        $tab.html('<div class="alert alert-info text-center">Please login to view your shared articles.</div>');
        return;
    }

    if (!sharedArticles || sharedArticles.length === 0) {
        $tab.html('<div class="alert alert-secondary text-center">No shared articles yet.</div>');
        return;
    }

    let html = '<div class="container px-2 px-md-4">';
    sharedArticles.forEach(article => {
        const tag = availableTags.find(t => t.id === article.category) || { color: "info", name: "General" };

        html += `
        <div class="card mb-4 shadow-sm rounded-4 overflow-hidden border border-info">
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

                    <div class="mb-2">
                        <span class="badge bg-primary-subtle text-primary fw-bold px-2 py-1 rounded-1">
                        👤 Shared by: ${article.sharedByName || (article.sharedById === currentUser.id ? currentUser.name : "Unknown")}
                        </span>
                    </div>

                    <h5 class="fw-semibold mb-1">${article.title}</h5>
                    <p class="text-muted small mb-2">${article.description || article.preview}</p>
                    <div class="text-secondary small mb-2">Source: ${article.sourceName || article.source || ''}</div>

                    <div class="ps-3 py-2 border-start border-4 border-info bg-light small fst-italic fw-semibold text-dark mb-3">
                        ${article.comment || '(No comment provided)'}
                    </div>

                    <div class="mt-auto d-flex gap-2">
                        <a href="article.html?id=${article.id}&collection=Shared" class="btn btn-primary btn-sm" target="_blank">View</a>
                        <button class="btn btn-sm btn-outline-danger unshare-btn" data-id="${article.id}">
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

$(document).on('click', '.unshare-btn', function () {
    const articleId = $(this).data('id');
    if (!currentUser) {
        alert("Please login to remove shared articles.");
        return;
    }

    ajaxCall("DELETE", serverUrl + `Articles/unshare?userId=${currentUser.id}&articleId=${articleId}`, null,
        function (data) {
            alert(data);
            sharedArticles = sharedArticles.filter(a => a.id !== articleId);
            renderSharedTab();
        },
        function (xhr) {
            alert(xhr.responseText || "Failed to remove shared article");
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