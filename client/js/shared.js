import { loadComponent } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponent('../components/navbar.html', '#navbar');
  await loadComponent('../components/footer.html', '#footer');
  await loadComponent('../components/report-modal.html', '#modals');

  document.getElementById('main-content').innerHTML = `
    <div class="card shadow p-4 mb-4" style="border-radius: 1.25rem; background: #fff;">
      <h3 class="fw-bold mb-4">כתבות ששיתפו משתמשים שאתה עוקב אחריהם</h3>
      <div class="list-group mb-4">
        <div class="list-group-item py-4">
          <div class="d-flex w-100 justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" class="rounded-circle me-3" width="48" height="48" alt="User">
              <div>
                <strong>johndoe</strong> <span class="text-muted small">שיתף:</span>
              </div>
            </div>
            <button class="btn btn-sm btn-danger rounded-pill">בטל שיתוף</button>
          </div>
          <div class="card mb-2 shadow-sm" style="border-radius: 1rem;">
            <div class="row g-0">
              <div class="col-md-4">
                <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" class="img-fluid rounded-start" alt="Article">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">פריצת דרך ב-AI</h5>
                  <p class="card-text">חוקרים מודיעים על התקדמות משמעותית בבינה מלאכותית. דמו.</p>
                  <span class="badge bg-primary">טכנולוגיה</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mb-2"><strong>תגובה:</strong> "This is amazing! Can't wait to see what's next."</div>
        </div>
        <div class="list-group-item py-4">
          <div class="d-flex w-100 justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" class="rounded-circle me-3" width="48" height="48" alt="User">
              <div>
                <strong>janedoe</strong> <span class="text-muted small">שיתפה:</span>
              </div>
            </div>
          </div>
          <div class="card mb-2 shadow-sm" style="border-radius: 1rem;">
            <div class="row g-0">
              <div class="col-md-4">
                <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80" class="img-fluid rounded-start" alt="Article">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">שיא עולם נשבר</h5>
                  <p class="card-text">נקבע שיא עולם חדש בריצת 100 מטר. דמו.</p>
                  <span class="badge bg-success">ספורט</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mb-2"><strong>תגובה:</strong> "Incredible performance!"</div>
        </div>
      </div>
    </div>
  `;
});
