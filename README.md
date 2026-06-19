# ZPrompt

Website statis untuk membuat prompt desain AI secara cepat dan rapi.

## Struktur File
- `index.html` halaman utama
- `style.css` tampilan website
- `script.js` logika generate prompt, copy, download, mode gelap
- `sw.js` service worker (offline support + caching)
- `assets/logo.png` logo utama ZPrompt
- `assets/favicon.png` favicon website
- `manifest.webmanifest` konfigurasi PWA dasar

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

## Platform Target yang Didukung
- Midjourney (otomatis generate aspect ratio `--ar` dan negative prompt `--no`)
- Canva AI (format naratif)
- ChatGPT Image / DALL-E
- Ideogram
- Leonardo AI
- Bing Image Creator

## Local Development
Cukup buka `index.html` di browser atau gunakan extension Live Server di VSCode.

## Deployment
Karena ini statis (Vanilla HTML/CSS/JS), bisa di-*host* di mana saja:
- GitHub Pages
- Netlify / Vercel
- Hosting konvensional (cPanel)

## Publish / Upload Manual
Untuk upload ke hosting, cukup sertakan file-file ini saja (tanpa folder `.git`):
```
index.html
contoh.html
style.css
script.js
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
