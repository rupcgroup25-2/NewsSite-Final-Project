function renderAdminDashboard(data) {
    const $tab = $('#admin');

    if (!currentUser || currentUser.email.toLowerCase() !== 'admin@newshub.com') {
        $tab.html('<div class="alert alert-warning text-center shadow-sm rounded-3 p-3">Admin access only.</div>');
        $('#admin-tab-li').addClass('d-none');
        return;
    }

    $('#admin-tab-li').removeClass('d-none');

    const { users = [], articles = [], reports = [] } = data;

    const totalUsers = users.length;
    const totalBlocked = users.filter(u => u.isBlocked).length;
    const totalArticles = articles.length;
    const totalShared = articles.filter(a => a.shared).length;

    let html = `
    <div class="row g-4 mb-5 text-center">
      <div class="col-md-3">
        <div class="card shadow-sm border-primary h-100">
          <div class="card-body">
            <h5 class="card-title text-primary"><i class="bi bi-people-fill me-2"></i>Users</h5>
            <h2 class="display-5">${totalUsers}</h2>
            <small class="text-muted">Total Registered Users</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm border-success h-100">
          <div class="card-body">
            <h5 class="card-title text-success"><i class="bi bi-journal-text me-2"></i>Articles</h5>
            <h2 class="display-5">${totalArticles}</h2>
            <small class="text-muted">Total Published Articles</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm border-info h-100">
          <div class="card-body">
            <h5 class="card-title text-info"><i class="bi bi-share-fill me-2"></i>Shared</h5>
            <h2 class="display-5">${totalShared}</h2>
            <small class="text-muted">Articles Shared by Users</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm border-danger h-100">
          <div class="card-body">
            <h5 class="card-title text-danger"><i class="bi bi-person-x-fill me-2"></i>Blocked</h5>
            <h2 class="display-5">${totalBlocked}</h2>
            <small class="text-muted">Users Blocked</small>
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
        html += `
          <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.isBlocked
                ? '<span class="badge bg-danger">Blocked</span>'
                : '<span class="badge bg-success">Active</span>'}</td>
            <td>${user.canShare ? '<span class="text-success">Allowed</span>' : '<span class="text-muted">Blocked</span>'}</td>
            <td class="text-center">
              <button title="${user.isBlocked ? 'Unblock user' : 'Block user'}" class="btn btn-sm btn-outline-${user.isBlocked ? 'success' : 'warning'} toggle-block-btn me-2" data-id="${user.id}" style="cursor:pointer;">
                <i class="bi bi-${user.isBlocked ? 'unlock-fill' : 'slash-circle-fill'}"></i>
              </button>
              <button title="${user.canShare ? 'Block Sharing' : 'Allow Sharing'}" class="btn btn-sm btn-outline-secondary toggle-share-btn" data-id="${user.id}" style="cursor:pointer;">
                <i class="bi bi-share-fill"></i>
              </button>
            </td>
          </tr>`;
    });

    html += `
          </tbody>
        </table>
      </div>
    </div>`;

    // דיווחים
    html += `
    <div class="card shadow-sm">
      <div class="card-header bg-danger text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="bi bi-flag-fill me-2"></i>Reported Articles</h5>
        <small>${reports.length} reports</small>
      </div>`;

    if (!reports.length) {
        html += '<div class="p-4 text-center text-muted fst-italic">No reports yet.</div>';
    } else {
        html += `
        <div class="table-responsive">
          <table class="table table-striped table-hover mb-0">
            <thead class="table-danger">
              <tr>
                <th>Article</th>
                <th>Reason</th>
                <th>Reporter</th>
                <th>Date</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>`;
        reports.forEach((r, i) => {
            const article = articles.find(a => a.id === r.articleId);
            html += `
              <tr>
                <td>${article?.title || r.articleId}</td>
                <td>${r.reason}</td>
                <td>${r.reporter}</td>
                <td>${formatDate(r.date)}</td>
                <td class="text-center">
                  <button title="Clear Report" class="btn btn-sm btn-danger clear-report-btn" data-index="${i}" style="cursor:pointer;">
                    <i class="bi bi-x-circle-fill"></i>
                  </button>
                </td>
              </tr>`;
        });
        html += `
            </tbody>
          </table>
        </div>`;
    }

    html += `</div>`;

    $tab.html(html);
}


// קריאות API מאובטחות
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

// הפיכת טקסט למספר
function parseCount(text) {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

// טעינת מידע לדשבורד
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
            reportsText
        ] = await Promise.all([
            getWithAuth("Admin/ActiveUsersCount"),
            getWithAuth("Admin/SavedArticlesCount"),
            getWithAuth("Admin/SharedArticlesCount"),
            getWithAuth("Admin/BlockedUsersCount"),
            getWithAuth("Admin/ReportsCount"),
        ]);

        const summaryData = {
            activeUsersCount: parseCount(activeUsersText),
            savedArticlesCount: parseCount(savedArticlesText),
            sharedArticlesCount: parseCount(sharedArticlesText),
            blockedUsersCount: parseCount(blockedUsersText),
            reportsCount: parseCount(reportsText),
        };

        const usersResponse = await fetch(serverUrl + "Admin/GetAllUsers", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        if (!usersResponse.ok) throw new Error("Failed to load users");
        const users = await usersResponse.json();

        //const articlesResponse = await fetch("/api/Articles", {
        //    headers: {
        //        "Authorization": "Bearer " + localStorage.getItem("token")
        //    }
        //});
        //const articles = await articlesResponse.json();

        //const reportsResponse = await fetch("/api/Reports", {
        //    headers: {
        //        "Authorization": "Bearer " + localStorage.getItem("token")
        //    }
       /* });*/
        //const reports = await reportsResponse.json();

        renderAdminDashboard({ users, articles: [], reports: [], ...summaryData });

    } catch (err) {
        $('#admin').html(`<div class="alert alert-danger text-center">Error loading admin data: ${err.message}</div>`);
    }
}

// כפתור חסימת משתמש
$(document).on('click', '.toggle-block-btn', async function () {
    const userId = $(this).data('id');
    try {
        await putWithAuth(`Admin/${userId}/block`);
        await loadAdminDashboardData();
    } catch {
        alert("Failed to toggle user block status.");
    }
});

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString(); // או כל פורמט אחר שתבחר
}


// Event handlers
$(document).ready(function () {
    renderUserActions();
    loadAdminDashboardData();
});