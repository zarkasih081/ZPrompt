const $ = (id) => document.getElementById(id);

let saveTimeout;
const saveStatus = $('saveStatus');
const historySidebar = $('historySidebar');
const historyOverlay = $('historyOverlay');
const historyList = $('historyList');
const historyEmpty = $('historyEmpty');
const platformTips = $('platformTips');
const toastContainer = $('toastContainer');

function showToast(message) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>&#10003;</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

const platformTipsData = {
  'Midjourney': '💡 <strong>Tips Midjourney:</strong> Prompt akan diubah menjadi format dipisah koma (comma-separated). Aspect ratio otomatis dihitung dari ukuran.',
  'Canva AI': '💡 <strong>Tips Canva AI:</strong> Canva lebih cocok untuk prompt konsep visual yang sederhana dan tidak terlalu teknis.',
  'ChatGPT Image': '💡 <strong>Tips ChatGPT / DALL-E:</strong> Berikan deskripsi natural dan detail (seperti bercerita) tentang elemen yang ingin digambar.',
  'Ideogram': '💡 <strong>Tips Ideogram:</strong> Sangat bagus untuk memunculkan tipografi. Pastikan teks utama diletakkan dalam tanda kutip.',
  'Leonardo AI': '💡 <strong>Tips Leonardo AI:</strong> Bagus untuk gaya 3D dan game asset. Tambahkan kata kunci kualitas tinggi.',
  'Bing Image Creator': '💡 <strong>Tips Bing (DALL-E 3):</strong> Mirip dengan ChatGPT, gunakan bahasa deskriptif.'
};

const presetsData = {
  'ig-feed': {
    designType: 'Feed Instagram', platform: 'Canva AI', width: '1080', height: '1080', unit: 'px',
    mood: 'Fresh dan cerah', styleDesign: 'Modern clean', textPlacement: 'Tengah utama', outputTone: 'Profesional', quality: 'High quality'
  },
  'yt-thumb': {
    designType: 'Thumbnail YouTube', platform: 'Midjourney', width: '1920', height: '1080', unit: 'px',
    mood: 'Modern dan premium', styleDesign: '3D soft style', outputTone: 'Profesional', quality: 'High quality'
  },
  'logo': {
    designType: 'Logo', platform: 'Ideogram', width: '1000', height: '1000', unit: 'px',
    mood: 'Minimalis dan bersih', styleDesign: 'Minimalis premium', outputTone: 'Profesional', quality: 'Clean vector'
  },
  'poster': {
    designType: 'Poster Promosi', platform: 'Canva AI', width: '1080', height: '1350', unit: 'px',
    mood: 'Elegan dan profesional', styleDesign: 'Modern clean', outputTone: 'Promosi', quality: 'High quality'
  },
  'story': {
    designType: 'Story Instagram', platform: 'Canva AI', width: '1080', height: '1920', unit: 'px',
    mood: 'Fresh dan cerah', styleDesign: 'Modern clean', outputTone: 'Promosi', quality: 'Mobile friendly'
  },
  'banner': {
    designType: 'Banner Website', platform: 'ChatGPT Image', width: '1920', height: '600', unit: 'px',
    mood: 'Modern dan premium', styleDesign: 'Modern clean', outputTone: 'Profesional', quality: 'High quality'
  },
  'ui': {
    designType: 'UI Website', platform: 'Midjourney', width: '1440', height: '900', unit: 'px',
    mood: 'Minimalis dan bersih', styleDesign: 'Modern clean', outputTone: 'Profesional', quality: 'High quality'
  },
  'slide': {
    designType: 'Presentasi Slide', platform: 'Canva AI', width: '1920', height: '1080', unit: 'px',
    mood: 'Elegan dan profesional', styleDesign: 'Edukatif formal', outputTone: 'Akademik', quality: 'High quality'
  }
};

const fields = {
  designType: $('designType'),
  platform: $('platform'),
  width: $('width'),
  height: $('height'),
  unit: $('unit'),
  primaryColor: $('primaryColor'),
  secondaryColor: $('secondaryColor'),
  mood: $('mood'),
  styleDesign: $('styleDesign'),
  mainText: $('mainText'),
  textPlacement: $('textPlacement'),
  fontStyle: $('fontStyle'),
  tagline: $('tagline'),
  visualDesc: $('visualDesc'),
  mainObject: $('mainObject'),
  background: $('background'),
  extraElements: $('extraElements'),
  outputTone: $('outputTone'),
  quality: $('quality'),
  notes: $('notes'),
};

const form = $('promptForm');
const resultPrompt = $('resultPrompt');
const charCount = $('charCount');

function valueOf(field) {
  return (field?.value || '').trim();
}

function addLine(lines, label, value) {
  if (value) lines.push(`${label}: ${value}.`);
}

function calculateAspectRatio(width, height) {
  if (!width || !height) return '';
  const w = parseInt(width);
  const h = parseInt(height);
  if (isNaN(w) || isNaN(h)) return '';
  
  const ratio = w / h;
  if (Math.abs(ratio - 1.77) < 0.1) return '16:9';
  if (Math.abs(ratio - 1.33) < 0.1) return '4:3';
  if (Math.abs(ratio - 0.56) < 0.1) return '9:16';
  if (Math.abs(ratio - 0.75) < 0.1) return '3:4';
  if (Math.abs(ratio - 1.0) < 0.1) return '1:1';
  
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  const divisor = gcd(w, h);
  return `${w / divisor}:${h / divisor}`;
}

function buildPrompt() {
  const width = valueOf(fields.width);
  const height = valueOf(fields.height);
  const unit = valueOf(fields.unit);
  const platform = valueOf(fields.platform);
  
  const vType = valueOf(fields.designType);
  const vVisual = valueOf(fields.visualDesc);
  const vMainObj = valueOf(fields.mainObject);
  const vMainText = valueOf(fields.mainText);
  const vTextPos = valueOf(fields.textPlacement);
  const vFontStyle = valueOf(fields.fontStyle);
  const vTagline = valueOf(fields.tagline);
  const vStyle = valueOf(fields.styleDesign);
  const vPrimary = valueOf(fields.primaryColor);
  const vSecondary = valueOf(fields.secondaryColor);
  const vMood = valueOf(fields.mood);
  const vBg = valueOf(fields.background);
  const vExtra = valueOf(fields.extraElements);
  const vTone = valueOf(fields.outputTone);
  const vQuality = valueOf(fields.quality);
  const vNotes = valueOf(fields.notes);

  if (platform === 'Midjourney') {
    const parts = [];
    if (vType) parts.push(vType);
    if (vVisual) parts.push(vVisual);
    if (vMainObj) parts.push(vMainObj);
    if (vMainText) parts.push(`typography text "${vMainText}" (${vFontStyle || 'clean'}, ${vTextPos || 'centered'})`);
    if (vTagline) parts.push(`subtitle text "${vTagline}"`);
    if (vStyle) parts.push(`${vStyle} style`);
    if (vPrimary || vSecondary) parts.push(`colors: ${vPrimary} and ${vSecondary}`);
    if (vMood) parts.push(`${vMood} lighting`);
    if (vBg) parts.push(`${vBg} background`);
    if (vExtra) parts.push(vExtra);
    if (vQuality) parts.push(vQuality);
    if (vTone) parts.push(`${vTone} feeling`);
    
    let prompt = parts.join(', ');
    const ar = calculateAspectRatio(width, height);
    if (ar && ar.length < 10) prompt += ` --ar ${ar}`;
    if (vNotes) {
      const negative = vNotes.toLowerCase().replace('jangan ', '').replace('tanpa ', '');
      prompt += ` --no ${negative}`;
    }
    return prompt;
  }
  
  if (platform === 'Canva AI') {
    const parts = [];
    parts.push(`Sebuah ${vType || 'desain visual'} dengan gaya ${vStyle || 'modern'}.`);
    if (vVisual) parts.push(`Konsep utama: ${vVisual}.`);
    if (vMainObj) parts.push(`Fokus pada ${vMainObj}.`);
    if (vPrimary) parts.push(`Warna dominan: ${vPrimary} dan ${vSecondary}.`);
    if (vBg) parts.push(`Background ${vBg}.`);
    if (vExtra) parts.push(`Tambahkan elemen pendukung: ${vExtra}.`);
    if (vNotes) parts.push(`Catatan: ${vNotes}.`);
    return parts.join(' ');
  }

  const size = width && height ? `${width} x ${height} ${unit}` : '';

  const lines = [];
  lines.push('Buatkan desain visual berdasarkan brief berikut. Hasil harus rapi, mudah dibaca, dan terlihat profesional.');
  addLine(lines, 'Jenis desain', vType);
  addLine(lines, 'Target platform', platform);
  addLine(lines, 'Ukuran desain', size);
  addLine(lines, 'Warna utama', vPrimary);
  addLine(lines, 'Warna sekunder', vSecondary);
  addLine(lines, 'Mood warna', vMood);
  addLine(lines, 'Gaya desain', vStyle);
  addLine(lines, 'Teks utama atau judul besar', vMainText);
  addLine(lines, 'Posisi teks utama', vTextPos);
  addLine(lines, 'Gaya font', vFontStyle);
  addLine(lines, 'Teks sekunder atau tagline', vTagline);
  addLine(lines, 'Deskripsi gambar, ilustrasi, atau logo', vVisual);
  addLine(lines, 'Objek utama', vMainObj);
  addLine(lines, 'Latar belakang', vBg);
  addLine(lines, 'Elemen tambahan', vExtra);
  addLine(lines, 'Nuansa output', vTone);
  addLine(lines, 'Kualitas output', vQuality);
  addLine(lines, 'Catatan khusus', vNotes);

  lines.push('Atur komposisi agar seimbang. Beri ruang kosong yang cukup. Jangan membuat desain terlalu ramai. Pastikan teks utama menjadi fokus dan tetap terbaca jelas.');
  lines.push('Gunakan detail visual yang konsisten dengan brand Zprompt, yaitu modern, bersih, kreatif, dan mudah digunakan.');

  return lines.join('\n');
}

function updateResult() {
  const prompt = buildPrompt();
  resultPrompt.value = prompt;
  charCount.textContent = `${prompt.length} karakter`;
}

function saveFormToStorage() {
  const formData = {};
  Object.keys(fields).forEach(key => {
    formData[key] = fields[key].value;
  });
  localStorage.setItem('zprompt_current_form', JSON.stringify(formData));
  
  if (saveStatus) {
    saveStatus.innerHTML = '&#10003; Draft saved';
    saveStatus.classList.add('show');
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveStatus.classList.remove('show');
    }, 2000);
  }
}

function loadFormFromStorage() {
  const saved = localStorage.getItem('zprompt_current_form');
  if (saved) {
    try {
      const formData = JSON.parse(saved);
      let hasData = false;
      Object.keys(formData).forEach(key => {
        if (fields[key]) {
          fields[key].value = formData[key];
          if (formData[key]) hasData = true;
        }
      });
      if (hasData) updateResult();
    } catch (e) {
      console.error('Error loading form data', e);
    }
  }
}

function toggleHistory() {
  const isHidden = historySidebar.getAttribute('aria-hidden') === 'true';
  historySidebar.setAttribute('aria-hidden', !isHidden);
  historyOverlay.setAttribute('aria-hidden', !isHidden);
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('zprompt_history')) || [];
  } catch {
    return [];
  }
}

function saveToHistory() {
  if (!valueOf(fields.designType) && !valueOf(fields.visualDesc) && !valueOf(fields.mainText)) return;
  
  const history = getHistory();
  const formData = {};
  Object.keys(fields).forEach(key => {
    formData[key] = fields[key].value;
  });
  
  const newItem = {
    id: Date.now().toString(),
    time: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    type: valueOf(fields.designType) || 'Desain Kustom',
    desc: valueOf(fields.visualDesc) || valueOf(fields.mainText) || 'Tanpa deskripsi',
    data: formData
  };
  
  history.unshift(newItem);
  if (history.length > 10) history.pop();
  
  localStorage.setItem('zprompt_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = '';
  
  if (history.length === 0) {
    historyList.style.display = 'none';
    historyEmpty.style.display = 'block';
    $('clearAllHistory').style.display = 'none';
    return;
  }
  
  historyList.style.display = 'flex';
  historyEmpty.style.display = 'none';
  $('clearAllHistory').style.display = 'block';
  
  history.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <div class="history-item-header">
        <div class="history-item-title">${item.type}</div>
        <div class="history-item-time">${item.time}</div>
      </div>
      <div class="history-item-desc">${item.desc}</div>
      <button class="delete-history" aria-label="Hapus history" data-id="${item.id}" title="Hapus">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
        </svg>
      </button>
    `;
    
    li.addEventListener('click', (e) => {
      if (e.target.closest('.delete-history')) return;
      form.reset();
      Object.keys(item.data).forEach(key => {
        if (fields[key]) fields[key].value = item.data[key];
      });
      updateResult();
      saveFormToStorage();
      toggleHistory();
      document.querySelector('#generator').scrollIntoView({ behavior: 'smooth' });
    });
    
    li.querySelector('.delete-history').addEventListener('click', (e) => {
      e.stopPropagation();
      const newHistory = history.filter(h => h.id !== item.id);
      localStorage.setItem('zprompt_history', JSON.stringify(newHistory));
      renderHistory();
    });
    
    historyList.appendChild(li);
  });
}


form.addEventListener('submit', (event) => {
  event.preventDefault();
  updateResult();
  saveToHistory();
  resultPrompt.focus();
  showToast('Prompt berhasil dibuat!');
});

Object.values(fields).forEach((field) => {
  field.addEventListener('input', () => {
    if (resultPrompt.value) updateResult();
    saveFormToStorage();
  });
});

$('copyPrompt').addEventListener('click', async () => {
  if (!resultPrompt.value.trim()) updateResult();
  saveToHistory();
  try {
    await navigator.clipboard.writeText(resultPrompt.value);
    showToast('Prompt berhasil disalin!');
  } catch (error) {
    resultPrompt.select();
    document.execCommand('copy');
    showToast('Prompt berhasil disalin!');
  }
});

$('exportBtn').addEventListener('click', () => {
  if (!resultPrompt.value.trim()) updateResult();
  saveToHistory();
  
  const format = $('exportFormat').value;
  let content = '';
  let filename = 'zprompt';
  let mimeType = 'text/plain;charset=utf-8';
  
  if (format === 'txt') {
    content = resultPrompt.value;
    filename += '.txt';
  } else if (format === 'json') {
    const formData = {};
    Object.keys(fields).forEach(key => {
      formData[key] = fields[key].value;
    });
    content = JSON.stringify({
      prompt: resultPrompt.value,
      parameters: formData,
      generatedAt: new Date().toISOString()
    }, null, 2);
    filename += '.json';
    mimeType = 'application/json;charset=utf-8';
  } else if (format === 'md') {
    content = [
      '# Zprompt Design Brief',
      '',
      `**Platform:** ${valueOf(fields.platform) || 'Umum'}`,
      `**Design Type:** ${valueOf(fields.designType) || '-'}`,
      '',
      '## Prompt',
      '',
      '```text',
      resultPrompt.value,
      '```'
    ].join('\n');
    filename += '.md';
  } else if (format === 'pdf') {
    const printWin = window.open('', '', 'width=800,height=600');
    printWin.document.write(`
      <html>
        <head>
          <title>Zprompt - PDF Export</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; padding: 40px; }
            h1 { color: #153d33; }
            .prompt-box { background: #f5f3ee; padding: 20px; border-radius: 8px; border: 1px solid #d9dfd8; white-space: pre-wrap; font-family: monospace; font-size: 14px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Zprompt Design Brief</h1>
          <div class="meta">
            <strong>Platform:</strong> ${valueOf(fields.platform) || 'Umum'}<br/>
            <strong>Type:</strong> ${valueOf(fields.designType) || '-'}<br/>
            <strong>Date:</strong> ${new Date().toLocaleString('id-ID')}
          </div>
          <h3>Generated Prompt:</h3>
          <div class="prompt-box">${resultPrompt.value.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
    showToast('Membuka PDF Print Dialog...');
    return;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(`File ${format.toUpperCase()} berhasil diunduh.`);
});

$('resetForm').addEventListener('click', () => {
  form.reset();
  resultPrompt.value = '';
  charCount.textContent = '0 karakter';
  localStorage.removeItem('zprompt_current_form');
  updatePlatformTips();
  showToast('Form telah dikosongkan.');
});

$('loadExample').addEventListener('click', () => {
  fields.designType.value = 'Poster Promosi';
  fields.platform.value = 'Canva AI';
  fields.width.value = '1080';
  fields.height.value = '1080';
  fields.unit.value = 'px';
  fields.primaryColor.value = 'hijau sage';
  fields.secondaryColor.value = 'emas lembut';
  fields.mood.value = 'Modern dan premium';
  fields.styleDesign.value = 'Minimalis premium';
  fields.mainText.value = 'Zprompt';
  fields.textPlacement.value = 'Tengah utama';
  fields.fontStyle.value = 'Sans serif modern';
  fields.tagline.value = 'Cepat, rapi, siap pakai';
  fields.visualDesc.value = 'visual brand digital kreatif dengan bentuk geometris lembut, cahaya halus, dan komposisi modern';
  fields.mainObject.value = 'ikon huruf Z modern';
  fields.background.value = 'gradasi lembut dengan ruang kosong bersih';
  fields.extraElements.value = 'sparkle halus, garis abstrak, bayangan lembut';
  fields.outputTone.value = 'Profesional';
  fields.quality.value = 'High quality';
  fields.notes.value = 'Teks harus terbaca jelas dan desain tidak boleh terlalu ramai.';
  updateResult();
  updatePlatformTips();
  document.querySelector('#generator').scrollIntoView({ behavior: 'smooth' });
});

$('themeToggle').addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('zarka-theme', next);
  updateThemeIcon();
});

function updateThemeIcon() {
  const icon = document.querySelector('.theme-icon');
  if (!icon) return;
  icon.textContent = document.documentElement.dataset.theme === 'dark' ? '🌙' : '☀️';
}

const savedTheme = localStorage.getItem('zarka-theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
updateThemeIcon();

$('year').textContent = new Date().getFullYear();

// Presets Event Listeners
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const data = presetsData[btn.dataset.preset];
    if (data) {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      form.reset();
      Object.keys(data).forEach(key => {
        if (fields[key]) fields[key].value = data[key];
      });
      updateResult();
      saveFormToStorage();
      updatePlatformTips();
    }
  });
});

// Sidebar Listeners
$('historyToggle').addEventListener('click', toggleHistory);
$('closeHistory').addEventListener('click', toggleHistory);
historyOverlay.addEventListener('click', toggleHistory);
$('clearAllHistory').addEventListener('click', () => {
  if (confirm('Yakin ingin menghapus semua history?')) {
    localStorage.removeItem('zprompt_history');
    renderHistory();
  }
});

function updatePlatformTips() {
  const plat = fields.platform.value;
  if (platformTipsData[plat] && platformTips) {
    platformTips.innerHTML = platformTipsData[plat];
    platformTips.setAttribute('aria-hidden', 'false');
  } else if (platformTips) {
    platformTips.setAttribute('aria-hidden', 'true');
  }
}

fields.platform.addEventListener('change', updatePlatformTips);

// Initial Load
loadFormFromStorage();
renderHistory();
updatePlatformTips();

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
