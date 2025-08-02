function renderAdminDashboard({
    users,
    activeUsersCount,
    savedArticlesCount,
    sharedArticlesCount,
    blockedUsersCount,
    reportsCount,
    articles = [],
    reports = [],
    dailyLoginsCount,
    ArticlePullRequestsCount
}) {
    const $tab = $('#admin');

    // בדיקת הרשאות admin
    if (!currentUser || currentUser.email.toLowerCase() !== 'admin@newshub.com') {
        $tab.html(`
            <div class="container-fluid d-flex justify-content-center align-items-center min-height-60vh">
                <div class="card shadow-lg border-0 admin-auth-card">
                    <div class="card-body text-center py-5">
                        <i class="bi bi-shield-lock text-warning mb-3 admin-auth-icon"></i>
                        <h4 class="text-muted">Admin Access Required</h4>
                        <p class="text-muted">You need admin privileges to access this dashboard.</p>
                    </div>
                </div>
            </div>
        `);
        $('#admin-tab-li').addClass('d-none');
        return;
    }

    $('#admin-tab-li').removeClass('d-none');

    const totalUsers = activeUsersCount;
    const totalBlocked = blockedUsersCount;
    const totalArticles = savedArticlesCount;
    const totalShared = sharedArticlesCount;
    const totalReports = reportsCount;
    const totalDailyLogins = dailyLoginsCount;
    const totalArticlePullRequestsCount = ArticlePullRequestsCount;

    let html = `
        <div class="container-fluid px-0">
            <!-- Header Section -->
            <div class="row mb-5">
                <div class="col-12">
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h1 class="display-5 fw-bold text-dark mb-2">
                                <i class="bi bi-speedometer2 me-3 text-primary"></i>Admin Dashboard
                            </h1>
                            <p class="text-muted mb-0">Comprehensive management and monitoring interface</p>
                        </div>
                        <div class="text-end">
                            <div class="badge bg-light text-dark px-3 py-2 rounded-pill">
                                <i class="bi bi-clock me-1"></i>
                                ${new Date().toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                })} • ${new Date().toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="row g-3 mb-5">
                <div class="col-xl-1-7 col-lg-3 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover admin-stats-card-users">
                        <div class="card-body text-white text-center p-3">
                            <i class="bi bi-people-fill mb-2 admin-stats-icon"></i>
                            <h3 class="fw-bold mb-1">${totalUsers}</h3>
                            <small class="badge bg-white bg-opacity-25 px-2 py-1 rounded-pill">Active Users</small>
                        </div>
                    </div>
                </div>
                <div class="col-xl-1-7 col-lg-3 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover admin-stats-card-articles">
                        <div class="card-body text-white text-center p-3">
                            <i class="bi bi-journal-text mb-2 admin-stats-icon"></i>
                            <h3 class="fw-bold mb-1">${totalArticles}</h3>
                            <small class="badge bg-white bg-opacity-25 px-2 py-1 rounded-pill">Saved Articles</small>
                        </div>
                    </div>
                </div>
                <div class="col-xl-1-7 col-lg-3 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover admin-stats-card-shares">
                        <div class="card-body text-white text-center p-3">
                            <i class="bi bi-share-fill mb-2 admin-stats-icon"></i>
                            <h3 class="fw-bold mb-1">${totalShared}</h3>
                            <small class="badge bg-white bg-opacity-25 px-2 py-1 rounded-pill">Shared Items</small>
                        </div>
                    </div>
                </div>
                <div class="col-xl-1-7 col-lg-3 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover admin-stats-card-blocked">
                        <div class="card-body text-white text-center p-3">
                            <i class="bi bi-person-x-fill mb-2 admin-stats-icon"></i>
                            <h3 class="fw-bold mb-1">${totalBlocked}</h3>
                            <small class="badge bg-white bg-opacity-25 px-2 py-1 rounded-pill">Blocked Users</small>
                        </div>
                    </div>
                </div>
                <div class="col-xl-1-7 col-lg-3 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover admin-stats-card-saved">
                        <div class="card-body text-dark text-center p-3">
                            <i class="bi bi-flag-fill mb-2 admin-stats-icon-reports"></i>
                            <h3 class="fw-bold mb-1">${totalReports}</h3>
                            <small class="badge bg-white bg-opacity-25 px-2 py-1 rounded-pill">Total Reports</small>
                        </div>
                    </div>
                </div>
                <div class="col-xl-1-7 col-lg-3 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover admin-stats-card-daily-logins">
                        <div class="card-body text-white text-center p-3">
                            <i class="bi bi-calendar-check mb-2 admin-stats-icon"></i>
                            <h3 class="fw-bold mb-1">${totalDailyLogins}</h3>
                            <small class="badge bg-white bg-opacity-25 px-2 py-1 rounded-pill">Daily Logins</small>
                        </div>
                    </div>
                </div>
                <div class="col-xl-1-7 col-lg-3 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover" style="border-radius: 16px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
                        <div class="card-body text-white text-center p-3">
                            <i class="bi bi-cloud-download mb-2" style="font-size: 2rem; opacity: 0.9;"></i>
                            <h3 class="fw-bold mb-1">${totalArticlePullRequestsCount}</h3>
                            <small class="badge bg-white bg-opacity-25 px-2 py-1 rounded-pill">API Calls</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Tags Section -->
            <div id="topTagsSection" class="mb-5">
                <div class="card border-0 shadow-lg card-hover" style="border-radius: 20px; overflow: hidden;">
                    <div class="card-header border-0 py-4" style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%);">
                        <div class="d-flex align-items-center admin-header">
                            <i class="bi bi-fire me-3 text-warning" style="font-size: 1.8rem;"></i>
                            <div>
                                <h4 class="mb-0 fw-bold text-white admin-card-text" id="topTagsHeader">Popular Tags</h4>
                                <p class="mb-0 text-white-50">Most frequently used content tags</p>
                            </div>
                        </div>
                    </div>
                    <div class="card-body py-4" id="topTagsList">
                        <div class="admin-loading">
                            <i class="bi bi-hourglass-split me-2"></i>
                            Loading popular tags...
                        </div>
                    </div>
                </div>
            </div>

            <!-- Users Management Table -->
            <div class="card border-0 shadow-lg mb-5" style="border-radius: 20px; overflow: hidden;">
                <div class="card-header border-0 py-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-person-lines-fill text-white me-3" style="font-size: 1.5rem;"></i>
                            <h4 class="text-white mb-0 fw-bold">User Management</h4>
                        </div>
                        <div class="text-white">
                            <span class="badge bg-white bg-opacity-25 px-2 py-2 rounded-pill">
                                <i class="bi bi-people me-1"></i>${totalUsers} users
                            </span>
                        </div>
                    </div>
                </div>
                <!-- Search Bar for Users -->
                <div class="card-body border-bottom bg-light py-3">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0">
                                    <i class="bi bi-search text-muted"></i>
                                </span>
                                <input type="text" id="userSearchInput" class="form-control border-start-0" 
                                       placeholder="Search users by name or email..." 
                                       style="box-shadow: none; border-color: #dee2e6;">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                        <table class="table table-hover mb-0 modern-table" id="usersTable">
                            <thead class="table-light">
                                <tr>
                                    <th class="fw-bold py-3 px-4">
                                        <i class="bi bi-person me-2 text-primary"></i>User Details
                                    </th>
                                    <th class="fw-bold py-3">
                                        <i class="bi bi-envelope me-2 text-primary"></i>Email
                                    </th>
                                    <th class="fw-bold py-3 text-center">
                                        <i class="bi bi-check-circle me-2 text-success"></i>Status
                                    </th>
                                    <th class="fw-bold py-3 text-center">
                                        <i class="bi bi-share me-2 text-info"></i>Sharing
                                    </th>
                                    <th class="fw-bold py-3 text-center">
                                        <i class="bi bi-gear me-2 text-warning"></i>Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>`;

    users.forEach((user, index) => {
        const statusBadge = user.active
            ? '<span class="badge bg-success-subtle text-success px-2 py-2 rounded-pill"><i class="bi bi-check-circle-fill me-1"></i>Active</span>'
            : '<span class="badge bg-danger-subtle text-danger px-2 py-2 rounded-pill"><i class="bi bi-x-circle-fill me-1"></i>Blocked</span>';

        const sharingBadge = !user.blockSharing
            ? '<span class="badge bg-info-subtle text-info px-2 py-2 rounded-pill"><i class="bi bi-share-fill me-1"></i>Allowed</span>'
            : '<span class="badge bg-secondary-subtle text-secondary px-2 py-2 rounded-pill"><i class="bi bi-ban me-1"></i>Blocked</span>';

        const statusBtnClass = user.active ? 'danger' : 'success';
        const statusBtnIcon = user.active ? 'person-x-fill' : 'person-check-fill';
        const statusBtnTitle = user.active ? 'Block User' : 'Unblock User';

        const sharingBtnClass = user.blockSharing ? 'info' : 'secondary';
        const sharingBtnIcon = user.blockSharing ? 'unlock-fill' : 'lock-fill';
        const sharingBtnTitle = user.blockSharing ? 'Allow Sharing' : 'Block Sharing';

        const rowClass = index % 2 === 0 ? 'table-row-even' : 'table-row-odd';

        html += `
            <tr class="${rowClass}">
                <td class="py-3 px-4">
                    <div class="d-flex align-items-center">
                        ${getUserProfileImageHtml(user, 40)}
                        <div class="ms-3">
                            <div class="fw-semibold text-dark">${user.name}</div>
                            <small class="text-muted">ID: ${user.id}</small>
                        </div>
                    </div>
                </td>
                <td class="py-3">
                    <span class="text-dark">${user.email}</span>
                </td>
                <td class="py-3 text-center">${statusBadge}</td>
                <td class="py-3 text-center">${sharingBadge}</td>
                <td class="py-3 text-center">
                    <div class="btn-group" role="group">
                        <button title="${statusBtnTitle}" 
                                class="btn btn-outline-${statusBtnClass} btn-sm rounded-pill me-2 action-btn toggle-deactivate-btn" 
                                data-id="${user.id}">
                            <i class="bi bi-${statusBtnIcon}"></i>
                        </button>
                        <button title="${sharingBtnTitle}" 
                                class="btn btn-outline-${sharingBtnClass} btn-sm rounded-pill action-btn toggle-block-btn" 
                                data-id="${user.id}">
                            <i class="bi bi-${sharingBtnIcon}"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });

    html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Reports Management Table -->
            <div class="card border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
                <div class="card-header border-0 py-4" style="background: linear-gradient(135deg, #fa709a 0%, #e0b200 100%);">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-flag-fill text-white me-3" style="font-size: 1.5rem;"></i>
                            <h4 class="text-white mb-0 fw-bold">Reports Management</h4>
                        </div>
                        <div class="text-white">
                            <span class="badge bg-white bg-opacity-25 px-2 py-2 rounded-pill">
                                 <i class="bi bi-exclamation-triangle me-1"></i>${totalReports} reports
                            </span>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0" id="reports-container">`;

    if (reports.length === 0) {
        html += `
                    <div class="text-center py-5"> 
                        <i class="bi bi-check-circle text-success mb-3" style="font-size: 3rem;"></i>
                        <h5 class="text-muted">No Reports Found</h5>
                        <p class="text-muted">All clear! No user reports at the moment.</p>
                    </div>`;
    } else {
        html += `
                    <div class="table-responsive" style="overflow-x:auto; max-height:400px;">
                        <table class="table table-hover mb-0 modern-table reports-table">
                            <thead class="table-light">
                                <tr>
                                    <th class="fw-bold py-3 px-3 text-center">ID</th>
                                    <th class="fw-bold py-3">Reporter Info</th>
                                    <th class="fw-bold py-3">Report Details</th>
                                    <th class="fw-bold py-3">Article Info</th>
                                    <th class="fw-bold py-3 text-center">Share Comment</th>
                                    <th class="fw-bold py-3 text-center">Reports Count</th>
                                    <th class="fw-bold py-3 text-center">Actions</th>
                                    <th class="fw-bold py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>`;

        reports.forEach((r, index) => {
            const rowClass = index % 2 === 0 ? 'table-row-even' : 'table-row-odd';
            const reportDate = r.ReportedAt ? new Date(r.ReportedAt).toLocaleDateString('en-GB') : '-';
            const reportTime = r.ReportedAt ? new Date(r.ReportedAt).toLocaleTimeString() : '';

            html += `
                <tr class="${rowClass}">
                    <td class="py-3 px-3 text-center">
                        <span class="badge bg-primary-subtle text-primary px-2 py-1 rounded-pill">#${r.Id}</span>
                    </td>
                    <td class="py-3">
                        <div class="reporter-info">
                            <div class="d-flex align-items-center mb-1">
                                ${getUserProfileImageHtml({
                                    id: r.ReporterId,
                                    name: r.ReporterName,
                                    imageUrl: r.ReporterImageUrl
                                }, 40)}
                                <div class="ms-3">
                                    <div class="fw-semibold text-dark">${r.ReporterName || 'Unknown'}</div>
                                    <small class="text-muted">${r.ReporterEmail || 'No email'}</small>
                                </div>
                            </div>
                            <small class="text-muted">ID: ${r.ReporterId}</small>
                        </div>
                    </td>
                    <td class="py-3">
                        <div class="report-details">
                            ${r.Comment ? `
                                <div class="comment-box p-2 bg-light rounded mb-2">
                                    <i class="bi bi-chat-quote text-muted me-1"></i>
                                    <span class="text-dark">${r.Comment.length > 50 ? r.Comment.substring(0, 50) + '...' : r.Comment}</span>
                                </div>
                            ` : '<span class="text-muted fst-italic">No comment provided</span>'}
                        </div>
                    </td>
                    <td class="py-3">
                        ${r.ArticleId !== null ? `
                            <div class="article-info">
                                <div class="fw-semibold text-primary mb-1">
                                    <i class="bi bi-newspaper me-1"></i>
                                    ${r.ArticleTitle || 'Untitled Article'}
                                </div>
                                <small class="text-muted">ID: ${r.ArticleId}</small>
                                ${r.ArticlePreview ? `
                                    <div class="mt-1">
                                        <small class="text-muted">${r.ArticlePreview.length > 40 ? r.ArticlePreview.substring(0, 40) + '...' : r.ArticlePreview}</small>
                                    </div>
                                ` : ''}
                            </div>
                        ` : '<span class="text-muted fst-italic">No article</span>'}
                    </td>
                    <td class="py-3 text-center">
                        ${r.SharedArticleId !== null ? `
                            <div class="shared-comment-info">
                                ${r.SharerComment ? `
                                    <div class="share-comment p-2 bg-info-subtle border border-info rounded mb-2">
                                        <i class="bi bi-chat-quote text-info me-1"></i>
                                        <span class="text-dark fw-semibold">"${r.SharerComment}"</span>
                                    </div>
                                ` : `
                                    <div class="text-muted fst-italic mb-2">
                                        <i class="bi bi-chat-x me-1"></i>
                                        No comment attached
                                    </div>
                                `}
                                <br><small class="text-muted"> ${r.SharerId != null ? "Sharer ID:" + r.SharerId : ''}</small>
                            </div>
                        ` : '<span class="text-muted fst-italic">Not shared</span>'}
                    </td>
                    <td class="py-3 text-center">
                        <span class="badge bg-dark text-white rounded-pill px-2 py-2">
                            <i class="bi bi-exclamation-triangle me-1"></i>
                            ${r.TotalReportsOnThisItem || 0}
                        </span>
                    </td>     
                    <td class="py-3 text-center d-flex justify-content-center gap-2 flex-wrap">
                        ${r.ArticleId !== null ? `
                            <a href="article.html?id=${r.ArticleId}${r.SharerComment ? '&collection=Shared' : '&collection=Reported'}"
                               class="btn btn-outline-primary btn-sm"
                               target="_blank" title="View Article">
                                <i class="bi bi-eye me-1"></i>
                            </a>

                            <button class="btn btn-outline-danger btn-sm delete-article-btn"
                                    data-article-id="${r.ArticleId}"
                                    title="Delete Article and all related reports">
                                <i class="bi bi-trash3-fill me-1"></i>Delete Article
                            </button>
                        ` : ''}

                        <button class="btn btn-outline-danger btn-sm delete-report-btn"
                                data-report-id="${r.Id}"
                                title="Delete Report Only">
                            <i class="bi bi-flag-fill me-1"></i>Delete Report
                        </button>
                    </td>

                    <td class="py-3">
                        <div class="date-info">
                            <div class="fw-semibold text-dark">${reportDate}</div>
                            ${reportTime && `<small class="text-muted">${reportTime}</small>`}
                        </div>
                    </td>
                </tr>`;
        });

        html += `
                            </tbody>
                        </table>
                    </div>`;
    }

    html += `
                </div>
            </div>
        </div>
`;

    $tab.html(html);
}
function getUserProfileImageHtml(user, size = 40) {
    const imageUrl = user.imageUrl ||
        `https://res.cloudinary.com/dvupmddqz/image/upload/profile_pics/profile_pics/${user.id}.jpg`;
    const fallbackInitial = (user.name || 'U').charAt(0).toUpperCase();

    return `
        <div class="position-relative d-inline-block" style="width:${size}px;height:${size}px;">
            <img src="${imageUrl}" alt="Profile" class="admin-profile-image" 
                style="width:${size}px;height:${size}px;"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
            <div class="admin-avatar-fallback position-absolute top-0 start-0" 
                style="width:${size}px;height:${size}px;display:none;font-size:${size / 2.2}px;">${fallbackInitial}</div>
        </div>
    `;
}

// פונקציות עזר לטעינת נתונים עם אימות Token
function getWithAuth(endpoint) {
    return new Promise((resolve, reject) => {
        ajaxCall(
            "GET", 
            serverUrl + endpoint, 
            null,
            function(response) {
                resolve(response);
            },
            function(xhr, status, error) {
                if (xhr.status === 404) {
                    resolve("0");
                } else {
                    reject(new Error(`Network response was not ok: ${xhr.status} ${error}`));
                }
            }
        );
    });
}

function getWithAuthJson(endpoint) {
    return new Promise((resolve, reject) => {
        ajaxCall(
            "GET", 
            serverUrl + endpoint, 
            null,
            function(response) {
                // אם response הוא כבר object, נחזיר אותו כמו שהוא
                // אם זה string, ננסה לעשות parse
                try {
                    const jsonResponse = typeof response === 'string' ? JSON.parse(response) : response;
                    resolve(jsonResponse);
                } catch (e) {
                    resolve(response); // נחזיר את הresponse כמו שהוא
                }
            },
            function(xhr, status, error) {
                reject(new Error(`Network response was not ok: ${xhr.status} ${error}`));
            }
        );
    });
}

function putWithAuth(endpoint) {
    return new Promise((resolve, reject) => {
        ajaxCall(
            "PUT", 
            serverUrl + endpoint, 
            null,
            function(response) {
                resolve(response);
            },
            function(xhr, status, error) {
                reject(new Error(`Network response was not ok: ${xhr.status} ${error}`));
            }
        );
    });
}

// פונקציה לניתוח טקסטים שמחזירים ספירה (מספרים בלבד)
function parseCount(text) {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

// טעינת כל הנתונים לדשבורד
async function loadAdminDashboardData() {
    if (!currentUser || currentUser.email.toLowerCase() !== 'admin@newshub.com') {
        $('#admin').html(`
            <div class="container-fluid d-flex justify-content-center align-items-center" style="min-height: 60vh;">
                <div class="card shadow-lg border-0" style="max-width: 400px; border-radius: 20px;">
                    <div class="card-body text-center p-5">
                        <i class="bi bi-shield-lock text-warning mb-3" style="font-size: 3rem;"></i>
                        <h4 class="text-muted">Admin Access Required</h4>
                        <p class="text-muted">You need admin privileges to access this dashboard.</p>
                    </div>
                </div>
            </div>
        `);
        $('#admin-tab-li').addClass('d-none');
        return;
    }

    $('#admin-tab-li').removeClass('d-none');

    // הצגת Loading
    $('#admin').html(`
        <div class="container-fluid d-flex justify-content-center align-items-center" style="min-height: 50vh;">
            <div class="text-center">
                <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h5 class="text-muted">Loading dashboard data...</h5>
            </div>
        </div>
    `);

    try {
        const [
            activeUsersText,
            savedArticlesText,
            sharedArticlesText,
            blockedUsersText,
            reportsCountText,
            dailyLoginsText,
            ArticlePullRequestsCount,
            usersResponse,
            articlesResponse,
            reportsResponse

        ] = await Promise.all([
            getWithAuth("Admin/ActiveUsersCount"),
            getWithAuth("Admin/SavedArticlesCount"),
            getWithAuth("Admin/SharedArticlesCount"),
            getWithAuth("Admin/BlockedUsersCount"),
            getWithAuth("Admin/ReportsCount"),
            getWithAuth("Admin/DailyLogins"),
            getWithAuth("Admin/ArticlePullRequestsCount?apiName=NewsApiCalls"),
            getWithAuthJson("Admin/GetAllUsers"),
            getWithAuthJson("Articles"),
            getWithAuthJson("Reports")
        ]);

        // הנתונים כבר מוכנים - לא צריך להמיר אותם
        const users = usersResponse;
        const articles = articlesResponse;
        const reports = reportsResponse;

        const summaryData = {
            activeUsersCount: parseCount(activeUsersText),
            savedArticlesCount: parseCount(savedArticlesText),
            sharedArticlesCount: parseCount(sharedArticlesText),
            blockedUsersCount: parseCount(blockedUsersText),
            reportsCount: parseCount(reportsCountText),
            dailyLoginsCount: parseCount(dailyLoginsText),
            ArticlePullRequestsCount: parseCount(ArticlePullRequestsCount)

        };

        renderAdminDashboard({
            users,
            articles,
            reports,
            ...summaryData
        });

        loadTopTags(5);

    } catch (err) {
        $('#admin').html(`
            <div class="container-fluid d-flex justify-content-center align-items-center" style="min-height: 50vh;">
                <div class="card shadow-lg border-0 border-danger" style="max-width: 500px; border-radius: 20px;">
                    <div class="card-body text-center p-5">
                        <i class="bi bi-exclamation-triangle text-danger mb-3" style="font-size: 3rem;"></i>
                        <h4 class="text-danger">Loading Error</h4>
                        <p class="text-muted">Failed to load dashboard data: ${err.message}</p>
                        <button class="btn btn-primary rounded-pill px-4 mt-3" onclick="loadAdminDashboardData()">
                            <i class="bi bi-arrow-clockwise me-2"></i>Retry
                        </button>
                    </div>
                </div>
            </div>
        `);
    }
}

// אירועים לכפתורים לשינוי סטטוס משתמשים
$(document).on('click', '.toggle-deactivate-btn', async function () {
    const userId = $(this).data('id');
    const $btn = $(this);

    // הוספת אנימציית טעינה
    const originalHtml = $btn.html();
    $btn.html('<span class="spinner-border spinner-border-sm" role="status"></span>').prop('disabled', true);

    try {
        await putWithAuth(`Admin/${userId}/deactivate`);
        await loadAdminDashboardData();
    } catch (err) {
        alert("Failed to toggle user status. Please try again.");
        $btn.html(originalHtml).prop('disabled', false);
    }
});

$(document).on('click', '.toggle-block-btn', async function () {
    const userId = $(this).data('id');
    const $btn = $(this);

    // הוספת אנימציית טעינה
    const originalHtml = $btn.html();
    $btn.html('<span class="spinner-border spinner-border-sm" role="status"></span>').prop('disabled', true);

    try {
        await putWithAuth(`Admin/${userId}/block`);
        await loadAdminDashboardData();
    } catch (err) {
        alert("Failed to toggle sharing permission. Please try again.");
        $btn.html(originalHtml).prop('disabled', false);
    }
});

// טעינה ראשונית כשמסך מוכן
$(document).ready(function () {
    renderUserActions?.(); // אם יש לך פונקציה כזו
    loadAdminDashboardData();

    // הוספת פונקציית חיפוש למשתמשים
    $(document).on('input', '#userSearchInput', function() {
        const searchTerm = $(this).val().toLowerCase();
        const $table = $('#usersTable tbody');
        const $rows = $table.find('tr');
        let visibleCount = 0;

        $rows.each(function() {
            const $row = $(this);
            const name = $row.find('td:first .fw-semibold').text().toLowerCase();
            const email = $row.find('td:nth-child(2)').text().toLowerCase();
            
            if (name.includes(searchTerm) || email.includes(searchTerm)) {
                $row.show();
                visibleCount++;
            } else {
                $row.hide();
            }
        });

        // עדכון מונה התוצאות
        $('#userSearchResults').text(`${visibleCount} users found`);
    });
});

function loadTopTags(topCount) {
    ajaxCall(
        "GET",
        serverUrl + `Admin/GetTopMostCommonTags?topCount=${topCount}`,
        null,
        function (tags) {
            let html = '';
            if (!tags || tags.length === 0) {
                html = `
                    <div class="admin-empty-state">
                        <i class="bi bi-tags text-muted"></i>
                        <p class="text-muted">No popular tags found yet.</p>
                    </div>`;
                $('#topTagsHeader').text('Popular Tags');
            } else {
                html += '<div class="row g-3">';

                tags.forEach((tag, index) => {
                    const animationClass = `stagger-animation-${(index % 5) + 1}`;

                    html += `
                        <div class="col-md-6 col-lg-4">
                            <div class="card border-0 shadow-sm h-100 card-hover admin-tag-card ${animationClass}" style="border-radius: 12px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 4px solid #6c757d; user-select: none;">
                                <div class="card-body p-4">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h5 class="fw-bold mb-1 text-dark">${tag.tagName}</h5>
                                            <div class="text-muted">
                                                <i class="bi bi-graph-up me-1"></i>
                                                ${tag.tagCount} articles
                                            </div>
                                        </div>
                                        <div class="text-end">
                                            <i class="bi bi-fire text-warning" style="font-size: 1.5rem;"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                });

                html += '</div>';
                $('#topTagsHeader').text(`Popular Tags (${tags.length})`);
            }
            
            $('#topTagsList').html(html);
        },
        function (xhr, status, error) {
            $('#topTagsList').html(`
                <div class="admin-empty-state">
                    <i class="bi bi-exclamation-triangle text-danger"></i>
                    <p class="text-danger">Failed to load popular tags.</p>
                </div>`);
            $('#topTagsHeader').text('🔥 Popular Tags - Error');
        }
    );
}


function loadAllReports() {
    getWithAuthJson("Reports")
        .then(reports => {
            allReports = reports;
            const html = renderReportsTable(allReports);
            $("#reports-container").html(html);
            bindAdminReportActions(); // מחבר את כפתורי המחיקה מחדש
        })
        .catch(err => {
            console.error("Failed to reload reports:", err);
            $("#reports-container").html('<p class="text-muted">Failed to load reports.</p>');
        });
}

function bindAdminReportActions() {
    $(".delete-report-btn").off("click").on("click", function () {
        const reportId = $(this).data("report-id");
        if (confirm("Are you sure you want to delete this report?")) {
            deleteReport(reportId);
        }
    });

    $(".delete-article-btn").off("click").on("click", function () {
        const articleId = $(this).data("article-id");
        if (confirm("Are you sure you want to delete this article and all related reports?")) {
            deleteArticle(articleId);
        }
    });
}


function deleteReport(reportId) {
    ajaxCall("DELETE", `${serverUrl}Reports/DeleteReport/${reportId}`, null,
        () => {
            alert("Report deleted successfully");
            loadAllReports(); 
        },
        (xhr) => {
            alert("Failed to delete report: " + (xhr.responseText || xhr.statusText));
        }
    );
}

function deleteArticle(articleId) {
    ajaxCall("DELETE", `${serverUrl}Articles/DeleteArticle/${articleId}`, null,
        () => {
            alert("Article and related reports deleted");
            loadAllReports(); 
        },
        (xhr) => {
            alert("Failed to delete article: " + (xhr.responseText || xhr.statusText));
        }
    );
}

