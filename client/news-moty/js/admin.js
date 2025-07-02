// renderAdminDashboard.js

function renderAdminDashboard({
    users,
    activeUsersCount,
    savedArticlesCount,
    sharedArticlesCount,
    blockedUsersCount,
    reportsCount,
    articles = [],
    reports = []
}) {
    const $tab = $('#admin');

    // בדיקת הרשאות admin
    if (!currentUser || currentUser.email.toLowerCase() !== 'admin@newshub.com') {
        $tab.html('<div class="alert alert-warning text-center shadow-sm rounded-3 p-3">Admin access only.</div>');
        $('#admin-tab-li').addClass('d-none');
        return;
    }

    $('#admin-tab-li').removeClass('d-none');

    const totalUsers = users.length;
    const totalBlocked = blockedUsersCount;
    const totalArticles = savedArticlesCount;
    const totalShared = sharedArticlesCount;
    const totalReports = reportsCount;

    let html = `
  <div class="row g-4 mb-5 text-center">
    <div class="col-md-2">
      <div class="card shadow-sm border-primary h-100">
        <div class="card-body">
          <h6 class="card-title text-primary"><i class="bi bi-people-fill me-2"></i>Users</h6>
          <h3>${totalUsers}</h3>
          <small class="text-muted">Registered</small>
        </div>
      </div>
    </div>
    <div class="col-md-2">
      <div class="card shadow-sm border-success h-100">
        <div class="card-body">
          <h6 class="card-title text-success"><i class="bi bi-journal-text me-2"></i>Articles</h6>
          <h3>${totalArticles}</h3>
          <small class="text-muted">Published</small>
        </div>
      </div>
    </div>
    <div class="col-md-2">
      <div class="card shadow-sm border-info h-100">
        <div class="card-body">
          <h6 class="card-title text-info"><i class="bi bi-share-fill me-2"></i>Shared</h6>
          <h3>${totalShared}</h3>
          <small class="text-muted">Shared by Users</small>
        </div>
      </div>
    </div>
    <div class="col-md-2">
      <div class="card shadow-sm border-danger h-100">
        <div class="card-body">
          <h6 class="card-title text-danger"><i class="bi bi-person-x-fill me-2"></i>Blocked</h6>
          <h3>${totalBlocked}</h3>
          <small class="text-muted">Blocked Users</small>
        </div>
      </div>
    </div>
    <div class="col-md-2">
      <div class="card shadow-sm border-warning h-100">
        <div class="card-body">
          <h6 class="card-title text-warning"><i class="bi bi-flag-fill me-2"></i>Reports</h6>
          <h3>${totalReports}</h3>
          <small class="text-muted">Total Reports</small>
        </div>
      </div>
    </div>
  </div>`;

    // טבלת משתמשים
    html += `
  <div class="card shadow-sm mb-5">
    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0"><i class="bi bi-person-lines-fill me-2"></i>User Management</h5>
      <small>${totalUsers} users</small>
    </div>
    <div class="table-responsive">
      <table class="table table-striped table-hover align-middle mb-0">
        <thead class="table-primary">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Sharing</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>`;

    users.forEach(user => {
        const statusBadge = user.active
            ? '<span class="badge bg-success">Active</span>'
            : '<span class="badge bg-danger">Blocked</span>';

        const sharingBadge = !user.blockSharing
            ? '<span class="badge bg-info text-dark">Sharing Allowed</span>'
            : '<span class="badge bg-secondary">Sharing Blocked</span>';

        const statusBtnClass = user.active ? 'danger' : 'success';
        const statusBtnIcon = user.active ? 'person-x-fill' : 'person-check-fill';
        const statusBtnTitle = user.active ? 'Deactivate User' : 'Activate User';

        const sharingBtnClass = user.blockSharing ? 'primary' : 'secondary';
        const sharingBtnIcon = user.blockSharing ? 'eye-fill' : 'eye-slash-fill';
        const sharingBtnTitle = user.blockSharing ? 'Allow Sharing' : 'Block Sharing';

        html += `
      <tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${statusBadge}</td>
        <td>${sharingBadge}</td>
        <td class="text-center">
          <button title="${statusBtnTitle}" class="btn btn-sm btn-outline-${statusBtnClass} toggle-deactivate-btn me-2" data-id="${user.id}">
            <i class="bi bi-${statusBtnIcon}"></i>
          </button>
          <button title="${sharingBtnTitle}" class="btn btn-sm btn-outline-${sharingBtnClass} toggle-block-btn" data-id="${user.id}">
            <i class="bi bi-${sharingBtnIcon}"></i>
          </button>
        </td>
      </tr>`;
    });

    html += `
        </tbody>
      </table>
    </div>
  </div>`;

    // טבלת דיווחים מלאה עם כל השדות ששלחת
    html += `
    <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">
      <thead style="background-color: #f8d7da;">
        <tr>
          <th>Id</th>
          <th>Reporter Id</th>
          <th>Reporter Name</th>
          <th>Reporter Email</th>
          <th>Comment</th>
          <th>Reported At</th>
          <th>Article Id</th>
          <th>Article Title</th>
          <th>Article Preview</th>
          <th>Shared Article Id</th>
          <th>Shared Article Title</th>
          <th>Shared By Name</th>
          <th>Total Reports On This Item</th>
        </tr>
      </thead>
      <tbody>
  `;

    reports.forEach(r => {
        html += `
      <tr>
        <td>${r.Id}</td>
        <td>${r.ReporterId}</td>
        <td>${r.ReporterName || '-'}</td>
        <td>${r.ReporterEmail || '-'}</td>
        <td>${r.Comment || '-'}</td>
        <td>${r.ReportedAt ? new Date(r.ReportedAt).toLocaleString() : '-'}</td>
        <td>${r.ArticleId !== null ? r.ArticleId : '-'}</td>
        <td>${r.ArticleTitle || '-'}</td>
        <td>${r.ArticlePreview || '-'}</td>
        <td>${r.SharedArticleId !== null ? r.SharedArticleId : '-'}</td>
        <td>${r.SharedArticleTitle || '-'}</td>
        <td>${r.SharedByName || '-'}</td>
        <td>${r.TotalReportsOnThisItem || 0}</td>
      </tr>
    `;
    });

    html += `
        </tbody>
      </table>
    </div>
  </div>`;

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
        $('#admin').html('<div class="alert alert-warning text-center shadow-sm rounded-3 p-3">Admin access only.</div>');
        $('#admin-tab-li').addClass('d-none');
        return;
    }

    $('#admin-tab-li').removeClass('d-none');

    try {
        const [
            activeUsersText,
            savedArticlesText,
            sharedArticlesText,
            blockedUsersText,
            reportsCountText,
            usersResponse,
            articlesResponse,
            reportsResponse
        ] = await Promise.all([
            getWithAuth("Admin/ActiveUsersCount"),
            getWithAuth("Admin/SavedArticlesCount"),
            getWithAuth("Admin/SharedArticlesCount"),
            getWithAuth("Admin/BlockedUsersCount"),
            getWithAuth("Admin/ReportsCount"),
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
            throw new Error("Failed to load one or more data sets (users/articles/reports).");
        }

        const users = await usersResponse.json();
        const articles = await articlesResponse.json();
        const reports = await reportsResponse.json();

        const summaryData = {
            activeUsersCount: parseCount(activeUsersText),
            savedArticlesCount: parseCount(savedArticlesText),
            sharedArticlesCount: parseCount(sharedArticlesText),
            blockedUsersCount: parseCount(blockedUsersText),
            reportsCount: parseCount(reportsCountText)
        };

        renderAdminDashboard({
            users,
            articles,
            reports,
            ...summaryData
        });

    } catch (err) {
        $('#admin').html(`<div class="alert alert-danger text-center">Error loading admin data: ${err.message}</div>`);
    }
}

// אירועים לכפתורים לשינוי סטטוס משתמשים
$(document).on('click', '.toggle-deactivate-btn', async function () {
    const userId = $(this).data('id');
    try {
        await putWithAuth(`Admin/${userId}/deactivate`);
        await loadAdminDashboardData();
    } catch {
        alert("Failed to toggle user status.");
    }
});

$(document).on('click', '.toggle-block-btn', async function () {
    const userId = $(this).data('id');
    try {
        await putWithAuth(`Admin/${userId}/block`);
        await loadAdminDashboardData();
    } catch {
        alert("Failed to toggle sharing permission.");
    }
});

// טעינה ראשונית כשמסך מוכן
$(document).ready(function () {
    renderUserActions?.(); // אם יש לך פונקציה כזו
    loadAdminDashboardData();
});
