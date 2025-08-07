// ================================================
// ================== FIREBASE IMPORTS ===========
// ================================================
//firebase chat
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
// Import will be done via script tag in HTML

// ================================================
// ================== MODALS SETUP ===============
// ================================================

// Create article-specific modals
function createArticleModals() {
    if ($('#shareModal').length > 0 || $('#reportModal').length > 0) {
        return; // Modals already exist
    }

    const modalsHtml = `
    <!-- Share Modal -->
    <div class="modal fade" id="shareModal" tabindex="-1" aria-labelledby="shareModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="shareModalLabel">Share Article</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="shareComment" class="form-label">Add a comment (optional)</label>
                        <textarea class="form-control" id="shareComment" rows="3" placeholder="What do you think about this article?"></textarea>
                    </div>
                    <div id="shareError" class="alert alert-danger d-none"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="btnShareArticle">Share Article</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Report Modal -->
    <div class="modal fade" id="reportModal" tabindex="-1" aria-labelledby="reportModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="reportModalLabel">Report Article</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="reportReason" class="form-label">Reason for reporting</label>
                        <select class="form-select" id="reportReason">
                            <option value="">Select a reason...</option>
                            <option value="inappropriate">Inappropriate content</option>
                            <option value="spam">Spam</option>
                            <option value="misinformation">Misinformation</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="reportComment" class="form-label">Additional details (optional)</label>
                        <textarea class="form-control" id="reportComment" rows="3" placeholder="Please provide more details..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="btnReportArticle">Submit Report</button>
                </div>
            </div>
        </div>
    </div>
    `;

    $('body').append(modalsHtml);
}

// ================================================
// ============= FIREBASE INITIALIZATION ==========
// ================================================

// Import Firebase configuration
// Firebase configuration will be imported from firebaseConfig.js
// Initialize Firebase
let app, analytics, db, auth;

// Function to initialize Firebase with config from external script
function initializeFirebase() {
    if (typeof firebaseConfig !== 'undefined') {
        try {
            app = initializeApp(firebaseConfig);
            window.app = app; // Make app globally available
            analytics = getAnalytics(app);
            db = getFirestore(app);
            auth = getAuth(app);
            
            // Initialize notifications if the function is available
            if (typeof initializeNotifications === 'function') {
                initializeNotifications();
            }
            
            console.log("Firebase initialized successfully");
            return true;
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            return false;
        }
    } else {
        console.error("Firebase config not found. Make sure firebaseConfig.js is loaded.");
        return false;
    }
}

// Firebase Auth Setup - Anonymous authentication for chat
function initializeFirebaseAuth() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User signed in:", user.uid);
                resolve(user);
            } else {
                // Anonymous authentication if no user
                signInAnonymously(auth)
                    .then((result) => {
                        console.log("Anonymous sign in successful:", result.user.uid);
                        resolve(result.user);
                    })
                    .catch((error) => {
                        console.error("Anonymous sign in failed:", error);
                        reject(error);
                    });
            }
        });
    });
}

// ================================================
// ================ CHAT SYSTEM ===================
// ================================================

// Initialize chat for the current article
async function initChat(articleData, userName) {
    // Initialize Firebase if not already initialized
    if (!app && !initializeFirebase()) {
        console.error("Failed to initialize Firebase");
        return;
    }

    // Instead of receiving articleId, we get all article data
    const unifiedId = generateUnifiedArticleId(articleData);

    if (!unifiedId) {
        console.error("Cannot generate unified ID for article:", articleData);
        return;
    }

    console.log("Using unified chat ID:", unifiedId);

    // Ensure user is connected to Firebase Auth
    try {
        await initializeFirebaseAuth();
    } catch (error) {
        console.error("Failed to authenticate:", error);
        return;
    }

    const chatContainer = document.getElementById('firebaseChatContainer');
    const chatMessages = document.getElementById('messages');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    // Check that all components exist
    if (!chatContainer || !chatMessages || !chatInput || !sendBtn) {
        console.error("Chat elements not found in DOM");
        return;
    }

    // Create reference to chat messages collection in Firestore
    const messagesRef = collection(db, 'chatrooms', unifiedId, 'messages');

    // Query to sort messages by timestamp
    const q = query(messagesRef, orderBy('timestamp'));

    try {
        // Listen to real-time changes
        const unsubscribe = onSnapshot(q, (snapshot) => {
            chatMessages.innerHTML = '';
            snapshot.forEach(doc => {
                const msg = doc.data();
                // Check if this is my message
                const isMine = (msg.userName === userName);
                const messageClass = isMine ? 'my-message' : 'other-message';
                const alignClass = isMine ? 'text-end' : 'text-start';
                // Additional background color already in CSS

                const div = document.createElement('div');
                div.className = `chat-message p-2 mb-1 rounded ${messageClass} ${alignClass}`;

                const timestamp = msg.timestamp ?
                    new Date(msg.timestamp.toDate()).toLocaleTimeString() :
                    'now';

                div.innerHTML = `
                    <div>
                        <strong>${msg.userName}:</strong> 
                        <span>${msg.text}</span>
                    </div>
                    <small class="text-muted">${timestamp}</small>
                `;
                chatMessages.appendChild(div);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
        }, (error) => {
            console.error("Error listening to messages:", error);
            chatMessages.innerHTML = '<div class="alert alert-danger">Error loading chat messages</div>';
        });

        // Send message
        sendBtn.onclick = async () => {
            const text = chatInput.value.trim();
            if (!text) return;

            try {
                await addDoc(messagesRef, {
                    text,
                    userName,
                    timestamp: serverTimestamp(),
                    articleTitle: articleData.title // Add article title for tracking
                });
                chatInput.value = '';
            } catch (error) {
                console.error("Error sending message:", error);
                showErrorToast("Failed to send message. Please try again.", "Chat Error");
            }
        };

        // Allow sending message with Enter
        chatInput.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendBtn.click();
            }
        };

    } catch (error) {
        console.error("Error initializing chat:", error);
        chatMessages.innerHTML = '<div class="alert alert-danger">Error initializing chat</div>';
    }

// Generates unified article ID for chat room identification
function generateUnifiedArticleId(article) {
    if (!article) return null;

    // Option 1: If there's a URL, use it
    if (article.url) {
        // Extract domain and keep only the unique part
        const url = new URL(article.url);
        const path = url.pathname + url.search;
        // Remove invalid characters for Firestore collection ID
        return btoa(path).replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
    }

    // Option 2: If no URL, use title + publication date
    if (article.title && article.publishedAt) {
        const combined = article.title + article.publishedAt;
        return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
    }

    // Option 3: If it's a local article with numeric ID, use it
    if (article.id && !isNaN(article.id)) {
        return `local_${article.id}`;
    }

    return null;
    }

// ================================================
// ============== ARTICLE LOADING =================
// ================================================


function loadSingleArticle(userId, articleId) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams(window.location.search);
        let collection = params.get('collection');
        let reporterId = params.get('reporterId');
        let apiUrl = '';
        if (reporterId != null && collection == 'Reported') {
            apiUrl = serverUrl + `Articles/single${collection}/userId/${reporterId}/articleId/${articleId}`;
        }
        else if (collection == "Shared")
            apiUrl = serverUrl + `Articles/single${collection}/articleId/${articleId}`;//add an SP to get article by ID, use the endpoint here.
        else {
            apiUrl = serverUrl + `Articles/single${collection}/userId/${userId}/articleId/${articleId}`;
        }

        ajaxCall("GET", apiUrl, null,
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

// ================================================
// ================ SAVE ARTICLE ==================
// ================================================

// Success callback for saving articles
function saveSCB(responseText) {
    showSuccessToast(responseText, "Article Saved");
    $('.save-article-btn-from-view').text("Article Saved");
    $('.save-article-btn-from-view').removeClass('btn-outline-dark').addClass('btn-dark');
}

function saveECB() {
    showErrorToast("Failed to save article", "Save Failed");
}
$(document).on('click', '.save-article-btn-from-view', function () {
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
    saveArticle(article, saveSCB, saveECB);
});

// ================================================
// ================ SHARE ARTICLE =================
// ================================================

// Global variable for share functionality
let shareArticleId = null;

$(document).on('click', '.share-article-btn-from-view', function () {
    if (!currentUser) {
        $('#loginModal').modal('show');
        return;
    }
    shareArticleId = $(this).data('id');
    $('#shareComment').val('');
    $('#shareError').addClass('d-none');
    $('#shareModal').modal('show');
});

function shareSCB(responseText) {
    showSuccessToast(responseText, "Article Shared");
    $('.share-article-btn-from-view').text("Article Shared");
    $('.share-article-btn-from-view').removeClass('btn-outline-dark').addClass('btn-dark');
}

function shareECB(xhr) {
    showErrorToast(xhr.responseText || "Failed to share article.", "Share Failed");
}

$(document).on('click', '#btnShareArticle', function () {
    const comment = $('#shareComment').val();
    shareArticle(window.article, comment, shareSCB, shareECB);
});

// ================================================
// ================ REPORT ARTICLE ================
// ================================================

// Handle report button clicks from article view
$(document).on('click', '.report-article-btn-from-view', function () {
    const articleId = $(this).data("id");
    $('#btnReportArticle').data("id", articleId);
    $('#reportModal').modal('show');
});

function reportSCB(responseText) {
    showSuccessToast("Report submitted successfully.", "Report Submitted");
    $('#reportModal').modal('hide');
    $("#reportComment").val("");
    $("#reportReason").val("");
    $('.report-article-btn-from-view').text("Article Reported");
    $('.report-article-btn-from-view').removeClass('btn-outline-danger').addClass('btn-danger');
}

function reportECB(xhr) {
    showErrorToast(xhr.responseText || "Failed to submit report.", "Report Failed");
}

$(document).on('click', '#btnReportArticle', function () {
    reportArticle(window.article, reportSCB, reportECB);
});

// ================================================
// ============= TEXT PROCESSING UTILS ============
// ================================================

// Wraps individual words in spans for text-to-speech highlighting
function wrapWordsInSpans(text) {
    return text.split(/(\s+)/).map((word, i) => {
        if (word.trim() === '') return word;
        return `<span class="tts-word" data-index="${i}">${word}</span>`;
    }).join('');
}

function findArticleInDB(url) {
    const fullUrl = serverUrl + `Articles/singleArticleByUrl?url=${url}`;
    return new Promise((resolve, reject) => {
        ajaxCall("GET", fullUrl, null,
            function (response) {
                resolve(response);
            },
            function (xhr) {
                reject(xhr);
            });
    });
}

// ================================================
// ============== MAIN PAGE SETUP =================
// ================================================

// Main document ready function - initializes the article page
$(document).ready(async function () {
    // Initialize auth modals first
    if (typeof createAuthModals === 'function') {
        createAuthModals();
    }
    
    // Create article-specific modals
    createArticleModals();
    
    const id = getArticleIdFromUrl();

    let articles;
    window.article = {}; // Add this to global scope

    if (isNaN(id)) {
        const cached = getCachedArticles() || [];
        const fromLocalStorage = JSON.parse(localStorage.getItem('searchArticles') || '[]');

        const combined = [...cached, ...fromLocalStorage];

        window.article = combined.find(a => a.id == id);

        try {
            let articleInDB = await findArticleInDB(window.article.url);
            if (articleInDB) {
                window.article.id = articleInDB.id;
            }
        }
        catch (err) {
            
        }
    }

    else {
        window.article = await loadSingleArticle(currentUser.id, id);
    }
    if (!window.article) {
        return $('#articleContainer').html(`
            <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
                <div class="card text-center shadow-sm p-4" style="max-width: 500px; width: 100%;">
                    <div class="card-body">
                        <div class="mb-3">
                            <i class="bi bi-file-earmark-x text-warning" style="font-size: 4rem;"></i>
                        </div>
                        <h4 class="card-title mb-3">Article Not Found</h4>
                        <p class="card-text text-muted mb-4">
                            Sorry, we couldn't find the article you're looking for. 
                            It may have been removed or the link is incorrect.
                        </p>
                        <div class="d-flex gap-2 justify-content-center">
                            <button class="btn btn-primary" onclick="window.history.back()">
                                <i class="bi bi-arrow-left me-1"></i>Go Back
                            </button>
                            <a href="index.html" class="btn btn-outline-primary">
                                <i class="bi bi-house me-1"></i>Home Page
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    let extractedContent;
    if (window.article.url) {
        try {
            extractedContent = await extractArticleContent(window.article.url);
        } catch (err) {
            console.warn("Could not extract article content:", err);
            window.article.fullText = window.article.preview || window.article.description || '';
        }
    } else {
        window.article.fullText = window.article.preview || window.article.description || '';
    }

    const comments = articleComments[id] || [];

    const html = `
<div class="row">
  <!-- Main Article Content -->
  <div class="col-lg-8">
    <div class="card mb-4 shadow-sm">
        <div class="card-body" style="width: 100%; max-width: none;">
        <h2 class="fw-bold">${window.article.title}</h2>
        <div class="text-muted small mb-2">
          <i class="bi bi-calendar-event"></i> ${formatDate(window.article.publishedAt)} &nbsp;
          <i class="bi bi-person"></i> ${window.article.source || window.article.sourceName || 'Unknown'} &nbsp;
          <span class="badge bg-secondary">${window.article.tags?.[0] || window.article.category || "General"}</span>
        </div>

        ${window.article.sourceUrl ? `
          <div class="alert alert-light border d-flex justify-content-between align-items-center small">
            <span>This article is from an external source.</span>
            <a href="${window.article.sourceUrl}" target="_blank">Read the original article</a>
          </div>` : ''}

        <img src="${window.article.imageUrl || window.article.urlToImage}" class="img-fluid mb-3" alt="${window.article.title}">

        <div class="article-summary card mb-4 shadow-sm">
          <div class="card-body">
            <h4 class="fw-bold">Summary</h4>
            <p id="articleSummary" style="font-size: 1.2rem; line-height: 1.6; color: #555; display:none;"></p>
            <button id="generateSummaryBtn" class="btn btn-primary btn-sm mt-2">Generate Summary</button>
            <div id="summaryLoading" style="display:none;">Loading summary...</div>
          </div>
        </div>

        <!-- Audio Controls - Moved to top of article content -->
        <div class="mb-4 p-3 bg-light rounded-3 border">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-headphones text-primary me-2" style="font-size: 1.2rem;"></i>
              <span class="fw-semibold text-dark">Audio Controls</span>
            </div>
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <div class="voice-selector-container">
                <label for="voiceSelect" class="form-label small text-muted mb-1">
                  <i class="bi bi-mic me-1"></i>Voice Selection
                </label>
                <select id="voiceSelect" class="form-select form-select-sm voice-dropdown" style="min-width: 180px; max-width: 220px;">
                  <option value="">🎙️ Default Voice</option>
                </select>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <button id="readArticleBtn" class="btn btn-primary btn-sm px-3 py-2 rounded-pill shadow-sm">
                  <i class="bi bi-play-fill me-1"></i> Play
                </button>
                <button id="stopReadArticleBtn" class="btn btn-outline-danger btn-sm px-3 py-2 rounded-pill shadow-sm">
                  <i class="bi bi-pause-fill me-1"></i> Pause
                </button>
                <button id="resumeReadArticleBtn" class="btn btn-outline-success btn-sm px-3 py-2 rounded-pill shadow-sm">
                  <i class="bi bi-play-circle me-1"></i> Resume
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="article-body" style="
          font-size: 1.4rem;
          line-height: 1.9;
          font-family: 'Segoe UI', 'Open Sans', sans-serif;
          color: #333;
          white-space: pre-line;
          text-align: justify;
          margin-top: 1rem;">
        </div>

        ${window.article.sourceUrl ? `
          <a href="${window.article.sourceUrl}" class="btn btn-outline-secondary mt-3" target="_blank">
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
            <button id="postCommentBtn" class="btn btn-secondary" type="submit">Post Comment</button>
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
        <button class="btn btn-${savedArticles.includes(id) ? 'dark' : 'outline-dark'} btn-sm w-100 mb-2 save-article-btn-from-view" data-id="${id}">
          <i class="bi bi-bookmark${savedArticles.includes(id) ? '-fill' : ''}"></i> ${savedArticles.includes(id) ? 'Saved' : 'Save Article'}
        </button>
        <button class="btn btn-outline-dark btn-sm w-100 share-article-btn-from-view" data-id="${id}">
          <i class="bi bi-share"></i> Share Article
        </button>
        <a href="${window.article.url}" target="_blank" class="mt-2 btn btn-outline-dark btn-sm w-100">
          <i class="bi bi-box-arrow-up-right"></i> View Source
        </a>
        <button class="btn btn-outline-danger btn-sm w-100 mt-2 report-article-btn-from-view" data-id="${id}">
          <i class="bi bi-flag"></i> Report Article
        </button>
      </div>
    </div>

    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <h6 class="fw-bold">Article Information</h6>
        <div class="mb-2">
          <strong>Category</strong><br>
          <span class="badge bg-secondary">${window.article.tags?.[0] || window.article.category || "General"}</span>
        </div>
        <div class="mb-2"><strong>Published</strong><br>${formatDate(window.article.publishedAt)}</div>
        <div class="mb-2"><strong>Source</strong><br>${window.article.source || window.article.sourceName || 'Unknown'}</div>
        <div><strong>Comments</strong><br><span id="comments-count">0 comments</span></div>
      </div>
    </div>

    <!-- Live Chat - moved to sidebar -->
    <div class="card shadow-sm">
      <div class="card-body">
        <h6 class="fw-bold mb-3"><i class="bi bi-chat-square-dots"></i> Live Chat</h6>
        <div id="firebaseChatContainer">
          <div id="messages" style="height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 8px; margin-bottom: 10px; border-radius: 5px; background-color: #f8f9fa;"></div>
          <div class="input-group">
            <input id="chatInput" type="text" class="form-control form-control-sm" placeholder="Type your message..." />
            <button id="sendBtn" class="btn btn-primary btn-sm">
              <i class="bi bi-send"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;
    //load comments from server
    function loadComments(articleId) {

        const url = serverUrl + `comments/article/${articleId}`;
        ajaxCall("GET", url, null,
            function (response) {
                const comments = response;
                renderComments(comments);
                updateCommentsCount(comments);
            },
            function (xhr) {
                console.error("Failed to load comments:", xhr.status, xhr.responseText);
                // If failed, try again after a moment
                setTimeout(() => {
                    loadComments(articleId);
                }, 1000);
            });
    }

    //render comments
    function renderComments(comments) {
        const container = $('#comments-list');
        container.empty();

        if (!comments || comments.length === 0) {
            container.append('<p>No comments yet.</p>');
            return;
        }

        comments.forEach(function (c) {
            let deleteButton = '';
            if (c.userId === currentUser.id) {
                deleteButton = `<button class="btn btn-sm btn-danger float-end delete-comment-btn" data-article-id="${window.article.id}">Delete Comment</button>`;
            }

            const commentHtml = `
        <div class="border p-2 mb-2">
            <strong>${c.username}</strong>
            ${deleteButton}<br>
            <span>${c.commentText}</span><br>
            <small class="text-muted">${new Date(c.createdAt).toLocaleString()}</small>
        </div>
        `;
            container.append(commentHtml);
        });

        if (isAdmin()) {
            const deleteBtn = `
            <button id="delete-all-comments-btn" class="btn btn-danger mt-3">
                Delete All Comments
            </button>
        `;
            container.append(deleteBtn);
        }
    }
    
    function updateCommentsCount(comments) {
        const commentsCountEl = document.getElementById("comments-count");
        if (commentsCountEl) {
            commentsCountEl.textContent = `${comments.length} comment${comments.length === 1 ? '' : 's'}`;
        }
        const commentsHeader = document.querySelector("h5.mb-3 i.bi-chat-dots")?.parentElement;
        if (commentsHeader) {
            commentsHeader.innerHTML = `<i class="bi bi-chat-dots"></i> Comments (${comments.length})`;
        }
    }

    //add comment
    $(document).on('submit', '#commentForm', function (e) {
        e.preventDefault();

        const commentText = $('#commentInput').val().trim();

        if (commentText.length === 0) {
            showWarningToast('Comment text cannot be empty.', 'Invalid Input');
            return;
        }
        let article = window.article;

        const commentToSend = {
            id: 0,
            articleId: 0,
            userId: currentUser.id,
            username: currentUser.name,
            commentText: commentText,
            createdAt: new Date().toISOString()
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
            sharedByName: "string",
            tags: [article.category]
        };

        const data = {
            article: articleToSend,
            comment: commentToSend
        };

        ajaxCall("POST", serverUrl + "Comments/Addcomment", JSON.stringify(data),
            function (response) {
                $(e.target).find('#commentInput').val('');
                
                // Refresh comments and wait for completion
                loadComments(window.article.id);
                
                // Show success message only after comments are loaded
                setTimeout(() => {
                    showSuccessToast(response, "Comment Added");
                }, 500);
            },
            function (xhr) {
                showErrorToast(xhr.responseText, "Comment Failed");
            });
    });


    loadComments(window.article.id);


    //delete comment
    $(document).on('click', '.delete-comment-btn', function () {
        const articleId = $(this).data('article-id');

        if (!confirm("Are you sure you want to delete your comment ?")) return;

        const url = serverUrl + `Comments/DeleteCommentByArticleAndUser?userId=${currentUser.id}&articleId=${articleId}`;

        console.log(url);

        ajaxCall("DELETE", url, null,
            function (response) {
                showSuccessToast(response, "Comment Deleted");
                loadComments(articleId);
            },
            function (xhr) {
                showErrorToast("Error: " + xhr.responseText, "Delete Failed");
            }
        );
    });

    //delete all comments of article by admin
    function isAdmin() {
        const user = JSON.parse(localStorage.getItem("user"));
        return user && user.email === "admin@newshub.com";
    }

    $(document).on('click', '#delete-all-comments-btn', function () {
        if (!confirm("Are you sure you want to delete all comments for this article?")) return;

        const url = serverUrl + `Admin/DeleteAllComments/${article.id}`;

        ajaxCall("DELETE", url, null,
            function (response) {
                showSuccessToast(response, "All Comments Deleted");
                loadComments(article.id); 
            },
            function (xhr) {
                showErrorToast("Error: " + xhr.responseText, "Delete Failed");
            });
    });


//extract text scraper
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

    $('#articleContainer').html(html);
    if (extractedContent) {
        $('.article-body').html(wrapWordsInSpans(extractedContent));
        window.extractedContent = extractedContent; // Save globally for TTS
    } else if (window.article.fullText) {
        $('.article-body').html(wrapWordsInSpans(window.article.fullText));
        window.extractedContent = window.article.fullText; // Save globally for TTS
    }

    // Initialize chat after all HTML is created
    const userName = currentUser ?
        currentUser.name :
        `Guest_${Math.random().toString(36).substr(2, 5)}`;

    // Initialize TTS voice selection
    setTimeout(() => {
        loadVoices();
    }, 100);

    // Ensure all elements exist before initializing chat
    setTimeout(async () => {
        await initChat(window.article, userName);
    }, 500); // Short wait to ensure everything is loaded
});

// ================================================
// ============ TEXT-TO-SPEECH (TTS) ==============
// ================================================

// Text-to-Speech functionality
let speechUtterance = null;
let isPaused = false;
let availableVoices = [];
let pausedText = ''; // Store remaining text when paused
let pausedAtIndex = 0; // Track where we paused
let selectedVoice = null; // Store the selected voice globally

// Function to load available voices
function loadVoices() {
    availableVoices = window.speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    
    if (!voiceSelect) return;

    // Clear existing list
    voiceSelect.innerHTML = '<option value="">🎙️ Default Voice</option>';
    
    // Filter only English voices
    const englishVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('en') || voice.lang.includes('US') || voice.lang.includes('GB')
    );
    
    // Add English voices only
    englishVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = availableVoices.indexOf(voice); // Store original index
        
        // Add icons based on voice type
        let voiceIcon = '🎵';
        if (voice.name.toLowerCase().includes('google')) voiceIcon = '🤖';
        else if (voice.name.toLowerCase().includes('microsoft')) voiceIcon = '💻';
        else if (voice.name.toLowerCase().includes('male')) voiceIcon = '👨';
        else if (voice.name.toLowerCase().includes('female')) voiceIcon = '👩';
        
        // Create cleaner name
        let cleanName = voice.name.replace(/Microsoft|Google|Apple/gi, '').trim();
        let region = '';
        if (voice.lang.includes('US')) region = '🇺🇸';
        else if (voice.lang.includes('GB')) region = '🇬🇧';
        else if (voice.lang.includes('AU')) region = '🇦🇺';
        else region = '🌍';
        
        option.textContent = `${voiceIcon} ${cleanName} ${region}`;
        voiceSelect.appendChild(option);
    });
    
    // Add CSS for dropdown
    if (!document.getElementById('voice-dropdown-styles')) {
        const style = document.createElement('style');
        style.id = 'voice-dropdown-styles';
    }
}

// Load voices when they are ready
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

function startSpeaking(text) {
    if (!text || text.trim() === '') {
        showWarningToast("No text to read.", "Text-to-Speech");
        return;
    }

    isPaused = false;
    pausedText = text; // Store the full text
    pausedAtIndex = 0; // Reset position

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = 'en-US';
    speechUtterance.pitch = 0.9;
    speechUtterance.rate = 0.9;

    // Select voice based on user choice
    const voiceSelect = document.getElementById('voiceSelect');
    const selectedVoiceIndex = voiceSelect ? voiceSelect.value : '';
    
    if (selectedVoiceIndex !== '' && availableVoices[selectedVoiceIndex]) {
        selectedVoice = availableVoices[selectedVoiceIndex];
        speechUtterance.voice = selectedVoice;
    } else {
        // Default - find English voice
        const voices = window.speechSynthesis.getVoices();
        let voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft')));
        if (!voice && voices.length > 0) voice = voices[0];
        if (voice) {
            selectedVoice = voice;
            speechUtterance.voice = voice;
        }
    }

    speechUtterance.onboundary = function (event) {
        if (event.name === 'word') {
            const start = event.charIndex;
            const end = start + event.charLength;
            pausedAtIndex = start; // Track current position for resume
            highlightSpokenWord(start, end);
        }
    };

    speechUtterance.onend = () => {
        $('.tts-word').removeClass('highlighted');
    };

    window.speechSynthesis.speak(speechUtterance);
}

function stopSpeaking() {
    if (window.speechSynthesis.speaking) {
        isPaused = true;
        window.speechSynthesis.cancel(); // Use cancel instead of pause for better compatibility
    }
}

function resumeSpeaking() {
    if (isPaused && pausedText) {
        // Extract remaining text from where we left off
        const remainingText = pausedText.substring(pausedAtIndex);
        if (remainingText.trim().length > 0) {
            isPaused = false;
            
            // Create new utterance for remaining text
            speechUtterance = new SpeechSynthesisUtterance(remainingText);
            speechUtterance.lang = 'en-US';
            speechUtterance.pitch = 0.9;
            speechUtterance.rate = 0.9;
            
            // Use same voice as before - save the starting position for proper highlighting
            const resumeStartIndex = pausedAtIndex;
            
            // Wait for voices to be available before setting voice
            const setVoiceAndSpeak = () => {
                // Use the previously selected voice if available
                if (selectedVoice) {
                    speechUtterance.voice = selectedVoice;
                } else {
                    // Fallback: get voice from selector or find a good English voice
                    const voiceSelect = document.getElementById('voiceSelect');
                    const selectedVoiceIndex = voiceSelect ? voiceSelect.value : '';
                    const voices = window.speechSynthesis.getVoices();
                    
                    if (selectedVoiceIndex !== '' && availableVoices[selectedVoiceIndex]) {
                        selectedVoice = availableVoices[selectedVoiceIndex];
                        speechUtterance.voice = selectedVoice;
                    } else if (voices.length > 0) {
                        // Find a good English voice
                        let voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft')));
                        if (!voice) voice = voices.find(v => v.lang.startsWith('en'));
                        if (!voice && voices.length > 0) voice = voices[0];
                        if (voice) {
                            selectedVoice = voice;
                            speechUtterance.voice = voice;
                        }
                    }
                }
                
                speechUtterance.onboundary = function (event) {
                    if (event.name === 'word') {
                        // For resumed speech, add the resume start index to get correct position
                        const actualStart = resumeStartIndex + event.charIndex;
                        const actualEnd = actualStart + event.charLength;
                        
                        // Update pausedAtIndex to track current position in original text
                        pausedAtIndex = actualStart;
                        
                        highlightSpokenWord(actualStart, actualEnd);
                    }
                };
                
                speechUtterance.onend = () => {
                    $('.tts-word').removeClass('highlighted');
                    isPaused = false;
                };
                
                window.speechSynthesis.speak(speechUtterance);
            };
            
            // If voices are already loaded, use them immediately
            if (window.speechSynthesis.getVoices().length > 0) {
                setVoiceAndSpeak();
            } else {
                // Wait for voices to load
                window.speechSynthesis.onvoiceschanged = () => {
                    setVoiceAndSpeak();
                    // Restore the original voices changed handler
                    window.speechSynthesis.onvoiceschanged = loadVoices;
                };
            }
        }
    }
}

$(document).on('click', '#readArticleBtn', function () {
    if (!window.extractedContent || window.extractedContent.trim().length === 0) {
        showWarningToast("No content to read.", "Text-to-Speech");
        return;
    }
    startSpeaking(window.extractedContent);
});

$(document).on('click', '#stopReadArticleBtn', function () {
    stopSpeaking();
});

$(document).on('click', '#resumeReadArticleBtn', function () {
    resumeSpeaking();
});

function highlightSpokenWord(start, end) {
    $('.tts-word').removeClass('highlighted');
    
    // Get the full text content for accurate indexing
    const fullText = window.extractedContent || '';
    if (!fullText) return;
    
    // Create a more accurate mapping between character positions and spans
    let charIndex = 0;
    let foundSpan = null;
    
    $('.tts-word').each(function () {
        const spanText = $(this).text();
        const spanStartIndex = charIndex;
        const spanEndIndex = charIndex + spanText.length;
        
        // Check if the word boundary falls within this span
        // Allow for some tolerance in matching
        if (start >= spanStartIndex && start <= spanEndIndex) {
            foundSpan = $(this);
            return false; // Break the loop
        }
        
        charIndex = spanEndIndex;
        
        // Handle whitespace and separators between spans
        // Skip whitespace in the original text
        while (charIndex < fullText.length && /\s/.test(fullText[charIndex])) {
            charIndex++;
        }
    });
    
    // If we didn't find exact match, try to find closest span
    if (!foundSpan) {
        let closestSpan = null;
        let minDistance = Infinity;
        charIndex = 0;
        
        $('.tts-word').each(function () {
            const spanText = $(this).text();
            const spanStartIndex = charIndex;
            const spanEndIndex = charIndex + spanText.length;
            
            // Calculate distance from start position to this span
            const distance = Math.min(
                Math.abs(start - spanStartIndex),
                Math.abs(start - spanEndIndex)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestSpan = $(this);
            }
            
            charIndex = spanEndIndex;
            while (charIndex < fullText.length && /\s/.test(fullText[charIndex])) {
                charIndex++;
            }
        });
        
        foundSpan = closestSpan;
    }
    
    if (foundSpan) {
        foundSpan.addClass('highlighted');
        
        // Scroll the highlighted word into view if needed
        const container = $('.article-body');
        const element = foundSpan[0];
        if (element && container.length) {
            const containerTop = container.scrollTop();
            const containerHeight = container.height();
            const elementTop = element.offsetTop - container.offset().top + containerTop;
            
            // Only scroll if element is not visible
            if (elementTop < containerTop || elementTop > containerTop + containerHeight) {
                container.animate({
                    scrollTop: elementTop - containerHeight / 2
                }, 300);
            }
        }
    }
}

// ================================================
// ================ SUMMARIZE ======================
// ================================================

$(document).on('click', '#generateSummaryBtn', function () {
    $('#summaryLoading').show();
    $('#articleSummary').text('');
    $(this).prop('disabled', true);

    const articleText = window.extractedContent || '';

    if (!articleText) {
        showWarningToast("No content available to summarize.", "Summarization");
        $('#summaryLoading').hide();
        $(this).prop('disabled', false);
        return;
    }

    ajaxCall(
        "POST",
        serverUrl + "Articles/summarize",
        JSON.stringify({ text: articleText }),
        function (data) {
            if (data.summary) {
                console.log(data.summary)
                $('#articleSummary').text(data.summary).show();
                $('.article-summary').show();
            } else {
                showWarningToast("No summary received", "Summarization");
            }
            $('#summaryLoading').hide();
            $('#generateSummaryBtn').prop('disabled', false);
        },
        function (xhr) {
            showErrorToast("Failed to generate summary: " + (xhr.responseText || xhr.statusText), "Summarization Failed");
            $('#summaryLoading').hide();
            $('#generateSummaryBtn').prop('disabled', false);
        }
    );
});