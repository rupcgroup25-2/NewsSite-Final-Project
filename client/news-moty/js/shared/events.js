$(document).on('click', '[data-category]', function () {
    const cat = $(this).data('category');
    renderArticles(cat);
});


$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function () {
    renderTabs();
});
