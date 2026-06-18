# ZPrompt

Website statis untuk membuat prompt desain AI secara cepat dan rapi.

## Struktur File
- `index.html` halaman utama
- `style.css` tampilan website
- `script.js` logika generate prompt, copy, download TXT, mode gelap
- `assets/logo.png` logo ZPrompt
- `assets/favicon.svg` favicon website
- `manifest.webmanifest` konfigurasi PWA dasar

## Fitur Fase Pertama
1. **Form Input:** Jenis desain, gaya, warna, elemen visual, dll.
2. **Preset Cepat:** Template untuk sosial media (IG Feed, Thumbnail YT, Logo).
3. **Draft Auto-save:** Otomatis menyimpan isian terakhir di `localStorage`.
4. **Export Format:** Teks (TXT), JSON, Markdown, PDF Print.
5. **Dark Mode:** Tema otomatis dan bisa diubah.

## Platform Target yang Didukung
- Midjourney (otomatis generate aspect ratio `--ar` dan negative prompt `--no`)
- Canva AI (format naratif)
- ChatGPT Image / DALL-E
- Ideogram
- Leonardo AI

## Local Development
Cukup buka `index.html` di browser atau gunakan extension Live Server di VSCode.

## Deployment
Karena ini statis (Vanilla HTML/CSS/JS), bisa di-*host* di mana saja:
- GitHub Pages
- Netlify / Vercel
- Hosting konvensional (cPanel)

## Brand

Nama brand: ZPrompt
Konsep: brand digital kreatif untuk tools, desain, AI, dan project web sederhana.
