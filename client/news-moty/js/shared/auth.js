
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

$('#loginForm').submit(function (e) {
    e.preventDefault(); // Prevent default form submission

    // Collect form data
    const username = $('#loginEmail').val();
    const password = $('#loginPassword').val();

    const requestData = {
        Id: 0,
        Name: "string",
        Email: username,
        Password: password,
        Active: "true",
        BlockSharing: "true"
    };

    // Call the AJAX wrapper
    ajaxCall(
        "POST",
        "https://localhost:7065/api/Users/Login", // Replace with your actual API
        JSON.stringify(requestData),
        function success(response) {
            console.log("Login successful!", response);
            // Redirect or update UI here
        },
        function error(error) {
            console.error("Login failed:", error);
            alert("Login failed. Please try again.");
        }
    );
});