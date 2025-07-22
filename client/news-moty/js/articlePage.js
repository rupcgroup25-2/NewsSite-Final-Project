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

function loadSingleArticle(userId, articleId) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams(window.location.search);
        collection = params.get('collection');
        ajaxCall("GET", serverUrl + `Articles/single${collection}/userId/${userId}/articleId/${articleId}`, null,
            function (article) {
                resolve(article);
            },
            function () {
                $("#saved").html('<div class="alert alert-danger text-center">Failed to load saved article.</div>');
                reject("Failed to load");
            }
        );
    });
}

function getArticleIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
function extractArticleContent(url) {
    return new Promise((resolve, reject) => {
        const extractUrl = serverUrl + `Articles/extract?url=${encodeURIComponent(url)}`;
        ajaxCall("GET", extractUrl, null,
            function (response) {
                if (response && response.content && response.content.trim()) {
                    resolve(response.content);
                } else {
                    reject("No content extracted from article.");
                }
            },
            function (xhr) {
                reject(xhr.responseText || "Failed to extract article content.");
            });
    });
}

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
});
function shareSCB(responseText) {
    alert(responseText);
    sharedArticles.push(article.id);
    $('.share-article-btn').text("Article Shared");
    $('.share-article-btn').removeClass('btn-outline-dark').addClass('btn-dark');
}
function shareECB(xhr) {
    alert(xhr.responseText || "Failed to share article.");
}

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
});
function saveSCB(responseText) {
    alert(responseText);
    savedArticles.push(article.id);
    $('.save-article-btn').text("Article Saved");
    $('.save-article-btn').removeClass('btn-outline-dark').addClass('btn-dark');
}

function saveECB() {
    alert("Failed to save article");
}

// --- Report Article ---
//let reportArticleId = null;
//$(document).on('click', '.report-article-btn', function () {
//    if (!currentUser) {
//        $('#loginModal').modal('show');
//        return;
//    }
//    reportArticleId = $(this).data('id');
//    $('#reportReason').val('');
//    $('#reportComment').val('');
//    $('#reportError').addClass('d-none');
//    $('#reportModal').modal('show');
//});
//$('#reportForm').on('submit', function (e) {
//    e.preventDefault();
//    if (!currentUser || !reportArticleId) return;
//    const reason = $('#reportReason').val();
//    const comment = $('#reportComment').val();
//    if (!reason) {
//        $('#reportError').removeClass('d-none').text('Please select a reason.');
//        return;
//    }
//    articleReports.push({
//        articleId: reportArticleId,
//        reason,
//        comment,
//        reporter: currentUser.name,
//        date: new Date()
//    });
//    $('#reportModal').modal('hide');
//});
function reportSCB(responseText) {
    alert("Report submitted successfully.");
    $('#reportModal').modal('hide');
    $("#reportComment").val("");
    $("#reportReason").val("");
    $('.report-article-btn').text("Article Reported");
    $('.report-article-btn').removeClass('btn-outline-danger').addClass('btn-danger');
}

function reportECB(xhr) {
    alert(xhr.responseText || "Failed to submit report.");
}


function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

$(document).ready(async function () {
    const id = getArticleIdFromUrl();
    if (!id) return $('#articleContainer').html('<div class="alert alert-danger">No article ID provided.</div>');
    let articles;
    article = {};
    if (isNaN(id)) {
        articles = getCachedArticles();
        article = articles.find(a => a.id == id);
    }
    else {
        article = await loadSingleArticle(currentUser.id, id);
    }

    if (!article) {
        return $('#articleContainer').html('<div class="alert alert-warning">Article not found.</div>');
    }

    if (article.url) {
        try {
            extractedContent = await extractArticleContent(article.url);
            extractedContent;
        } catch (err) {
            console.warn("Could not extract article content:", err);
            article.fullText = article.preview || article.description || '';
        }
    } else {
        article.fullText = article.preview || article.description || '';
    }
    const comments = articleComments[id] || [];

    const html = `
<div class="row">
  <!-- Main Article Content -->
  <div class="col-lg-8">
    <div class="card mb-4 shadow-sm">
        <div class="card-body" style="width: 100%; max-width: none;">
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

        <div class="article-summary card mb-4 shadow-sm">
          <div class="card-body">
            <h4 class="fw-bold">Summary</h4>
            <p id="articleSummary" style="font-size: 1.2rem; line-height: 1.6; color: #555; display:none;"></p>
            <button id="generateSummaryBtn" class="btn btn-primary btn-sm mt-2">Generate Summary</button>
            <div id="summaryLoading" style="display:none;">Loading summary...</div>
          </div>
        </div>

        <div class="article-body" style="
          font-size: 1.4rem;
          line-height: 1.9;
          font-family: 'Segoe UI', 'Open Sans', sans-serif;
          color: #333;
          white-space: pre-line;
          text-align: justify;
          margin-top: 1rem;
        ">
          ${extractedContent}
        </div>

        <!-- Playback Buttons Moved Here -->
        <div class="mt-4 d-flex flex-wrap gap-2 justify-content-start">
          <button id="readArticleBtn" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-volume-up"></i> Read Article
          </button>
          <button id="stopReadArticleBtn" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-stop-circle"></i> Stop Reading
          </button>
          <button id="resumeReadArticleBtn" class="btn btn-outline-success btn-sm">
            <i class="bi bi-play-circle"></i> Resume Reading
          </button>
        </div>

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
        <button class="btn btn-outline-danger btn-sm w-100 mt-2 report-article-btn" data-id="${id}">
          <i class="bi bi-flag"></i> Report Article
        </button>
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

//TTS READER
let speechUtterance = null;
let currentChunkIndex = 0;
let chunks = [];
let isPaused = false;

function splitTextIntoChunks(text, maxLength = 200) {
    const result = [];
    let start = 0;
    while (start < text.length) {
        let end = start + maxLength;
        if (end > text.length) end = text.length;
        if (end < text.length) {
            let lastSpace = text.lastIndexOf(' ', end);
            if (lastSpace > start) end = lastSpace;
        }
        result.push(text.substring(start, end).trim());
        start = end;
    }
    return result;
}

function speakChunks() {
    if (currentChunkIndex >= chunks.length) {
        // סיימנו הכל - איפוס
        currentChunkIndex = 0;
        chunks = [];
        return;
    }

    speechUtterance = new SpeechSynthesisUtterance(chunks[currentChunkIndex]);
    speechUtterance.lang = 'en-US';
    speechUtterance.pitch = 0.9;
    speechUtterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    let voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft')));
    if (!voice && voices.length > 0) voice = voices[0];
    if (voice) speechUtterance.voice = voice;

    speechUtterance.onend = () => {
        if (!isPaused) {
            currentChunkIndex++;
            speakChunks();
        }
    };

    window.speechSynthesis.speak(speechUtterance);
}

function startSpeaking(text) {
    if (!text || text.trim() === '') {
        alert("No text to read.");
        return;
    }
    chunks = splitTextIntoChunks(text);
    currentChunkIndex = 0;
    isPaused = false;

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    speakChunks();
}
function stopSpeaking() {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        isPaused = true;
        window.speechSynthesis.pause();
    }
}

function resumeSpeaking() {
    if (window.speechSynthesis.paused) {
        isPaused = false;
        window.speechSynthesis.resume();
    }
}
$(document).on('click', '#readArticleBtn', function () {
    if (!extractedContent || extractedContent.trim().length === 0) {
        alert("No content to read.");
        return;
    }
    startSpeaking(extractedContent);
});

$(document).on('click', '#stopReadArticleBtn', function () {
    stopSpeaking();
});

$(document).on('click', '#resumeReadArticleBtn', function () {
    resumeSpeaking();
});


//SUMMARIZE
$(document).on('click', '#generateSummaryBtn', function () {
    $('#summaryLoading').show();
    $('#articleSummary').text('');
    $(this).prop('disabled', true);

    const articleText = extractedContent|| '';

    if (!articleText) {
        alert("No content available to summarize.");
        $('#summaryLoading').hide();
        $(this).prop('disabled', false);
        return;
    }

    ajaxCall(
        "POST",
        serverUrl + "Articles/summarize",
        JSON.stringify({ text: articleText }),  // stringify כאן
        function (data) {
            if (data.summary) {
                console.log(data.summary)
                $('#articleSummary').text(data.summary).show();
                $('.article-summary').show(); 
            } else {
                alert("No summary received");
            }
            $('#summaryLoading').hide();
            $('#generateSummaryBtn').prop('disabled', false);
        },
        function (xhr) {
            alert("Failed to generate summary: " + (xhr.responseText || xhr.statusText));
            $('#summaryLoading').hide();
            $('#generateSummaryBtn').prop('disabled', false);
        }
    );
});