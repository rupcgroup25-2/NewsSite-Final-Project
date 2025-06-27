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

$(document).on('click', '.view-article-btn', function () {
    // modal + comment logic
});
