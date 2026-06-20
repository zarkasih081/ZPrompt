const PAGE_ICONS = {
  sun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
};

function updatePageThemeIcon() {
  const icon = document.querySelector('.theme-icon');
  if (!icon) return;
  icon.innerHTML = document.documentElement.dataset.theme === 'dark' ? PAGE_ICONS.moon : PAGE_ICONS.sun;
}

function updatePageThemeColor() {
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#0d1411' : '#10261f');
  }
}

function setTheme(theme) {
  if (theme) document.documentElement.dataset.theme = theme;
  updatePageThemeIcon();
  updatePageThemeColor();
}

let savedTheme = null;
try { savedTheme = localStorage.getItem('zprompt-theme'); } catch (error) {}
if (savedTheme) setTheme(savedTheme);
else updatePageThemeIcon();

document.getElementById('themeToggle')?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
  try { localStorage.setItem('zprompt-theme', nextTheme); } catch (error) {}
});

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const temp = document.createElement('textarea');
  temp.value = text;
  temp.setAttribute('readonly', '');
  temp.style.position = 'fixed';
  temp.style.opacity = '0';
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  temp.remove();
}

document.querySelectorAll('[data-copy-text]').forEach((button) => {
  button.addEventListener('click', async () => {
    const originalText = button.textContent;
    const successText = button.dataset.copySuccess || 'Tersalin';

    try {
      await copyTextToClipboard(button.dataset.copyText || '');
      button.textContent = successText;
    } catch (error) {
      button.textContent = 'Gagal menyalin';
    }

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  });
});

window.addEventListener('scroll', () => {
  const backToTop = document.getElementById('backToTop');
  if (!backToTop) return;
  backToTop.classList.toggle('show', window.scrollY > 300);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const manifestHref = document.querySelector('link[rel="manifest"]')?.href || window.location.href;
    const serviceWorkerUrl = new URL('sw.js', manifestHref).href;
    navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {});
  });
}
