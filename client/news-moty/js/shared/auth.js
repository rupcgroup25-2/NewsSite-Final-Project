//create register and login modals
function createModals() {
    const modalsHtml = `
    <!-- Login Modal -->
    <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title" id="loginModalLabel">Login to News Hub</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-0">
                    <form id="loginForm">
                        <div class="mb-3">
                            <label for="loginEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="loginEmail" required>
                        </div>
                        <div class="mb-3">
                            <label for="loginPassword" class="form-label">Password</label>
                            <input type="password" class="form-control" id="loginPassword" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Login</button>
                    </form>
                    <div id="loginMessage" class="alert mt-3 d-none"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Register Modal -->
    <div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title" id="registerModalLabel">Create Account</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-0">
                    <form id="registerForm">
                        <div class="mb-3">
                            <label for="registerName" class="form-label">Full Name</label>
                            <input type="text" class="form-control" id="registerName" required>
                        </div>
                        <div class="mb-3">
                            <label for="registerEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="registerEmail" required>
                        </div>
                        <div class="mb-3">
                            <label for="registerPassword" class="form-label">Password</label>
                            <input type="password" class="form-control" id="registerPassword" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Register</button>
                    </form>
                    <div id="registerError" class="alert alert-danger mt-3 d-none"></div>
                </div>
            </div>
        </div>
    </div>
    `;

    $('body').append(modalsHtml);
}

$(document).ready(function () {
    createModals();
    renderUserActions();
});

// Render user-related actions (Login/Register buttons or greeting and Logout button)

function renderUserActions() {
    const $actions = $("#user-actions");
    $actions.empty();
    if (currentUser) {
        $actions.append(`<span class="me-3">${getGreeting()}, <strong>${currentUser.name}</strong>!</span><button class="btn btn-outline-secondary btn-sm" id="logout-btn">Logout</button>`);
    } else {
        $actions.append(`<button class="btn btn-outline-primary btn-sm me-2" data-bs-toggle="modal" data-bs-target="#loginModal">Login</button>
                         <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#registerModal">Register</button>`);

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
            console.log("Login successful!", response);
            currentUser = response;
            localStorage.setItem('user', JSON.stringify(currentUser));
            renderUserActions();
            showMessage('#loginMessage', 'Login successful!', 'success');
            setTimeout(() => {
                $('#loginModal').modal('hide');
                hideMessage('#loginMessage');
                location.reload();
            }, 1000);
        },
        function error(xhr, status, error) {
            console.error("Login failed:", xhr.responseText || error);
            showMessage('#loginMessage', 'Login failed. Please try again.', 'danger');
        }
    );
});

// Handle Register form submission - AJAX

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
            console.log("Registration successful!", response);
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
    if (name.length < 2 || !/^[A-Za-z]+$/.test(name)) {
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
    if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
        passInput[0].setCustomValidity("Password must be at least 8 characters long, with at least one number and one uppercase letter.");
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
    renderUserActions();
    location.reload();
    //renderTabs();
});

