

function renderHomeTab() {
    $("#home").html(`
    <div class="mb-4">
      <h2 class="h4">Welcome to News Hub</h2>
      <p class="text-muted">Stay updated with the latest news tailored to your interests.</p>
    </div>
    <div class="mb-3">
      <div class="btn-group" role="group" aria-label="Category filter">
        <button class="btn btn-outline-secondary btn-sm" data-category="all">All</button>
        ${availableTags.map(tag => `
          <button class="btn btn-outline-secondary btn-sm" data-category="${tag.id}">
            ${tag.name}
          </button>`).join("")}
      </div>
    </div>
    <div class="row" id="articles-list"></div>
  `);

    renderArticles("all");
}

function renderArticles(category) {
    let filtered = sampleArticles;
    if (category !== "all") {
        filtered = filtered.filter(article => article.category === category);
    }

    const $list = $("#articles-list");
    $list.empty();

    filtered.forEach(article => {
        const isSaved = savedArticles.includes(article.id);
        const tagColor = availableTags.find(t => t.id === article.category)?.color || 'secondary';

        $list.append(`
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${article.imageUrl}" class="card-img-top" alt="${article.title}">
          <div class="card-body">
            <h5 class="card-title">${article.title}</h5>
            <p class="card-text">${article.preview}</p>
            <span class="badge bg-${tagColor}">${article.category}</span>
            <div class="mt-2 text-muted small">${formatDate(article.publishedAt)}</div>
            <div class="mt-3 d-flex gap-2">
              <button class="btn btn-outline-primary btn-sm view-article-btn" data-id="${article.id}">View</button>
              <button class="btn btn-${isSaved ? 'success' : 'outline-success'} btn-sm save-article-btn" data-id="${article.id}">
                ${isSaved ? 'Saved' : 'Save'}
              </button>
              <button class="btn btn-outline-info btn-sm share-article-btn" data-id="${article.id}">Share</button>
              <button class="btn btn-outline-danger btn-sm report-article-btn" data-id="${article.id}">Report</button>
            </div>
          </div>
        </div>
      </div>
    `);
    });
}

// Setup category filter click events
$(document).on("click", "[data-category]", function () {
    const category = $(this).data("category");
    renderArticles(category);
});
