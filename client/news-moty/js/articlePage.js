//firebase chat
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
// Import will be done via script tag in HTML


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

// Firebase Auth Setup - התחברות אנונימית לצורך הצ'אט
function initializeFirebaseAuth() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User signed in:", user.uid);
                resolve(user);
            } else {
                // התחברות אנונימית אם אין משתמש
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

// פונקציה לאתחול הצ'אט של כתבה
async function initChat(articleData, userName) {
    // אתחל Firebase אם עדיין לא אותחל
    if (!app && !initializeFirebase()) {
        console.error("Failed to initialize Firebase");
        return;
    }

    // במקום לקבל articleId, נקבל את כל נתוני הכתבה
    const unifiedId = generateUnifiedArticleId(articleData);

    if (!unifiedId) {
        console.error("Cannot generate unified ID for article:", articleData);
        return;
    }

    console.log("Using unified chat ID:", unifiedId);

    // וודא שהמשתמש מחובר ל-Firebase Auth
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

    // בדיקה שכל הרכיבים קיימים
    if (!chatContainer || !chatMessages || !chatInput || !sendBtn) {
        console.error("Chat elements not found in DOM");
        return;
    }

    // יצירת reference לאוסף ההודעות של הצ'אט ב-Firestore
    const messagesRef = collection(db, 'chatrooms', unifiedId, 'messages');

    // שאילתה למיון ההודעות לפי timestamp
    const q = query(messagesRef, orderBy('timestamp'));

    try {
        // האזנה לשינויים בזמן אמת
        const unsubscribe = onSnapshot(q, (snapshot) => {
            chatMessages.innerHTML = '';
            snapshot.forEach(doc => {
                const msg = doc.data();
                // בדוק אם זו ההודעה שלי
                const isMine = (msg.userName === userName);
                const messageClass = isMine ? 'my-message' : 'other-message';
                const alignClass = isMine ? 'text-end' : 'text-start';
                // צבע רקע נוסף כבר ב-CSS

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
            chatMessages.scrollTop = chatMessages.scrollHeight; // גלילה לתחתית
        }, (error) => {
            console.error("Error listening to messages:", error);
            chatMessages.innerHTML = '<div class="alert alert-danger">Error loading chat messages</div>';
        });

        // שליחת הודעה
        sendBtn.onclick = async () => {
            const text = chatInput.value.trim();
            if (!text) return;

            try {
                await addDoc(messagesRef, {
                    text,
                    userName,
                    timestamp: serverTimestamp(),
                    articleTitle: articleData.title // הוסף את כותרת הכתבה למעקב
                });
                chatInput.value = '';
            } catch (error) {
                console.error("Error sending message:", error);
                alert("Failed to send message. Please try again.");
            }
        };

        // אפשרות לשלוח הודעה בעזרת Enter
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
}


function generateUnifiedArticleId(article) {
    if (!article) return null;

    // אופציה 1: אם יש URL, השתמש בו
    if (article.url) {
        // נוציא את הדומיין ונשמור רק את החלק הייחודי
        const url = new URL(article.url);
        const path = url.pathname + url.search;
        // נסיר תווים לא חוקיים עבור Firestore collection ID
        return btoa(path).replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
    }

    // אופציה 2: אם אין URL, נשתמש בכותרת + תאריך פרסום
    if (article.title && article.publishedAt) {
        const combined = article.title + article.publishedAt;
        return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
    }

    // אופציה 3: אם זה כתבה מקומית עם ID מספרי, נשתמש בו
    if (article.id && !isNaN(article.id)) {
        return `local_${article.id}`;
    }

    return null;
}

function loadSingleArticle(userId, articleId) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams(window.location.search);
        let collection = params.get('collection');
        let apiUrl = '';
        if (collection == "Shared")
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

// --- Save Article ---
function saveSCB(responseText) {
    alert(responseText);
    $('.save-article-btn-from-view').text("Article Saved");
    $('.save-article-btn-from-view').removeClass('btn-outline-dark').addClass('btn-dark');
}

function saveECB() {
    alert("Failed to save article");
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

// --- Share Article ---
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
    alert(responseText);
    $('.share-article-btn-from-view').text("Article Shared");
    $('.share-article-btn-from-view').removeClass('btn-outline-dark').addClass('btn-dark');
}

function shareECB(xhr) {
    alert(xhr.responseText || "Failed to share article.");
}

$(document).on('click', '#btnShareArticle', function () {
    const comment = $('#shareComment').val();
    shareArticle(window.article, comment, shareSCB, shareECB);
});

// --- Report Article ---
$(document).on('click', '.report-article-btn-from-view', function () { //inserting the article id to the modal report button
    const articleId = $(this).data("id");
    $('#btnReportArticle').data("id", articleId);
    $('#reportModal').modal('show');
});

function reportSCB(responseText) {
    alert("Report submitted successfully.");
    $('#reportModal').modal('hide');
    $("#reportComment").val("");
    $("#reportReason").val("");
    $('.report-article-btn-from-view').text("Article Reported");
    $('.report-article-btn-from-view').removeClass('btn-outline-danger').addClass('btn-danger');
}

function reportECB(xhr) {
    alert(xhr.responseText || "Failed to submit report.");
}

$(document).on('click', '#btnReportArticle', function () {
    reportArticle(window.article, reportSCB, reportECB);
});

//to split the words in the body to spans
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

$(document).ready(async function () {
    const id = getArticleIdFromUrl();

    let articles;
    window.article = {}; // הוסף את זה לגלובל scope

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
        return $('#articleContainer').html('<div class="alert alert-warning">Article not found.</div>');
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

    <!-- Live Chat - מועבר לסיידבר -->
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
                // אם נכשל, נסה שוב אחרי רגע
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
            alert('Comment text cannot be empty.');
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
                
                // רענן את התגובות והמתן לסיום
                loadComments(window.article.id);
                
                // הצג הודעת הצלחה רק אחרי שהתגובות נטענו
                setTimeout(() => {
                    alert(response);
                }, 500);
            },
            function (xhr) {
                alert(xhr.responseText);
            });
    });


    $(document).ready(function () {
        loadComments(window.article.id);
    });

    //delete comment
    $(document).on('click', '.delete-comment-btn', function () {
        const articleId = $(this).data('article-id');

        if (!confirm("Are you sure you want to delete your comment ?")) return;

        const url = serverUrl + `Comments/DeleteCommentByArticleAndUser?userId=${currentUser.id}&articleId=${articleId}`;

        console.log(url);

        ajaxCall("DELETE", url, null,
            function (response) {
                alert(response);
                loadComments(articleId);
            },
            function (xhr) {
                alert("Error: " + xhr.responseText);
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
                alert(response);
                loadComments(article.id); 
            },
            function (xhr) {
                alert("Error: " + xhr.responseText);
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
        window.extractedContent = extractedContent; // שמור גלובלית לצורך TTS
    } else if (window.article.fullText) {
        $('.article-body').html(wrapWordsInSpans(window.article.fullText));
        window.extractedContent = window.article.fullText; // שמור גלובלית לצורך TTS
    }

    // אתחל את הצ'אט אחרי שכל ה-HTML נוצר
    const userName = currentUser ?
        currentUser.name :
        `Guest_${Math.random().toString(36).substr(2, 5)}`;

    // אתחול בחירת קולות TTS
    setTimeout(() => {
        loadVoices();
    }, 100);

    // וודא שכל האלמנטים קיימים לפני אתחול הצ'אט
    setTimeout(async () => {
        await initChat(window.article, userName);
    }, 500); // המתנה קצרה לוודא שהכל נטען
});

//TTS READER
let speechUtterance = null;
let isPaused = false;
let availableVoices = [];

// פונקציה לטעינת קולות זמינים
function loadVoices() {
    availableVoices = window.speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    
    if (!voiceSelect) return;

    // נקה את הרשימה הקיימת
    voiceSelect.innerHTML = '<option value="">🎙️ Default Voice</option>';
    
    // סנן רק קולות באנגלית
    const englishVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('en') || voice.lang.includes('US') || voice.lang.includes('GB')
    );
    
    // הוסף את הקולות הבאנגלית בלבד
    englishVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = availableVoices.indexOf(voice); // שמור את האינדקס המקורי
        
        // הוסף אייקונים לפי סוג הקול
        let voiceIcon = '🎵';
        if (voice.name.toLowerCase().includes('google')) voiceIcon = '🤖';
        else if (voice.name.toLowerCase().includes('microsoft')) voiceIcon = '💻';
        else if (voice.name.toLowerCase().includes('male')) voiceIcon = '👨';
        else if (voice.name.toLowerCase().includes('female')) voiceIcon = '👩';
        
        // יצירת שם נקי יותר
        let cleanName = voice.name.replace(/Microsoft|Google|Apple/gi, '').trim();
        let region = '';
        if (voice.lang.includes('US')) region = '🇺🇸';
        else if (voice.lang.includes('GB')) region = '🇬🇧';
        else if (voice.lang.includes('AU')) region = '🇦🇺';
        else region = '🌍';
        
        option.textContent = `${voiceIcon} ${cleanName} ${region}`;
        voiceSelect.appendChild(option);
    });
    
    // הוסף CSS לדropdown
    if (!document.getElementById('voice-dropdown-styles')) {
        const style = document.createElement('style');
        style.id = 'voice-dropdown-styles';
        style.textContent = `
            /* Light mode styles (default) */
            .voice-selector-container {
                background: rgba(255, 255, 255, 0.9);
                padding: 8px 12px;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            .voice-selector-container label {
                color: #6c757d !important;
                font-weight: 500;
            }
            .voice-dropdown {
                border: 1px solid #d0d0d0 !important;
                border-radius: 8px !important;
                background: white !important;
                color: #333 !important;
                font-size: 0.85rem !important;
                padding: 6px 10px !important;
                transition: all 0.2s ease !important;
            }
            .voice-dropdown:focus {
                border-color: #0d6efd !important;
                box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15) !important;
                background: #f8f9fa !important;
            }
            .voice-dropdown option {
                padding: 8px 12px;
                font-size: 0.9rem;
                background: white;
                color: #333;
            }
            .voice-dropdown option:hover,
            .voice-dropdown option:checked {
                background: #f8f9fa !important;
                color: #212529 !important;
            }

            /* Dark mode styles */
            @media (prefers-color-scheme: dark) {
                .voice-selector-container {
                    background: rgba(40, 44, 52, 0.95);
                    border: 1px solid #495057;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                }
                .voice-selector-container label {
                    color: #e9ecef !important;
                }
                .voice-dropdown {
                    border: 1px solid #6c757d !important;
                    background: #343a40 !important;
                    color: #f8f9fa !important;
                }
                .voice-dropdown:focus {
                    background: #495057 !important;
                    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
                }
                .voice-dropdown option {
                    background: #343a40;
                    color: #f8f9fa;
                }
                .voice-dropdown option:hover,
                .voice-dropdown option:checked {
                    background: #495057 !important;
                    color: #ffffff !important;
                }
            }

            /* Manual dark mode class support */
            [data-bs-theme="dark"] .voice-selector-container,
            .dark-mode .voice-selector-container {
                background: rgba(40, 44, 52, 0.95);
                border: 1px solid #495057;
                box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            }
            [data-bs-theme="dark"] .voice-selector-container label,
            .dark-mode .voice-selector-container label {
                color: #e9ecef !important;
            }
            [data-bs-theme="dark"] .voice-dropdown,
            .dark-mode .voice-dropdown {
                border: 1px solid #6c757d !important;
                background: #343a40 !important;
                color: #f8f9fa !important;
            }
            [data-bs-theme="dark"] .voice-dropdown:focus,
            .dark-mode .voice-dropdown:focus {
                background: #495057 !important;
                box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
            }
            [data-bs-theme="dark"] .voice-dropdown option,
            .dark-mode .voice-dropdown option {
                background: #343a40;
                color: #f8f9fa;
            }
            [data-bs-theme="dark"] .voice-dropdown option:hover,
            [data-bs-theme="dark"] .voice-dropdown option:checked,
            .dark-mode .voice-dropdown option:hover,
            .dark-mode .voice-dropdown option:checked {
                background: #495057 !important;
                color: #ffffff !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// טען קולות כשהם מוכנים
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

function startSpeaking(text) {
    if (!text || text.trim() === '') {
        alert("No text to read.");
        return;
    }

    isPaused = false;

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = 'en-US';
    speechUtterance.pitch = 0.9;
    speechUtterance.rate = 0.9;

    // בחירת קול לפי הבחירה של המשתמש
    const voiceSelect = document.getElementById('voiceSelect');
    const selectedVoiceIndex = voiceSelect ? voiceSelect.value : '';
    
    if (selectedVoiceIndex !== '' && availableVoices[selectedVoiceIndex]) {
        speechUtterance.voice = availableVoices[selectedVoiceIndex];
    } else {
        // ברירת מחדל - מצא קול באנגלית
        const voices = window.speechSynthesis.getVoices();
        let voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft')));
        if (!voice && voices.length > 0) voice = voices[0];
        if (voice) speechUtterance.voice = voice;
    }

    speechUtterance.onboundary = function (event) {
        if (event.name === 'word') {
            const start = event.charIndex;
            const end = start + event.charLength;
            highlightSpokenWord(start, end);
        }
    };

    speechUtterance.onend = () => {
        $('.tts-word').removeClass('highlighted');
    };

    window.speechSynthesis.speak(speechUtterance);
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
    if (!window.extractedContent || window.extractedContent.trim().length === 0) {
        alert("No content to read.");
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
    let totalLength = 0;
    $('.tts-word').each(function () {
        const text = $(this).text();
        const wordLength = text.length;
        if (start >= totalLength && start < totalLength + wordLength) {
            $(this).addClass('highlighted');
            return false;
        }
        totalLength += wordLength + 1;
    });
}

//SUMMARIZE
$(document).on('click', '#generateSummaryBtn', function () {
    $('#summaryLoading').show();
    $('#articleSummary').text('');
    $(this).prop('disabled', true);

    const articleText = window.extractedContent || '';

    if (!articleText) {
        alert("No content available to summarize.");
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