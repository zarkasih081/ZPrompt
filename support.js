const supportForm = document.getElementById('supportForm');
const supportStatus = document.getElementById('supportStatus');

function getFormValue(form, name) {
  return (new FormData(form).get(name) || '').toString().trim();
}

supportForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = getFormValue(supportForm, 'Nama') || 'Tidak diisi';
  const email = getFormValue(supportForm, 'Email') || 'Tidak diisi';
  const category = getFormValue(supportForm, 'Kategori');
  const suggestion = getFormValue(supportForm, 'Saran');

  if (!suggestion) {
    supportStatus.textContent = 'Isi saran perlu diisi terlebih dahulu.';
    return;
  }

  const subject = encodeURIComponent(`Saran ZPrompt - ${category}`);
  const body = encodeURIComponent([
    `Nama: ${name}`,
    `Email: ${email}`,
    `Kategori: ${category}`,
    '',
    'Isi saran:',
    suggestion
  ].join('\n'));

  window.location.href = `mailto:zarkasih081@gmail.com?subject=${subject}&body=${body}`;
  supportStatus.textContent = 'Jika aplikasi email tidak terbuka, gunakan tombol Salin Email lalu kirim saran secara manual.';
});
