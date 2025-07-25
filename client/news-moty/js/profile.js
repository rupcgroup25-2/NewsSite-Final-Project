// Profile Page Logic - Simplified Version

let userProfile = null;
let followingUsers = [];

$(document).ready(function() {
    renderUserActions();
    
    if (!currentUser) {
        renderLoginRequired();
        return;
    }
    
    loadUserProfile();
});

function renderLoginRequired() {
    $('#profile').html(`
        <div class="text-center py-5">
            <i class="bi bi-person-circle display-1 text-muted"></i>
            <h2 class="mt-3">Profile Access Required</h2>
            <p class="text-muted">Please log in to view your profile.</p>
            <button class="btn btn-primary" onclick="$('#loginModal').modal('show')">
                <i class="bi bi-box-arrow-in-right me-2"></i>Login
            </button>
        </div>
    `);
}

function loadUserProfile() {
    // Show loading
    $('#profile').html(`
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading profile...</p>
        </div>
    `);
    
    // For now, use current user data and load following users
    userProfile = currentUser;
    loadFollowingUsers();
}

function loadFollowingUsers() {
    ajaxCall(
        "GET",
        serverUrl + `Users/GetFollowingUsers?userId=${currentUser.id}`,
        "",
        loadFollowingUsersSCB,
        loadFollowingUsersECB
    );
}

function loadFollowingUsersSCB(response) {
    try {
        followingUsers = typeof response === 'string' ? JSON.parse(response) : response;
        renderProfile();
    } catch (error) {
        console.error("Error parsing following users:", error);
        followingUsers = [];
        renderProfile();
    }
}

function loadFollowingUsersECB(xhr) {
    console.error("Error loading following users:", xhr);
    followingUsers = [];
    renderProfile();
}

function renderProfile() {
    const profile = userProfile || currentUser;
    
    $('#profile').html(`
        <div class="row">
            <!-- Profile Header -->
            <div class="col-12">
                <div class="card mb-4 shadow-sm">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <!-- Simple user icon instead of image -->
                                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                                     style="width: 120px; height: 120px; font-size: 3rem;">
                                    <i class="bi bi-person-fill"></i>
                                </div>
                            </div>
                            <div class="col">
                                <h2 class="mb-1">${profile.name || 'Unknown User'}</h2>
                                <p class="text-muted mb-2">
                                    <i class="bi bi-envelope me-1"></i>${profile.email || ''}
                                </p>
                                <div class="d-flex gap-3 mb-3">
                                    <div class="text-center">
                                        <div class="fw-bold fs-5">${followingUsers.length}</div>
                                        <small class="text-muted">Following</small>
                                    </div>
                                </div>
                                <button class="btn btn-outline-primary" id="editProfileBtn">
                                    <i class="bi bi-pencil me-1"></i>Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Following Users -->
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-people me-2"></i>Following (${followingUsers.length})
                        </h5>
                        <button class="btn btn-sm btn-outline-primary" id="findUsersBtn">
                            <i class="bi bi-person-plus me-1"></i>Find Users
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderFollowingUsers()}
                    </div>
                </div>
            </div>
        </div>
    `);
    
    // Bind events
    bindProfileEvents();
}

function renderFollowingUsers() {
    if (followingUsers.length === 0) {
        return `
            <div class="text-center py-4">
                <i class="bi bi-people display-4 text-muted"></i>
                <h6 class="mt-3">Not following anyone yet</h6>
                <p class="text-muted">Start following other users to see their shared articles!</p>
            </div>
        `;
    }

    return `
        <div class="row g-3">
            ${followingUsers.map(user => `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <!-- Simple user icon for each user -->
                            <div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                                 style="width: 80px; height: 80px; font-size: 2rem;">
                                <i class="bi bi-person-fill"></i>
                            </div>
                            <h6 class="card-title">${user.name}</h6>
                            <p class="card-text text-muted small">${user.email}</p>
                            <div class="d-flex gap-2 justify-content-center">
                                <button class="btn btn-sm btn-outline-danger unfollow-btn" data-user-id="${user.id}">
                                    <i class="bi bi-person-dash me-1"></i>Unfollow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function bindProfileEvents() {
    // Edit profile button - simple modal
    $(document).off('click', '#editProfileBtn').on('click', '#editProfileBtn', function () {
        openEditProfileModal();
    });

    // Find users button
    $(document).off('click', '#findUsersBtn').on('click', '#findUsersBtn', function () {
        window.location.href = 'interests.html';
    });

    // Unfollow user
    $(document).off('click', '.unfollow-btn').on('click', '.unfollow-btn', function () {
        const userId = $(this).data('user-id');
        unfollowUser(userId);
    });

    // Save profile changes
    $(document).off('click', '#saveProfileBtn').on('click', '#saveProfileBtn', function () {
        saveProfileChanges();
    });
}

function openEditProfileModal() {
    const profile = userProfile || currentUser;
    
    // Populate form with basic info only
    $('#editProfileName').val(profile.name || '');
    $('#editProfileEmail').val(profile.email || '');
    
    $('#editProfileModal').modal('show');
}

function saveProfileChanges() {
    const name = $('#editProfileName').val().trim();
    
    if (!name) {
        alert('Name is required.');
        return;
    }
    
    // Disable save button
    $('#saveProfileBtn').prop('disabled', true).text('Saving...');
    
    const profileData = {
        name: name
    };
    
    ajaxCall(
        "PUT",
        serverUrl + `Users/UpdateProfile?userId=${currentUser.id}`,
        JSON.stringify(profileData),
        saveProfileSCB,
        saveProfileECB
    );
}function saveProfileSCB(response) {
    $('#saveProfileBtn').prop('disabled', false).text('Save Changes');
    $('#editProfileModal').modal('hide');

    // Update current user data
    if (currentUser) {
        currentUser.name = $('#editProfileName').val().trim();
    }

    // Reload profile
    loadUserProfile();

    alert('Profile updated successfully!');
}

function saveProfileECB(xhr) {
    $('#saveProfileBtn').prop('disabled', false).text('Save Changes');
    console.error("Error saving profile:", xhr);
    alert(xhr.responseText || 'Failed to update profile. Please try again.');
}

function unfollowUser(userId) {
    if (!confirm('Are you sure you want to unfollow this user?')) {
        return;
    }

    ajaxCall(
        "DELETE",
        serverUrl + `Users/UnfollowUser?userId=${currentUser.id}&followUserId=${userId}`,
        "",
        function (response) {
            followingUsers = followingUsers.filter(user => user.id != userId);
            renderProfile();
            alert('User unfollowed successfully.');
        },
        function (xhr) {
            console.error("Error unfollowing user:", xhr);
            alert('Failed to unfollow user. Please try again.');
        }
    );
}

function renderProfileError() {
    $('#profile').html(`
        <div class="text-center py-5">
            <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
            <h2 class="mt-3">Profile Load Error</h2>
            <p class="text-muted">Unable to load profile data. Please try again.</p>
            <button class="btn btn-primary" onclick="loadUserProfile()">
                <i class="bi bi-arrow-clockwise me-2"></i>Retry
            </button>
        </div>
    `);
}