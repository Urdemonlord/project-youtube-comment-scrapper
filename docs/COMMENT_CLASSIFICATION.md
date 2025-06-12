# Kategori Klasifikasi Komentar

Dokumen ini merangkum definisi kategori yang digunakan untuk mengklasifikasikan komentar YouTube pada proyek ini. Kategori diadaptasi dari contoh diskusi sebelumnya.

1. **Kritik Konstruktif**
   - Komentar bernada negatif namun disertai saran atau alasan logis untuk perbaikan.
2. **Penghinaan**
   - Serangan verbal langsung kepada individu, bukan argumennya.
3. **Ujaran Kebencian**
   - Komentar menyerang kelompok berdasarkan identitas (suku, agama, ras, gender, dll.).
4. **Netral/Positif**
   - Komentar netral, pertanyaan, atau dukungan positif.
5. **Spam/Tidak Relevan**
   - Komentar promosi atau di luar topik pembahasan.

File `src/utils/textClassifier.js` berisi fungsi sederhana `classifyComment()`
yang melakukan klasifikasi berbasis kata kunci. Daftar kata kunci saat ini:

- **Penghinaan:** `bodoh`, `goblok`, `idiot`, `tolol`, `bego`, `dungu`
- **Ujaran Kebencian:** `kafir`, `aseng`, `babi`, `anjing`, `monyet`

Kata kunci dapat diperluas sesuai kebutuhan untuk meningkatkan akurasi
pendeteksian komentar bernada negatif.
