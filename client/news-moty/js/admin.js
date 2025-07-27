// renderAdminDashboard.js - Modern Version

function renderAdminDashboard({
    users,
    activeUsersCount,
    savedArticlesCount,
    sharedArticlesCount,
    blockedUsersCount,
    reportsCount,
    articles = [],
    reports = [],
    dailyLoginsCount
}) {
    const $tab = $('#admin');

    // בדיקת הרשאות admin
    if (!currentUser || currentUser.email.toLowerCase() !== 'admin@newshub.com') {
        $tab.html(`
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

    const totalUsers = activeUsersCount;
    const totalBlocked = blockedUsersCount;
    const totalArticles = savedArticlesCount;
    const totalShared = sharedArticlesCount;
    const totalReports = reportsCount;
    const totalDailyLogins = dailyLoginsCount;

    let html = `
        <div class="container-fluid px-0">
            <!-- Header Section -->
            <div class="row mb-5">
                <div class="col-12">
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h1 class="display-5 fw-bold text-primary mb-2">
                                <i class="bi bi-speedometer2 me-3"></i>Admin Dashboard
                            </h1>
                            <p class="lead text-muted mb-0">Manage users, monitor activity, and review reports</p>
                        </div>
                        <div class="text-end">
                            <span class="text-primary fw-bold" style="font-size:1.15rem;">Last updated: ${new Date().toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="row g-4 mb-5">
                <div class="col-lg-2 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover" style="border-radius: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <div class="card-body text-white text-center p-4">
                            <i class="bi bi-people-fill mb-3" style="font-size: 2.5rem; opacity: 0.9;"></i>
                            <h2 class="fw-bold mb-1">${totalUsers}</h2>
                            <small class="badge bg-white bg-opacity-25 px-3 py-2 rounded-pill">Active Users</small>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover" style="border-radius: 16px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                        <div class="card-body text-white text-center p-4">
                            <i class="bi bi-journal-text mb-3" style="font-size: 2.5rem; opacity: 0.9;"></i>
                            <h2 class="fw-bold mb-1">${totalArticles}</h2>
                            <small class="badge bg-white bg-opacity-25 px-3 py-2 rounded-pill">Saved Articles</small>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover" style="border-radius: 16px; background: linear-gradient(135deg, #3a8dde 0%, #00d4ff 100%);">
                        <div class="card-body text-white text-center p-4">
                            <i class="bi bi-share-fill mb-3" style="font-size: 2.5rem; opacity: 0.9;"></i>
                            <h2 class="fw-bold mb-1">${totalShared}</h2>
                            <small class="badge bg-white bg-opacity-25 px-3 py-2 rounded-pill">Shared Items</small>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover" style="border-radius: 16px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                        <div class="card-body text-white text-center p-4">
                            <i class="bi bi-person-x-fill mb-3" style="font-size: 2.5rem; opacity: 0.9;"></i>
                            <h2 class="fw-bold mb-1">${totalBlocked}</h2>
                            <small class="badge bg-white bg-opacity-25 px-3 py-2 rounded-pill">Blocked Users</small>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2 col-md-4 col-sm-6">
                    <div class="card border-0 shadow-sm h-100 card-hover" style="border-radius: 16px; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
                        <div class="card-body text-dark text-center p-4">
                            <i class="bi bi-flag-fill mb-3" style="font-size: 2.5rem; opacity: 0.8;"></i>
                            <h2 class="fw-bold mb-1">${totalReports}</h2>
                            <small class="badge bg-white bg-opacity-25 px-3 py-2 rounded-pill">Total Reports</small>
                        </div>
                    </div>
                </div>
                 <div class="col-lg-2 col-md-4 col-sm-6">
    <div class="card border-0 shadow-sm h-100 card-hover" style="border-radius: 16px; background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);">
        <div class="card-body text-white text-center p-4">
            <i class="bi bi-calendar-check mb-3" style="font-size: 2.5rem; opacity: 0.9;"></i>
            <h2 class="fw-bold mb-1">${totalDailyLogins}</h2>
            <small class="badge bg-white bg-opacity-25 px-3 py-2 rounded-pill">Daily Logins</small>
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
                            <span class="badge bg-white bg-opacity-25 px-3 py-2 rounded-pill">
                                <i class="bi bi-people me-1"></i>${totalUsers} users
                            </span>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 modern-table">
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
            ? '<span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill"><i class="bi bi-check-circle-fill me-1"></i>Active</span>'
            : '<span class="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill"><i class="bi bi-x-circle-fill me-1"></i>Blocked</span>';

        const sharingBadge = !user.blockSharing
            ? '<span class="badge bg-info-subtle text-info px-3 py-2 rounded-pill"><i class="bi bi-share-fill me-1"></i>Allowed</span>'
            : '<span class="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill"><i class="bi bi-ban me-1"></i>Blocked</span>';

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
                        <div class="avatar-circle me-3">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
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
                            <span class="badge bg-white bg-opacity-25 px-3 py-2 rounded-pill">
                                <i class="bi bi-exclamation-triangle me-1"></i>${totalReports} reports
                            </span>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0">`;

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
                                    <th class="fw-bold py-3 text-center">Shared Content</th>
                                    <th class="fw-bold py-3 text-center">Reports Count</th>
                                    <th class="fw-bold py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>`;

        reports.forEach((r, index) => {
            const rowClass = index % 2 === 0 ? 'table-row-even' : 'table-row-odd';
            const reportDate = r.ReportedAt ? new Date(r.ReportedAt).toLocaleDateString() : '-';
            const reportTime = r.ReportedAt ? new Date(r.ReportedAt).toLocaleTimeString() : '';

            html += `
                <tr class="${rowClass}">
                    <td class="py-3 px-3 text-center">
                        <span class="badge bg-primary-subtle text-primary px-2 py-1 rounded-pill">#${r.Id}</span>
                    </td>
                    <td class="py-3">
                        <div class="reporter-info">
                            <div class="d-flex align-items-center mb-1">
                                <div class="avatar-small me-2">
                                    ${(r.ReporterName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
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
                            <div class="shared-info">
                                <div class="fw-semibold">
                                    <i class="bi bi-share me-1"></i>
                                    ${r.SharedArticleTitle || 'Untitled'}
                                </div>
                                <small class="text-muted">Shared by: ${r.SharedByName || 'Unknown'}</small>
                                <br><small class="text-muted">ID: ${r.SharedArticleId}</small>
                            </div>
                        ` : '<span class="text-muted fst-italic">Not shared</span>'}
                    </td>
                    <td class="py-3 text-center">
                        <span class="badge bg-dark text-white rounded-pill px-3 py-2">
                            <i class="bi bi-exclamation-triangle me-1"></i>
                            ${r.TotalReportsOnThisItem || 0}
                        </span>
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

        <style>
        .card-hover {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .modern-table {
            font-size: 0.95rem;
        }
        .modern-table th {
            background-color: #f8f9fa;
            border-bottom: 2px solid #dee2e6;
            font-weight: 600;
            color: #495057;
        }
        .modern-table td {
            border-bottom: 1px solid #f1f1f1;
            vertical-align: middle;
        }
        .table-row-even {
            background-color: #fafbfc;
        }
        .table-row-odd {
            background-color: #ffffff;
        }
        .table-row-even:hover, .table-row-odd:hover {
            background-color: #f0f8ff !important;
        }

        .avatar-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.9rem;
        }
        .avatar-small {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.75rem;
        }

        .action-btn {
            transition: all 0.2s ease;
            border-width: 1.5px;
        }
        .action-btn:hover {
            transform: scale(1.05);
        }

        .comment-box {
            border-left: 3px solid #007bff;
        }

        .reports-table td {
            max-width: 200px;
            word-wrap: break-word;
        }

        .reporter-info, .article-info, .shared-info, .report-details {
            line-height: 1.3;
        }

        .date-info {
            white-space: nowrap;
        }

        .admin-card-text {
            text-shadow: 0 2px 6px rgba(0,0,0,0.25), 0 1px 0 #333;
        }

        .admin-bubble {
            display: inline-block;
            background: rgba(255,255,255,0.85);
            color: #222;
            font-size: 2.1rem;
            font-weight: bold;
            border-radius: 2rem;
            padding: 0.25em 1.2em;
            margin-bottom: 0.2em;
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }
        .admin-bubble-label {
            display: inline-block;
            background: rgba(255,255,255,0.65);
            color: #333;
            font-size: 1.05rem;
            font-weight: 500;
            border-radius: 1.2rem;
            padding: 0.15em 0.9em;
            margin-top: 0.2em;
        }

        @media (max-width: 768px) {
            .modern-table {
                font-size: 0.85rem;
            }
            .avatar-circle {
                width: 32px;
                height: 32px;
                font-size: 0.8rem;
            }
            .reports-table td {
                max-width: 150px;
            }
        }
        </style>`;

    $tab.html(html);
}

// פונקציות עזר לטעינת נתונים עם אימות Token
function getWithAuth(endpoint) {
    return fetch(serverUrl + endpoint, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        }
    }).then(res => {
        if (res.status === 404) {
            // אם קיבלנו 404, זה אומר שאין נתונים - נחזיר "0"
            return "0";
        }
        if (!res.ok) throw new Error("Network response was not ok");
        return res.text();
    });
}

function putWithAuth(endpoint) {
    return fetch(serverUrl + endpoint, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        }
    }).then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.text();
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
            fetch(serverUrl + "Admin/GetAllUsers", {
                headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
            }),
            fetch(serverUrl + "Articles", {
                headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
            }),
            fetch(serverUrl + "Reports", {
                headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
            })
        ]);

        if (!usersResponse.ok || !articlesResponse.ok || !reportsResponse.ok) {
            throw new Error("Failed to load one or more data sets.");
        }

        const users = await usersResponse.json();
        const articles = await articlesResponse.json();
        const reports = await reportsResponse.json();

        const summaryData = {
            activeUsersCount: parseCount(activeUsersText),
            savedArticlesCount: parseCount(savedArticlesText),
            sharedArticlesCount: parseCount(sharedArticlesText),
            blockedUsersCount: parseCount(blockedUsersText),
            reportsCount: parseCount(reportsCountText),
            dailyLoginsCount: parseCount(dailyLoginsText)
        };

        renderAdminDashboard({
            users,
            articles,
            reports,
            ...summaryData
        });

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
    } catch {
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
    } catch {
        alert("Failed to toggle sharing permission. Please try again.");
        $btn.html(originalHtml).prop('disabled', false);
    }
});

// טעינה ראשונית כשמסך מוכן
$(document).ready(function () {
    renderUserActions?.(); // אם יש לך פונקציה כזו
    loadAdminDashboardData();
});