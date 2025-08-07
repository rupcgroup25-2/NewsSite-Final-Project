// ================================================
// ================== NAVBAR ===================
// ================================================

document.addEventListener("DOMContentLoaded", function () {
    // Create HTML for navigation
    const navbarHTML = `
<nav class="navbar navbar-expand-lg sticky-top navbar-modern shadow-lg py-2" id="main-navbar">
    <div class="container-fluid px-4">
        <a class="navbar-brand modern-brand d-flex align-items-center" href="index.html">
            <div class="brand-logo-container">
                <img src="public/newsSite.png" alt="News Hub Logo" class="brand-logo">
            </div>
            <span class="brand-text">MYNews</span>
        </a>
        
        <div class="d-flex align-items-center order-lg-2 ms-auto navbar-actions gap-2">
            <button class="btn modern-icon-btn position-relative" id="notifications-btn" type="button" 
                    aria-label="Notifications" title="Notifications">
                <i class="bi bi-bell"></i>
                <span class="notification-badge position-absolute rounded-pill bg-danger" 
                      id="notification-badge">
                    <span class="visually-hidden">unread messages</span>
                </span>
            </button>
            <button class="btn modern-icon-btn" id="toggle-dark" type="button" aria-label="Toggle dark mode">
                <i class="bi bi-moon-stars-fill"></i>
            </button>
        </div>
        
        <button class="navbar-toggler modern-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span></span>
            <span></span>
            <span></span>
        </button>
        
        <div class="collapse navbar-collapse order-lg-1" id="navbarNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0 modern-nav-pills">
                <li class="nav-item"><a class="nav-link modern-nav-link" href="index.html"><i class="bi bi-house-fill"></i><span>Home</span></a></li>
                <li class="nav-item"><a class="nav-link modern-nav-link" href="saved.html"><i class="bi bi-bookmark-fill"></i><span>Saved</span></a></li>
                <li class="nav-item"><a class="nav-link modern-nav-link" href="shared.html"><i class="bi bi-people-fill"></i><span>Community</span></a></li>
                <li class="nav-item"><a class="nav-link modern-nav-link" href="profile.html"><i class="bi bi-person-fill"></i><span>Profile</span></a></li>
                <li class="nav-item"><a class="nav-link modern-nav-link" href="about.html"><i class="bi bi-info-circle-fill"></i><span>About</span></a></li>

                ${currentUser && currentUser.email.toLowerCase() === 'admin'
                ? '<li class="nav-item"><a class="nav-link modern-nav-link admin-link" href="admin.html"><i class="bi bi-gear-fill"></i><span>Admin</span></a></li>'
                : ''
            }
            </ul>
            <div id="user-actions" class="d-flex align-items-center navbar-user-actions"></div>
        </div>
    </div>
</nav>
`;
    document.body.insertAdjacentHTML("afterbegin", navbarHTML);

    // Mark active link based on current page
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll("#main-navbar .nav-link").forEach(link => {
        if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
        }
    });
    
    // Wait for auth.js to load then render user actions
    setTimeout(() => {
        if (typeof renderUserActions === 'function') {
            renderUserActions();
        }
    }, 100);
});

