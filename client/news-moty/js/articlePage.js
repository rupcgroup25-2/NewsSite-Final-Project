
//Load all saved articles for current user
function loadSavedArticles(userId) {
    return new Promise((resolve, reject) => {
        ajaxCall("GET", serverUrl + `Articles/saved/${userId}`, null,
            function (articles) {
                savedArticles = articles;
                resolve(articles); // ✅ Resolve the Promise when done
            },
            function () {
                $("#saved").html('<div class="alert alert-danger text-center">Failed to load saved articles.</div>');
                reject("Failed to load"); // ❌ Reject on error
            }
        );
    });
}

$(document).ready(async function () {
    const id = getArticleIdFromUrl();
    if (!id) return $('#articleContainer').html('<div class="alert alert-danger">No article ID provided.</div>');
    let articles;
    if (isNaN(id))
        articles = getCachedArticles();
    else {
        await loadSavedArticles(currentUser.id);
        articles = savedArticles;
        console.log(articles);
    }
    const article = articles.find(a => a.id == id);
    if (!article) {
        return $('#articleContainer').html('<div class="alert alert-warning">Article not found.</div>');
    }

    const comments = articleComments[id] || [];

    const html = `
    <div class="row">
      <!-- Main Article Content -->
      <div class="col-lg-8">
        <div class="card mb-4 shadow-sm">
          <div class="card-body">
            <h2 class="fw-bold">${article.title}</h2>
            <div class="text-muted small mb-2">
              <i class="bi bi-calendar-event"></i> ${formatDate(article.publishedAt)} &nbsp;
              <i class="bi bi-person"></i> ${article.source || article.sourceName || 'Unknown'} &nbsp;
              <span class="badge bg-${availableTags.find(t => t.id === article.category)?.color || 'secondary'}">${article.category}</span>
            </div>

            ${article.sourceUrl ? `
              <div class="alert alert-light border d-flex justify-content-between align-items-center small">
                <span>This article is from an external source.</span>
                <a href="${article.sourceUrl}" target="_blank">Read the original article</a>
              </div>` : ''}

            <img src="${article.imageUrl || article.urlToImage}" class="img-fluid mb-3" alt="${article.title}">
            <p class="fs-6">${article.preview || article.description}</p>

            ${article.sourceUrl ? `
              <a href="${article.sourceUrl}" class="btn btn-outline-secondary mt-3" target="_blank">
                <i class="bi bi-box-arrow-up-right"></i> Read Original Article
              </a>` : ''}
          </div>
        </div>

        <!-- Comments Section -->
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="mb-3"><i class="bi bi-chat-dots"></i> Comments (${comments.length})</h5>
            ${currentUser ? `
              <form id="commentForm" class="mb-3">
                <textarea class="form-control mb-2" id="commentInput" rows="3" placeholder="Share your thoughts on this article..." required></textarea>
                <button class="btn btn-secondary" type="submit">Post Comment</button>
              </form>` : `<div class="alert alert-info">Login to comment.</div>`}
            <div id="comments-list"></div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">
        <div class="card mb-3 shadow-sm">
          <div class="card-body">
            <h6 class="fw-bold">Actions</h6>
            <button class="btn btn-${savedArticles.includes(id) ? 'dark' : 'outline-dark'} btn-sm w-100 mb-2 save-article-btn" data-id="${id}">
              <i class="bi bi-bookmark${savedArticles.includes(id) ? '-fill' : ''}"></i> ${savedArticles.includes(id) ? 'Saved' : 'Save Article'}
            </button>
            <button class="btn btn-outline-dark btn-sm w-100 share-article-btn" data-id="${id}">
              <i class="bi bi-share"></i> Share Article
            </button>
            <a href="${article.url}" target="_blank" class="mt-2 btn btn-outline-dark btn-sm w-100">
              <i class="bi bi-box-arrow-up-right"></i> View Source
            </a>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="fw-bold">Article Information</h6>
            <div class="mb-2">
              <strong>Category</strong><br>
              <span class="badge bg-${availableTags.find(t => t.id === article.category)?.color || 'secondary'}">${article.category}</span>
            </div>
            <div class="mb-2"><strong>Published</strong><br>${formatDate(article.publishedAt)}</div>
            <div class="mb-2"><strong>Source</strong><br>${article.source || article.sourceName || 'Unknown'}</div>
            <div><strong>Comments</strong><br>${comments.length} comment${comments.length === 1 ? '' : 's'}</div>
          </div>
        </div>
      </div>
    </div>
  `;

    $('#articleContainer').html(html);
    //renderComments(id);

    $('#commentForm').off('submit').on('submit', function (e) {
        e.preventDefault();
        const text = $('#commentInput').val();
        if (text && currentUser) {
            if (!articleComments[id]) articleComments[id] = [];
            articleComments[id].push({ user: currentUser.name, text, date: new Date() });
            //renderComments(id);
            $('#commentInput').val('');
        }
    });
});

function getArticleIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
