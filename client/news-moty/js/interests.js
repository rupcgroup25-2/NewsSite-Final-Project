function renderInterestsTab() {
    const $tab = $('#interests');
    if (!currentUser) {
        $tab.html('<div class="alert alert-info text-center">Please login to manage your interests.</div>');
        return;
    }
    let html = '<div class="mb-3">Select your interests:</div><div class="row">';
    availableTags.forEach(tag => {
        const checked = userTags.includes(tag.id) ? 'checked' : '';
        html += `<div class="col-6 col-md-4 mb-2">
      <div class="form-check">
        <input class="form-check-input interest-checkbox" type="checkbox" value="${tag.id}" id="interest-${tag.id}" ${checked}>
        <label class="form-check-label" for="interest-${tag.id}">${tag.name}</label>
      </div>
    </div>`;
    });
    html += `<div class="mb-3">
                <label for="new-interest" class="form-label">Add new interest</label>
                <input type="text" id="new-interest" class="form-control" placeholder="Type a new interest and press Add">
                <button class="btn btn-secondary mt-2" id="add-interest-btn">Add</button>
            </div>`;
    html += '</div><button class="btn btn-primary mt-3" id="save-interests-btn">Save Preferences</button>';
    $tab.html(html);
}

$(document).on('click', '#save-interests-btn', function () {
    userTags = $('.interest-checkbox:checked').map(function () {
        return $(this).val();
    }).get();
    renderInterestsTab();
});

// Save interests
$(document).on('click', '#save-interests-btn', function () {
    userTags = [];
    $('.interest-checkbox:checked').each(function () {
        userTags.push($(this).val());
    });
    renderInterestsTab();
});

// Event handlers
$(document).ready(function () {
    renderUserActions();
    renderInterestsTab();
});