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


// Event handlers
$(document).ready(function () {
    renderUserActions();
    renderSharedTab();
});