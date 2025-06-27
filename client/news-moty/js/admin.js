function renderAdminTab() {
    const $tab = $('#admin');
    if (!currentUser || currentUser.email !== 'admin@newshub.com') {
        $tab.html('<div class="alert alert-warning text-center">Admin access only.</div>');
        $('#admin-tab-li').addClass('d-none');
        return;
    }
    $('#admin-tab-li').removeClass('d-none');
    let html = `<div class="row mb-4">
    <div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted">Total Users</div><div class="h3">${users.length}</div></div></div></div>
    <div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted">Articles</div><div class="h3">${sampleArticles.length}</div></div></div></div>
    <div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted">Shared</div><div class="h3">${sharedArticles.length}</div></div></div></div>
    <div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted">Blocked Users</div><div class="h3">${users.filter(u => u.isBlocked).length}</div></div></div></div>
  </div>`;
    // Reported articles
    html += '<h5>Reported Articles</h5>';
    if (!articleReports.length) {
        html += '<div class="alert alert-secondary">No reported articles.</div>';
    } else {
        html += '<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>Article</th><th>Reason</th><th>Comment</th><th>Reporter</th><th>Date</th><th>Action</th></tr></thead><tbody>';
        articleReports.forEach((r, i) => {
            const article = sampleArticles.find(a => a.id === r.articleId);
            html += `<tr><td>${article ? article.title : r.articleId}</td><td>${r.reason}</td><td>${r.comment}</td><td>${r.reporter}</td><td>${formatDate(r.date)}</td><td><button class="btn btn-sm btn-danger clear-report-btn" data-index="${i}">Clear</button></td></tr>`;
        });
        html += '</tbody></table></div>';
    }
    // User management
    html += '<h5>User Management</h5><div class="table-responsive"><table class="table table-bordered"><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Sharing</th><th>Actions</th></tr></thead><tbody>';
    users.forEach(user => {
        html += `<tr><td>${user.name}</td><td>${user.email}</td><td>${user.isBlocked ? '<span class="badge bg-danger">Blocked</span>' : '<span class="badge bg-success">Active</span>'}</td><td>${user.canShare ? 'Allowed' : 'Blocked'}</td><td><button class="btn btn-sm btn-warning toggle-block-btn" data-id="${user.id}">${user.isBlocked ? 'Unblock' : 'Block'}</button> <button class="btn btn-sm btn-secondary toggle-share-btn" data-id="${user.id}">${user.canShare ? 'Block Sharing' : 'Allow Sharing'}</button></td></tr>`;
    });
    html += '</tbody></table></div>';
    $tab.html(html);
}

// Admin actions
$(document).on('click', '.toggle-block-btn', function () {
    const id = $(this).data('id');
    users = users.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u);
    renderAdminTab();
});
$(document).on('click', '.toggle-share-btn', function () {
    const id = $(this).data('id');
    users = users.map(u => u.id === id ? { ...u, canShare: !u.canShare } : u);
    renderAdminTab();
});

// --- Admin: Show reported articles, allow clearing reports ---
$(document).on('click', '.clear-report-btn', function () {
    const idx = $(this).data('index');
    articleReports.splice(idx, 1);
    renderAdminTab();
});

// Event handlers
$(document).ready(function () {
    renderUserActions();
    renderAdminTab();
});