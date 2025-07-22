//firebase chat
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Your web app's Firebase configuration
// הוסף כאן את ה-firebaseConfig שלך
const firebaseConfig = {
    apiKey: "AIzaSyBNmhr9BYmpGC0jLG9TFCoR3rCNKI8IPIM",
    authDomain: "newspapersite-ruppin.firebaseapp.com",
    projectId: "newspapersite-ruppin",
    storageBucket: "newspapersite-ruppin.firebasestorage.app",
    messagingSenderId: "397153014495",
    appId: "1:397153014495:web:c3613b494555359a86cf6a",
    measurementId: "G-WN88XW35LV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

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

document.addEventListener('DOMContentLoaded', async () => {
    // המתן עד שה-article נטען
    const waitForArticle = () => {
        return new Promise((resolve) => {
            const checkArticle = () => {
                if (window.article) {
                    resolve();
                } else {
                    setTimeout(checkArticle, 100);
                }
            };
            checkArticle();
        });
    };

    await waitForArticle();

    const userName = currentUser ?
        currentUser.name :
        `Guest_${Math.random().toString(36).substr(2, 5)}`;

    // העבר את כל נתוני הכתבה במקום רק ה-ID
    await initChat(window.article, userName);
});


// פתרון 4: אלטרנטיבה - השתמש בהאש של הכתבה
function generateArticleHash(article) {
    // יצור hash פשוט מהכותרת והתאריך
    let text = '';
    if (article.title) text += article.title;
    if (article.publishedAt) text += article.publishedAt;
    if (article.url) text += article.url;

    // Hash function פשוט
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    return `article_${Math.abs(hash)}`;
}

// שימוש בפונקציה החדשה
async function initChatWithHash(articleData, userName) {
    const chatId = generateArticleHash(articleData);
    console.log("Using hashed chat ID:", chatId);

    // יתר הקוד זהה לפונקציה המקורית, רק עם chatId במקום unifiedId
    // ...
}

// שאר הפונקציות נשארות אותו דבר...

//Load all saved articles for current user
function loadSavedArticles(userId) {
    return new Promise((resolve, reject) => {
        ajaxCall("GET", serverUrl + `Articles/saved/${userId}`, null,
            function (articles) {
                savedArticles = articles;
                resolve(articles);
            },
            function () {
                $("#saved").html('<div class="alert alert-danger text-center">Failed to load saved articles.</div>');
                reject("Failed to load");
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

//to split the words in the body to spans
function wrapWordsInSpans(text) {
    return text.split(/(\s+)/).map((word, i) => {
        if (word.trim() === '') return word;
        return `<span class="tts-word" data-index="${i}">${word}</span>`;
    }).join('');
}

$(document).ready(async function () {
    const id = getArticleIdFromUrl();
    if (!id) return $('#articleContainer').html('<div class="alert alert-danger">No article ID provided.</div>');

    let articles;
    window.article = {}; // הוסף את זה לגלובל scope

    if (isNaN(id)) {
        articles = getCachedArticles();
        window.article = articles.find(a => a.id == id);
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
          <span class="badge bg-${availableTags.find(t => t.id === window.article.category)?.color || 'secondary'}">${window.article.category}</span>
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

        <div class="article-body" style="
          font-size: 1.4rem;
          line-height: 1.9;
          font-family: 'Segoe UI', 'Open Sans', sans-serif;
          color: #333;
          white-space: pre-line;
          text-align: justify;
          margin-top: 1rem;">
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
        <a href="${window.article.url}" target="_blank" class="mt-2 btn btn-outline-dark btn-sm w-100">
          <i class="bi bi-box-arrow-up-right"></i> View Source
        </a>
        <button class="btn btn-outline-danger btn-sm w-100 mt-2 report-article-btn" data-id="${id}">
          <i class="bi bi-flag"></i> Report Article
        </button>
      </div>
    </div>

    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <h6 class="fw-bold">Article Information</h6>
        <div class="mb-2">
          <strong>Category</strong><br>
          <span class="badge bg-${availableTags.find(t => t.id === window.article.category)?.color || 'secondary'}">${window.article.category}</span>
        </div>
        <div class="mb-2"><strong>Published</strong><br>${formatDate(window.article.publishedAt)}</div>
        <div class="mb-2"><strong>Source</strong><br>${window.article.source || window.article.sourceName || 'Unknown'}</div>
        <div><strong>Comments</strong><br>${comments.length} comment${comments.length === 1 ? '' : 's'}</div>
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

    $('#commentForm').off('submit').on('submit', function (e) {
        e.preventDefault();
        const text = $('#commentInput').val();
        if (text && currentUser) {
            if (!articleComments[id]) articleComments[id] = [];
            articleComments[id].push({ user: currentUser.name, text, date: new Date() });
            $('#commentInput').val('');
        }
    });
});

//TTS READER
let speechUtterance = null;
let isPaused = false;

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

    const voices = window.speechSynthesis.getVoices();
    let voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft')));
    if (!voice && voices.length > 0) voice = voices[0];
    if (voice) speechUtterance.voice = voice;

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