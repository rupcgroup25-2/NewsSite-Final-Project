function renderInterestsTab() {
    const $tab = $('#interests');
    if (!currentUser) {
        $tab.html('<div class="alert alert-info text-center">Please login to manage your interests.</div>');
        return;
    }

    let html = '<div class="mb-3">Your interests:</div><div class="mb-3">';

    currentUser.tags.forEach(tag => {
        html += `
            <button type="button" class="btn btn-outline-primary btn-sm me-1 mb-1 interest-tag" data-id="${tag.id}">
                ${tag.name} <span aria-hidden="true">&times;</span>
            </button>`;
    });

    html += `</div>
            <div class="mb-3">
                <label for="new-interest" class="form-label">Add new interest</label>
                <input type="text" id="new-interest" class="form-control" placeholder="Type a new interest and press Add">
                <button class="btn btn-primary mt-2" id="add-interest-btn">Add</button>
            </div>`;

    html += `<div class="mb-3">
            <label for="emailSearch" class="form-label">Follow users</label>
            <input type="text" id="emailSearch" class="form-control" placeholder="Search by email..." autocomplete="off" />
            <ul id="suggestions" class="list-group position-absolute w-100"></ul>
            <button class="btn btn-primary mt-2" id="follow-user-btn">Follow</button>
            <button class="btn btn-danger mt-2" id="unfollow-user-btn">Unfollow</button>
            </div>`;

    $tab.html(html);
}

// Event handlers
$(document).ready(function () {
    renderUserActions();
    renderInterestsTab();
    loadEmails();
});

//Adding new interest
$(document).on('click', '#add-interest-btn', function () {
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
            renderInterestsTab();
        },
        function error(xhr) {
            alert("Failed to add interest: " + (xhr.responseText || xhr.statusText));
        }
    );
});

//Removing interest
$(document).on('click', '.interest-tag', function () {
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
            renderInterestsTab();
        },
        function error(xhr) {
            alert("Failed to remove interest: " + (xhr.responseText || xhr.statusText));
        }
    );
});

//Searching user's for following
let allEmails = [];

function loadEmails() {
    ajaxCall(
        "GET",
        serverUrl + "Users/AllEmails",
        null, // No body for GET
        function success(data) {
            allEmails = data;
        },
        function error(xhr) {
            console.log("Failed to fetch emails: " + (xhr.responseText || xhr.statusText));
            $("#emailSearch").hide();
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

    const url = `${serverUrl}Users/Follow?followerId=${currentUser.id}&followedEmail=${email}`;

    ajaxCall(
        "POST",
        url,
        null,
        function success() {
            alert("Follow request sent.");
        },
        function error(xhr) {
            alert((xhr.responseText || xhr.statusText));
        }
    );
});

$(document).on('click', '#unfollow-user-btn', function () {
    const email = $('#emailSearch').val().trim();
    if (!email) {
        alert("Please enter an email to unfollow.");
        return;
    }

    const url = `${serverUrl}Users/Unfollow?followerId=${currentUser.id}&followedEmail=${email}`;

    ajaxCall(
        "DELETE",
        url,
        null,
        function success() {
            alert("Unfollow request sent.");
        },
        function error(xhr) {
            alert((xhr.responseText || xhr.statusText));
        }
    );
});
