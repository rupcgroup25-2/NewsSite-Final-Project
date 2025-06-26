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

$('#loginForm').submit(function (e) {
    e.preventDefault();

    const username = $('#loginEmail').val();
    const password = $('#loginPassword').val();

    const requestData = {
        id: 0,
        name: "string",
        email: username,
        password: password,
        active: true,
        blockSharing: true
    };

    ajaxCall(
        "POST",
        serverUrl + "Users/Login",
        JSON.stringify(requestData),
        function success(response) {
            console.log("Login successful!", response);
            currentUser = response;
            localStorage.setItem('user', JSON.stringify(currentUser));
            renderUserActions();
            showMessage('#loginMessage', 'Login successful!', 'success');
            setTimeout(() => {
                $('#loginModal').modal('hide');
                hideMessage('#loginMessage');
            }, 1000);
        },
        function error(xhr, status, error) {
            console.error("Login failed:", xhr.responseText || error);
            showMessage('#loginMessage', 'Login failed. Please try again.', 'danger');
        }
    );
});

$('#registerForm').submit(function (e) {
    e.preventDefault();

    const name = $('#registerName').val();
    const email = $('#registerEmail').val();
    const password = $('#registerPassword').val();

    const requestData = {
        id: 0,
        name: name,
        email: email,
        password: password,
        active: true,
        blockSharing: false
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

