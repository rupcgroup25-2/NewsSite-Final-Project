// Profile Page Logic - Simplified Version

let userProfile = null;
let followingUsers = [];
let allEmails = [];

$(document).ready(function () {
    renderUserActions();

    if (!currentUser) {
        renderLoginRequired();
        return;
    }

    loadUserProfile();

    const defaultCount = parseInt($("#activityCountSelect").val()) || 10;

    loadRecentActivities(currentUser.id, defaultCount);

    $("#activityCountSelect").on("change", function () {
        const selectedCount = parseInt($(this).val()) || 10;
        console.log("activityCountSelect changed to:", selectedCount);
        loadRecentActivities(currentUser.id, selectedCount);
    });

    loadEmails();
    
    // פונקציית debug לבדיקת העדפות התראות
    window.checkNotificationPreferences = function() {
        console.log('🔍 === NOTIFICATION PREFERENCES DEBUG ===');
        console.log('📱 localStorage notificationStyle:', localStorage.getItem('notificationStyle'));
        console.log('📱 Selected radio value:', $('input[name="notificationStyle"]:checked').val());
        console.log('📱 Radio buttons state:');
        $('input[name="notificationStyle"]').each(function() {
            console.log(`  - ${$(this).val()}: ${$(this).is(':checked') ? 'CHECKED' : 'unchecked'}`);
        });
        console.log('=====================================');
    };
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
    // Check if server is available first
    if (!serverUrl) {
        console.error("Server URL not configured");
        renderProfileWithoutServer();
        return;
    }
    
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

function renderProfileWithoutServer() {
    console.warn("Rendering profile in offline mode");
    userProfile = currentUser;
    followingUsers = [];
    renderProfile();
}

function loadFollowingUsers() {
    ajaxCall(
        "GET",
        serverUrl + `Users/GetFollowedUsers?userId=${currentUser.id}`,
        "",
        loadFollowingUsersSCB,
        loadFollowingUsersECB
    );
}

function loadFollowingUsersSCB(response) {
    try {
        const rawData = typeof response === 'string' ? JSON.parse(response) : response;
        
        // Server returns flat array: [name1, email1, name2, email2, ...]
        // Convert to array of objects: [{name: name1, email: email1}, {name: name2, email: email2}, ...]
        followingUsers = [];
        for (let i = 0; i < rawData.length; i += 2) {
            if (i + 1 < rawData.length) {
                followingUsers.push({
                    name: rawData[i],
                    email: rawData[i + 1],
                    id: i / 2 // Simple ID based on position, since server doesn't return user IDs
                });
            }
        }
        
        // Cache the following users
        localStorage.setItem('cachedFollowingUsers', JSON.stringify(followingUsers));
        
        renderProfile();
    } catch (error) {
        console.error("Error parsing following users:", error);
        // Try to load from cache
        const cached = localStorage.getItem('cachedFollowingUsers');
        if (cached) {
            try {
                followingUsers = JSON.parse(cached);
                console.log("Loaded following users from cache");
            } catch (e) {
                followingUsers = [];
            }
        } else {
            followingUsers = [];
        }
        renderProfile();
    }
}

function loadFollowingUsersECB(xhr) {
    console.error("Error loading following users:", xhr);
    
    // Try to load from cache
    const cached = localStorage.getItem('cachedFollowingUsers');
    if (cached) {
        try {
            followingUsers = JSON.parse(cached);
            console.log("Loaded following users from cache due to server error");
        } catch (e) {
            followingUsers = [];
        }
    } else {
        followingUsers = [];
    }
    
    // Show profile even if following users failed to load
    renderProfile();
    
    // Show a warning message about the service being unavailable
    if (xhr.status === 500) {
        console.warn("Server error - following users service unavailable");
    } else if (xhr.status === 0) {
        console.warn("Network error - server might be down");
    }
}

function renderProfile() {
    const profile = userProfile || currentUser;
    
    $('#profile').html(`
        <div class="container-fluid px-0">
            <!-- Profile Header with Cover -->
            <div class="row g-0">
                <div class="col-12">
                    <div class="profile-header-card">
                        <div class="card-body p-4 text-white position-relative">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <div class="position-relative">
                                        ${getProfileImageHtml(currentUser)}
                                        <input type="file" id="profileImageInput" accept="image/*" style="display:none;">
                                        <button class="profile-image-edit-btn" 
                                                id="uploadProfileImageBtn" title="Change profile image">
                                            <i class="bi bi-camera"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col">
                                    <h1 class="profile-title user-select-none">${profile.name || 'Unknown User'}</h1>
                                    <p class="profile-email user-select-none">
                                        <i class="bi bi-envelope me-2"></i>${profile.email || ''}
                                    </p>
                                    <div class="d-flex gap-4 mb-3">
                                        <div class="text-center user-select-none">
                                            <div class="profile-stat-number">${followingUsers.length}</div>
                                            <small class="profile-stat-label">Following</small>
                                        </div>
                                    </div>
                                    <div class="d-flex gap-2 flex-wrap">
                                        <button class="profile-btn profile-btn-primary" id="editProfileBtn">
                                            <i class="bi bi-pencil me-2"></i>Edit Profile
                                        </button>
                                        <button class="profile-btn profile-btn-secondary" id="changePasswordBtn">
                                            <i class="bi bi-key me-2"></i>Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Image Generator Section -->
            <div class="row g-0 mb-4">
                <div class="col-12">
                    <div class="profile-card mx-3">
                        <div class="profile-card-header bg-gradient-success">
                            <h5 class="profile-section-title user-select-none">
                                <i class="bi bi-magic me-2"></i>AI Profile Image Generator
                            </h5>
                        </div>
                        <div class="card-body p-4">
                            <div class="input-group input-group-lg">
                                <span class="input-group-text bg-light border-0">
                                    <i class="bi bi-lightbulb text-warning"></i>
                                </span>
                                <input type="text" id="profileImagePrompt" 
                                       class="form-control border-0 shadow-sm" 
                                       placeholder="Describe your ideal profile image (e.g., 'Professional headshot with blue background')...">
                                <button class="profile-btn profile-btn-success" 
                                        id="generateProfileImageBtn" type="button">
                                    <i class="bi bi-stars me-2"></i>Generate Image
                                </button>
                            </div>
                            <small class="text-muted mt-2 d-block user-select-none">
                                <i class="bi bi-info-circle me-1"></i>
                                Tip: Be specific with colors, style, and background for best results. 
                                <strong>Generation takes 2-3 minutes.</strong>
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-0">
                <!-- Left Column -->
                <div class="col-lg-8 px-3">
                    <!-- Notification Settings -->
                    <div class="profile-card mb-4">
                        <div class="profile-card-header bg-gradient-primary">
                            <h5 class="profile-section-title user-select-none">
                                <i class="bi bi-bell me-2"></i>Notification Preferences
                            </h5>
                        </div>
                        <div class="card-body p-4">
                            <div class="form-check form-switch mb-4">
                                <input class="form-check-input" type="checkbox" id="notificationsSwitch" style="transform: scale(1.2);">
                                <label class="form-check-label fw-semibold fs-6 user-select-none" for="notificationsSwitch">
                                    Enable Push Notifications
                                </label>
                            </div>
                            
                            <div class="mb-4">
                                <label class="form-label fw-semibold user-select-none">Notification Display Style:</label>
                                <div class="row g-2">
                                    <div class="col-md-4">
                                        <div class="profile-notification-option">
                                            <input class="form-check-input" type="radio" name="notificationStyle" id="styleAuto" value="auto">
                                            <label class="form-check-label fw-semibold user-select-none" for="styleAuto">
                                                Auto Mode
                                            </label>
                                            <small class="text-muted d-block user-select-none">Smart detection</small>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="profile-notification-option">
                                            <input class="form-check-input" type="radio" name="notificationStyle" id="styleInPage" value="inpage">
                                            <label class="form-check-label fw-semibold user-select-none" for="styleInPage">
                                                In-Page
                                            </label>
                                            <small class="text-muted d-block user-select-none">Inside website</small>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="profile-notification-option">
                                            <input class="form-check-input" type="radio" name="notificationStyle" id="styleSystem" value="system">
                                            <label class="form-check-label fw-semibold user-select-none" for="styleSystem">
                                                System
                                            </label>
                                            <small class="text-muted d-block user-select-none">Browser notifications</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted user-select-none">
                                    Get notified about comments, shares, and updates<br>
                                    <span id="currentStyleHint" class="fw-semibold"></span>
                                </small>
                                <button class="profile-btn profile-btn-outline-primary" id="testNotificationBtn">
                                    <i class="bi bi-bell-fill me-2"></i>Test Notification
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Interests Section -->
                    <div class="profile-card mb-4">
                        <div class="profile-card-header bg-gradient-info">
                            <h5 class="profile-section-title user-select-none">
                                <i class="bi bi-heart me-2"></i>Your Interests
                            </h5>
                        </div>
                        <div class="card-body p-4">
                            <div class="mb-3">
                                <label class="form-label fw-semibold user-select-none">Current Interests:</label>
                                <div class="interests-tags-container">
                                    ${renderInterestsButtons()}
                                </div>
                            </div>
                            <div class="row g-3">
                                <div class="col-md-8">
                                    <input type="text" id="new-interest" class="form-control form-control-lg shadow-sm" 
                                           placeholder="Add a new interest...">
                                </div>
                                <div class="col-md-4">
                                    <button class="profile-btn profile-btn-info w-100" id="add-interest-btn">
                                        <i class="bi bi-plus-lg me-2"></i>Add Interest
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Following Users -->
                    <div class="profile-card">
                        <div class="profile-card-header bg-gradient-success">
                            <h5 class="profile-section-title user-select-none">
                                <i class="bi bi-people me-2"></i>Following Users (${followingUsers.length})
                            </h5>
                        </div>
                        <div class="card-body p-4">
                            <!-- Follow users section -->
                            <div class="profile-follow-section">
                                <label for="emailSearch" class="form-label fw-semibold user-select-none">Follow New Users</label>
                                <div class="row g-2">
                                    <div class="col-md-8">
                                        <div class="position-relative">
                                            <input type="text" id="emailSearch" class="form-control form-control-lg shadow-sm" 
                                                   placeholder="Search by email address..." autocomplete="off" />
                                            <ul id="suggestions" class="list-group position-absolute w-100 shadow-lg" 
                                                style="z-index: 1050; top: 100%;"></ul>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <button class="profile-btn profile-btn-success w-100" id="follow-user-btn">
                                            <i class="bi bi-person-plus me-2"></i>Follow
                                        </button>
                                    </div>
                                </div>
                            </div>
                            ${renderFollowingUsers()}
                        </div>
                    </div>
                </div>

                <!-- Right Column - Recent Activities -->
                <div class="col-lg-4 px-3">
                    <div class="profile-activity-card">
                        <div class="profile-card-header bg-gradient-warning">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="profile-section-title user-select-none">
                                    <i class="bi bi-clock-history me-2"></i>Recent Activities
                                </h5>
                                <select id="activityCountSelect" class="form-select form-select-sm w-auto shadow-sm">
                                    <option value="5">5</option>
                                    <option value="10" selected>10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>
                        <div class="profile-activity-content" id="recent-activities-container">
                            <!-- תוכן הפעולות נטען דינמית -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);

    // אחרי שהכנסנו את ה־HTML, עכשיו אפשר להאזין ל-select:
    const $select = $("#activityCountSelect");

    // טען פעולות כברירת מחדל:
    const defaultCount = parseInt($select.val()) || 10;
    loadRecentActivities(currentUser.id, defaultCount);

    // האזן לשינויי הסלקט:
    $select.on("change", function () {
        const selectedCount = parseInt($(this).val()) || 10;
        loadRecentActivities(currentUser.id, selectedCount);
    });

    // Bind events
    bindProfileEvents();
    
    // טען הגדרות התראות
    loadNotificationSettings();
    
    bindProfileImageUploadEvents();
    
    // רענן את תמונת הפרופיל כדי למנוע בעיות cache
    if (currentUser && currentUser.imageUrl) {
        setTimeout(() => {
            refreshProfileImageGlobally();
        }, 500); // המתן קצת כדי שה-DOM יטען
    }

}

function loadRecentActivities(userId, count = 10) {
    ajaxCall(
        "GET",
        `${serverUrl}Users/AllActivities?userId=${userId}&count=${count}`,
        null,
        function success(data) {
            const activities = Array.isArray(data) ? data : [];
            $("#recent-activities-container").html(renderRecentActivities(activities));
        },
        function error(xhr) {
            console.error("Failed to fetch activities:", xhr.responseText || xhr.statusText);
            $("#recent-activities-container").html('<p class="text-muted">Could not load recent activities.</p>');
        }
    );
}

function renderRecentActivities(activities) {
    if (!activities || activities.length === 0) {
        return `
            <div class="text-center p-4">
                <i class="bi bi-clock-history display-4 text-muted mb-3 user-select-none"></i>
                <p class="text-muted user-select-none">No recent activities found.</p>
            </div>
        `;
    }

    const getActivityIcon = (activityType) => {
        const type = activityType.toLowerCase();
        if (type.includes('login')) return 'bi-box-arrow-in-right text-success';
        if (type.includes('comment')) return 'bi-chat-dots text-primary';
        if (type.includes('share')) return 'bi-share text-info';
        if (type.includes('save')) return 'bi-bookmark text-warning';
        if (type.includes('follow')) return 'bi-person-plus text-success';
        return 'bi-circle-fill text-secondary';
    };

    const getActivityColor = (activityType) => {
        const type = activityType.toLowerCase();
        if (type.includes('login')) return 'success';
        if (type.includes('comment')) return 'primary';
        if (type.includes('share')) return 'info';
        if (type.includes('save')) return 'warning';
        if (type.includes('follow')) return 'success';
        return 'secondary';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    return activities.map((activity, index) => `
        <div class="activity-item user-select-none" style="animation-delay: ${index * 0.1}s;">
            <div class="d-flex align-items-start">
                <div class="flex-shrink-0 me-3">
                    <div class="rounded-circle bg-${getActivityColor(activity.ActivityType)} bg-opacity-10 p-2 d-flex align-items-center justify-content-center"
                         style="width: 40px; height: 40px;">
                        <i class="bi ${getActivityIcon(activity.ActivityType)} fs-6"></i>
                    </div>
                </div>
                <div class="flex-grow-1">
                    <div class="fw-semibold mb-1" style="font-size: 0.9rem; line-height: 1.3;">
                        ${activity.ActivityType}
                    </div>
                    <small class="text-muted">
                        <i class="bi bi-clock me-1"></i>
                        ${formatDate(activity.ActivityDate)}
                    </small>
                </div>
            </div>
        </div>
    `).join('');
}


function renderFollowingUsers() {
    if (followingUsers.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="bi bi-people display-4 text-muted mb-3 user-select-none"></i>
                <h6 class="fw-semibold user-select-none">Not following anyone yet</h6>
                <p class="text-muted user-select-none">Start following other users to see their shared articles!</p>
            </div>
        `;
    }

    return `
        <div class="row g-3">
            ${followingUsers.map((user, index) => `
                <div class="col-md-6 col-xl-4" style="animation-delay: ${index * 0.1}s;">
                    <div class="profile-following-card">
                        <div class="card-body text-center p-4">
                            <div class="position-relative d-inline-block mb-3">
                                <div class="profile-user-avatar">
                                    <i class="bi bi-person-fill text-white fs-3"></i>
                                </div>
                                <div class="profile-user-status" title="Active"></div>
                            </div>
                            <h6 class="card-title fw-bold mb-2 user-select-none">${user.name}</h6>
                            <p class="card-text text-muted small mb-3 user-select-none">
                                <i class="bi bi-envelope me-1"></i>${user.email}
                            </p>
                            <button class="profile-btn profile-btn-outline-danger unfollow-btn" 
                                    data-user-email="${user.email}">
                                <i class="bi bi-person-dash me-1"></i>Unfollow
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderInterestsButtons() {
    if (!currentUser || !currentUser.tags || currentUser.tags.length === 0) {
        return `
            <div class="text-center p-4 bg-light rounded-3">
                <i class="bi bi-heart display-6 text-muted mb-2 user-select-none"></i>
                <p class="text-muted mb-0 user-select-none">No interests added yet.</p>
                <small class="text-muted user-select-none">Add your first interest below!</small>
            </div>
        `;
    }

    const colors = ['primary', 'success', 'info', 'warning', 'danger', 'secondary'];
    
    return `
        <div class="interests-grid">
            ${currentUser.tags.map((tag, index) => {
                const color = colors[index % colors.length];
                return `
                    <button type="button" 
                            class="btn btn-${color} btn-sm me-2 mb-2 interest-tag profile-interest-tag user-select-none" 
                            data-id="${tag.id}">
                        <span class="fw-semibold">${tag.name}</span>
                        <i class="bi bi-x-circle-fill ms-2 text-white interest-remove-icon" 
                           title="Remove interest"></i>
                    </button>
                `;
            }).join('')}
        </div>
    `;
}

function bindProfileEvents() {
    // Edit profile button - simple modal
    $(document).off('click', '#editProfileBtn').on('click', '#editProfileBtn', function () {
        openEditProfileModal();
    });

    // Change password button
    $(document).off('click', '#changePasswordBtn').on('click', '#changePasswordBtn', function () {
        openChangePasswordModal();
    });

    // Notification option selection - click entire div
    $(document).off('click', '.profile-notification-option').on('click', '.profile-notification-option', function () {
        const radio = $(this).find('input[type="radio"]');
        radio.prop('checked', true);
        radio.trigger('change');
    });

    // Notification style change handler
    $(document).off('change', 'input[name="notificationStyle"]').on('change', 'input[name="notificationStyle"]', function() {
        const selectedStyle = $(this).val();
        console.log('📱 Notification style changed to:', selectedStyle);
        localStorage.setItem('notificationStyle', selectedStyle);
        
        // עדכן את הטקסט המסביר
        updateStyleHint(selectedStyle);
        
        // הצג הודעה על השינוי
        $('.notification-status').removeClass('text-warning text-success text-muted text-danger')
            .addClass('text-success').text(`Notification style updated to: ${selectedStyle}`);
            
        console.log('✅ Notification style saved to localStorage');
    });

    // Unfollow user
    $(document).off('click', '.unfollow-btn').on('click', '.unfollow-btn', function () {
        const userEmail = $(this).data('user-email');
        unfollowUser(userEmail);
    });

    // Save profile changes
    $(document).off('click', '#saveProfileBtn').on('click', '#saveProfileBtn', function () {
        saveProfileChanges();
    });

    // Adding new interest
    $(document).off('click', '#add-interest-btn').on('click', '#add-interest-btn', function () {
        const newTagName = $('#new-interest').val().trim();

        if (!newTagName) {
            alert("Please enter a valid interest.");
            return;
        }

        const apiUrl = `${serverUrl}Tags/assign/userId/${currentUser.id}/tagName/${newTagName}`;

        ajaxCall(
            "POST",
            apiUrl,
            null,
            function success(response) {
                const newTag = {
                    id: response.tagId,
                    name: newTagName
                };
                currentUser.tags.push(newTag);
                localStorage.setItem('user', JSON.stringify(currentUser));
                $('#new-interest').val('');
                $('.interests-tags-container').html(renderInterestsButtons());
            },
            function error(xhr) {
                alert("Failed to add interest: " + (xhr.responseText || xhr.statusText));
            }
        );
    });

    // Removing interest
    $(document).off('click', '.interest-tag').on('click', '.interest-tag', function () {
        const tagId = $(this).data('id');
        const tagName = $(this).clone().find('span').remove().end().text().trim();

        if (!confirm(`Are you sure you want to remove interest "${tagName}" ?`)) return;

        const url = `${serverUrl}Tags/RemoveFromUser/userId/${currentUser.id}/tagId/${tagId}`;

        ajaxCall(
            "DELETE",
            url,
            null, // No body needed
            function success() {
                // Update local user object
                currentUser.tags = currentUser.tags.filter(t => t.id !== tagId);
                localStorage.setItem("user", JSON.stringify(currentUser));
                $('.interests-tags-container').html(renderInterestsButtons());
            },
            function error(xhr) {
                alert("Failed to remove interest: " + (xhr.responseText || xhr.statusText));
            }
        );
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
        newName: name
    };
    
    ajaxCall(
        "PUT",
        serverUrl + `Users/UpdateProfile?userId=${currentUser.id}`,
        JSON.stringify(name), // שולח רק "שם"
        saveProfileSCB,
        saveProfileECB
    );
}function saveProfileSCB(response) {
    $('#saveProfileBtn').prop('disabled', false).text('Save Changes');
    $('#editProfileModal').modal('hide');

    // Update current user data
    if (currentUser) {
        currentUser.name = $('#editProfileName').val().trim();
        localStorage.setItem('user', JSON.stringify(currentUser));
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

function openChangePasswordModal() {
    // Create the modal HTML if it doesn't exist
    if ($('#changePasswordModal').length === 0) {
        const modalHTML = `
            <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-labelledby="changePasswordModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="changePasswordModalLabel">
                                <i class="bi bi-key me-2"></i>Change Password
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="changePasswordForm">
                                <div class="mb-3">
                                    <label for="newPassword" class="form-label">New Password</label>
                                    <div class="input-group">
                                        <input type="password" class="form-control" id="newPassword" required minlength="8">
                                        <button class="btn btn-outline-secondary" type="button" id="toggleNewPassword">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                    </div>
                                    <div class="form-text">Password must be 8+ characters with uppercase, lowercase, number, and symbol.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="confirmPassword" class="form-label">Confirm New Password</label>
                                    <div class="input-group">
                                        <input type="password" class="form-control" id="confirmPassword" required>
                                        <button class="btn btn-outline-secondary" type="button" id="toggleConfirmPassword">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                <div id="passwordError" class="alert alert-danger d-none"></div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-warning" id="savePasswordBtn">
                                <i class="bi bi-check-lg me-1"></i>Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('body').append(modalHTML);
        
        // Bind password visibility toggle events
        bindPasswordToggleEvents();
        
        // Bind save password event
        bindSavePasswordEvent();
    }
    
    // Clear form and show modal
    $('#changePasswordForm')[0].reset();
    $('#passwordError').addClass('d-none');
    $('#changePasswordModal').modal('show');
}

function bindPasswordToggleEvents() {
    // Toggle password visibility
    $('#toggleNewPassword').on('click', function() {
        togglePasswordVisibility('newPassword', 'toggleNewPassword');
    });
    
    $('#toggleConfirmPassword').on('click', function() {
        togglePasswordVisibility('confirmPassword', 'toggleConfirmPassword');
    });
}

function togglePasswordVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bi bi-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'bi bi-eye';
    }
}

function bindSavePasswordEvent() {
    $('#savePasswordBtn').on('click', function() {
        const newPassword = $('#newPassword').val().trim();
        const confirmPassword = $('#confirmPassword').val().trim();
        
        // Clear previous errors
        $('#passwordError').addClass('d-none');
        
        // Validation
        if (!newPassword || !confirmPassword) {
            showPasswordError('All fields are required.');
            return;
        }
        
        // Validate password according to registration requirements
        if (newPassword.length < 8 ||
            !/\d/.test(newPassword) ||
            !/[A-Z]/.test(newPassword) ||
            !/[a-z]/.test(newPassword) ||
            !/[^\w\d\s]/.test(newPassword)) {
            showPasswordError('Password must be 8+ chars with uppercase, lowercase, number, and symbol.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showPasswordError('New password and confirmation do not match.');
            return;
        }
        
        // Disable button and show loading
        $('#savePasswordBtn').prop('disabled', true).html('<i class="bi bi-hourglass-split me-1"></i>Changing...');
        
        // Call API to change password - send only the new password as string
        ajaxCall(
            "PUT",
            serverUrl + `Users/ChangePassword?userId=${currentUser.id}`,
            JSON.stringify(newPassword),
            changePasswordSCB,
            changePasswordECB
        );
    });
}

function showPasswordError(message) {
    $('#passwordError').removeClass('d-none').text(message);
}

function changePasswordSCB(response) {
    $('#savePasswordBtn').prop('disabled', false).html('<i class="bi bi-check-lg me-1"></i>Change Password');
    $('#changePasswordModal').modal('hide');
    alert('Password changed successfully!');
}

function changePasswordECB(xhr) {
    $('#savePasswordBtn').prop('disabled', false).html('<i class="bi bi-check-lg me-1"></i>Change Password');
    console.error("Error changing password:", xhr);
    
    let errorMessage = 'Failed to change password. Please try again.';
    if (xhr.responseText) {
        errorMessage = xhr.responseText;
    } else if (xhr.status === 401) {
        errorMessage = 'Current password is incorrect.';
    } else if (xhr.status === 400) {
        errorMessage = 'Invalid password format.';
    }
    
    showPasswordError(errorMessage);
}

function unfollowUser(userEmail) {
    if (!confirm('Are you sure you want to unfollow this user?')) {
        return;
    }

    ajaxCall(
        "DELETE",
        serverUrl + `Users/Unfollow?followerId=${currentUser.id}&followedEmail=${encodeURIComponent(userEmail)}`,
        "",
        function (response) {
            // הסר המשתמש מהמערך המקומי
            followingUsers = followingUsers.filter(user => user.email !== userEmail);
            
            // עדכן את ה-cache
            localStorage.setItem('cachedFollowingUsers', JSON.stringify(followingUsers));
            
            // רנדר מחדש את הפרופיל
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

// פונקציה ליצירת HTML של תמונת פרופיל עם ברירת מחדל
function getProfileImageHtml(profile) {
    const baseImageUrl = currentUser.imageUrl || 
                        `https://res.cloudinary.com/dvupmddqz/image/upload/profile_pics/profile_pics/${currentUser.id}.jpg`;
    
    // הוסף cache-busting parameter כדי למנוע בעיות cache בדפדפן
    const imageUrl = baseImageUrl + '?t=' + new Date().getTime();
    
    const fallbackInitial = (profile.name || 'User').charAt(0).toUpperCase();
    
    return `
        <div class="profile-image-container position-relative">
            <img id="profilePic" 
                 src="${imageUrl}" 
                 alt="Profile Image" 
                 class="rounded-circle border border-4 border-white shadow-lg profile-image-animated" 
                 style="width: 140px; height: 140px; object-fit: cover; display: block;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="default-profile-image shadow-lg position-absolute top-0 start-0" 
                 style="display: none;">
                ${fallbackInitial}
            </div>
        </div>
    `;
}

//Searching user's for following
function loadEmails() {
    ajaxCall(
        "GET",
        serverUrl + "Users/AllEmails",
        null, // No body for GET
        function success(data) {
            try {
                allEmails = Array.isArray(data) ? data : [];
                console.log("Loaded emails:", allEmails.length);
            } catch (error) {
                console.error("Error processing emails data:", error);
                allEmails = [];
                $("#emailSearch").hide();
            }
        },
        function error(xhr) {
            console.log("Failed to fetch emails: " + (xhr.responseText || xhr.statusText));
            allEmails = [];
            // Don't hide the search, just show a message
            if (xhr.status === 500) {
                console.warn("Server error - email search service unavailable");
            } else if (xhr.status === 0) {
                console.warn("Network error - server might be down");
            }
        }
    );
}

// Handle input event for the search bar
$(document).on("input", "#emailSearch", function () {
    const query = $(this).val().toLowerCase();
    const $suggestions = $("#suggestions");
    $suggestions.empty();

    if (!query) return;

    const matches = allEmails.filter(email => email.toLowerCase().includes(query)).slice(0, 10);

    matches.forEach(email => {
        const $li = $("<li>")
            .text(email)
            .addClass("list-group-item")
            .css("cursor", "pointer")
            .on("click", function () {
                $("#emailSearch").val(email);
                $suggestions.empty();
            });

        $suggestions.append($li);
    });
});

//Follow and Unfollow events
$(document).on('click', '#follow-user-btn', function () {
    const email = $('#emailSearch').val().trim();
    if (!email) {
        alert("Please enter an email to follow.");
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    const url = `${serverUrl}Users/Follow?followerId=${currentUser.id}&followedEmail=${email}`;

    ajaxCall(
        "POST",
        url,
        null,
        function success() {
            alert("Follow request sent.");
            // Clear the search field and reload following users list
            $('#emailSearch').val('');
            $('#suggestions').empty();
            loadFollowingUsers();
        },
        function error(xhr) {
            let errorMsg = "Failed to follow user.";
            if (xhr.status === 500) {
                errorMsg = "Server error. Please try again later.";
            } else if (xhr.status === 0) {
                errorMsg = "Network error. Please check your connection.";
            } else if (xhr.responseText) {
                errorMsg = xhr.responseText;
            }
            alert(errorMsg);
        }
    );
});

function addNotificationSettingsToProfile() {
    if (!currentUser) return;

    const notificationSettings = `
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="bi bi-bell me-2"></i>Notification Settings
                </h5>
            </div>
            <div class="card-body">
                <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" id="notificationsSwitch">
                    <label class="form-check-label" for="notificationsSwitch">
                        Receive push notifications
                    </label>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Notification Style:</label>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="notificationStyle" id="styleAuto" value="auto" checked>
                        <label class="form-check-label" for="styleAuto">
                            🤖 Auto - In-page when visible, system when not
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="notificationStyle" id="styleInPage" value="inpage">
                        <label class="form-check-label" for="styleInPage">
                            🎨 In-page - Always show notifications inside the website
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="notificationStyle" id="styleSystem" value="system">
                        <label class="form-check-label" for="styleSystem">
                            📱 System - Always show as browser notifications
                        </label>
                    </div>
                </div>
                
                <small class="text-muted d-block mb-3">
                    Get notified about new comments, article shares, and system updates
                </small>
                <button class="btn btn-outline-primary btn-sm" id="testNotificationBtn">
                    <i class="bi bi-bell"></i> Send Test Notification
                </button>
            </div>
        </div>
    `;

    // הוסף לאחר הכרטיס הראשון בפרופיל
    const $firstCard = $('#profile .card:first');
    
    if ($firstCard.length > 0) {
        $firstCard.after(notificationSettings);
    } else {
        // נסה להוסיף בסוף האזור של הפרופיל
        const $profile = $('#profile');
        if ($profile.length > 0) {
            $profile.append(`<div class="col-12">${notificationSettings}</div>`);
        }
    }

    // טען הגדרות נוכחיות
    loadNotificationSettings();
    
    // עדכן את ההסבר הראשוני
    const currentStyle = localStorage.getItem('notificationStyle') || 'auto';
    updateStyleHint(currentStyle);
}

// פונקציה לעדכון הטקסט המסביר
function updateStyleHint(style) {
    const hints = {
        'auto': '🤖 Auto: System notifications when page hidden, in-page when visible',
        'system': '💻 System: Will always show browser/OS notifications',
        'inpage': '🌐 In-Page: Will always show notifications inside the website'
    };
    
    $('#currentStyleHint').text(hints[style] || hints['auto']);
    console.log('🎨 Style hint updated to:', style);
}

// טעינת הגדרות התראות
function loadNotificationSettings() {
    if (!currentUser) return;
    
    // טען הגדרת סוג התראה מ-localStorage קודם כל
    const savedStyle = localStorage.getItem('notificationStyle') || 'auto';
    console.log('🔄 Loading notification style from localStorage:', savedStyle);
    
    // בחר את הרדיו הנכון
    $(`input[name="notificationStyle"][value="${savedStyle}"]`).prop('checked', true);
    
    // עדכן את ההסבר
    updateStyleHint(savedStyle);
    
    // בדוק שהפונקציות הנדרשות קיימות
    if (typeof checkNotificationStatus !== 'function') {
        console.log('⏳ checkNotificationStatus not ready, retrying...');
        setTimeout(loadNotificationSettings, 1000); // נסה שוב אחרי שנייה
        return;
    }
    
    // הוסף loading state
    $('#notificationsSwitch').prop('disabled', true);
    $('#testNotificationBtn').prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Loading...');

    checkNotificationStatus(currentUser.id).then(isEnabled => {
        $('#notificationsSwitch').prop('checked', isEnabled).prop('disabled', false);
        $('#testNotificationBtn').prop('disabled', false).html('<i class="bi bi-bell-fill me-2"></i>Test Notification');
        
        // הצג סטטוס נוכחי
        const statusText = isEnabled ? 'enabled' : 'disabled';
        const statusClass = isEnabled ? 'text-success' : 'text-muted';
        $('.notification-status').remove();
        $('#notificationsSwitch').parent().append(`
            <small class="notification-status ${statusClass} d-block mt-1">
                Notifications are currently ${statusText}
            </small>
        `);
        
        console.log('✅ Notification settings loaded successfully');
    }).catch(err => {
        console.error('❌ Error loading notification status:', err);
        $('#notificationsSwitch').prop('disabled', false);
        $('#testNotificationBtn').prop('disabled', false).html('<i class="bi bi-bell-fill me-2"></i>Test Notification');
        
        $('.notification-status').remove();
        $('#notificationsSwitch').parent().append(`
            <small class="notification-status text-danger d-block mt-1">
                Error loading notification status
            </small>
        `);
    });
}

// טיפול בשינוי הגדרות
$(document).on('change', '#notificationsSwitch', function () {
    if (!currentUser) return;

    const isEnabled = $(this).is(':checked');
    const switchElement = $(this);
    
    // הוסף visual feedback
    switchElement.prop('disabled', true);
    $('.notification-status').removeClass('text-success text-muted text-danger').addClass('text-warning').text('Updating...');

    const originalValue = !isEnabled; // הערך המקורי לפני השינוי
    
    const updatePromise = isEnabled ? 
        new Promise(resolve => {
            if (typeof enableNotifications === 'function') {
                enableNotifications(currentUser.id);
            }
            setTimeout(resolve, 1000);
        }) :
        new Promise(resolve => {
            if (typeof disableNotifications === 'function') {
                disableNotifications(currentUser.id);
            }
            setTimeout(resolve, 1000);
        });
    
    updatePromise.then(() => {
        // בדוק את הסטטוס החדש
        return checkNotificationStatus(currentUser.id);
    }).then(newStatus => {
        const statusText = newStatus ? 'enabled' : 'disabled';
        const statusClass = newStatus ? 'text-success' : 'text-muted';
        $('.notification-status').removeClass('text-warning text-danger').addClass(statusClass).text(`Notifications are currently ${statusText}`);
    }).catch(error => {
        // החזר את המתג למצב המקורי
        switchElement.prop('checked', originalValue);
        $('.notification-status').removeClass('text-warning text-success text-muted').addClass('text-danger').text('Error updating notification settings');
    }).finally(() => {
        // החזר את השליטה
        switchElement.prop('disabled', false);
    });
});

// שליחת התראת בדיקה
$(document).on('click', '#testNotificationBtn', function () {
    if (!currentUser) return;
    
    const $btn = $(this);
    const originalText = $btn.html();
    
    // הוסף loading state
    $btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Sending...');
    
    // קבל הגדרת סוג התראה מהמשתמש
    const notificationStyle = localStorage.getItem('notificationStyle') || 'auto';
    console.log('🔧 Testing notification with style:', notificationStyle);
    
    // החלט איזה סוג התראה להציג (בדיוק כמו ב-showCustomNotification)
    const isPageVisible = !document.hidden && document.visibilityState === 'visible';
    let useSystemNotification = false;
    
    switch(notificationStyle) {
        case 'system':
            useSystemNotification = true;
            break;
        case 'inpage':
            useSystemNotification = false;
            break;
        case 'auto':
        default:
            useSystemNotification = !isPageVisible;
            break;
    }
    
    console.log('🔔 Will use system notification:', useSystemNotification);
    
    // הצג התראה לפי הבחירה
    if (useSystemNotification) {
        if (Notification.permission === 'granted') {
            console.log('🔔 Testing system notification');
            const testNotification = new Notification('Test - System Notification', {
                body: 'This is a test system notification based on your settings!',
                icon: '/favicon.ico',
                tag: 'profile-test',
                requireInteraction: true
            });
            
            testNotification.onclick = function() {
                console.log('Profile test notification clicked!');
                testNotification.close();
            };
            
            setTimeout(() => testNotification.close(), 8000);
        } else {
            alert('Please allow notifications in your browser first!');
            $btn.prop('disabled', false).html(originalText);
            return;
        }
    } else {
        // הצג התראת in-page
        console.log('🔔 Testing in-page notification');
        if (typeof showCustomNotification === 'function') {
            showCustomNotification(
                'Test - In-Page Notification',
                'This is a test in-page notification based on your settings!',
                { url: window.location.href }
            );
        }
    }
    
    // גם שלח דרך השרת (אם יש) לבדיקת Firebase
    if (typeof sendTestNotification === 'function') {
        console.log('🚀 Also sending server test notification...');
        sendTestNotification(currentUser.id);
    }
    
    // החזר למצב הרגיל אחרי 3 שניות
    setTimeout(() => {
        $btn.prop('disabled', false).html(originalText);
    }, 3000);
});

// פונקציה לרענון תמונת פרופיל בכל האתר
function refreshProfileImageGlobally() {
    const timestamp = new Date().getTime();
    const baseImageUrl = currentUser.imageUrl || 
                        `https://res.cloudinary.com/dvupmddqz/image/upload/profile_pics/profile_pics/${currentUser.id}.jpg`;
    const imageUrlWithCache = baseImageUrl + '?t=' + timestamp;
    
    // עדכן את תמונת הפרופיל בכל מקום שהיא מופיעה
    $('#profilePic').attr('src', imageUrlWithCache);
    
    // עדכן גם במקומות אחרים אם יש (navbar, header וכו')
    $('.user-profile-image').attr('src', imageUrlWithCache);
    $('.current-user-avatar').attr('src', imageUrlWithCache);
    
    console.log('🖼️ Profile image refreshed globally with cache-busting');
}

// פונקציה למחיקת cache של תמונות בדפדפן
function clearImageCache() {
    // יצירת תמונה חדשה כדי לאלץ טעינה מחדש
    const img = new Image();
    const baseImageUrl = currentUser.imageUrl || 
                        `https://res.cloudinary.com/dvupmddqz/image/upload/profile_pics/profile_pics/${currentUser.id}.jpg`;
    
    img.onload = function() {
        console.log('🗑️ Image cache cleared and reloaded');
        refreshProfileImageGlobally();
    };
    
    img.onerror = function() {
        console.log('⚠️ Image reload failed, but cache cleared');
        refreshProfileImageGlobally();
    };
    
    // טען את התמונה עם timestamp חדש
    img.src = baseImageUrl + '?clear=' + new Date().getTime();
}

//adding profile picture
function getAuthToken() {
    return JSON.parse(localStorage.getItem("user")).token;
}

function bindProfileImageUploadEvents() {
    // Open file dialog when button is clicked
    $(document).off('click', '#uploadProfileImageBtn').on('click', '#uploadProfileImageBtn', function () {
        $('#profileImageInput').click();
    });

    // Handle file selection
    $(document).off('change', '#profileImageInput').on('change', '#profileImageInput', function () {
        const file = this.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('UserId', currentUser.id);
        formData.append('ImageFile', file);

        // Optional: show loading spinner on image
        $('#profilePic').css('opacity', 0.5);

        let token;
        try {
            token = getAuthToken();
        } catch {
            token = null;
        }

        fetch(serverUrl + 'Users/UploadProfileImage', {
            method: 'POST',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        })
            .then(res => {
                if (res.status === 401) {
                    alert('Your session has expired. Please log in again.');
                    localStorage.removeItem('user');
                    localStorage.removeItem('cachedFollowingUsers');
                    window.location.reload();
                    return Promise.reject();
                }
                return res.json();
            })
            .then(data => {
                if (data && data.imageUrl) {
                    // עדכן את המידע המקומי
                    currentUser.imageUrl = data.imageUrl;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                    
                    // נקה את ה-cache ורענן את התמונה
                    clearImageCache();
                } else if (data) {
                    alert('Image upload failed');
                }
            })
            .catch(() => alert('Image upload failed'))
            .finally(() => $('#profilePic').css('opacity', 1));
    });
}
//Generate picture
$(document).off('click', '#generateProfileImageBtn').on('click', '#generateProfileImageBtn', function () {
    const prompt = $('#profileImagePrompt').val().trim();
    if (!prompt) {
        alert('Please enter a prompt.');
        return;
    }

    let token;
    try {
        token = getAuthToken();
    } catch {
        token = null;
    }

    // Disable button and show loading state
    const $generateBtn = $('#generateProfileImageBtn');
    const originalText = $generateBtn.html();
    $generateBtn.prop('disabled', true)
               .html('<i class="bi bi-hourglass-split me-2"></i>Generating... (2-3 minutes)');
    
    $('#profilePic').css('opacity', 0.5);

    fetch(serverUrl + 'Users/GenerateProfileImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId: currentUser.id, prompt: prompt })
    })
        .then(res => {
            if (res.status === 401) {
                alert('Your session has expired. Please log in again.');
                localStorage.removeItem('user');
                localStorage.removeItem('cachedFollowingUsers');
                window.location.reload();
                return Promise.reject();
            }
            return res.json();
        })
        .then(data => {
            if (data && data.imageUrl) {
                // עדכן את המידע המקומי
                currentUser.imageUrl = data.imageUrl;
                localStorage.setItem('user', JSON.stringify(currentUser));
                
                // נקה את ה-cache ורענן את התמונה
                clearImageCache();
                
                alert('Profile image generated successfully!');
            } else {
                alert('Image generation failed');
            }
        })
        .catch(() => alert('Image generation failed'))
        .finally(() => {
            // Restore button state
            $generateBtn.prop('disabled', false).html(originalText);
            $('#profilePic').css('opacity', 1);
        });
});