# ZPrompt

Website statis untuk membuat prompt desain AI secara cepat dan rapi.

## Struktur File
- `index.html` halaman utama generator prompt
- `template/index.html` halaman template prompt
- `tentang/index.html` halaman tentang
- `dukungan/index.html` halaman dukungan & saran
- `contoh.html`, `about.html`, `support.html` pengalih untuk link lama
- `style.css` tampilan website
- `script.js` logika utama
- `page.js` logika halaman statis
- `library.js` logika template prompt
- `support.js` logika halaman dukungan
- `sw.js` service worker (offline support)
- `manifest.webmanifest` konfigurasi PWA
- `assets/` logo dan icon

## Fitur
1. **Form Input:** Jenis desain, gaya, warna, elemen visual, dll.
2. **Preset Cepat:** 13 template siap pakai (Feed IG, Story, Thumbnail YT, Logo Brand, Poster, Poster Makanan, Label Produk, Banner, Maskot, UI Website, UI Aplikasi, Presentasi Slide, Presentasi Bisnis).
3. **Bahasa Output:** Indonesia, English, atau Campuran.
4. **Level Detail:** Singkat, Standar, Detail, Sangat detail.
5. **Negative Prompt:** Kolom khusus untuk hal yang harus dihindari.
6. **Perbaiki Prompt:** Tombol untuk meningkatkan kualitas prompt otomatis.
7. **Draft Auto-save:** Otomatis menyimpan isian terakhir di `localStorage`.
8. **Export Format:** Teks (TXT), JSON, Markdown, Cetak PDF.
9. **Dark Mode:** Tema otomatis dan bisa diubah.
10. **Riwayat Prompt:** Tersimpan di localStorage, bisa di-load ulang.
11. **Offline Support:** Service worker dengan fallback offline page.
12. **Mode Cepat:** Pembuatan prompt hanya dengan 3 input.
13. **Skor Kualitas Prompt:** Penilaian kualitas prompt otomatis beserta saran.
14. **Brand Kit:** Simpan warna, gaya, dan font brand Anda.
15. **Prompt Library:** Halaman khusus berisi contoh dan template prompt.
16. **Halaman Tentang:** Informasi seputar ZPrompt.
17. **Dukungan & Saran:** Kirim masukan dan beri dukungan.
18. **Install App:** ZPrompt bisa di-install sebagai Progressive Web App (PWA).
19. **Privasi Lokal:** Data 100% aman dan hanya tersimpan di perangkat Anda.

## Platform Target yang Didukung
- Midjourney (otomatis generate aspect ratio `--ar` dan negative prompt `--no`)
- Canva AI (format naratif)
- ChatGPT Image / DALL-E
- Ideogram
- Leonardo AI
- Bing Image Creator

## Local Development
Gunakan server statis lokal agar rute bersih seperti `/template/`, `/tentang/`, dan `/dukungan/` berjalan konsisten.

Contoh:
```
python -m http.server 8137
```

Lalu buka `http://127.0.0.1:8137/`.

## Deployment
Karena ini statis (Vanilla HTML/CSS/JS), bisa di-*host* di mana saja:
- GitHub Pages
- Netlify / Vercel
- Hosting konvensional (cPanel)

## Publish / Upload Manual
Untuk upload ke hosting, cukup sertakan file-file ini saja (tanpa folder `.git`):
```
index.html
template/
tentang/
dukungan/
contoh.html
about.html
support.html
style.css
script.js
page.js
library.js
support.js
sw.js
manifest.webmanifest
assets/
LICENSE
```

## Brand

Nama brand: ZPrompt
Konsep: brand digital kreatif untuk tools, desain, AI, dan project web sederhana.

## License

Proyek ini dirilis di bawah [MIT License](LICENSE).
