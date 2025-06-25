$(document).on('click', '[data-category]', function () {
    const cat = $(this).data('category');
    renderArticles(cat);
});

$(document).on('click', '#save-interests-btn', function () {
    userTags = $('.interest-checkbox:checked').map(function () {
        return $(this).val();
    }).get();
    renderInterestsTab();
});

$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function () {
    renderTabs();
});
