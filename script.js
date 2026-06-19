const $ = (id) => document.getElementById(id);

let saveTimeout;
const saveStatus = $('saveStatus');
const historySidebar = $('historySidebar');
const historyOverlay = $('historyOverlay');
const historyList = $('historyList');
const historyEmpty = $('historyEmpty');
const platformTips = $('platformTips');
const toastContainer = $('toastContainer');
const resultEmptyState = $('resultEmptyState');

let activeOutputMode = 'prompt';
let currentPromptText = '';

function showToast(message) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

const ICONS = {
  tip: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:text-bottom; margin-right:4px;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  sun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
};

const platformTipsData = {
  'Midjourney': ICONS.tip + ' <strong>Tips Midjourney:</strong> Prompt akan diubah menjadi format dipisah koma (comma-separated). Aspect ratio otomatis dihitung dari ukuran.',
  'Canva AI': ICONS.tip + ' <strong>Tips Canva AI:</strong> Canva lebih cocok untuk prompt konsep visual yang sederhana dan tidak terlalu teknis.',
  'ChatGPT Image': ICONS.tip + ' <strong>Tips ChatGPT / DALL-E:</strong> Berikan deskripsi natural dan detail (seperti bercerita) tentang elemen yang ingin digambar.',
  'Ideogram': ICONS.tip + ' <strong>Tips Ideogram:</strong> Sangat bagus untuk memunculkan tipografi. Pastikan teks utama diletakkan dalam tanda kutip.',
  'Leonardo AI': ICONS.tip + ' <strong>Tips Leonardo AI:</strong> Bagus untuk gaya 3D dan game asset. Tambahkan kata kunci kualitas tinggi.',
  'Bing Image Creator': ICONS.tip + ' <strong>Tips Bing (DALL-E 3):</strong> Mirip dengan ChatGPT, gunakan bahasa deskriptif.'
};

const presetsData = {
  'ig-feed': {
    designType: 'Feed Instagram', platform: 'Canva AI', width: '1080', height: '1080', unit: 'px',
    mood: 'Fresh dan cerah', styleDesign: 'Modern clean', textPlacement: 'Tengah utama', outputTone: 'Profesional', quality: 'High quality'
  },
  'story': {
    designType: 'Story Instagram', platform: 'Canva AI', width: '1080', height: '1920', unit: 'px',
    mood: 'Fresh dan cerah', styleDesign: 'Modern clean', outputTone: 'Promosi', quality: 'Mobile friendly'
  },
  'yt-thumb': {
    designType: 'Thumbnail YouTube', platform: 'Midjourney', width: '1920', height: '1080', unit: 'px',
    mood: 'Modern dan premium', styleDesign: '3D soft style', outputTone: 'Profesional', quality: 'High quality'
  },
  'logo': {
    designType: 'Logo', platform: 'Ideogram', width: '1000', height: '1000', unit: 'px',
    mood: 'Minimalis dan bersih', styleDesign: 'Minimalis premium', outputTone: 'Profesional', quality: 'Clean vector',
    negativePrompt: 'teks blur, background ramai, warna terlalu banyak'
  },
  'poster': {
    designType: 'Poster Promosi', platform: 'Canva AI', width: '1080', height: '1350', unit: 'px',
    mood: 'Elegan dan profesional', styleDesign: 'Modern clean', outputTone: 'Promosi', quality: 'High quality'
  },
  'poster-makanan': {
    designType: 'Poster Promosi', platform: 'ChatGPT Image', width: '1080', height: '1350', unit: 'px',
    mood: 'Hangat dan ramah', styleDesign: 'Modern clean', outputTone: 'Promosi', quality: 'High quality',
    visualDesc: 'foto makanan appetizing dengan pencahayaan hangat dan dekorasi segar',
    negativePrompt: 'makanan basi, gelap, blur, tidak appetizing'
  },
  'label-produk': {
    designType: 'Label Produk', platform: 'Canva AI', width: '800', height: '600', unit: 'px',
    mood: 'Hangat dan ramah', styleDesign: 'Modern clean', outputTone: 'Promosi', quality: 'Print ready',
    negativePrompt: 'teks terlalu kecil, warna pudar'
  },
  'banner': {
    designType: 'Banner Website', platform: 'ChatGPT Image', width: '1920', height: '600', unit: 'px',
    mood: 'Modern dan premium', styleDesign: 'Modern clean', outputTone: 'Profesional', quality: 'High quality'
  },
  'maskot': {
    designType: 'Logo', platform: 'Midjourney', width: '1000', height: '1000', unit: 'px',
    mood: 'Lucu dan kartun', styleDesign: 'Kartun lucu', outputTone: 'Lucu', quality: 'Clean vector',
    visualDesc: 'karakter maskot lucu dan friendly dengan ekspresi ceria',
    negativePrompt: 'realistis, gelap, menakutkan, horror'
  },
  'ui': {
    designType: 'UI Website', platform: 'Midjourney', width: '1440', height: '900', unit: 'px',
    mood: 'Minimalis dan bersih', styleDesign: 'Modern clean', outputTone: 'Profesional', quality: 'High quality'
  },
  'ui-app': {
    designType: 'UI Website', platform: 'Midjourney', width: '390', height: '844', unit: 'px',
    mood: 'Minimalis dan bersih', styleDesign: 'Modern clean', outputTone: 'Profesional', quality: 'High quality',
    visualDesc: 'desain antarmuka aplikasi mobile yang clean dan intuitif'
  },
  'slide': {
    designType: 'Presentasi Slide', platform: 'Canva AI', width: '1920', height: '1080', unit: 'px',
    mood: 'Elegan dan profesional', styleDesign: 'Edukatif formal', outputTone: 'Akademik', quality: 'High quality'
  },
  'bisnis': {
    designType: 'Presentasi Slide', platform: 'Canva AI', width: '1920', height: '1080', unit: 'px',
    mood: 'Modern dan premium', styleDesign: 'Luxury elegant', outputTone: 'Profesional', quality: 'High quality',
    visualDesc: 'presentasi bisnis profesional dengan data visual dan grafik modern'
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
  promptLang: $('promptLang'),
  detailLevel: $('detailLevel'),
  outputTone: $('outputTone'),
  quality: $('quality'),
  notes: $('notes'),
  negativePrompt: $('negativePrompt'),
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
  const lang = valueOf(fields.promptLang) || 'Indonesia';
  const detail = valueOf(fields.detailLevel) || 'Standar';
  
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
  const vNegative = valueOf(fields.negativePrompt);

  // Language helper flags
  const isEn = lang === 'English';
  const isMix = lang === 'Campuran';

  // ========== MIDJOURNEY ==========
  if (platform === 'Midjourney') {
    const parts = [];
    if (vType) parts.push(vType);
    if (vVisual) parts.push(vVisual);
    if (vMainObj) parts.push(vMainObj);
    if (vMainText) parts.push(`typography text "${vMainText}" (${vFontStyle || 'clean'}, ${vTextPos || 'centered'})`);
    if (vTagline) parts.push(`subtitle text "${vTagline}"`);
    if (vStyle) parts.push(`${vStyle} style`);
    if (vPrimary && vSecondary) parts.push(`colors: ${vPrimary} and ${vSecondary}`);
    else if (vPrimary) parts.push(`colors: ${vPrimary}`);
    else if (vSecondary) parts.push(`colors: ${vSecondary}`);
    if (vMood) parts.push(`${vMood} lighting`);
    if (vBg) parts.push(`${vBg} background`);
    if (vExtra) parts.push(vExtra);
    if (vQuality) parts.push(vQuality);
    if (vTone) parts.push(`${vTone} feeling`);
    
    // Detail level extras
    if (detail === 'Detail' || detail === 'Sangat detail') {
      parts.push('highly detailed', 'professional composition');
    }
    if (detail === 'Sangat detail') {
      parts.push('intricate details', 'perfect lighting', 'masterpiece', '8k resolution');
    }
    
    // Singkat: only keep essential parts
    let finalParts = parts;
    if (detail === 'Singkat') {
      finalParts = parts.slice(0, Math.min(parts.length, 5));
    }
    
    let prompt = finalParts.join(', ');
    const ar = calculateAspectRatio(width, height);
    if (ar && ar.length < 10) prompt += ` --ar ${ar}`;
    
    // Negative prompt: prefer dedicated field, fallback to notes
    if (vNegative) {
      prompt += ` --no ${vNegative}`;
    } else if (vNotes) {
      const negative = vNotes.toLowerCase().replace('jangan ', '').replace('tanpa ', '');
      prompt += ` --no ${negative}`;
    }
    return prompt;
  }
  
  // ========== CANVA AI ==========
  if (platform === 'Canva AI') {
    const parts = [];
    
    if (isEn) {
      parts.push(`A ${vType || 'visual design'} with ${vStyle || 'modern'} style.`);
      if (vVisual) parts.push(`Main concept: ${vVisual}.`);
      if (vMainObj) parts.push(`Focus on ${vMainObj}.`);
      if (vPrimary && vSecondary) parts.push(`Dominant colors: ${vPrimary} and ${vSecondary}.`);
      else if (vPrimary) parts.push(`Dominant color: ${vPrimary}.`);
      else if (vSecondary) parts.push(`Dominant color: ${vSecondary}.`);
      if (vBg) parts.push(`Background: ${vBg}.`);
      if (vExtra) parts.push(`Add supporting elements: ${vExtra}.`);
      if (detail === 'Detail' || detail === 'Sangat detail') {
        if (vMood) parts.push(`Mood: ${vMood}.`);
        if (vMainText) parts.push(`Main text: "${vMainText}".`);
        if (vTagline) parts.push(`Tagline: "${vTagline}".`);
      }
      if (detail === 'Sangat detail') {
        if (vFontStyle) parts.push(`Font style: ${vFontStyle}.`);
        if (vTextPos) parts.push(`Text placement: ${vTextPos}.`);
        parts.push('Ensure professional quality, sharp details, and ready for immediate use.');
      }
      if (vNotes) parts.push(`Notes: ${vNotes}.`);
      if (vNegative) parts.push(`Avoid: ${vNegative}.`);
    } else if (isMix) {
      parts.push(`Sebuah ${vType || 'visual design'} dengan ${vStyle || 'modern'} style.`);
      if (vVisual) parts.push(`Main concept: ${vVisual}.`);
      if (vMainObj) parts.push(`Focus on ${vMainObj}.`);
      if (vPrimary && vSecondary) parts.push(`Dominant color: ${vPrimary} dan ${vSecondary}.`);
      else if (vPrimary) parts.push(`Dominant color: ${vPrimary}.`);
      else if (vSecondary) parts.push(`Dominant color: ${vSecondary}.`);
      if (vBg) parts.push(`Background: ${vBg}.`);
      if (vExtra) parts.push(`Supporting elements: ${vExtra}.`);
      if (detail === 'Detail' || detail === 'Sangat detail') {
        if (vMood) parts.push(`Mood: ${vMood}.`);
        if (vMainText) parts.push(`Main text: "${vMainText}".`);
        if (vTagline) parts.push(`Tagline: "${vTagline}".`);
      }
      if (detail === 'Sangat detail') {
        if (vFontStyle) parts.push(`Font style: ${vFontStyle}.`);
        if (vTextPos) parts.push(`Text position: ${vTextPos}.`);
        parts.push('Pastikan professional quality, sharp details, dan siap digunakan.');
      }
      if (vNotes) parts.push(`Notes: ${vNotes}.`);
      if (vNegative) parts.push(`Avoid: ${vNegative}.`);
    } else {
      // Indonesia (default)
      parts.push(`Sebuah ${vType || 'desain visual'} dengan gaya ${vStyle || 'modern'}.`);
      if (vVisual) parts.push(`Konsep utama: ${vVisual}.`);
      if (vMainObj) parts.push(`Fokus pada ${vMainObj}.`);
      if (vPrimary && vSecondary) parts.push(`Warna dominan: ${vPrimary} dan ${vSecondary}.`);
      else if (vPrimary) parts.push(`Warna dominan: ${vPrimary}.`);
      else if (vSecondary) parts.push(`Warna dominan: ${vSecondary}.`);
      if (vBg) parts.push(`Background ${vBg}.`);
      if (vExtra) parts.push(`Tambahkan elemen pendukung: ${vExtra}.`);
      if (detail === 'Detail' || detail === 'Sangat detail') {
        if (vMood) parts.push(`Mood: ${vMood}.`);
        if (vMainText) parts.push(`Teks utama: "${vMainText}".`);
        if (vTagline) parts.push(`Tagline: "${vTagline}".`);
      }
      if (detail === 'Sangat detail') {
        if (vFontStyle) parts.push(`Gaya font: ${vFontStyle}.`);
        if (vTextPos) parts.push(`Posisi teks: ${vTextPos}.`);
        parts.push('Pastikan kualitas profesional, detail tajam, dan siap digunakan langsung.');
      }
      if (vNotes) parts.push(`Catatan: ${vNotes}.`);
      if (vNegative) parts.push(`Hindari: ${vNegative}.`);
    }
    
    // Singkat: keep only first few sentences
    if (detail === 'Singkat') return parts.slice(0, 4).join(' ');
    return parts.join(' ');
  }

  // ========== DEFAULT / GENERIC ==========
  const size = width && height ? `${width} x ${height} ${unit}` : '';
  const lines = [];

  // Intro based on language
  if (isEn) {
    lines.push('Create a visual design based on the following brief. Use clean, modern, readable composition ready for use.');
  } else if (isMix) {
    lines.push('Buat visual design sesuai brief berikut. Use clean, modern composition yang mudah dibaca dan siap digunakan.');
  } else {
    lines.push('Buat desain visual sesuai brief berikut. Gunakan komposisi yang rapi, modern, mudah dibaca, dan siap digunakan.');
  }

  // Singkat: minimal fields only
  if (detail === 'Singkat') {
    addLine(lines, isEn ? 'Design type' : 'Jenis desain', vType);
    if (vPrimary && vSecondary) addLine(lines, isEn ? 'Colors' : 'Warna', `${vPrimary} & ${vSecondary}`);
    else if (vPrimary) addLine(lines, isEn ? 'Color' : 'Warna', vPrimary);
    addLine(lines, isEn ? 'Style' : 'Gaya', vStyle);
    addLine(lines, isEn ? 'Visual' : 'Visual', vVisual);
    addLine(lines, isEn ? 'Quality' : 'Kualitas', vQuality);
    if (vNegative) addLine(lines, isEn ? 'Avoid' : isMix ? 'Avoid' : 'Hindari', vNegative);
    return lines.join('\n');
  }

  // Standar and above: all filled fields
  addLine(lines, isEn ? 'Design type' : isMix ? 'Design type' : 'Jenis desain', vType);
  addLine(lines, 'Target platform', platform);
  addLine(lines, isEn ? 'Design size' : isMix ? 'Design size' : 'Ukuran desain', size);
  addLine(lines, isEn ? 'Primary color' : isMix ? 'Primary color' : 'Warna utama', vPrimary);
  addLine(lines, isEn ? 'Secondary color' : isMix ? 'Secondary color' : 'Warna sekunder', vSecondary);
  addLine(lines, isEn ? 'Color mood' : isMix ? 'Color mood' : 'Mood warna', vMood);
  addLine(lines, isEn ? 'Design style' : isMix ? 'Design style' : 'Gaya desain', vStyle);
  addLine(lines, isEn ? 'Main text or headline' : isMix ? 'Main text' : 'Teks utama atau judul besar', vMainText);
  addLine(lines, isEn ? 'Main text position' : isMix ? 'Text position' : 'Posisi teks utama', vTextPos);
  addLine(lines, isEn ? 'Font style' : 'Gaya font', vFontStyle);
  addLine(lines, isEn ? 'Tagline' : isMix ? 'Tagline' : 'Teks sekunder atau tagline', vTagline);
  addLine(lines, isEn ? 'Visual description' : isMix ? 'Visual description' : 'Deskripsi gambar, ilustrasi, atau logo', vVisual);
  addLine(lines, isEn ? 'Main object' : isMix ? 'Main object' : 'Objek utama', vMainObj);
  addLine(lines, isEn ? 'Background' : isMix ? 'Background' : 'Latar belakang', vBg);
  addLine(lines, isEn ? 'Additional elements' : isMix ? 'Extra elements' : 'Elemen tambahan', vExtra);
  addLine(lines, isEn ? 'Output tone' : isMix ? 'Output tone' : 'Nuansa output', vTone);
  addLine(lines, isEn ? 'Output quality' : isMix ? 'Output quality' : 'Kualitas output', vQuality);
  addLine(lines, isEn ? 'Special notes' : isMix ? 'Notes' : 'Catatan khusus', vNotes);
  if (vNegative) addLine(lines, isEn ? 'Things to avoid' : isMix ? 'Avoid' : 'Yang harus dihindari', vNegative);

  // Closing phrases
  if (isEn) {
    lines.push('Use balanced composition with adequate white space, ensuring the main text remains the focal point.');
    lines.push('Keep the design modern, clean, and professional.');
  } else if (isMix) {
    lines.push('Gunakan balanced composition, white space yang cukup, dan pastikan main text tetap menjadi focal point.');
    lines.push('Keep the design modern, clean, dan professional.');
  } else {
    lines.push('Gunakan komposisi seimbang, ruang kosong yang cukup, dan pastikan teks utama tetap menjadi fokus.');
    lines.push('Jaga tampilan tetap modern, bersih, dan sesuai karakter ZPrompt.');
  }

  // Detail level extras
  if (detail === 'Detail' || detail === 'Sangat detail') {
    if (isEn) {
      lines.push('Pay attention to typography hierarchy and ensure visual elements support the main message.');
      lines.push('Use appropriate lighting and shadows to add depth.');
    } else if (isMix) {
      lines.push('Perhatikan typography hierarchy dan pastikan visual elements mendukung main message.');
      lines.push('Gunakan lighting dan shadows yang tepat untuk menambah depth.');
    } else {
      lines.push('Perhatikan hierarki tipografi dan pastikan elemen visual mendukung pesan utama.');
      lines.push('Gunakan pencahayaan dan bayangan yang tepat untuk menambah kedalaman.');
    }
  }

  if (detail === 'Sangat detail') {
    if (isEn) {
      lines.push('Ensure pixel-perfect alignment, consistent spacing, and professional color harmony.');
      lines.push('Output should be high resolution, print-ready, with no visual artifacts or distortions.');
      lines.push('Every detail must look intentional and refined.');
    } else if (isMix) {
      lines.push('Pastikan pixel-perfect alignment, consistent spacing, dan professional color harmony.');
      lines.push('Output harus high resolution, print-ready, tanpa visual artifacts atau distorsi.');
      lines.push('Setiap detail harus terlihat intentional dan refined.');
    } else {
      lines.push('Pastikan alignment sempurna, jarak yang konsisten, dan harmoni warna yang profesional.');
      lines.push('Output harus beresolusi tinggi, siap cetak, tanpa artefak visual atau distorsi.');
      lines.push('Setiap detail harus terlihat disengaja dan rapi.');
    }
  }

  return lines.join('\n');
}

function buildBriefText() {
  const lines = [];
  const size = valueOf(fields.width) && valueOf(fields.height)
    ? `${valueOf(fields.width)} x ${valueOf(fields.height)} ${valueOf(fields.unit)}`
    : '';

  addLine(lines, 'Jenis desain', valueOf(fields.designType));
  addLine(lines, 'Platform', valueOf(fields.platform));
  addLine(lines, 'Ukuran', size);
  addLine(lines, 'Warna', [valueOf(fields.primaryColor), valueOf(fields.secondaryColor)].filter(Boolean).join(' dan '));
  addLine(lines, 'Mood', valueOf(fields.mood));
  addLine(lines, 'Gaya', valueOf(fields.styleDesign));
  addLine(lines, 'Teks utama', valueOf(fields.mainText));
  addLine(lines, 'Tagline', valueOf(fields.tagline));
  addLine(lines, 'Visual', valueOf(fields.visualDesc));
  addLine(lines, 'Objek utama', valueOf(fields.mainObject));
  addLine(lines, 'Latar', valueOf(fields.background));
  addLine(lines, 'Elemen tambahan', valueOf(fields.extraElements));
  addLine(lines, 'Output', `${valueOf(fields.promptLang)}, ${valueOf(fields.detailLevel)}, ${valueOf(fields.outputTone)}, ${valueOf(fields.quality)}`.replace(/^(, )+|(, )+$/g, ''));
  addLine(lines, 'Catatan', valueOf(fields.notes));

  return lines.join('\n');
}

function buildNegativeText() {
  const negative = valueOf(fields.negativePrompt);
  if (negative) return negative;

  const match = currentPromptText.match(/--no\s+(.+)$/i);
  if (match?.[1]) return match[1].trim();

  return 'Tidak ada negative prompt khusus.';
}

function getOutputTextForMode(mode) {
  if (!currentPromptText.trim()) return '';
  if (mode === 'brief') return buildBriefText();
  if (mode === 'negative') return buildNegativeText();
  return currentPromptText;
}

function updateOutputModeButtons() {
  document.querySelectorAll('.output-mode-btn').forEach((button) => {
    const isActive = button.dataset.outputMode === activeOutputMode;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
}

function renderOutput() {
  const text = getOutputTextForMode(activeOutputMode);
  resultPrompt.value = text;
  charCount.textContent = `${text.length} huruf`;
  if (resultEmptyState) resultEmptyState.hidden = Boolean(currentPromptText.trim());
  updateOutputModeButtons();
}

function setOutputMode(mode) {
  activeOutputMode = mode;
  renderOutput();
}

function updateResult() {
  const prompt = buildPrompt();
  currentPromptText = prompt;
  renderOutput();
}

function clearResult() {
  currentPromptText = '';
  renderOutput();
}

function ensurePromptReady() {
  if (!form.checkValidity()) {
    form.reportValidity();
    showToast('Lengkapi jenis desain dan platform dulu.');
    return false;
  }

  if (!currentPromptText.trim()) updateResult();

  if (!currentPromptText.trim()) {
    showToast('Belum ada prompt untuk dipakai.');
    return false;
  }

  return true;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function saveFormToStorage() {
  const formData = {};
  Object.keys(fields).forEach(key => {
    formData[key] = fields[key].value;
  });
  try {
    localStorage.setItem('zprompt_current_form', JSON.stringify(formData));
  } catch(e) {
    console.warn('Storage disabled or full:', e);
  }
  
  if (saveStatus) {
    saveStatus.textContent = 'Draft tersimpan';
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

let lastFocusedBeforeHistory = null;

function isHistoryOpen() {
  return historySidebar.getAttribute('aria-hidden') === 'false';
}

function getHistoryFocusableItems() {
  return Array.from(historySidebar.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    .filter((element) => !element.disabled && element.offsetParent !== null);
}

function openHistoryPanel() {
  if (isHistoryOpen()) return;
  lastFocusedBeforeHistory = document.activeElement;
  historySidebar.setAttribute('aria-hidden', 'false');
  historyOverlay.setAttribute('aria-hidden', 'false');
  $('historyToggle').setAttribute('aria-expanded', 'true');
  setTimeout(() => {
    ($('closeHistory') || historySidebar).focus();
  }, 0);
}

function closeHistoryPanel() {
  if (!isHistoryOpen()) return;
  historySidebar.setAttribute('aria-hidden', 'true');
  historyOverlay.setAttribute('aria-hidden', 'true');
  $('historyToggle').setAttribute('aria-expanded', 'false');

  if (lastFocusedBeforeHistory && typeof lastFocusedBeforeHistory.focus === 'function') {
    lastFocusedBeforeHistory.focus();
  }
}

function toggleHistory() {
  if (isHistoryOpen()) closeHistoryPanel();
  else openHistoryPanel();
}

function handleHistoryKeydown(event) {
  if (!isHistoryOpen()) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeHistoryPanel();
    return;
  }

  if (event.key !== 'Tab') return;

  const focusableItems = getHistoryFocusableItems();
  if (focusableItems.length === 0) {
    event.preventDefault();
    historySidebar.focus();
    return;
  }

  const firstItem = focusableItems[0];
  const lastItem = focusableItems[focusableItems.length - 1];

  if (event.shiftKey && document.activeElement === firstItem) {
    event.preventDefault();
    lastItem.focus();
  } else if (!event.shiftKey && document.activeElement === lastItem) {
    event.preventDefault();
    firstItem.focus();
  }
}

const formStepMeta = [
  { required: ['designType', 'platform'], track: ['width', 'height'], optionalLabel: 'Ukuran opsional' },
  { required: [], track: ['primaryColor', 'secondaryColor', 'mood', 'styleDesign'], optionalLabel: 'Opsional' },
  { required: [], track: ['mainText', 'textPlacement', 'fontStyle', 'tagline'], optionalLabel: 'Opsional' },
  { required: [], track: ['visualDesc', 'mainObject', 'background', 'extraElements'], optionalLabel: 'Opsional' },
  { required: [], track: ['promptLang', 'detailLevel', 'outputTone', 'quality', 'notes', 'negativePrompt'], optionalLabel: 'Opsional' }
];

function setupRequiredIndicators() {
  Object.values(fields).forEach((field) => {
    if (!field?.required) return;

    const label = field.closest('label');
    if (!label || label.querySelector('.required-pill')) return;

    const labelText = Array.from(label.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .filter(Boolean)
      .join(' ');

    Array.from(label.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .forEach((node) => node.remove());

    const row = document.createElement('span');
    row.className = 'label-row';

    const text = document.createElement('span');
    text.textContent = labelText;

    const badge = document.createElement('span');
    badge.className = 'required-pill';
    badge.textContent = 'Wajib';

    row.appendChild(text);
    row.appendChild(badge);
    label.insertBefore(row, field);
  });
}

function updateFormStepStatuses() {
  document.querySelectorAll('.form-step').forEach((fieldset, index) => {
    const meta = formStepMeta[index] || { required: [], track: [] };
    const status = fieldset.querySelector('.form-step-status');
    if (!status) return;

    const missingRequired = meta.required.filter((key) => !valueOf(fields[key]));
    if (missingRequired.length > 0) {
      status.textContent = `${missingRequired.length} wajib belum terisi`;
      return;
    }

    const filled = meta.track.filter((key) => valueOf(fields[key])).length;
    if (meta.required.length > 0) {
      status.textContent = filled > 0 ? `Wajib lengkap, ${filled} detail terisi` : 'Wajib lengkap';
      return;
    }

    status.textContent = filled > 0 ? `${filled} terisi` : meta.optionalLabel || 'Opsional';
  });
}

function setFormStepOpen(fieldset, isOpen) {
  const button = fieldset.querySelector('.form-step-toggle');
  const body = fieldset.querySelector('.form-step-body');
  const chevron = fieldset.querySelector('.form-step-chevron');

  fieldset.classList.toggle('is-collapsed', !isOpen);
  if (button) button.setAttribute('aria-expanded', String(isOpen));
  if (body) body.hidden = !isOpen;
  if (chevron) chevron.textContent = isOpen ? '-' : '+';
}

function setupFormSteps() {
  const steps = Array.from(form.querySelectorAll('fieldset'));

  steps.forEach((fieldset, index) => {
    if (fieldset.classList.contains('form-step')) return;

    const legend = fieldset.querySelector('legend');
    if (!legend) return;

    const title = legend.textContent.trim();
    const body = document.createElement('div');
    body.className = 'form-step-body';
    body.id = `formStepBody${index + 1}`;

    while (legend.nextSibling) {
      body.appendChild(legend.nextSibling);
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'form-step-toggle';
    button.setAttribute('aria-controls', body.id);

    const titleWrap = document.createElement('span');
    titleWrap.className = 'form-step-title';

    const number = document.createElement('span');
    number.className = 'form-step-index';
    number.textContent = String(index + 1);

    const labelWrap = document.createElement('span');
    labelWrap.className = 'form-step-label';

    const label = document.createElement('span');
    label.textContent = title;

    const status = document.createElement('span');
    status.className = 'form-step-status';

    const chevron = document.createElement('span');
    chevron.className = 'form-step-chevron';
    chevron.setAttribute('aria-hidden', 'true');

    labelWrap.appendChild(label);
    labelWrap.appendChild(status);
    titleWrap.appendChild(number);
    titleWrap.appendChild(labelWrap);
    button.appendChild(titleWrap);
    button.appendChild(chevron);

    legend.textContent = '';
    legend.appendChild(button);
    fieldset.appendChild(body);
    fieldset.classList.add('form-step');

    setFormStepOpen(fieldset, index === 0);

    button.addEventListener('click', () => {
      setFormStepOpen(fieldset, fieldset.classList.contains('is-collapsed'));
    });
  });

  updateFormStepStatuses();
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
  
  try {
    localStorage.setItem('zprompt_history', JSON.stringify(history));
  } catch(e) {
    console.warn('Storage disabled or full:', e);
  }
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

    // Build DOM elements safely using textContent to prevent XSS
    const header = document.createElement('div');
    header.className = 'history-item-header';

    const title = document.createElement('div');
    title.className = 'history-item-title';
    title.textContent = item.type;

    const time = document.createElement('div');
    time.className = 'history-item-time';
    time.textContent = item.time;

    header.appendChild(title);
    header.appendChild(time);

    const desc = document.createElement('div');
    desc.className = 'history-item-desc';
    desc.textContent = item.desc;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-history';
    deleteBtn.setAttribute('aria-label', 'Hapus riwayat');
    deleteBtn.dataset.id = item.id;
    deleteBtn.title = 'Hapus';
    deleteBtn.innerHTML = `
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
      </svg>
    `;

    li.appendChild(header);
    li.appendChild(desc);
    li.appendChild(deleteBtn);
    
    li.addEventListener('click', (e) => {
      if (e.target.closest('.delete-history')) return;
      form.reset();
      Object.keys(item.data).forEach(key => {
        if (fields[key]) fields[key].value = item.data[key];
      });
      setOutputMode('prompt');
      updateResult();
      saveFormToStorage();
      updateFormStepStatuses();
      closeHistoryPanel();
      document.querySelector('#generator').scrollIntoView({ behavior: 'smooth' });
    });
    
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newHistory = history.filter(h => h.id !== item.id);
      try {
        localStorage.setItem('zprompt_history', JSON.stringify(newHistory));
      } catch(e) {}
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
  showToast('Prompt siap dipakai.');
});

Object.values(fields).forEach((field) => {
  field.addEventListener('input', () => {
    if (currentPromptText) {
      if (form.checkValidity()) updateResult();
      else clearResult();
    }
    updateFormStepStatuses();
    saveFormToStorage();
  });
});

$('copyPrompt').addEventListener('click', async () => {
  if (!ensurePromptReady()) return;
  saveToHistory();
  try {
    await navigator.clipboard.writeText(resultPrompt.value);
    showToast('Prompt disalin.');
  } catch (error) {
    resultPrompt.select();
    const copied = document.execCommand('copy');
    showToast(copied ? 'Prompt disalin.' : 'Gagal menyalin prompt.');
  }
});

// Improve Prompt — rule-based enhancement
function improvePrompt() {
  if (!ensurePromptReady()) return;
  setOutputMode('prompt');
  let text = currentPromptText.trim();

  const platform = valueOf(fields.platform);
  const lang = valueOf(fields.promptLang) || 'Indonesia';
  const isEn = lang === 'English';
  const isMix = lang === 'Campuran';

  if (platform === 'Midjourney') {
    // Add quality parameters if missing
    if (!text.includes('--q')) text += ' --q 2';
    if (!text.includes('--s') && !text.includes('--style')) text += ' --s 750';
    // Add quality keywords if not present
    const hasQualityKw = ['8k', '4k', 'ultra detailed', 'high resolution'].some(k => text.toLowerCase().includes(k));
    if (!hasQualityKw) {
      const paramIdx = text.indexOf(' --');
      const qualityStr = ', 8k resolution, ultra detailed, professional photography';
      if (paramIdx > -1) {
        text = text.substring(0, paramIdx) + qualityStr + text.substring(paramIdx);
      } else {
        text += qualityStr;
      }
    }
  } else if (platform === 'Canva AI') {
    if (isEn) {
      text += ' Make sure the result looks professional, high quality, and ready to use immediately.';
    } else if (isMix) {
      text += ' Pastikan result terlihat professional, high quality, dan siap digunakan langsung.';
    } else {
      text += ' Pastikan hasil terlihat profesional, berkualitas tinggi, dan siap digunakan langsung.';
    }
  } else {
    // Generic improvement
    if (isEn) {
      text += '\nEnsure high resolution output, sharp details, professional lighting, and ready for immediate use.';
      text += '\nUse visual hierarchy to guide the viewer\'s eye through the design naturally.';
    } else if (isMix) {
      text += '\nPastikan output high resolution, sharp details, professional lighting, dan siap digunakan langsung.';
      text += '\nGunakan visual hierarchy untuk memandu mata viewer secara natural.';
    } else {
      text += '\nPastikan output beresolusi tinggi, detail tajam, pencahayaan profesional, dan siap digunakan langsung.';
      text += '\nGunakan hierarki visual untuk memandu mata pemirsa melalui desain secara natural.';
    }
  }

  currentPromptText = text;
  renderOutput();
  showToast('Prompt ditingkatkan!');
}

$('improvePrompt').addEventListener('click', improvePrompt);

$('exportBtn').addEventListener('click', () => {
  if (!ensurePromptReady()) return;
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
      activeMode: activeOutputMode,
      activeOutput: resultPrompt.value,
      prompt: currentPromptText,
      brief: buildBriefText(),
      negative: buildNegativeText(),
      parameters: formData,
      generatedAt: new Date().toISOString()
    }, null, 2);
    filename += '.json';
    mimeType = 'application/json;charset=utf-8';
  } else if (format === 'md') {
    content = [
      '# ZPrompt Design Brief',
      '',
      `**Platform:** ${valueOf(fields.platform) || 'Umum'}`,
      `**Design Type:** ${valueOf(fields.designType) || '-'}`,
      `**Mode:** ${activeOutputMode}`,
      '',
      '## Output',
      '',
      '```text',
      resultPrompt.value,
      '```'
    ].join('\n');
    filename += '.md';
  } else if (format === 'pdf') {
    const printWin = window.open('', '', 'width=800,height=600');
    if (!printWin) {
      showToast('Popup PDF diblokir. Izinkan popup lalu coba lagi.');
      return;
    }

    const safePlatform = escapeHtml(valueOf(fields.platform) || 'Umum');
    const safeType = escapeHtml(valueOf(fields.designType) || '-');
    const safeDate = escapeHtml(new Date().toLocaleString('id-ID'));
    const safePrompt = escapeHtml(resultPrompt.value);

    printWin.document.write(`
      <html>
        <head>
          <title>ZPrompt - PDF Export</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; padding: 40px; }
            h1 { color: #153d33; }
            .prompt-box { background: #f5f3ee; padding: 20px; border-radius: 8px; border: 1px solid #d9dfd8; white-space: pre-wrap; font-family: monospace; font-size: 14px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>ZPrompt Design Brief</h1>
          <div class="meta">
            <strong>Platform:</strong> ${safePlatform}<br/>
            <strong>Type:</strong> ${safeType}<br/>
            <strong>Date:</strong> ${safeDate}
          </div>
          <h3>Generated Prompt:</h3>
          <div class="prompt-box">${safePrompt}</div>
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
  showToast('File berhasil diunduh.');
});

$('resetForm').addEventListener('click', () => {
  form.reset();
  setOutputMode('prompt');
  clearResult();
  try { localStorage.removeItem('zprompt_current_form'); } catch(e) {}
  updatePlatformTips();
  updateFormStepStatuses();
  showToast('Form dikosongkan.');
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
  fields.mainText.value = 'ZPrompt';
  fields.textPlacement.value = 'Tengah utama';
  fields.fontStyle.value = 'Sans serif modern';
  fields.tagline.value = 'Cepat, rapi, siap pakai';
  fields.visualDesc.value = 'visual brand digital kreatif dengan bentuk geometris lembut, cahaya halus, dan komposisi modern';
  fields.mainObject.value = 'ikon huruf Z modern';
  fields.background.value = 'gradasi lembut dengan ruang kosong bersih';
  fields.extraElements.value = 'sparkle halus, garis abstrak, bayangan lembut';
  fields.promptLang.value = 'Indonesia';
  fields.detailLevel.value = 'Standar';
  fields.outputTone.value = 'Profesional';
  fields.quality.value = 'High quality';
  fields.notes.value = 'Teks harus terbaca jelas.';
  fields.negativePrompt.value = 'jangan terlalu ramai, jangan blur, jangan background gelap';
  setOutputMode('prompt');
  updateResult();
  updatePlatformTips();
  updateFormStepStatuses();
  document.querySelector('#generator').scrollIntoView({ behavior: 'smooth' });
});

$('themeToggle').addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('zprompt-theme', next); } catch(e) {}
  updateThemeIcon();
});

function updateThemeIcon() {
  const icon = document.querySelector('.theme-icon');
  if (!icon) return;
  icon.innerHTML = document.documentElement.dataset.theme === 'dark' ? ICONS.moon : ICONS.sun;
}

let savedTheme = null;
try { savedTheme = localStorage.getItem('zprompt-theme'); } catch(e) {}
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
      setOutputMode('prompt');
      updateResult();
      saveFormToStorage();
      updatePlatformTips();
      updateFormStepStatuses();
    }
  });
});

function filterPresets(category) {
  document.querySelectorAll('.preset-category-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.category === category);
  });

  document.querySelectorAll('.preset-btn').forEach((button) => {
    button.hidden = category !== 'all' && button.dataset.category !== category;
  });
}

document.querySelectorAll('.preset-category-btn').forEach((button) => {
  button.addEventListener('click', () => {
    filterPresets(button.dataset.category || 'all');
  });
});

document.querySelectorAll('.output-mode-btn').forEach((button) => {
  button.addEventListener('click', () => {
    setOutputMode(button.dataset.outputMode || 'prompt');
  });
});

$('loadExampleEmpty')?.addEventListener('click', () => {
  $('loadExample').click();
});

$('mobileGenerate')?.addEventListener('click', () => {
  if (typeof form.requestSubmit === 'function') form.requestSubmit();
  else form.dispatchEvent(new Event('submit', { cancelable: true }));
});

$('mobileCopy')?.addEventListener('click', () => {
  $('copyPrompt').click();
});

// Sidebar Listeners
$('historyToggle').addEventListener('click', toggleHistory);
$('closeHistory').addEventListener('click', closeHistoryPanel);
historyOverlay.addEventListener('click', closeHistoryPanel);
document.addEventListener('keydown', handleHistoryKeydown);
$('clearAllHistory').addEventListener('click', () => {
  if (confirm('Yakin ingin menghapus semua riwayat?')) {
    try { localStorage.removeItem('zprompt_history'); } catch(e) {}
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
setupRequiredIndicators();
setupFormSteps();
loadFormFromStorage();
updateFormStepStatuses();
renderHistory();
updatePlatformTips();
renderOutput();

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
