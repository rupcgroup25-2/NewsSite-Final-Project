// main.js — shared by all pages

$(document).ready(function () {
    renderUserActions();

    // Optionally auto-render the main tab of this page (if not already done by index.js, saved.js, etc.)
    if (typeof renderHomeTab === "function") renderHomeTab();
    if (typeof renderSavedTab === "function") renderSavedTab();
    if (typeof renderSharedTab === "function") renderSharedTab();
    if (typeof renderInterestsTab === "function") renderInterestsTab();
    if (typeof renderAdminTab === "function") renderAdminTab();
});
