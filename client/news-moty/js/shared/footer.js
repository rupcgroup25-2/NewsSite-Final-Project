// ================================================
// =================== FOOTER =====================
// ================================================

document.addEventListener("DOMContentLoaded", function () {
    // Create HTML for footer
    const footerHTML = `
    <footer class="bg-body-tertiary border-top py-4 mt-5">
        <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div class="text-muted small mb-2 mb-md-0">
                &copy; <span id="footer-year"></span> MYNews. All rights reserved.
            </div>
            <button class="btn btn-outline-secondary btn-sm" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="Back to top">
                <i class="bi bi-arrow-up"></i> Back to top
            </button>
        </div>
    </footer>
    `;

    // Add footer to end of body
    document.body.insertAdjacentHTML("beforeend", footerHTML);

        // Set footer year
            document.getElementById('footer-year').textContent = new Date().getFullYear();
});
