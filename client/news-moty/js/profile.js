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
        <div class="row">
            <!-- Profile Header -->
            <div class="col-12">
                <div class="card mb-4 shadow-sm">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <!-- Simple user icon instead of image -->
                                <div class="position-relative">
                                <img id="profilePic" src="${`https://res.cloudinary.com/dvupmddqz/image/upload/profile_pics/profile_pics/${currentUser.id}.jpg` || '/img/default-profile.png'}" 
                                     alt="Profile Image" class="rounded-circle border" 
                                     style="width: 120px; height: 120px; object-fit: cover;">
                                <input type="file" id="profileImageInput" accept="image/*" style="display:none;">
                                <button class="btn btn-sm btn-outline-secondary position-absolute bottom-0 end-0" 
                                        id="uploadProfileImageBtn" title="Change profile image">
                                    <i class="bi bi-camera"></i>
                                </button>
                            </div>
                                                    <div class="input-group mt-2">
                            <input type="text" id="profileImagePrompt" class="form-control" placeholder="Describe your profile image...">
                            <button class="btn btn-outline-success" id="generateProfileImageBtn" type="button">
                                <i class="bi bi-magic"></i> Generate Image
                            </button>
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
                                <div class="d-flex gap-2">
                                    <button class="btn btn-outline-primary" id="editProfileBtn">
                                        <i class="bi bi-pencil me-1"></i>Edit Profile
                                    </button>
                                    <button class="btn btn-outline-warning" id="changePasswordBtn">
                                        <i class="bi bi-key me-1"></i>Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Following Users -->
            <div class="col-12">

            <!-- Recent Activities -->
            <div class="col-12">
                <div class="card shadow-sm mb-4">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-clock-history me-2"></i>Recent Activities
                        </h5>
                        <select id="activityCountSelect" class="form-select form-select-sm w-auto">
                            <option value="5">5</option>
                            <option value="10" selected>10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                    <div class="card-body" id="recent-activities-container">
                        <!-- תוכן הפעולות נטען דינמית -->
                    </div>
                </div>
            </div>

                <!-- Interests Section -->
                <div class="card shadow-sm mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="bi bi-heart me-2"></i>Your Interests
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">Your interests:</div>
                        <div class="mb-3" id="interests-container">
                            ${renderInterestsButtons()}
                        </div>
                        <div class="mb-3">
                            <label for="new-interest" class="form-label">Add new interest</label>
                            <input type="text" id="new-interest" class="form-control" placeholder="Type a new interest and press Add">
                            <button class="btn btn-primary mt-2" id="add-interest-btn">Add</button>
                        </div>
                    </div>
                </div>
                
                <div class="card shadow-sm">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="bi bi-people me-2"></i>Following (${followingUsers.length})
                        </h5>
                    </div>
                    <div class="card-body">
                        <!-- Follow users section -->
                        <div class="mb-4 p-3 bg-light rounded">
                            <label for="emailSearch" class="form-label">Follow users</label>
                            <div class="position-relative">
                                <input type="text" id="emailSearch" class="form-control" placeholder="Search by email..." autocomplete="off" />
                                <ul id="suggestions" class="list-group position-absolute w-100" style="z-index: 1050; top: 100%;"></ul>
                            </div>
                            <button class="btn btn-primary mt-2" id="follow-user-btn">Follow</button>
                        </div>
                        ${renderFollowingUsers()}
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
    
    // הוסף הגדרות התראות לפרופיל
    addNotificationSettingsToProfile();


    bindProfileImageUploadEvents();

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
        return '<p class="text-muted">No recent activities.</p>';
    }

    return `
        <ul class="list-group list-group-flush">
            ${activities.map(activity => `
                <li class="list-group-item">
                    <i class="bi bi-dot me-2 text-primary"></i>
                    ${activity.ActivityType}
                    <br><small class="text-muted">${new Date(activity.ActivityDate).toLocaleString()}</small>
                </li>
            `).join('')}
        </ul>
    `;
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
                                <button class="btn btn-sm btn-outline-danger unfollow-btn" data-user-email="${user.email}">
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

function renderInterestsButtons() {
    if (!currentUser || !currentUser.tags || currentUser.tags.length === 0) {
        return '<div class="text-muted">No interests added yet.</div>';
    }

    return currentUser.tags.map(tag => `
        <button type="button" class="btn btn-outline-primary btn-sm me-1 mb-1 interest-tag" data-id="${tag.id}">
            ${tag.name} <span aria-hidden="true">&times;</span>
        </button>
    `).join('');
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
                $('#interests-container').html(renderInterestsButtons());
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
                $('#interests-container').html(renderInterestsButtons());
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
    
    // הוסף מאזינים לשינוי הגדרות
    $(document).on('change', 'input[name="notificationStyle"]', function() {
        const selectedStyle = $(this).val();
        localStorage.setItem('notificationStyle', selectedStyle);
        
        // הצג הודעה על השינוי
        $('.notification-status').removeClass('text-warning text-success text-muted text-danger')
            .addClass('text-success').text(`Notification style updated to: ${selectedStyle}`);
    });
}

// טעינת הגדרות התראות
function loadNotificationSettings() {
    if (!currentUser) return;
    
    // בדוק שהפונקציות הנדרשות קיימות
    if (typeof checkNotificationStatus !== 'function') {
        setTimeout(loadNotificationSettings, 1000); // נסה שוב אחרי שנייה
        return;
    }
    
    // הוסף loading state
    $('#notificationsSwitch').prop('disabled', true);
    $('#testNotificationBtn').prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Loading...');

    checkNotificationStatus(currentUser.id).then(isEnabled => {
        $('#notificationsSwitch').prop('checked', isEnabled).prop('disabled', false);
        $('#testNotificationBtn').prop('disabled', false).html('<i class="bi bi-bell"></i> Send Test Notification');
        
        // טען הגדרת סוג התראה מ-localStorage
        const savedStyle = localStorage.getItem('notificationStyle') || 'auto';
        $(`input[name="notificationStyle"][value="${savedStyle}"]`).prop('checked', true);
        
        // הצג סטטוס נוכחי
        const statusText = isEnabled ? 'enabled' : 'disabled';
        const statusClass = isEnabled ? 'text-success' : 'text-muted';
        $('.notification-status').remove();
        $('#notificationsSwitch').parent().append(`
            <small class="notification-status ${statusClass} d-block mt-1">
                Notifications are currently ${statusText} (${savedStyle} style)
            </small>
        `);
    }).catch(err => {
        $('#notificationsSwitch').prop('disabled', false);
        $('#testNotificationBtn').prop('disabled', false).html('<i class="bi bi-bell"></i> Send Test Notification');
        
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
    
    // בדוק שהפונקציה קיימת
    if (typeof sendTestNotification === 'function') {
        sendTestNotification(currentUser.id);
    } else {
        alert('Test notification function is not available. Please make sure notifications are properly loaded.');
    }
    
    // החזר למצב הרגיל אחרי 3 שניות
    setTimeout(() => {
        $btn.prop('disabled', false).html(originalText);
    }, 3000);
});

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
                    $('#profilePic').attr('src', data.imageUrl);
                    currentUser.imageUrl = data.imageUrl;
                    localStorage.setItem('user', JSON.stringify(currentUser));
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
                $('#profilePic').attr('src', data.imageUrl);
                currentUser.imageUrl = data.imageUrl;
                localStorage.setItem('user', JSON.stringify(currentUser));
            } else {
                alert('Image generation failed');
            }
        })
        .catch(() => alert('Image generation failed'))
        .finally(() => $('#profilePic').css('opacity', 1));
});