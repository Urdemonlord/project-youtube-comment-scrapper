# Analisis Sentimen dan Toksisitas Komentar YouTube Menggunakan AI
(YouTube Comment Sentiment and Toxicity Analysis Using AI)

Skripsi ini disusun untuk memenuhi salah satu syarat  
menyelesaikan Program Studi Teknik Informatika  
Universitas Muhammadiyah Semarang

Oleh:  
**Hasrinata Arya Afendi**  
<!-- Add your NIM here -->
Program Studi Teknik Informatika  
Fakultas Teknik  
Universitas Muhammadiyah Semarang  
2025

## 📑 Abstrak

Aplikasi ini dikembangkan sebagai bagian dari penelitian skripsi untuk menganalisis sentimen dan tingkat toksisitas komentar YouTube menggunakan kecerdasan buatan (AI). Sistem ini mengintegrasikan YouTube Data API dan Google Gemini API untuk memberikan analisis mendalam tentang opini publik dan interaksi pengguna dalam konten YouTube.

## 🎯 Tujuan Penelitian

1. Mengembangkan sistem analisis otomatis untuk komentar YouTube
2. Mengimplementasikan analisis sentimen menggunakan AI
3. Mendeteksi tingkat toksisitas dalam komentar
4. Mengekstrak dan visualisasi kata kunci penting
5. Memberikan insight yang bermanfaat bagi content creator dan peneliti

## 🔬 Metodologi

### Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express
- AI Processing: Google Gemini API
- Data Source: YouTube Data API v3
- Visualisasi: React Charts
- Export Data: Excel

### Fitur Utama

1. **Pengambilan Data**
   - Fetching komentar YouTube
   - Validasi dan preprocessing data
   - Penyimpanan data terstruktur

2. **Analisis AI**
   - Analisis sentimen (positif/negatif/netral)
   - Deteksi toksisitas
   - Ekstraksi kata kunci
   - Identifikasi topik

3. **Visualisasi**
   - Grafik distribusi sentimen
   - Pemetaan tingkat toksisitas
   - Word cloud kata kunci
   - Analisis topik

4. **Export Data**
   - Format Excel untuk analisis lanjutan
   - Laporan terstruktur

## 💻 Panduan Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd project-youtube-comment-scrapper
```

2. Install dependencies:
```bash
npm install
npm install @xenova/transformers # diperlukan untuk analisis IndoBERT
```
3. Konfigurasi environment:
```bash
cp .env.example .env
```
Edit file .env dengan API keys:
- YouTube API key dari [Google Cloud Console](https://console.cloud.google.com)
- Gemini API key dari [Google AI Studio](https://makersuite.google.com/app/apikey)

4. Jalankan aplikasi:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
```
## 🔒 Keamanan API

1. Jangan pernah commit file .env
2. Selalu gunakan environment variables
3. Batasi API keys di Google Cloud Console:
   - Set HTTP referrer restrictions
   - Set API quota limits
   - Aktifkan hanya service yang diperlukan

## 📊 Hasil Penelitian

Sistem ini menghasilkan berbagai analisis:
- Analisis sentimen komentar
- Deteksi tingkat toksisitas
- Ekstraksi kata kunci penting
- Visualisasi data interaktif
- Export data untuk analisis lanjut

### 🚀 Custom Model Upload
### 🔤 Mode IndoBERT
Aktifkan analisis IndoBERT dengan mengirim parameter `analysisMethod: "indobert"` pada endpoint `/analyze-comments`. Pastikan paket `@xenova/transformers` telah terpasang.

### API Usage
Gunakan parameter `includeReplies` pada endpoint `/analyze-comments` untuk menyertakan balasan komentar. Nilai default adalah `false`. Jika diatur ke `true`, setiap reply akan dihitung sebagai komentar tersendiri hingga batas `maxComments` tercapai.

Gunakan parameter `maxComments` untuk menentukan jumlah komentar yang diambil (20-2000). Sistem mendukung pagination otomatis untuk mengambil komentar dalam jumlah besar.

Gunakan juga parameter `sortBy` untuk menentukan urutan komentar. Pilihan `relevance` (default) akan mengambil komentar terpopuler, `time` mengambil komentar terbaru, dan `rating` mengambil komentar dengan rating tertinggi.

Parameter `analysisMethod` memungkinkan pemilihan antara `gemini` (default, comprehensive analysis) atau `indobert` (optimized for Indonesian language).

Pengguna kini dapat mengunggah model AI pribadi melalui tab Analyze. Setelah diunggah, model dapat diaktifkan atau dihapus sesuai kebutuhan. Sistem akan menggunakan model aktif milik pengguna saat melakukan prediksi.

## 🤝 Kontribusi

Lihat file [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan berkontribusi. Gunakan pesan commit yang jelas dan deskriptif agar riwayat proyek mudah dipahami, contohnya:

```
Add keyword-based classifier and tests
```

## 📝 Lisensi

MIT License

## 📧 Kontak

Hasrinata Arya Afendi  
Teknik Informatika  
Universitas Muhammadiyah Semarang (UNIMUS)  
C2C022041@student.unimus.ac.id
