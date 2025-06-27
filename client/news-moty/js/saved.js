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

// Event handlers
$(document).ready(function () {
    renderUserActions();
    renderSavedTab();
});