function createUserActionsModals() {
    const modalsHtml = `
    <div class="modal fade" id="shareModal" tabindex="-1" aria-labelledby="shareModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title" id="shareModalLabel">Share Article</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-0">
                    <form id="shareForm">
                        <div class="mb-3">
                            <label for="shareComment" class="form-label">Add your comment</label>
                            <textarea class="form-control" id="shareComment" rows="3" required></textarea>
                        </div>
                        <button id="btnShareArticle" type="submit" class="btn btn-primary w-100">Share</button>
                    </form>
                    <div id="shareError" class="alert alert-danger mt-3 d-none"></div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="reportModal" tabindex="-1" aria-labelledby="reportModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title" id="reportModalLabel">Report Article</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-0">
                    <form id="reportForm">
                        <div class="mb-3">
                            <label for="reportReason" class="form-label">Reason</label>
                            <select class="form-select" id="reportReason" required>
                                <option value="">Select a reason...</option>
                                <option value="spam">Spam</option>
                                <option value="inappropriate">Inappropriate content</option>
                                <option value="misinformation">Misinformation</option>
                                <option value="copyright">Copyright violation</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="reportComment" class="form-label">Additional details</label>
                            <textarea class="form-control" id="reportComment" rows="3"></textarea>
                        </div>
                        <button id="btnReportArticle" type="submit" class="btn btn-danger w-100">Report</button>
                    </form>
                    <div id="reportError" class="alert alert-danger mt-3 d-none"></div>
                </div>
            </div>
        </div>
    </div>`;

    $('body').append(modalsHtml);
}

$(document).ready(function () {
    createUserActionsModals();
});

//to save the article id on the other share button
$(document).on('click', '.share-article-btn', function () {
    if (!currentUser) {
        $('#loginModal').modal('show');
        return;
    }
    const articleId = $(this).data("id");
    $('#btnShareArticle').data("id", articleId);
    $('#shareModal').modal('show');
});

//Sharing the clicked article to the user
$(document).on('submit', '#shareForm', function (e) {
    e.preventDefault();
    $('#shareModal').modal('hide');
});

$(document).on('click', '#btnShareArticle', function (e) {
    if (!currentUser) {
        alert("Please login to share articles.");
        return;
    }

    const articleId = $(this).data("id");
    const comment = $("#shareComment").val()?.trim() || "";

    // Get the article data - try different sources
    let article = null;
    
    // Try to get from cached articles (for index page)
    if (typeof getCachedArticles === 'function') {
        const articles = getCachedArticles();
        article = articles.find(a => a.id == articleId);
    }
    
    // Try to get from sampleArticles (fallback)
    if (!article && typeof sampleArticles !== 'undefined') {
        article = sampleArticles.find(a => a.id == articleId);
    }
    
    // Try to get from global article variable (for article page)
    if (!article && typeof window.article !== 'undefined') {
        article = window.article;
    }

    if (!article) {
        alert("Article not found.");
        return;
    }

    const articleToSend = {
        comment: comment,
        id: 0,
        title: article.title || "",
        description: article.preview || article.description || "",
        url: article.url || "",
        urlToImage: article.imageUrl || article.urlToImage || "",
        publishedAt: article.publishedAt || new Date().toISOString(),
        sourceName: article.source || article.sourceName || "",
        author: article.author || "",
        sharedById: 0,
        sharedByName: "string"
    };

    ajaxCall(
        "POST",
        serverUrl + `Articles/ShareArticle?userId=${currentUser.id}`,
        JSON.stringify(articleToSend),
        shareSCB,
        shareECB
    );
});

// Success and Error callbacks for sharing
function shareSCB(responseText) {
    alert("Article shared successfully!");
    $('#shareModal').modal('hide');
    $("#shareComment").val("");
    // Refresh the current view if needed
    if (typeof renderHomeTab === 'function') {
        renderHomeTab();
    }
    if (typeof renderSharedTab === 'function') {
        renderSharedTab();
    }
}

function shareECB(xhr) {
    alert(xhr.responseText || "Failed to share article. Please try again.");
}

//Saving the clicked article to the user
function saveArticle(article, saveSCB, saveECB) {
    if (!currentUser) {
        alert("Please login to save articles.");
        return;
    }

    const articleToSend = {
        comment: "",
        id: 0,
        title: article.title || "",
        description: article.preview || "",
        url: article.url || "",
        urlToImage: article.imageUrl || "",
        publishedAt: article.publishedAt || new Date().toISOString(),
        sourceName: article.source || "",
        author: article.author || "",
        sharedById: 0,
        sharedByName: "string"
    };

    if (!articleToSend) {
        alert("Article not found.");
        return;
    }

    ajaxCall(
        "POST",
        serverUrl + `Articles/SaveArticle?userId=${currentUser.id}`,
        JSON.stringify(articleToSend),
        saveSCB,
        saveECB
    );
}


//report the article by the user
$(document).on('submit', '#reportForm', function (e) {
    e.preventDefault();
    $('#reportModal').modal('hide');
});

$(document).on('click', '.report-article-btn', function () {
    const articleId = $(this).data("id");
    $('#btnReportArticle').data("id", articleId); // שמירת ID
    $('#reportModal').modal('show');
});

$(document).on('click', '#btnReportArticle', function () {
    if (!currentUser) {
        alert("Please login to report articles.");
        return;
    }

    const reason = $("#reportReason").val();
    const comment = $("#reportComment").val()?.trim() || "";

    if (!reason) {
        alert("Please select a reason for reporting.");
        return;
    }

    if (!article) {
        alert("Article not found.");
        return;
    }

    const reportToSend = {
        id: 0,
        reporterId: currentUser.id,
        articleId: 0,
        sharedArticleId: null,
        comment: reason + (comment ? ` - ${comment}` : ""),
        reportedAt: new Date().toISOString()
    };

    const articleToSend = {
        comment: "",
        id: 0,
        title: article.title || "",
        description: article.preview || "",
        url: article.url || "",
        urlToImage: article.imageUrl || "",
        publishedAt: article.publishedAt || new Date().toISOString(),
        sourceName: article.source || "",
        author: article.author || ""
    };

    const data = {
        Report: reportToSend,
        Article: articleToSend
    };

    ajaxCall(
        "POST",
        serverUrl + "Reports",
        JSON.stringify(data),
        reportSCB,
        reportECB
    );
});

// Share callback functions
function shareSCB(responseText) {
    alert(responseText || "Article shared successfully!");
    $('#shareModal').modal('hide');
    $("#shareComment").val("");
    // Refresh the current view if needed
    if (typeof renderHomeTab === 'function') {
        renderHomeTab();
    } else if (typeof renderSharedTab === 'function') {
        renderSharedTab();
    }
}

function shareECB(xhr) {
    alert(xhr.responseText || "Failed to share article.");
}

// Report callback functions  
function reportSCB(responseText) {
    alert(responseText || "Article reported successfully!");
    $('#reportModal').modal('hide');
    $("#reportReason").val("");
    $("#reportComment").val("");
}

function reportECB(xhr) {
    alert(xhr.responseText || "Failed to report article.");
}