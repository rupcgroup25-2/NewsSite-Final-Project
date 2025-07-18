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

    $tab.html(html);
}

// Event handlers
$(document).ready(function () {
    renderUserActions();
    renderInterestsTab();
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
