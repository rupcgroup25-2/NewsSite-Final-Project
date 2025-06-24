import { loadComponent } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponent('../components/navbar.html', '#navbar');
  await loadComponent('../components/footer.html', '#footer');
  await loadComponent('../components/report-modal.html', '#modals');

  document.getElementById('main-content').innerHTML = `
    <div class="card shadow p-4 mb-4" style="border-radius: 1.25rem; background: #fff;">
      <h3 class="fw-bold mb-4">הכתבות ששמרת</h3>
      <div class="row row-cols-1 row-cols-md-2 g-4">
        <div class="col">
          <div class="card h-100 shadow-sm" style="border-radius: 1rem;">
            <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80" class="card-img-top" alt="Saved 1" style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
            <div class="card-body">
              <h5 class="card-title">השקת סמארטפון חדש</h5>
              <p class="card-text">חברת ענק משיקה את מכשיר הדגל החדש שלה. דמו.</p>
              <button class="btn btn-danger rounded-pill">הסר שמירה</button>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card h-100 shadow-sm" style="border-radius: 1rem;">
            <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80" class="card-img-top" alt="Saved 2" style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
            <div class="card-body">
              <h5 class="card-title">עדכון סייבר</h5>
              <p class="card-text">מומחים מזהירים מפגיעויות חדשות בתוכנה פופולרית. דמו.</p>
              <button class="btn btn-danger rounded-pill">הסר שמירה</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
});
