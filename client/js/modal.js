// Report Modal logic

document.addEventListener('DOMContentLoaded', () => {
  const modals = document.getElementById('modals');
  if (!modals) return;

  document.body.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'reportForm') {
      e.preventDefault();
      const textarea = document.getElementById('reportComment');
      if (!textarea.value.trim()) {
        textarea.classList.add('is-invalid');
        return;
      } else {
        textarea.classList.remove('is-invalid');
      }
      // TODO: Submit report via API
      // Close modal after submit
      const modal = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
      if (modal) modal.hide();
      textarea.value = '';
      alert('Report submitted!');
    }
  });

  document.body.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'reportComment') {
      e.target.classList.remove('is-invalid');
    }
  });
});
