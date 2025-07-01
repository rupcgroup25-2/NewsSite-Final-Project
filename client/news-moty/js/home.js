// Event handlers
$(document).ready(function () {
    renderUserActions();

    // --- View Article Modal (with comments, save/share/report) ---
    $(document).on('click', '.view-article-btn', function () {
        const id = $(this).data('id');
        var articles = getCachedArticles();
        const article = articles.find(a => a.id === id);
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
});




