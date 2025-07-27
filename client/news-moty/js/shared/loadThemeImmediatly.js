(function () {
    const savedTheme = localStorage.getItem('newsHubTheme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    if (document.body) {
        document.body.setAttribute('data-bs-theme', savedTheme);
    }
})();