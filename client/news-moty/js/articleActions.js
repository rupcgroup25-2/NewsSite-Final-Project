// Unsave article
$(document).on('click', '.unsave-btn', function () {
    const id = $(this).data('id');
    savedArticles = savedArticles.filter(aid => aid !== id);
    renderSavedTab();
});

// --- Save Article ---
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
    renderHomeTab();
});

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
    renderHomeTab();
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
    renderHomeTab();
});