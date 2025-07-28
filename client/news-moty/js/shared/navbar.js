    document.addEventListener("DOMContentLoaded", function () {
    // יוצרים HTML עבור הניווט
    const navbarHTML = `
    <nav class="navbar navbar-expand-lg sticky-top bg-body shadow-sm py-2" id="main-navbar" style="z-index: 9999;">
        <div class="container-fluid px-3">
            <a class="navbar-brand fw-bold d-flex align-items-center" href="index.html">
                <img src="public/newsSite.png" alt="News Hub Logo" class="me-2" style="width: 40px; height: 40px;">
                <span class="fs-4">News Hub</span>
            </a>
            <div class="d-flex align-items-center gap-2 order-lg-2 ms-auto p-2">
                <button class="btn btn-outline-secondary btn-sm" id="toggle-dark" type="button" aria-label="Toggle dark mode">
                    <i class="bi bi-moon-stars-fill"></i>
                </button>
            </div>
            <button class="navbar-toggler ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse order-lg-1" id="navbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0 nav-pills gap-1">
                    <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="saved.html">Saved</a></li>
                    <li class="nav-item"><a class="nav-link" href="shared.html">Shared</a></li>
                    <li class="nav-item"><a class="nav-link" href="profile.html">Profile</a></li>
                    <li class="nav-item"><a class="nav-link" href="admin.html">Admin</a></li>
                </ul>
                <div id="user-actions" class="d-flex align-items-center ms-lg-3"></div>
            </div>
        </div>
    </nav>
    `;

    // מוסיפים את ה־Navbar ל־body (אפשר גם ל־div ייעודי)
    document.body.insertAdjacentHTML("afterbegin", navbarHTML);

    // סימון הלינק הפעיל לפי הדף הנוכחי
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll("#main-navbar .nav-link").forEach(link => {
        if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
        }
    });
});

