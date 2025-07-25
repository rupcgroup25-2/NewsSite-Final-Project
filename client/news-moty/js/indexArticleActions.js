// --- Save Article ---
$(document).on('click', '.save-article-btn', function () {
    console.log('Save button clicked, currentUser:', currentUser);
    if (!currentUser) {
        console.log('No current user, showing login modal');
        $('#loginModal').modal('show');
        return;
    }
    const id = $(this).data('id');
    const $button = $(this);
    console.log('Saving article with id:', id);
    
    if (savedArticles.includes(id)) {
        savedArticles = savedArticles.filter(aid => aid !== id);
        $button.removeClass('btn-success').addClass('btn-outline-success').html('<i class="fas fa-bookmark me-1"></i>Save');
        console.log('Article removed from saved');
    } else {
        savedArticles.push(id);
        $button.removeClass('btn-outline-success').addClass('btn-success').html('<i class="fas fa-bookmark me-1"></i>Saved');
        console.log('Article added to saved');
    }
    
    // Save to localStorage
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
    console.log('Saved articles updated:', savedArticles);
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
    $('#shareComment').val(''); // Clear the form
    alert('Article shared successfully!');
});

// --- Report Article ---
let reportArticleId = null;
$(document).on('click', '.report-article-btn', function () {
    console.log('Report button clicked, currentUser:', currentUser);
    if (!currentUser) {
        console.log('No current user, showing login modal');
        $('#loginModal').modal('show');
        return;
    }
    reportArticleId = $(this).data('id');
    console.log('Opening report modal for article:', reportArticleId);
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
    $('#reportReason').val(''); // Clear the form
    $('#reportComment').val('');
    alert('Report submitted successfully!');
});