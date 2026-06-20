const libraryData = [
  { id: 'ig-feed', title: 'Feed Instagram', platform: 'Canva AI', desc: 'Sebuah Feed Instagram dengan gaya modern clean. Warna dominan cerah. Kualitas profesional dan siap digunakan langsung.' },
  { id: 'story', title: 'Story Instagram Promosi', platform: 'Canva AI', desc: 'Story Instagram ukuran 1080 x 1920. Gaya modern clean untuk promosi produk harian di media sosial.' },
  { id: 'yt-thumb', title: 'Thumbnail YouTube', platform: 'Midjourney', desc: 'Thumbnail YouTube, 3D soft style, modern premium lighting, 1920 x 1080, professional composition --ar 16:9' },
  { id: 'logo', title: 'Logo Minimalis', platform: 'Ideogram', desc: 'Logo typography text "BrandName", minimalis premium, clean vector, resolusi tinggi, tanpa background ramai.' },
  { id: 'poster', title: 'Poster Acara', platform: 'Canva AI', desc: 'Poster promosi elegan dan profesional. Background bersih dengan ruang kosong yang cukup dan detail tajam.' },
  { id: 'poster-makanan', title: 'Poster Menu Makanan', platform: 'ChatGPT Image', desc: 'Foto makanan appetizing dengan pencahayaan hangat, dekorasi segar, gaya modern clean, tidak blur atau gelap.' },
  { id: 'label-produk', title: 'Label Kemasan', platform: 'Canva AI', desc: 'Label produk yang bersih, modern, print ready, dengan font mudah dibaca dan warna yang tidak kusam.' },
  { id: 'banner', title: 'Banner Website', platform: 'ChatGPT Image', desc: 'Banner website ukuran 1920 x 600 dengan gaya modern clean, resolusi tinggi, dan komposisi profesional.' },
  { id: 'maskot', title: 'Maskot 3D Lucu', platform: 'Midjourney', desc: 'Karakter maskot lucu dan friendly, ekspresi ceria, kartun lucu style, clean vector --no realistis, horror --ar 1:1' },
  { id: 'ui', title: 'UI Dashboard Web', platform: 'Midjourney', desc: 'UI website dashboard modern clean, minimalis dan bersih, high quality, professional feeling --ar 16:9' },
  { id: 'ui-app', title: 'UI Mobile App', platform: 'Midjourney', desc: 'Desain antarmuka aplikasi mobile yang clean, intuitif, modern clean style, high quality --ar 9:16' },
  { id: 'slide', title: 'Presentasi Edukasi', platform: 'Canva AI', desc: 'Presentasi slide edukatif formal, high quality, cocok untuk materi kuliah, sekolah, atau pelatihan.' },
  { id: 'bisnis', title: 'Pitch Deck Bisnis', platform: 'Canva AI', desc: 'Presentasi slide luxury elegant untuk bisnis profesional dengan data visual dan grafik modern.' },
  { id: 'stiker-cup', title: 'Stiker Cup Minuman', platform: 'Canva AI', desc: 'Label produk stiker cup dengan gaya kartun lucu, fresh dan cerah, print ready, tidak kusam.' },
  { id: 'poster-kampus', title: 'Poster Kampus/Mahasiswa', platform: 'Canva AI', desc: 'Poster promosi akademis dengan gaya edukatif formal, elegan, profesional, dan mudah dibaca.' },
  { id: 'proposal', title: 'Cover Proposal', platform: 'Canva AI', desc: 'Cover proposal bisnis minimalis premium, bersih, modern, dan terlihat profesional.' }
];

const galleryContainer = document.getElementById('galleryContainer');
const searchInput = document.getElementById('searchInput');
const filterPlatform = document.getElementById('filterPlatform');

function buildPresetUrl(id) {
  const target = new URL('../', window.location.href);
  target.searchParams.set('preset', id);
  target.hash = 'generator';
  return target.href;
}

function createGalleryCard(item) {
  const card = document.createElement('article');
  card.className = 'gallery-card';

  const tag = document.createElement('span');
  tag.className = 'gallery-tag';
  tag.textContent = item.platform;

  const title = document.createElement('h3');
  title.className = 'gallery-title';
  title.textContent = item.title;

  const desc = document.createElement('p');
  desc.className = 'gallery-desc';
  desc.textContent = item.desc;

  const actions = document.createElement('div');
  actions.className = 'gallery-actions';

  const useLink = document.createElement('a');
  useLink.className = 'primary-btn';
  useLink.href = buildPresetUrl(item.id);
  useLink.textContent = 'Gunakan';

  const copyButton = document.createElement('button');
  copyButton.className = 'secondary-btn';
  copyButton.type = 'button';
  copyButton.textContent = 'Salin';
  copyButton.addEventListener('click', async () => {
    const originalText = copyButton.textContent;
    try {
      if (typeof copyTextToClipboard === 'function') await copyTextToClipboard(item.desc);
      else await navigator.clipboard.writeText(item.desc);
      copyButton.textContent = 'Tersalin';
    } catch (error) {
      copyButton.textContent = 'Gagal';
    }
    window.setTimeout(() => {
      copyButton.textContent = originalText;
    }, 2000);
  });

  actions.append(useLink, copyButton);
  card.append(tag, title, desc, actions);
  return card;
}

function renderGallery() {
  if (!galleryContainer || !searchInput || !filterPlatform) return;

  const query = searchInput.value.trim().toLowerCase();
  const platform = filterPlatform.value;

  const filtered = libraryData.filter((item) => {
    const haystack = `${item.title} ${item.desc} ${item.platform}`.toLowerCase();
    return haystack.includes(query) && (platform === 'all' || item.platform === platform);
  });

  galleryContainer.replaceChildren();

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Tidak ada prompt yang cocok dengan pencarian Anda.';
    galleryContainer.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    galleryContainer.appendChild(createGalleryCard(item));
  });
}

searchInput?.addEventListener('input', renderGallery);
filterPlatform?.addEventListener('change', renderGallery);
renderGallery();
