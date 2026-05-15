# 💸 Kas Kawan Enterprise

**KasKawan** adalah aplikasi *Software as a Service* (SaaS) manajemen keuangan tingkat *Enterprise* yang dirancang khusus untuk membantu UMKM (Usaha Mikro, Kecil, dan Menengah) dalam mencatat, memantau, dan menganalisis arus kas mereka dengan sangat mudah. 

Dibangun dengan antarmuka **Bento Box Design** yang modern, fitur *Multi-Wallet*, hingga integrasi **Asisten AI**, KasKawan membawa pengalaman pencatatan keuangan ke level selanjutnya.

---

## ✨ Fitur Utama (Core Features)

### 📊 1. Dashboard Analitik Cerdas (Bento UI)
* **Ringkasan Keuangan:** Pantau Saldo Bersih, Total Pemasukan, dan Total Pengeluaran dalam satu pandangan.
* **Grafik Interaktif:** Visualisasi arus kas (Cash Flow) yang membandingkan pemasukan dan pengeluaran secara real-time.
* **Filter Periode:** Filter data berdasarkan Hari Ini, Minggu Ini, Bulan Ini, Tahun Ini, Semua Data, atau *Custom Date Range*.
* **Export Laporan:** Unduh laporan keuangan ke format **PDF** atau **CSV** dengan sekali klik.

### 💳 2. Manajemen Multi-Dompet (Smart Wallets)
* **Banyak Cabang/Sumber:** Buat banyak dompet sekaligus (Contoh: Laci Kasir, Rekening BCA, OVO, dll).
* **Global Wallet Switcher:** Ganti dompet yang sedang aktif dari mana saja melalui navigasi atas (Top Bar). Sistem akan mengingat pilihan dompet terakhir Anda menggunakan *Local Storage*.
* **Dompet Utama:** Tetapkan satu dompet sebagai sumber dana utama (Primary Wallet).

### ✍️ 3. Trio Metode Pencatatan (Omni-Input)
* **Manual Input:** Form pencatatan cepat dengan pilihan kategori dinamis dan desain responsif (Tombol di Desktop, Dropdown di Mobile).
* **Scan Struk (OCR):** Cukup foto struk belanja, biarkan sistem membaca total transaksinya.
* **Voice Input:** Catat transaksi hanya dengan berbicara (Input Suara).

### 🤖 4. KasKawan AI Assistant
* Asisten virtual bertenaga AI yang siap membantu menjawab pertanyaan seputar keuangan bisnis Anda.
* Dibekali fitur *Floating Chat Bubble* yang modern dan tidak mengganggu area kerja.

### 🎨 5. Theme Customizer (Personalisasi Brand)
* **Dark Mode & Light Mode:** Sesuaikan kenyamanan mata Anda.
* **Custom Brand Color:** Ubah warna utama (*Primary*), teks, dan aksen aplikasi menggunakan *Native Color Picker* agar sesuai dengan identitas bisnis UMKM Anda.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** CSS Modules / Custom CSS Variables (Responsive & Adaptive)
* **Database & Auth:** [Supabase](https://supabase.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Charts:** [Recharts](https://recharts.org/)
* **Forms & Validation:** React Hook Form + Zod
* **Notifications:** Sonner
* **Export Tools:** jsPDF + autoTable

---

## 🚀 Panduan Instalasi (Getting Started)

Ikuti langkah-langkah di bawah ini untuk menjalankan KasKawan di mesin lokal Anda.

### 1. Clone Repository
```bash
git clone https://github.com/Renhakudo/kas-kawan.git
cd kaskawan
```

### 2. Install Dependencies
```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env.local` di *root directory* proyek Anda dan masukkan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
```

### 4. Setup Database (Supabase Migrations)
Aplikasi ini membutuhkan struktur tabel tertentu agar dapat berjalan. Jalankan skrip SQL yang telah disediakan melalui SQL Editor di *dashboard* Supabase Anda:

1. Buka file `supabase-migration.sql` (berisi skema dasar seperti profil, transaksi, dll) lalu *Run* di Supabase.
2. Buka file `supabase/migrations/add_wallets.sql` (berisi pembaruan skema untuk fitur Multi-Wallet) lalu *Run* di Supabase.

### 5. Jalankan Development Server
```bash
npm run dev
# atau
yarn dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

---

## 📖 Cara Penggunaan (User Guide)

1. **Registrasi/Login:** Buat akun baru atau masuk menggunakan akun yang sudah ada. Profil awal (nama toko) akan terbuat otomatis.
2. **Setup Dompet:** Pergi ke halaman **Pengaturan**, tambahkan dompet sesuai kebutuhan bisnis Anda (misal: "Kasir Depan").
3. **Mencatat Transaksi:** Klik menu **Catat Transaksi**, pastikan *Global Wallet Switcher* (di atas layar) menunjukkan dompet yang benar, lalu masukkan data pengeluaran/pemasukan.
4. **Kustomisasi Tema:** Klik ikon **Palet Warna** (Theme Customizer) yang melayang di sebelah kanan layar untuk menyesuaikan warna aplikasi dengan warna *brand* Anda.
5. **Analitik & Export:** Buka halaman **Dashboard**, pilih rentang tanggal, lalu klik tombol **PDF** atau **CSV** untuk mengunduh laporan keuangan.

---

## 📱 Responsivitas Layar

Aplikasi ini dibangun dengan pendekatan *Mobile-First*. 
- **Di Desktop:** Tampilan terbagi dalam *Grid* yang luas, *Sidebar Navigation* yang statis, dan layout *Bento Box*.
- **Di Layar Mobile:** Navigasi berubah menjadi menu *Hamburger* (*Drawer*), *Global Wallet Switcher* terintegrasi rapi di *header* atas, dan semua form serta tabel beradaptasi agar tidak rusak (*no horizontal scroll*).

by :
1. Mochamad Danu Syarifudin
2. Muhammad Hilmi Mu'afa
---

## 🤝 Kontribusi

Saran, masukan, dan kontribusi sangat diterima! Silakan buka *Issue* atau buat *Pull Request* jika Anda ingin menambahkan fitur baru atau memperbaiki *bug*.
