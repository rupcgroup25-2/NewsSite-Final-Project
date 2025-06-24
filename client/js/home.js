import { loadComponent } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponent('../components/navbar.html', '#navbar');
  await loadComponent('../components/footer.html', '#footer');
  await loadComponent('../components/report-modal.html', '#modals');

  document.getElementById('main-content').innerHTML = `
    <div class="card shadow p-4 mb-4" style="border-radius: 1.25rem; background: #fff;">
      <div class="mb-4">
        <div class="card mb-4 shadow-sm" style="border-radius: 1rem;">
          <div class="row g-0 align-items-center">
            <div class="col-md-5">
              <img src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' class='img-fluid rounded-start w-100 h-100' style='object-fit:cover; min-height:220px; border-top-left-radius: 1rem; border-bottom-left-radius: 1rem;' alt='Featured'>
            </div>
            <div class="col-md-7">
              <div class="card-body">
                <h2 class="card-title fw-bold">כתבה מרכזית: אירוע עולמי חשוב</h2>
                <p class="card-text">תקציר של הסיפור החשוב ביותר היום. זו כתבת דמו. הישארו מעודכנים.</p>
                <div class="d-flex gap-2">
                  <button class="btn btn-primary rounded-pill">צפה</button>
                  <button class="btn btn-outline-success rounded-pill">שמור</button>
                  <button class="btn btn-outline-info rounded-pill">שתף</button>
                  <button class="btn btn-outline-danger rounded-pill" data-bs-toggle="modal" data-bs-target="#reportModal">דווח</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h4 class="fw-bold mb-3">טכנולוגיה</h4>
      <div class="row row-cols-1 row-cols-md-3 g-4 mb-5">
        <div class="col">
          <div class="card h-100 shadow-sm" style="border-radius: 1rem;">
            <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" class="card-img-top" alt="Tech 1" style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
            <div class="card-body">
              <h5 class="card-title">פריצת דרך ב-AI</h5>
              <p class="card-text">חוקרים מודיעים על התקדמות משמעותית בבינה מלאכותית. דמו.</p>
              <div class="d-flex gap-2">
                <button class="btn btn-primary rounded-pill">צפה</button>
                <button class="btn btn-outline-success rounded-pill">שמור</button>
                <button class="btn btn-outline-info rounded-pill">שתף</button>
                <button class="btn btn-outline-danger rounded-pill" data-bs-toggle="modal" data-bs-target="#reportModal">דווח</button>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card h-100 shadow-sm" style="border-radius: 1rem;">
            <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80" class="card-img-top" alt="Tech 2" style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
            <div class="card-body">
              <h5 class="card-title">השקת סמארטפון חדש</h5>
              <p class="card-text">חברת ענק משיקה את מכשיר הדגל החדש שלה. דמו.</p>
              <div class="d-flex gap-2">
                <button class="btn btn-primary rounded-pill">צפה</button>
                <button class="btn btn-outline-success rounded-pill">שמור</button>
                <button class="btn btn-outline-info rounded-pill">שתף</button>
                <button class="btn btn-outline-danger rounded-pill" data-bs-toggle="modal" data-bs-target="#reportModal">דווח</button>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card h-100 shadow-sm" style="border-radius: 1rem;">
            <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80" class="card-img-top" alt="Tech 3" style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
            <div class="card-body">
              <h5 class="card-title">עדכון סייבר</h5>
              <p class="card-text">מומחים מזהירים מפגיעויות חדשות בתוכנה פופולרית. דמו.</p>
              <div class="d-flex gap-2">
                <button class="btn btn-primary rounded-pill">צפה</button>
                <button class="btn btn-outline-success rounded-pill">שמור</button>
                <button class="btn btn-outline-info rounded-pill">שתף</button>
                <button class="btn btn-outline-danger rounded-pill" data-bs-toggle="modal" data-bs-target="#reportModal">דווח</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h4 class="fw-bold mb-3">ספורט</h4>
      <div class="row row-cols-1 row-cols-md-3 g-4">
        <div class="col">
          <div class="card h-100 shadow-sm" style="border-radius: 1rem;">
            <img src="https://images.unsplash.com/photo-1505843279827-4b2b0c44a0a0?auto=format&fit=crop&w=400&q=80" class="card-img-top" alt="Sports 1" style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
            <div class="card-body">
              <h5 class="card-title">ניצחון אליפות</h5>
              <p class="card-text">האנדרדוגים זוכים בגביע בגמר מרתק. דמו.</p>
              <div class="d-flex gap-2">
                <button class="btn btn-primary rounded-pill">צפה</button>
                <button class="btn btn-outline-success rounded-pill">שמור</button>
                <button class="btn btn-outline-info rounded-pill">שתף</button>
                <button class="btn btn-outline-danger rounded-pill" data-bs-toggle="modal" data-bs-target="#reportModal">דווח</button>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card h-100 shadow-sm" style="border-radius: 1rem;">
            <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80" class="card-img-top" alt="Sports 2" style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
            <div class="card-body">
              <h5 class="card-title">שיא עולם נשבר</h5>
              <p class="card-text">נקבע שיא עולם חדש בריצת 100 מטר. דמו.</p>
              <div class="d-flex gap-2">
                <button class="btn btn-primary rounded-pill">צפה</button>
                <button class="btn btn-outline-success rounded-pill">שמור</button>
                <button class="btn btn-outline-info rounded-pill">שתף</button>
                <button class="btn btn-outline-danger rounded-pill" data-bs-toggle="modal" data-bs-target="#reportModal">דווח</button>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card h-100 shadow-sm" style="border-radius: 1rem;">
            <img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80" class="card-img-top" alt="Sports 3" style="border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
            <div class="card-body">
              <h5 class="card-title">חדשות העברות</h5>
              <p class="card-text">שחקן כוכב עובר לקבוצה חדשה בעסקת שיא. דמו.</p>
              <div class="d-flex gap-2">
                <button class="btn btn-primary rounded-pill">צפה</button>
                <button class="btn btn-outline-success rounded-pill">שמור</button>
                <button class="btn btn-outline-info rounded-pill">שתף</button>
                <button class="btn btn-outline-danger rounded-pill" data-bs-toggle="modal" data-bs-target="#reportModal">דווח</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
});
