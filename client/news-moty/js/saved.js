
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

    let html = '<div class="row">';
    savedArticles.forEach(article => {
        // למצוא תגית למאמר לפי קטגוריה (אם יש)
        const tag = availableTags.find(t => t.id === article.category) || { color: "secondary", name: "General" };

        html += `
        <div class="col-md-6 col-lg-4 mb-4 d-flex align-items-stretch">
          <div class="card shadow-sm rounded-4 h-100 border-0 overflow-hidden">
            <div class="position-relative">
              <img src="${article.urlToImage}" class="card-img-top object-fit-cover" alt="${article.title}" style="height: 220px;">
              <div class="position-absolute top-0 start-0 w-100 px-3 pt-3 d-flex justify-content-between align-items-start" style="z-index:2;">
                <span class="badge bg-${tag.color} fs-6 shadow">${tag.name}</span>
                <span class="badge bg-dark bg-opacity-75 text-light small">${formatDate(article.publishedAt)}</span>
              </div>
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title mb-2">${article.title}</h5>
              <p class="card-text text-muted flex-grow-1">${article.description || article.preview}</p>
              <div class="mb-2 text-end small text-secondary">Source: ${article.source || ''}</div>
              <div class="d-flex flex-wrap gap-2 mt-auto">
                <a href="${article.url}" target="_blank" class="btn btn-primary btn-sm flex-fill">
                  <i class="fas fa-external-link-alt me-1"></i>View
                </a>
                <button class="btn btn-outline-danger btn-sm flex-fill unsave-btn" data-id="${article.id}">
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
// Event handlers
$(document).ready(function () {
    renderUserActions();
    if (currentUser) {
        loadSavedArticles(currentUser.id); 
    }
});