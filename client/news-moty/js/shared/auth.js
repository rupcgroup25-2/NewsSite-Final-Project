//create register and login modals
function createAuthModals() {
    // בדוק אם המודלים כבר קיימים
    if ($('#loginModal').length > 0 || $('#registerModal').length > 0) {
        return; // המודלים כבר קיימים, אל תיצור שוב
    }
    

    const modalsHtml = `
    <!-- Login Modal -->
    <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg modern-auth-modal">
                <div class="modal-header border-0 pb-2 modern-auth-header">
                    <div class="d-flex align-items-center gap-3">
                        <div class="auth-icon-container">
                            <i class="bi bi-person-check-fill"></i>
                        </div>
                        <h5 class="modal-title fw-bold mb-0" id="loginModalLabel">Welcome Back</h5>
                    </div>
                    <button type="button" class="btn-close modern-close-btn" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body px-4 pb-4">
                    <p class="text-muted small mb-4">Sign in to access your personalized news experience</p>
                    <form id="loginForm">
                        <div class="mb-3">
                            <label for="loginEmail" class="form-label modern-label">
                                <i class="bi bi-envelope me-2"></i>Email Address
                            </label>
                            <input type="email" class="form-control modern-input" id="loginEmail" 
                                   placeholder="Enter your email" required>
                        </div>
                        <div class="mb-4">
                            <label for="loginPassword" class="form-label modern-label">
                                <i class="bi bi-lock me-2"></i>Password
                            </label>
                            <input type="password" class="form-control modern-input" id="loginPassword" 
                                   placeholder="Enter your password" required>
                        </div>
                        <button type="submit" class="btn modern-btn-primary w-100 py-3 mb-3">
                            <i class="bi bi-box-arrow-in-right me-2"></i>Sign In
                        </button>
                        <div class="text-center">
                            <small class="text-muted">Don't have an account? 
                                <a href="#" class="modern-link" data-bs-toggle="modal" data-bs-target="#registerModal" data-bs-dismiss="modal">
                                    Create Account
                                </a>
                            </small>
                        </div>
                    </form>
                    <div id="loginMessage" class="alert mt-3 d-none modern-alert"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Register Modal -->
    <div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg modern-auth-modal">
                <div class="modal-header border-0 pb-2 modern-auth-header">
                    <div class="d-flex align-items-center gap-3">
                        <div class="auth-icon-container">
                            <i class="bi bi-person-plus-fill"></i>
                        </div>
                        <h5 class="modal-title fw-bold mb-0" id="registerModalLabel">Join News Hub</h5>
                    </div>
                    <button type="button" class="btn-close modern-close-btn" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body px-4 pb-4">
                    <p class="text-muted small mb-4">Create your account to save articles and join discussions</p>
                    <form id="registerForm">
                        <div class="mb-3">
                            <label for="registerName" class="form-label modern-label">
                                <i class="bi bi-person me-2"></i>Full Name
                            </label>
                            <input type="text" class="form-control modern-input" id="registerName" 
                                   placeholder="Enter your full name" required>
                        </div>
                        <div class="mb-3">
                            <label for="registerEmail" class="form-label modern-label">
                                <i class="bi bi-envelope me-2"></i>Email Address
                            </label>
                            <input type="email" class="form-control modern-input" id="registerEmail" 
                                   placeholder="Enter your email" required>
                        </div>
                        <div class="mb-4">
                            <label for="registerPassword" class="form-label modern-label">
                                <i class="bi bi-lock me-2"></i>Password
                            </label>
                            <input type="password" class="form-control modern-input" id="registerPassword" 
                                   placeholder="Create a password" required>
                        </div>
                        <button type="submit" class="btn modern-btn-primary w-100 py-3 mb-3">
                            <i class="bi bi-person-plus me-2"></i>Create Account
                        </button>
                        <div class="text-center">
                            <small class="text-muted">Already have an account? 
                                <a href="#" class="modern-link" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal">
                                    Sign In
                                </a>
                            </small>
                        </div>
                    </form>
                    <div id="registerError" class="alert alert-danger mt-3 d-none modern-alert"></div>
                </div>
            </div>
        </div>
    </div>
    `;

    $('body').append(modalsHtml);
}

$(document).ready(function () {
    createAuthModals();
    renderUserActions();
});

// Render user-related actions (Login/Register buttons or greeting and Logout button)

function renderUserActions() {
    const $actions = $("#user-actions");
    $actions.empty();
    if (currentUser) {
        $actions.append(`<span class="me-3 navbar-user-greeting">${getGreeting()}, <strong>${currentUser.name}</strong>!</span><button class="btn modern-btn-logout" id="logout-btn">
                            <i class="bi bi-box-arrow-right me-1"></i>Logout
                         </button>`);
    } else {
        $actions.append(`<button class="btn modern-btn-outline me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
                            <i class="bi bi-box-arrow-in-right me-1"></i>Login
                         </button>
                         <button class="btn modern-btn-primary" data-bs-toggle="modal" data-bs-target="#registerModal">
                            <i class="bi bi-person-plus me-1"></i>Register
                         </button>`);

    }
}

function showMessage(selector, message, type) {
    // type: "success" or "danger"
    $(selector)
        .removeClass('d-none alert-success alert-danger')
        .addClass(`alert alert-${type}`)
        .text(message);
}

function hideMessage(selector) {
    $(selector).addClass('d-none').text('').removeClass('alert alert-success alert-danger');
}

// Handle Login form submission - AJAX
$(document).on('submit', '#loginForm', function (e) {
    e.preventDefault();

    const username = $('#loginEmail').val();
    const password = $('#loginPassword').val();

    const requestData = {
        id: 0,
        name: "string",
        email: username,
        password: password,
        active: true,
        blockSharing: false,
        tags: []
    };

    ajaxCall(
        "POST",
        serverUrl + "Users/Login",
        JSON.stringify(requestData),
        function success(response) {
            // Only log in if response is a valid user
            if (!response || !response.id || response.id === 0) {
                showMessage('#loginMessage', 'Login failed. Please check your credentials.', 'danger');
                return;
            }
            currentUser = response;
            localStorage.setItem('user', JSON.stringify(currentUser));

            // בדוק אם יש משתמש קודם ועבור להתראות החדשות
            if (typeof switchUserNotifications === 'function') {
                switchUserNotifications(currentUser.id);
            } else if (typeof subscribeUserToNotifications === 'function') {
                subscribeUserToNotifications(currentUser.id);
            }

            hideMessage('#loginError');
            $('#loginModal').modal('hide');

            showMessage('#loginSuccess', 'Login successful! Welcome back.', 'success');
            setTimeout(() => {
                hideMessage('#loginSuccess');
                renderUserActions();
                location.reload();
            }, 1500);

        },
        function error(xhr, status, error) {
            try {
                const response = JSON.parse(xhr.responseText);
                message = response.message || message;
                console.error("Server error:", response);
            } catch (e) {
                console.warn("Response is not valid JSON:", xhr.responseText);
                message = xhr.responseText || message;
            }

            showMessage('#loginMessage', message, 'danger');
        }
    );
});

// Handle Register form submission - AJAX
$(document).on("input", "#registerName, #registerEmail, #registerPassword", function () {
    this.setCustomValidity(""); // clears any custom error
});


$(document).on('submit', '#registerForm', function (e) {
    e.preventDefault();
    if (!checkValidation()) return;

    const name = $('#registerName').val();
    const email = $('#registerEmail').val();
    const password = $('#registerPassword').val();

    const requestData = {
        id: 0,
        name: name,
        email: email,
        password: password,
        active: true,
        blockSharing: false,
        tags:[]
    };

    ajaxCall(
        "POST",
        serverUrl + "Users/Register",
        JSON.stringify(requestData),
        function success(response) {
            renderUserActions();
            showMessage('#registerError', 'Registration successful!', 'success');
            setTimeout(() => {
                $('#registerModal').modal('hide');
                $('#registerForm')[0].reset();
                hideMessage('#registerError');
            }, 1000);
        },
        function error(xhr, status, error) {
            console.error("Registration failed:", xhr.responseText || error);
            showMessage('#registerError', 'Registration failed. Please try again.', 'danger');
        }
    );
});

function checkValidation() {
    const nameInput = $("#registerName");
    const emailInput = $("#registerEmail");
    const passInput = $("#registerPassword");

    const name = nameInput.val().trim();
    const email = emailInput.val().trim();
    const password = passInput.val();

    let valid = true;

    // Validate name
    if (name.length < 2 || !/^[A-Za-z\s]+$/.test(name)) {
        nameInput[0].setCustomValidity("Name must be at least 2 characters and contain only English letters.");
        nameInput[0].reportValidity();
        valid = false;
    } else {
        nameInput[0].setCustomValidity(""); // clear
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailInput[0].setCustomValidity("Please enter a valid email address.");
        emailInput[0].reportValidity();
        valid = false;
    } else {
        emailInput[0].setCustomValidity("");
    }

    // Validate password
    if (password.length < 8 ||
        !/\d/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[^\w\d\s]/.test(password)) {
        passInput[0].setCustomValidity("Password must be 8+ chars with uppercase, lowercase, number, and symbol.");
        passInput[0].reportValidity();
        valid = false;
    } else {
        passInput[0].setCustomValidity("");
    }

    return valid;
}

// Logout
$(document).on('click', '#logout-btn', function () {
    currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('cachedFollowingUsers');
    
    // בטל הרשמה להתראות
    if (typeof unsubscribeUserFromNotifications === 'function') {
        unsubscribeUserFromNotifications();
    }
    
    renderUserActions();
    location.reload();
    //renderTabs();
});

