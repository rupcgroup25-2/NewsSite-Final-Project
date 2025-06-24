import { loadComponent } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponent('../components/navbar.html', '#navbar');
  await loadComponent('../components/footer.html', '#footer');
  await loadComponent('../components/report-modal.html', '#modals');

  const main = document.getElementById('main-content');
  if (window.location.pathname.endsWith('admin-login.html')) {
    main.innerHTML = `
      <div class="container d-flex align-items-center justify-content-center" style="min-height: 100vh;">
        <div class="card shadow p-4" style="max-width: 400px; width: 100%; border-radius: 1.25rem;">
          <div class="text-center mb-4">
            <img src="../assets/logo.png" alt="Logo" style="width: 60px;">
            <h2 class="mt-2 mb-0 fw-bold">NewsSite Admin</h2>
            <small class="text-muted">Sign in to your account</small>
          </div>
          <form id="adminLoginForm">
            <div class="mb-3">
              <label for="adminEmail" class="form-label">Email</label>
              <input type="email" class="form-control rounded-pill" id="adminEmail" required>
            </div>
            <div class="mb-3">
              <label for="adminPassword" class="form-label">Password</label>
              <input type="password" class="form-control rounded-pill" id="adminPassword" required>
            </div>
            <button type="submit" class="btn btn-primary w-100 rounded-pill fw-bold">Login</button>
          </form>
        </div>
      </div>
    `;
  } else if (window.location.pathname.endsWith('admin-dashboard.html')) {
    main.innerHTML = `
      <div class="card shadow p-4 mb-4" style="border-radius: 1.25rem; background: #fff;">
        <h3 class="fw-bold mb-4">ניהול משתמשים</h3>
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>משתמש</th>
                <th>סטטוס</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>johndoe</td>
                <td><span class="badge bg-success">פעיל</span></td>
                <td>
                  <button class="btn btn-sm btn-warning rounded-pill">חסום</button>
                  <button class="btn btn-sm btn-secondary rounded-pill">השבת</button>
                  <button class="btn btn-sm btn-info rounded-pill">צפה בפעילות</button>
                </td>
              </tr>
              <tr>
                <td>janedoe</td>
                <td><span class="badge bg-danger">חסום</span></td>
                <td>
                  <button class="btn btn-sm btn-success rounded-pill">בטל חסימה</button>
                  <button class="btn btn-sm btn-secondary rounded-pill">השבת</button>
                  <button class="btn btn-sm btn-info rounded-pill">צפה בפעילות</button>
                </td>
              </tr>
              <tr>
                <td>alice</td>
                <td><span class="badge bg-secondary">מושבת</span></td>
                <td>
                  <button class="btn btn-sm btn-warning rounded-pill">חסום</button>
                  <button class="btn btn-sm btn-success rounded-pill">הפעל</button>
                  <button class="btn btn-sm btn-info rounded-pill">צפה בפעילות</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
});
