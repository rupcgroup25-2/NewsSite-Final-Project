import { loadComponent } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponent('../components/navbar.html', '#navbar');
  await loadComponent('../components/footer.html', '#footer');
  await loadComponent('../components/report-modal.html', '#modals');

  document.getElementById('main-content').innerHTML = `
    <div class="card shadow p-4 mb-4" style="border-radius: 1.25rem; background: #fff;">
      <div class="row g-4">
        <div class="col-md-6 border-end">
          <h4 class="fw-bold mb-3">בחר תחומי עניין</h4>
          <form class="mb-3">
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" value="Technology" id="tagTech" checked>
              <label class="form-check-label" for="tagTech">טכנולוגיה</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" value="Sports" id="tagSports">
              <label class="form-check-label" for="tagSports">ספורט</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" value="Politics" id="tagPolitics">
              <label class="form-check-label" for="tagPolitics">פוליטיקה</label>
            </div>
          </form>
          <div class="input-group mb-3">
            <input type="text" class="form-control rounded-pill" placeholder="הוסף תגית מותאמת" id="customTagInput">
            <button class="btn btn-outline-primary rounded-pill" type="button" id="addTagBtn">הוסף</button>
          </div>
          <div id="customTags" class="mb-3"></div>
        </div>
        <div class="col-md-6">
          <h4 class="fw-bold mb-3">עקוב אחרי משתמשים</h4>
          <div class="input-group mb-3">
            <input type="text" class="form-control rounded-pill" placeholder="חפש משתמש" id="userSearchInput">
            <button class="btn btn-outline-secondary rounded-pill" type="button" id="searchUserBtn">חפש</button>
          </div>
          <ul class="list-group mb-3" id="userSearchResults">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              johndoe <button class="btn btn-sm btn-success rounded-pill">עקוב</button>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              janedoe <button class="btn btn-sm btn-success rounded-pill">עקוב</button>
            </li>
          </ul>
          <h5 class="fw-bold">משתמשים שאתה עוקב אחריהם</h5>
          <ul class="list-group" id="followedUsers">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              johndoe <button class="btn btn-sm btn-danger rounded-pill">הפסק לעקוב</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;

  // Demo: Add custom tag
  document.getElementById('addTagBtn').onclick = () => {
    const input = document.getElementById('customTagInput');
    const tag = input.value.trim();
    if (tag) {
      const tagDiv = document.createElement('span');
      tagDiv.className = 'badge bg-primary me-2';
      tagDiv.textContent = tag;
      document.getElementById('customTags').appendChild(tagDiv);
      input.value = '';
    }
  };
});
