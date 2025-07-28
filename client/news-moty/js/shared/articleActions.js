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

// --- Share Article ---
//handle UI on share submit 
$(document).on('submit', '#shareForm', function (e) {
    e.preventDefault();
    $('#shareModal').modal('hide');
    $('#shareComment').val('');
});

// Sharing the clicked article by the user
function shareArticle(article, comment, successCB, errorCB) {
    if (!currentUser) {
        alert("Please login to share articles.");
        return;
    }

    if (!article) {
        alert("Article not found.");
        return;
    }

    const articleToSend = {
        comment: comment || "",
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
        function (responseText) {
            sharedArticles.push(article.id);
            successCB(responseText);
        },
        errorCB
    );
}

//Saving the clicked article by the user
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
        function (responseText) {
            savedArticles.push(article.id);
            saveSCB(responseText);
        },
        saveECB
    );
}

// --- Report Article ---
//handle UI on report submit - DISABLED for shared.js
// $(document).on('submit', '#reportForm', function (e) {
//     e.preventDefault();
//     $('#reportModal').modal('hide');
//     $('#reportComment').val('');
// });

// Reporting the clicked article
function reportArticle(article, successCB, errorCB, isFromShared = false) {
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
        articleId: 0, // Assuming 0 because it's an external article
        sharerId: isFromShared ? article.sharedById : null, // Use article ID if from shared page
        comment: reason + (comment ? ` - ${comment}` : ""),
        reportedAt: new Date().toISOString()
    };

    const articleToSend = {
        comment: "",
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

    const data = {
        Report: reportToSend,
        Article: articleToSend
    };

    ajaxCall(
        "POST",
        serverUrl + "Reports",
        JSON.stringify(data),
        successCB,
        errorCB
    );
}
