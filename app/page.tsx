"use client";

import Link from "next/link";
import {
  Camera,
  Mic,
  MessageSquare,
  ArrowRight,
  BarChart3,
  Receipt,
  Smartphone,
  ChevronRight,
  Sparkles,
  Zap,
  CheckCircle,
  Keyboard // Tambahan icon buat Manual Input
} from "lucide-react";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
        fontFamily: "inherit",
        overflowX: "hidden",
      }}
    >
      {/* --- NAVBAR (STATIC / TIDAK FIXED) --- */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 5%",
          background: "var(--bg-page)",
          borderBottom: "1px solid var(--border)",
          height: "77px", // Fix height untuk kalkulasi Hero
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* PLACEHOLDER LOGO.PNG */}
          <img 
            src="/logo.png" 
            alt="KasKawan" 
            style={{ 
              height: "36px", 
              width: "auto", 
              objectFit: "contain",
              display: "block" 
            }} 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'flex');
            }}
          />
          {/* Fallback Text Logo */}
          <div style={{ display: "none", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: 16 }}>K</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 22, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>KasKawan.</span>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginRight: "12px", cursor: "pointer" }}>Masuk</span>
          </Link>
          <Link href="/register">
            <button className="btn-primary" style={{ borderRadius: "100px", padding: "10px 24px" }}>
              Daftar Gratis
            </button>
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION (1 HALAMAN FULL) --- */}
      <header
        style={{
          minHeight: "calc(100vh - 77px)", // 100vh dikurangi tinggi Navbar
          padding: "0 5%", // Top-bottom 0 karena pakai alignItems center
          display: "flex",
          flexWrap: "wrap",
          gap: "64px",
          alignItems: "center", // Otomatis ke tengah vertikal
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-page) 100%)",
        }}
      >
        {/* Kiri: Copywriting Asimetris */}
        <div className="animate-fade-in-up" style={{ flex: "1 1 260px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", background: "var(--accent-muted)", color: "var(--accent)", borderRadius: "100px", fontSize: "13px", fontWeight: 700, marginBottom: "24px" }}>
            <Sparkles size={16} /> Era Baru Pembukuan Warung
          </div>
          
          <h1 style={{ fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: "32px", color: "var(--text-primary)" }}>
            Catat Kas <br/>
            Cukup <span style={{ position: "relative", display: "inline-block" }}>
              Ngomong.
              <span style={{ position: "absolute", bottom: "8px", left: 0, width: "100%", height: "8px", background: "var(--accent)", opacity: 0.3, zIndex: -1 }}></span>
            </span>
          </h1>
          
          <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "40px", maxWidth: "90%" }}>
            Buang kalkulatormu. KasKawan pakai AI untuk mendengarkan suaramu dan membaca foto strukmu. Pembukuan UMKM selesai dalam 5 detik.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/register">
              <button className="btn-primary" style={{ padding: "16px 32px", fontSize: "16px", borderRadius: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                Mulai Pembukuan <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>

        {/* Kanan: Mockup Interaktif Chat AI */}
        <div className="animate-fade-in" style={{ flex: "1 1 260px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: "420px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "24px", overflow: "hidden", boxShadow: "var(--shadow-elevated)" }}>
            <div style={{ padding: "16px 24px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-danger)" }}></div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-warning)" }}></div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-income)" }}></div>
              <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px" }}>AI ASSISTANT</span>
            </div>
            
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ alignSelf: "flex-end", maxWidth: "80%" }}>
                <div style={{ background: "var(--accent)", color: "white", padding: "12px 16px", borderRadius: "16px 16px 0 16px", fontSize: "14px", lineHeight: 1.5 }}>
                  "Tolong catat ada pemasukan dari jual 5 porsi nasi goreng, total 75 ribu."
                </div>
              </div>
              
              <div style={{ alignSelf: "flex-start", maxWidth: "90%" }}>
                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "16px", borderRadius: "16px 16px 16px 0", fontSize: "14px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", color: "var(--text-primary)", fontWeight: 700 }}>
                    <CheckCircle size={18} color="var(--color-income)" /> Siap, sudah dicatat!
                  </div>
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px" }}>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Pemasukan Masuk</p>
                    <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--color-income)", marginBottom: "4px" }}>+ Rp 75.000</p>
                    <p style={{ fontSize: "13px", color: "var(--text-primary)" }}>Nasi Goreng (5 Porsi)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- BENTO BOX LAYOUT (1 HALAMAN FULL) --- */}
      <section style={{ 
        minHeight: "100vh", // FULL SCREEN
        padding: "60px 5%", 
        background: "var(--bg-page)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center" // Vertikal ke tengah
      }}>
        <div style={{ marginBottom: "48px", maxWidth: "600px" }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: "16px" }}>
            Bukan Aplikasi Kasir Biasa.
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "18px" }}>Kami mendesain ulang cara UMKM melakukan pembukuan. Lupakan form panjang, cukup gunakan kebiasaan Anda sehari-hari.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", gridAutoRows: "minmax(250px, auto)" }}>
          {/* Box 1: Besar */}
          <div className="glass-card" style={{ gridColumn: "1 / -1", padding: "clamp(24px, 5vw, 40px)", display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center", background: "var(--bg-elevated)" }}>
            <div style={{ flex: "1 1 260px" }}>
              <div style={{ width: 56, height: 56, background: "var(--color-income-bg)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", border: "1px solid var(--color-income-border)" }}>
                <Camera size={28} color="var(--color-income)" />
              </div>
              <h3 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "16px", color: "var(--text-primary)" }}>Scan Struk Belanja Kulakan</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.6 }}>Habis belanja bahan baku di pasar? Gak perlu rekap ulang malam harinya. Foto struknya pakai kamera HP, AI kami akan mengekstrak semua item dan nominal pengeluaran ke dalam laporan Anda secara otomatis.</p>
            </div>
            {/* Visualisasi Kertas Struk */}
            <div style={{ flex: "1 1 260px", display: "flex", justifyContent: "center" }}>
               <div style={{ width: "200px", background: "white", padding: "24px", border: "1px dashed #cbd5e1", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", transform: "rotate(3deg)" }}>
                  <div style={{ borderBottom: "1px dashed #94a3b8", paddingBottom: "12px", marginBottom: "12px", textAlign: "center" }}>
                    <p style={{ fontWeight: 800, color: "#0f172a", fontSize: "14px" }}>Toko Makmur</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "8px" }}><span>Telur 2kg</span><span>56.000</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "8px" }}><span>Beras 5kg</span><span>75.000</span></div>
                  <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "8px", marginTop: "12px", display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#0f172a" }}><span>Total</span><span>131.000</span></div>
               </div>
            </div>
          </div>

          {/* Box 2: Dashboard Cerdas */}
          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", background: "var(--bg-card)" }}>
            <div style={{ width: 48, height: 48, background: "var(--color-balance-bg)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
              <BarChart3 size={24} color="var(--color-balance)" />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "12px", color: "var(--text-primary)" }}>Dashboard Cerdas</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6, marginBottom: "32px", flexGrow: 1 }}>Grafik arus kas harian dan bulanan yang memperlihatkan kondisi keuangan bisnis tanpa perlu pusing baca tabel akuntansi.</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "80px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
               <div style={{ width: "20%", height: "40%", background: "var(--color-income)", borderRadius: "4px 4px 0 0", opacity: 0.5 }}></div>
               <div style={{ width: "20%", height: "70%", background: "var(--color-income)", borderRadius: "4px 4px 0 0", opacity: 0.7 }}></div>
               <div style={{ width: "20%", height: "50%", background: "var(--color-expense)", borderRadius: "4px 4px 0 0" }}></div>
               <div style={{ width: "20%", height: "100%", background: "var(--accent)", borderRadius: "4px 4px 0 0" }}></div>
            </div>
          </div>

          {/* Box 3: Tanya Kondisi Usaha */}
          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", background: "var(--bg-card)" }}>
            <div style={{ width: 48, height: 48, background: "var(--accent-muted)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
              <MessageSquare size={24} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "12px", color: "var(--text-primary)" }}>Tanya Kondisi Usaha</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6 }}>Gak perlu pusing nyari data. Chat aja: "Pengeluaran terbanyak minggu ini apa?" Sistem langsung rekap dan jawab seketika.</p>
          </div>

          {/* Box 4: Pencatatan Suara */}
          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", background: "var(--bg-card)" }}>
            <div style={{ width: 48, height: 48, background: "var(--accent-muted)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
              <Mic size={24} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "12px", color: "var(--text-primary)" }}>Pencatatan Suara</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6 }}>Lagi repot layani pelanggan? Cukup tekan tombol mic dan ucapkan transaksi Anda. AI kami akan langsung menerjemahkannya menjadi catatan kas.</p>
          </div>

          {/* Box 5: Input Manual Cepat */}
          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", background: "var(--bg-card)" }}>
            <div style={{ width: 48, height: 48, background: "hsl(38 92% 52% / 0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
              <Keyboard size={24} color="var(--color-warning)" />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "12px", color: "var(--text-primary)" }}>Input Manual Cepat</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6 }}>Lebih suka ketik sendiri? Tersedia form manual dengan antarmuka yang dirancang khusus agar 3x lebih cepat dari aplikasi kasir konvensional.</p>
          </div>

        </div>
      </section>

      {/* --- SEKSI "Masih Pakai Cara Lama" (1 HALAMAN FULL) --- */}
      <section style={{ 
        minHeight: "100vh", // FULL SCREEN
        padding: "60px 5%", 
        background: "var(--bg-elevated)", 
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center" // Vertikal ke tengah
      }}>
        <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: "64px", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 260px" }}>
             <h2 style={{ fontSize: "36px", fontWeight: 900, marginBottom: "24px", color: "var(--text-primary)" }}>Masih Pakai Cara Lama?</h2>
             <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "32px" }}>Beralih ke KasKawan dan rasakan hematnya waktu Anda setiap hari. Lebih banyak waktu untuk fokus melayani pelanggan.</p>
             <Link href="/register">
                <button className="btn-secondary" style={{ padding: "12px 24px", borderRadius: "8px", fontWeight: 700, display: "flex", gap: "8px", alignItems: "center" }}>
                  Mulai Transformasi <ChevronRight size={16} />
                </button>
             </Link>
          </div>

          <div style={{ flex: "2 1 260px", display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
            {[
              { text: "Buku lecek & bon numpuk hilang entah ke mana", type: "bad" },
              { text: "Uang modal & uang pribadi tercampur", type: "bad" },
              { text: "Pencatatan 90% lebih cepat dengan sistem AI", type: "good" },
              { text: "Laporan harian otomatis tanpa repot rekap ulang malam-malam", type: "good" },
            ].map((item, i) => (
              <div key={i} style={{ 
                padding: "20px 24px", 
                background: "var(--bg-card)", 
                borderLeft: `4px solid ${item.type === 'good' ? 'var(--color-income)' : 'var(--border)'}`,
                borderTop: "1px solid var(--border)",
                borderRight: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                borderRadius: "0 12px 12px 0",
                display: "flex",
                gap: "16px",
                alignItems: "center"
              }}>
                {item.type === 'good' 
                  ? <CheckCircle size={20} color="var(--color-income)" style={{ flexShrink: 0 }} /> 
                  : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
                }
                <span style={{ fontSize: "16px", color: item.type === 'good' ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: item.type === 'good' ? 700 : 500 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ padding: "64px 5% 32px", background: "var(--bg-page)", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "40px", marginBottom: "64px" }}>
          <div>
            <img src="/logo.png" alt="KasKawan" style={{ height: "28px", marginBottom: "16px", display: "block" }} 
              onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'block'); }} 
            />
            <div style={{ display: "none", fontWeight: 800, fontSize: 20, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "16px" }}>KasKawan.</div>
            
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "300px", lineHeight: 1.6 }}>
              Asisten pembukuan cerdas untuk warung dan UMKM Indonesia. Aman, cepat, dan anti ribet.
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "64px", flexWrap: "wrap" }}>
            <div>
              <h4 style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", fontSize: "14px" }}>Produk</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <a href="#" style={{ color: "var(--text-secondary)", fontSize: "14px", textDecoration: "none" }}>Fitur AI</a>
                <a href="#" style={{ color: "var(--text-secondary)", fontSize: "14px", textDecoration: "none" }}>Keamanan Data</a>
                <a href="#" style={{ color: "var(--text-secondary)", fontSize: "14px", textDecoration: "none" }}>Harga</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", fontSize: "14px" }}>Bantuan</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <a href="#" style={{ color: "var(--text-secondary)", fontSize: "14px", textDecoration: "none" }}>Cara Kerja</a>
                <a href="https://wa.me/6281234567890" style={{ color: "var(--accent)", fontSize: "14px", textDecoration: "none", fontWeight: 600 }}>Tanya WhatsApp</a>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "32px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>© 2026 KasKawan. Hak Cipta Dilindungi.</p>
          <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Zap size={14} /> Powered by Next.js & AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
