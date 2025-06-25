// News Hub Application - JavaScript with jQuery

$(document).ready(() => {
  // Initialize the application
  initializeApp()
})

// Global variables
let currentUser = null
let currentArticle = null
let savedArticles = []
let sharedArticles = []
let reportedArticles = []
let userTags = []
let customTags = []
let followingUsers = []
let allUsers = []
const adminStats = {
  dailyVisits: 0,
  totalArticles: 0,
  totalSaves: 0,
  totalReports: 0,
  blockedUsers: 0,
}

// Sample data
const sampleArticles = [
  {
    id: "1",
    title: "Revolutionary AI Technology Transforms Healthcare",
    content:
      "Artificial Intelligence is making unprecedented advances in healthcare, with new diagnostic tools showing remarkable accuracy in detecting diseases early. This breakthrough technology promises to revolutionize patient care and medical outcomes worldwide.\n\nThe latest AI systems can analyze medical images with 95% accuracy, surpassing human radiologists in many cases. This development could save millions of lives by enabling earlier detection of critical conditions like cancer, heart disease, and neurological disorders.\n\nMajor hospitals across the globe are now implementing these AI-powered diagnostic tools, with remarkable results. Patients are receiving faster, more accurate diagnoses, leading to better treatment outcomes and reduced healthcare costs.",
    preview:
      "AI technology is revolutionizing healthcare with new diagnostic tools showing remarkable accuracy in detecting diseases early...",
    category: "technology",
    publishedAt: new Date("2024-01-15"),
    imageUrl: "/placeholder.svg?height=400&width=600",
    isHero: true,
  },
  {
    id: "2",
    title: "Global Climate Summit Reaches Historic Agreement",
    content:
      "World leaders have reached a groundbreaking agreement on climate action, committing to ambitious targets for carbon reduction and renewable energy adoption. The summit marks a turning point in global environmental policy.\n\nOver 190 countries have pledged to achieve net-zero emissions by 2050, with intermediate targets set for 2030. The agreement includes unprecedented funding for developing nations to transition to clean energy and adapt to climate change impacts.",
    preview:
      "World leaders reach groundbreaking agreement on climate action with ambitious carbon reduction targets...",
    category: "environment",
    publishedAt: new Date("2024-01-14"),
    imageUrl: "/placeholder.svg?height=400&width=600",
    isHero: true,
  },
  {
    id: "3",
    title: "Breakthrough in Quantum Computing Achieved",
    content:
      "Scientists have achieved a major breakthrough in quantum computing, demonstrating quantum supremacy in solving complex mathematical problems. This advancement could revolutionize computing, cryptography, and scientific research.",
    preview: "Scientists achieve major breakthrough in quantum computing, demonstrating quantum supremacy...",
    category: "technology",
    publishedAt: new Date("2024-01-13"),
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "4",
    title: "New Study Reveals Benefits of Mediterranean Diet",
    content:
      "A comprehensive study involving 50,000 participants shows that the Mediterranean diet significantly reduces the risk of heart disease and improves cognitive function. The research provides strong evidence for dietary lifestyle changes.",
    preview: "Comprehensive study shows Mediterranean diet significantly reduces heart disease risk...",
    category: "health",
    publishedAt: new Date("2024-01-12"),
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "5",
    title: "Olympic Games Set New Sustainability Standards",
    content:
      "The upcoming Olympic Games will set new standards for sustainability, featuring carbon-neutral venues and innovative waste reduction programs. Organizers aim to create a blueprint for future sporting events.",
    preview: "Upcoming Olympic Games set new sustainability standards with carbon-neutral venues...",
    category: "sports",
    publishedAt: new Date("2024-01-11"),
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "6",
    title: "Cryptocurrency Market Shows Signs of Recovery",
    content:
      "After months of volatility, the cryptocurrency market is showing strong signs of recovery with major coins gaining significant value. Analysts point to increased institutional adoption and regulatory clarity as key factors.",
    preview: "Cryptocurrency market shows strong recovery signs with major coins gaining value...",
    category: "business",
    publishedAt: new Date("2024-01-10"),
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "7",
    title: "Space Tourism Industry Takes Off",
    content:
      "Commercial space tourism is becoming a reality as multiple companies successfully launch civilian passengers into space. This marks the beginning of a new era in space exploration and accessibility.",
    preview: "Commercial space tourism becomes reality with successful civilian launches...",
    category: "technology",
    publishedAt: new Date("2024-01-09"),
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "8",
    title: "Mental Health Awareness Reaches New Heights",
    content:
      "Mental health awareness campaigns are showing unprecedented success in reducing stigma and encouraging people to seek help. New treatment methods and support systems are being implemented worldwide.",
    preview: "Mental health awareness campaigns show success in reducing stigma and encouraging help-seeking...",
    category: "health",
    publishedAt: new Date("2024-01-08"),
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
]

const availableTags = [
  { id: "technology", name: "Technology", icon: "fas fa-microchip", color: "primary" },
  { id: "health", name: "Health", icon: "fas fa-heartbeat", color: "success" },
  { id: "sports", name: "Sports", icon: "fas fa-football-ball", color: "warning" },
  { id: "business", name: "Business", icon: "fas fa-chart-line", color: "info" },
  { id: "entertainment", name: "Entertainment", icon: "fas fa-film", color: "danger" },
  { id: "environment", name: "Environment", icon: "fas fa-leaf", color: "success" },
]

// Sample users for following functionality
allUsers = [
  { id: "1", username: "john_doe", name: "John Doe", email: "john@example.com", isBlocked: false },
  { id: "2", username: "jane_smith", name: "Jane Smith", email: "jane@example.com", isBlocked: true },
  { id: "3", username: "bob_wilson", name: "Bob Wilson", email: "bob@example.com", isBlocked: false },
  { id: "4", username: "alice_cooper", name: "Alice Cooper", email: "alice@example.com", isBlocked: false },
  { id: "5", username: "david_brown", name: "David Brown", email: "david@example.com", isBlocked: false },
]

// Initialize application
function initializeApp() {
  // Track daily visits
  adminStats.dailyVisits++
  adminStats.totalArticles = sampleArticles.length

  // Load initial data
  loadHomePage()
  setupEventHandlers()
  updateNavigation()

  // Initialize sample shared articles
  sharedArticles = [
    {
      id: "1",
      articleId: "1",
      userId: "1",
      username: "john_doe",
      comment:
        "This AI breakthrough is absolutely fascinating! The potential for early disease detection could save millions of lives.",
      sharedAt: new Date("2024-01-16"),
      article: sampleArticles[0],
    },
    {
      id: "2",
      articleId: "2",
      userId: "4",
      username: "alice_cooper",
      comment:
        "Finally, some real action on climate change! Hope world leaders actually follow through on these commitments.",
      sharedAt: new Date("2024-01-15"),
      article: sampleArticles[1],
    },
  ]
}

// Setup event handlers
function setupEventHandlers() {
  // Login form
  $("#loginForm").on("submit", (e) => {
    e.preventDefault()
    handleLogin()
  })

  // Register form
  $("#registerForm").on("submit", (e) => {
    e.preventDefault()
    handleRegister()
  })

  // Category filters
  $(document).on("click", ".category-filter", function () {
    $(".category-filter").removeClass("active")
    $(this).addClass("active")
    const category = $(this).data("category")
    filterArticlesByCategory(category)
  })

  // Custom tag input
  $("#customTagInput").on("keypress", (e) => {
    if (e.which === 13) {
      addCustomTag()
    }
  })

  // User search input
  $("#userSearchInput").on("keypress", (e) => {
    if (e.which === 13) {
      searchUsers()
    }
  })

  // Comment input
  $("#commentInput").on("keypress", (e) => {
    if (e.which === 13) {
      addComment()
    }
  })
}

// Page navigation
function showPage(pageName) {
  // Hide all pages
  $(".page-content").hide()

  // Show selected page
  $(`#${pageName}Page`).show().addClass("fade-in")

  // Update navigation
  $(".nav-link").removeClass("active")
  $(`.nav-link[onclick="showPage('${pageName}')"]`).addClass("active")

  // Load page-specific content
  switch (pageName) {
    case "home":
      loadHomePage()
      break
    case "saved":
      loadSavedArticles()
      break
    case "shared":
      loadSharedArticles()
      break
    case "interests":
      loadInterestsPage()
      break
    case "admin":
      loadAdminPage()
      break
  }
}

// Load home page with hero carousel and categorized articles
function loadHomePage() {
  loadHeroCarousel()
  loadCategorizedArticles()
}

// Load hero carousel
function loadHeroCarousel() {
  const heroArticles = sampleArticles.filter((article) => article.isHero)
  const $heroInner = $("#heroInner")
  const $heroIndicators = $("#heroIndicators")

  $heroInner.empty()
  $heroIndicators.empty()

  heroArticles.forEach((article, index) => {
    // Create indicator
    const $indicator = $(`
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="${index}" 
                    ${index === 0 ? 'class="active"' : ""}></button>
        `)
    $heroIndicators.append($indicator)

    // Create carousel item
    const $item = $(`
            <div class="carousel-item ${index === 0 ? "active" : ""}">
                <a href="#" class="hero-article" style="background-image: url('${article.imageUrl}')" 
                   onclick="viewArticle('${article.id}')">
                    <div class="hero-content">
                        <h1 class="hero-title">${article.title}</h1>
                        <p class="hero-preview">${article.preview}</p>
                        <div class="hero-meta">
                            <span class="badge bg-light text-dark me-2">${article.category}</span>
                            <span>${formatDate(article.publishedAt)}</span>
                        </div>
                    </div>
                </a>
            </div>
        `)
    $heroInner.append($item)
  })
}

// Load categorized articles
function loadCategorizedArticles() {
  const categories = [...new Set(sampleArticles.map((article) => article.category))]
  const $container = $("#categorizedArticles")
  $container.empty()

  categories.forEach((category) => {
    const categoryArticles = sampleArticles.filter((article) => article.category === category && !article.isHero)

    if (categoryArticles.length > 0) {
      const $section = $(`
                <div class="category-section">
                    <h3 class="category-title text-capitalize">${category}</h3>
                    <div class="row" id="category-${category}"></div>
                </div>
            `)

      const $row = $section.find(".row")
      categoryArticles.slice(0, 3).forEach((article) => {
        const $card = createArticleCard(article)
        $row.append($card)
      })

      $container.append($section)
    }
  })
}

// Filter articles by category
function filterArticlesByCategory(category) {
  if (category === "all") {
    $(".category-section").show()
  } else {
    $(".category-section").hide()
    $(`.category-section:has(#category-${category})`).show()
  }
}

// Create article card
function createArticleCard(article) {
  return $(`
        <div class="col-md-4 mb-4">
            <div class="card article-card" onclick="viewArticle('${article.id}')">
                <img src="${article.imageUrl}" class="card-img-top" alt="${article.title}">
                <div class="card-body">
                    <h5 class="article-title">${article.title}</h5>
                    <p class="article-preview">${article.preview}</p>
                    <div class="article-meta">
                        <small class="text-muted">
                            <i class="fas fa-calendar me-1"></i>
                            ${formatDate(article.publishedAt)}
                        </small>
                        <span class="badge bg-primary ms-2">${article.category}</span>
                    </div>
                </div>
            </div>
        </div>
    `)
}

// View single article
function viewArticle(articleId) {
  const article = sampleArticles.find((a) => a.id === articleId)
  if (!article) return

  currentArticle = article
  showPage("article")
  displayArticle(article)
  loadComments(articleId)
  loadRelatedArticles(article.category, articleId)
  updateArticleActions()
}

// Display article content
function displayArticle(article) {
  const $content = $("#articleContent")
  $content.html(`
        <div class="card-body">
            <h1 class="mb-3">${article.title}</h1>
            <div class="mb-3">
                <small class="text-muted">
                    <i class="fas fa-calendar me-2"></i>
                    ${formatDate(article.publishedAt)}
                    <span class="badge bg-primary ms-2">${article.category}</span>
                </small>
            </div>
            <img src="${article.imageUrl}" class="img-fluid mb-4" alt="${article.title}">
            <div class="article-content">
                ${article.content
                  .split("\n")
                  .map((p) => `<p>${p}</p>`)
                  .join("")}
            </div>
        </div>
    `)
}

// Update article actions based on user state
function updateArticleActions() {
  if (currentUser) {
    $("#loginPromptActions").hide()
    $("#saveBtn, #shareBtn, #reportBtn").show()

    // Check if article is already saved
    const isSaved = savedArticles.includes(currentArticle.id)
    if (isSaved) {
      $("#saveBtn").hide()
      $("#unsaveBtn").show()
    } else {
      $("#saveBtn").show()
      $("#unsaveBtn").hide()
    }

    // Check if article is already reported by this user
    const isReported = reportedArticles.some(
      (report) => report.articleId === currentArticle.id && report.userId === currentUser.id,
    )
    if (isReported) {
      $("#reportBtn").prop("disabled", true).text("Already Reported")
    } else {
      $("#reportBtn").prop("disabled", false).html('<i class="fas fa-flag"></i> Report Article')
    }

    $("#commentForm").show()
    $("#loginPromptComments").hide()
  } else {
    $("#loginPromptActions").show()
    $("#saveBtn, #unsaveBtn, #shareBtn, #reportBtn").hide()
    $("#commentForm").hide()
    $("#loginPromptComments").show()
  }
}

// Authentication functions
// תקן את פונקציית handleLogin כדי לטפל נכון בהתחברות האדמין
function handleLogin() {
  const email = $("#loginEmail").val()
  const password = $("#loginPassword").val()

  // Admin login - אפשר גם עם admin@newshub.com או admin
  if ((email === "admin" || email === "admin@newshub.com") && password === "admin") {
    currentUser = {
      id: "admin",
      name: "Administrator",
      email: "admin@newshub.com",
      username: "admin",
      isAdmin: true,
    }

    // נקה את השדות
    $("#loginEmail, #loginPassword").val("")

    // סגור את המודל
    $("#loginModal").modal("hide")

    // עדכן את הניווט
    updateNavigation()

    // הצג הודעת הצלחה
    showToast("Admin login successful!", "success")

    // עבור לעמוד האדמין
    setTimeout(() => {
      showPage("admin")
    }, 500)

    return
  }

  // Regular user login (mock)
  if (email && password) {
    const user = allUsers.find((u) => u.email === email)
    if (user) {
      currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        isAdmin: false,
      }

      // נקה את השדות
      $("#loginEmail, #loginPassword").val("")

      // סגור את המודל
      $("#loginModal").modal("hide")

      // עדכן את הניווט
      updateNavigation()

      // הצג הודעת הצלחה
      showToast("Login successful!", "success")
    } else {
      showError("loginError", "Invalid credentials")
    }
  } else {
    showError("loginError", "Please enter both email and password")
  }
}

function handleRegister() {
  const name = $("#registerName").val()
  const email = $("#registerEmail").val()
  const password = $("#registerPassword").val()
  const confirmPassword = $("#confirmPassword").val()

  if (password !== confirmPassword) {
    showError("registerError", "Passwords do not match")
    return
  }

  if (name && email && password) {
    const newUser = {
      id: Date.now().toString(),
      name: name,
      email: email,
      username: email.split("@")[0],
      isAdmin: false,
      isBlocked: false,
    }

    allUsers.push(newUser)
    currentUser = newUser

    $("#registerModal").modal("hide")
    updateNavigation()
    showToast("Registration successful!", "success")
    $("#registerName, #registerEmail, #registerPassword, #confirmPassword").val("")
  }
}

function logout() {
  currentUser = null
  savedArticles = []
  userTags = []
  customTags = []
  followingUsers = []
  updateNavigation()
  showToast("Logged out successfully!", "info")
  showPage("home")
}

// Update navigation based on auth state
// תקן את פונקציית updateNavigation כדי לוודא שהיא מציגה את קישור האדמין
function updateNavigation() {
  if (currentUser) {
    $("#loginLink, #registerLink").hide()
    $("#logoutLink, #userGreeting").show()

    const hour = new Date().getHours()
    let greeting = "Hello"
    if (hour < 12) greeting = "Good morning"
    else if (hour < 18) greeting = "Good afternoon"
    else greeting = "Good evening"

    $("#greetingText").text(`${greeting}, ${currentUser.name}!`)

    // הצג את קישור האדמין אם המשתמש הוא אדמין
    if (currentUser.isAdmin) {
      $("#adminLink").show()
      console.log("Admin link should be visible now") // לדיבוג
    } else {
      $("#adminLink").hide()
    }
  } else {
    $("#loginLink, #registerLink").show()
    $("#logoutLink, #userGreeting, #adminLink").hide()
  }
}

// Article actions
function saveArticle() {
  if (!currentUser) {
    showToast("Please login to save articles", "warning")
    return
  }

  if (!savedArticles.includes(currentArticle.id)) {
    savedArticles.push(currentArticle.id)
    adminStats.totalSaves++
    showToast("Article saved successfully!", "success")
    updateArticleActions()
  }
}

function unsaveArticle() {
  savedArticles = savedArticles.filter((id) => id !== currentArticle.id)
  adminStats.totalSaves--
  showToast("Article removed from saved!", "success")
  updateArticleActions()
}

function showShareModal() {
  if (!currentUser) {
    showToast("Please login to share articles", "warning")
    return
  }
  $("#shareModal").modal("show")
}

function shareArticle() {
  const comment = $("#shareComment").val().trim()
  if (!comment) {
    showToast("Please add a comment before sharing", "warning")
    return
  }

  const newShare = {
    id: Date.now().toString(),
    articleId: currentArticle.id,
    userId: currentUser.id,
    username: currentUser.username,
    comment: comment,
    sharedAt: new Date(),
    article: currentArticle,
  }

  sharedArticles.unshift(newShare)
  $("#shareModal").modal("hide")
  $("#shareComment").val("")
  showToast("Article shared successfully!", "success")
}

function showReportModal() {
  if (!currentUser) {
    showToast("Please login to report articles", "warning")
    return
  }

  // Check if already reported
  const isReported = reportedArticles.some(
    (report) => report.articleId === currentArticle.id && report.userId === currentUser.id,
  )

  if (isReported) {
    showToast("You have already reported this article", "info")
    return
  }

  $("#reportModal").modal("show")
}

function reportArticle() {
  const reason = $("#reportReason").val()
  const comment = $("#reportComment").val().trim()

  if (!reason) {
    showToast("Please select a reason for reporting", "warning")
    return
  }

  const newReport = {
    id: Date.now().toString(),
    articleId: currentArticle.id,
    userId: currentUser.id,
    username: currentUser.username,
    reason: reason,
    comment: comment,
    reportedAt: new Date(),
    article: currentArticle,
  }

  reportedArticles.push(newReport)
  adminStats.totalReports++

  $("#reportModal").modal("hide")
  $("#reportReason").val("")
  $("#reportComment").val("")

  showToast("Article reported successfully. Thank you for helping keep our community safe.", "success")
  updateArticleActions()
}

// Comments functionality
function loadComments(articleId) {
  // Mock comments data
  const comments = [
    {
      id: "1",
      userId: "1",
      username: "john_doe",
      text: "This is a fascinating article! Thanks for sharing.",
      createdAt: new Date("2024-01-16T10:30:00"),
      isReported: false,
    },
    {
      id: "2",
      userId: "4",
      username: "alice_cooper",
      text: "I completely agree with the points made here. Very insightful.",
      createdAt: new Date("2024-01-16T11:15:00"),
      isReported: false,
    },
  ]

  displayComments(comments)
}

function displayComments(comments) {
  const $commentsList = $("#commentsList")

  if (comments.length === 0) {
    $commentsList.html('<p class="text-muted">No comments yet. Be the first to comment!</p>')
    return
  }

  const commentsHtml = comments
    .map(
      (comment) => `
        <div class="comment-item">
            <div class="comment-meta">
                <strong>${comment.username}</strong>
                <small class="text-muted ms-2">${formatDate(comment.createdAt)}</small>
                ${comment.isReported ? '<span class="badge bg-warning ms-2">Reported</span>' : ""}
            </div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `,
    )
    .join("")

  $commentsList.html(commentsHtml)
}

function addComment() {
  const commentText = $("#commentInput").val().trim()
  if (!commentText) {
    showToast("Please enter a comment", "warning")
    return
  }

  // Mock adding comment
  $("#commentInput").val("")
  showToast("Comment added successfully!", "success")
}

// Load related articles
function loadRelatedArticles(category, currentArticleId) {
  const relatedArticles = sampleArticles
    .filter((article) => article.category === category && article.id !== currentArticleId)
    .slice(0, 3)

  const $container = $("#relatedArticles")

  if (relatedArticles.length === 0) {
    $container.html('<p class="text-muted">No related articles found.</p>')
    return
  }

  const relatedHtml = relatedArticles
    .map(
      (article) => `
        <div class="mb-3">
            <h6 class="mb-1">
                <a href="#" onclick="viewArticle('${article.id}')" class="text-decoration-none">
                    ${article.title}
                </a>
            </h6>
            <small class="text-muted">${formatDate(article.publishedAt)}</small>
        </div>
    `,
    )
    .join("")

  $container.html(relatedHtml)
}

// Saved articles functionality
function loadSavedArticles() {
  if (!currentUser) {
    $("#loginRequiredSaved").show()
    $("#savedArticlesContainer").hide()
    return
  }

  $("#loginRequiredSaved").hide()
  $("#savedArticlesContainer").show()

  const savedArticlesList = sampleArticles.filter((article) => savedArticles.includes(article.id))
  const $container = $("#savedArticlesList")

  if (savedArticlesList.length === 0) {
    $("#noSavedArticles").show()
    $container.empty()
    return
  }

  $("#noSavedArticles").hide()

  const articlesHtml = savedArticlesList
    .map(
      (article) => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card article-card">
                <img src="${article.imageUrl}" class="card-img-top" alt="${article.title}">
                <div class="card-body">
                    <h5 class="article-title">${article.title}</h5>
                    <p class="article-preview">${article.preview}</p>
                    <div class="article-meta mb-3">
                        <small class="text-muted">
                            <i class="fas fa-calendar me-1"></i>
                            ${formatDate(article.publishedAt)}
                        </small>
                        <span class="badge bg-primary ms-2">${article.category}</span>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary btn-sm" onclick="viewArticle('${article.id}')">
                            <i class="fas fa-eye me-1"></i>Read
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="removeSavedArticle('${article.id}')">
                            <i class="fas fa-trash me-1"></i>Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("")

  $container.html(articlesHtml)
}

function removeSavedArticle(articleId) {
  savedArticles = savedArticles.filter((id) => id !== articleId)
  adminStats.totalSaves--
  showToast("Article removed from saved!", "success")
  loadSavedArticles()
}

function searchSavedArticles() {
  const searchTerm = $("#searchInput").val().toLowerCase().trim()
  const $articleCards = $("#savedArticlesList .col-md-6")

  $articleCards.each(function () {
    const title = $(this).find(".article-title").text().toLowerCase()
    const preview = $(this).find(".article-preview").text().toLowerCase()

    if (title.includes(searchTerm) || preview.includes(searchTerm)) {
      $(this).show()
    } else {
      $(this).hide()
    }
  })
}

// Shared articles functionality
function loadSharedArticles() {
  const $container = $("#sharedArticlesList")

  // Filter shared articles by followed users
  let filteredShares = sharedArticles
  if (currentUser && followingUsers.length > 0) {
    filteredShares = sharedArticles.filter((share) =>
      followingUsers.some((followedUser) => followedUser.id === share.userId),
    )
  }

  if (filteredShares.length === 0) {
    $("#noSharedArticles").show()
    $container.empty()
    return
  }

  $("#noSharedArticles").hide()

  const sharesHtml = filteredShares
    .map(
      (share) => `
        <div class="card shared-article mb-4">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h5 class="card-title">${share.article.title}</h5>
                        <p class="card-text">${share.article.preview}</p>
                        <div class="shared-comment">
                            <strong>${share.username} shared:</strong>
                            <p class="mt-2 mb-0">"${share.comment}"</p>
                        </div>
                        <div class="mt-3">
                            <small class="text-muted">
                                <i class="fas fa-share me-1"></i>
                                Shared ${formatDate(share.sharedAt)}
                            </small>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-primary btn-sm me-2" onclick="viewArticle('${share.article.id}')">
                                <i class="fas fa-eye me-1"></i>Read Article
                            </button>
                            ${
                              currentUser
                                ? `
                                <button class="btn btn-outline-danger btn-sm" onclick="reportSharedComment('${share.id}')">
                                    <i class="fas fa-flag me-1"></i>Report
                                </button>
                            `
                                : ""
                            }
                        </div>
                    </div>
                    <div class="col-md-4">
                        <img src="${share.article.imageUrl}" class="img-fluid rounded" alt="${share.article.title}">
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("")

  $container.html(sharesHtml)
}

function reportSharedComment(shareId) {
  if (!currentUser) {
    showToast("Please login to report content", "warning")
    return
  }

  // Mock reporting functionality
  showToast("Shared comment reported successfully!", "success")
}

// Interests page functionality
function loadInterestsPage() {
  if (!currentUser) {
    $("#loginRequiredInterests").show()
    $("#tagsManagement").hide()
    $("#loginRequiredFollow").show()
    $("#userSearchSection").hide()
    return
  }

  $("#loginRequiredInterests").hide()
  $("#tagsManagement").show()
  $("#loginRequiredFollow").hide()
  $("#userSearchSection").show()

  loadAvailableTags()
  updateSelectedTagsSummary()
  loadFollowingList()
}

function loadAvailableTags() {
  const allTags = [...availableTags, ...customTags]
  const $container = $("#availableTags")

  const tagsHtml = allTags
    .map(
      (tag) => `
        <div class="col-md-6 col-sm-12 mb-3">
            <div class="card tag-item ${userTags.includes(tag.id) ? "selected" : ""} ${tag.isCustom ? "custom-tag" : ""}" 
                 onclick="toggleTag('${tag.id}')">
                <div class="card-body text-center">
                    <i class="${tag.icon || "fas fa-tag"} fa-2x text-${tag.color || "warning"} mb-2"></i>
                    <h6 class="card-title">${tag.name}</h6>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" ${userTags.includes(tag.id) ? "checked" : ""}>
                    </div>
                    ${
                      tag.isCustom
                        ? `
                        <button class="btn btn-sm btn-outline-danger mt-2" onclick="removeCustomTag('${tag.id}', event)">
                            <i class="fas fa-times"></i>
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        </div>
    `,
    )
    .join("")

  $container.html(tagsHtml)
}

function toggleTag(tagId) {
  if (userTags.includes(tagId)) {
    userTags = userTags.filter((id) => id !== tagId)
  } else {
    userTags.push(tagId)
  }
  loadAvailableTags()
  updateSelectedTagsSummary()
}

function addCustomTag() {
  const tagName = $("#customTagInput").val().trim()
  if (!tagName) {
    showToast("Please enter a tag name", "warning")
    return
  }

  const tagId = "custom_" + Date.now()
  const newTag = {
    id: tagId,
    name: tagName,
    icon: "fas fa-tag",
    color: "warning",
    isCustom: true,
  }

  customTags.push(newTag)
  userTags.push(tagId)
  $("#customTagInput").val("")

  loadAvailableTags()
  updateSelectedTagsSummary()
  showToast("Custom tag added successfully!", "success")
}

function removeCustomTag(tagId, event) {
  event.stopPropagation()
  customTags = customTags.filter((tag) => tag.id !== tagId)
  userTags = userTags.filter((id) => id !== tagId)
  loadAvailableTags()
  updateSelectedTagsSummary()
  showToast("Custom tag removed!", "success")
}

function updateSelectedTagsSummary() {
  const $container = $("#selectedTagsSummary")

  if (userTags.length === 0) {
    $container.html('<p class="text-muted">No interests selected yet.</p>')
    return
  }

  const allTags = [...availableTags, ...customTags]
  const selectedTagNames = userTags.map((tagId) => {
    const tag = allTags.find((t) => t.id === tagId)
    return tag ? tag.name : tagId
  })

  const tagsHtml = `
        <div class="d-flex flex-wrap gap-2 mb-3">
            ${selectedTagNames
              .map(
                (name) => `
                <span class="badge bg-primary">${name}</span>
            `,
              )
              .join("")}
        </div>
        <p class="text-muted">You have selected ${userTags.length} interest(s).</p>
    `

  $container.html(tagsHtml)
}

function saveUserTags() {
  if (!currentUser) {
    showToast("Please login to save preferences", "warning")
    return
  }

  showToast("Preferences saved successfully!", "success")
}

// User following functionality
function searchUsers() {
  const searchTerm = $("#userSearchInput").val().toLowerCase().trim()
  if (!searchTerm) {
    showToast("Please enter a username to search", "warning")
    return
  }

  const results = allUsers.filter(
    (user) => user.username.toLowerCase().includes(searchTerm) && user.id !== currentUser.id && !user.isBlocked,
  )

  displayUserSearchResults(results)
}

function displayUserSearchResults(users) {
  const $container = $("#userSearchResults")

  if (users.length === 0) {
    $container.html('<p class="text-muted">No users found.</p>')
    return
  }

  const usersHtml = users
    .map((user) => {
      const isFollowing = followingUsers.some((f) => f.id === user.id)
      return `
            <div class="user-result d-flex justify-content-between align-items-center">
                <div>
                    <strong>${user.name}</strong>
                    <small class="text-muted d-block">@${user.username}</small>
                </div>
                <button class="btn btn-${isFollowing ? "secondary" : "primary"} btn-sm" 
                        onclick="${isFollowing ? "unfollowUser" : "followUser"}('${user.id}')">
                    ${isFollowing ? "Unfollow" : "Follow"}
                </button>
            </div>
        `
    })
    .join("")

  $container.html(usersHtml)
}

function followUser(userId) {
  const user = allUsers.find((u) => u.id === userId)
  if (user && !followingUsers.some((f) => f.id === userId)) {
    followingUsers.push(user)
    showToast(`Now following ${user.name}!`, "success")
    loadFollowingList()
    searchUsers() // Refresh search results
  }
}

function unfollowUser(userId) {
  const user = followingUsers.find((f) => f.id === userId)
  if (user) {
    followingUsers = followingUsers.filter((f) => f.id !== userId)
    showToast(`Unfollowed ${user.name}`, "info")
    loadFollowingList()
    searchUsers() // Refresh search results
  }
}

function loadFollowingList() {
  const $container = $("#followingList")

  if (followingUsers.length === 0) {
    $container.html('<p class="text-muted">You\'re not following anyone yet.</p>')
    return
  }

  const followingHtml = followingUsers
    .map(
      (user) => `
        <div class="following-item d-flex justify-content-between align-items-center">
            <div>
                <strong>${user.name}</strong>
                <small class="text-muted d-block">@${user.username}</small>
            </div>
            <button class="btn btn-outline-secondary btn-sm" onclick="unfollowUser('${user.id}')">
                Unfollow
            </button>
        </div>
    `,
    )
    .join("")

  $container.html(followingHtml)
}

// Admin functionality
// תקן את פונקציית loadAdminPage כדי לוודא שהיא עובדת נכון
function loadAdminPage() {
  console.log("Loading admin page, current user:", currentUser) // לדיבוג

  if (!currentUser || !currentUser.isAdmin) {
    showToast("Access denied. Admin privileges required.", "danger")
    showPage("home")
    return
  }

  // עדכן את הסטטיסטיקות
  updateAdminStats()
  loadReportedArticles()
  loadUserManagement()

  console.log("Admin page loaded successfully") // לדיבוג
}

function updateAdminStats() {
  $("#totalVisits").text(adminStats.dailyVisits)
  $("#totalArticles").text(adminStats.totalArticles)
  $("#totalSaves").text(adminStats.totalSaves)
  $("#totalReports").text(adminStats.totalReports)
  $("#blockedUsers").text(allUsers.filter((u) => u.isBlocked).length)
}

function loadReportedArticles() {
  const $container = $("#reportedArticlesList")

  if (reportedArticles.length === 0) {
    $container.html('<p class="text-muted">No reported articles.</p>')
    return
  }

  const reportsHtml = reportedArticles
    .map(
      (report) => `
        <div class="card mb-3 border-warning">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6 class="card-title">${report.article.title}</h6>
                        <p class="text-muted mb-2">Reported by: ${report.username}</p>
                        <p class="mb-2"><strong>Reason:</strong> ${report.reason}</p>
                        ${report.comment ? `<p class="mb-2"><strong>Details:</strong> ${report.comment}</p>` : ""}
                        <small class="text-muted">Reported on: ${formatDate(report.reportedAt)}</small>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-primary btn-sm me-2" onclick="viewArticle('${report.article.id}')">
                            View Article
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="dismissReport('${report.id}')">
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("")

  $container.html(reportsHtml)
}

function dismissReport(reportId) {
  reportedArticles = reportedArticles.filter((r) => r.id !== reportId)
  adminStats.totalReports--
  loadReportedArticles()
  updateAdminStats()
  showToast("Report dismissed", "success")
}

function loadUserManagement() {
  const $tbody = $("#usersTableBody")

  const usersHtml = allUsers
    .map(
      (user) => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span class="badge bg-${user.isBlocked ? "danger" : "success"}">
                    ${user.isBlocked ? "Blocked" : "Active"}
                </span>
            </td>
            <td>
                <button class="btn btn-${user.isBlocked ? "success" : "warning"} btn-sm me-2" 
                        onclick="toggleUserBlock('${user.id}')">
                    ${user.isBlocked ? "Unblock" : "Block"}
                </button>
            </td>
        </tr>
    `,
    )
    .join("")

  $tbody.html(usersHtml)
}

function toggleUserBlock(userId) {
  const user = allUsers.find((u) => u.id === userId)
  if (user) {
    user.isBlocked = !user.isBlocked
    loadUserManagement()
    updateAdminStats()
    showToast(`User ${user.isBlocked ? "blocked" : "unblocked"} successfully`, "success")
  }
}

// Utility functions
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function showToast(message, type = "info") {
  const toastId = "toast_" + Date.now()
  const toast = $(`
        <div class="toast" id="${toastId}" role="alert">
            <div class="toast-header">
                <i class="fas fa-${getToastIcon(type)} text-${type} me-2"></i>
                <strong class="me-auto">News Hub</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">${message}</div>
        </div>
    `)

  // Create toast container if it doesn't exist
  if ($(".toast-container").length === 0) {
    $("body").append('<div class="toast-container"></div>')
  }

  $(".toast-container").append(toast)

  // Initialize and show toast
  const bsToast = new bootstrap.Toast(toast[0])
  bsToast.show()

  // Remove toast after it's hidden
  toast.on("hidden.bs.toast", function () {
    $(this).remove()
  })
}

function getToastIcon(type) {
  switch (type) {
    case "success":
      return "check-circle"
    case "danger":
      return "exclamation-triangle"
    case "warning":
      return "exclamation-triangle"
    case "info":
      return "info-circle"
    default:
      return "info-circle"
  }
}

function showError(elementId, message) {
  $(`#${elementId}`).text(message).show()
  setTimeout(() => {
    $(`#${elementId}`).hide()
  }, 5000)
}
