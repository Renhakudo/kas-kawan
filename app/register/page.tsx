"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, User, UserPlus, Loader2, CheckCircle, Sparkles, Quote } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Semua field wajib diisi");
      return;
    }
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi.");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div 
      style={{ 
        display: "flex", 
        height: "100dvh", // Menggunakan dvh agar akurat di mobile
        overflowY: "auto", // Mengizinkan scroll bawah jika layar terlalu pendek
        background: "var(--bg-page)", 
        fontFamily: "inherit", 
        color: "var(--text-primary)" 
      }}
    >
      
      {/* --- BAGIAN KIRI: FORM REGISTRASI --- */}
      <div 
        className="auth-form-section"
        style={{ 
          flex: "1 1 50%", 
          display: "flex", 
          flexDirection: "column", 
          padding: "5%", // Pakai persentase agar responsif
          position: "relative",
          justifyContent: "center"
        }}
      >
        {/* Logo */}
        <div className="logo-container" style={{ position: "absolute", top: "5%", left: "5%" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img 
              src="/logo.png" 
              alt="KasKawan" 
              style={{ height: "32px", width: "auto", objectFit: "contain", display: "block" }} 
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
              <span style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>KasKawan.</span>
            </div>
          </Link>
        </div>

        {/* Kontainer Form */}
        <div className="form-content" style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "1vh" }}>
            Daftar KasKawan
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "3vh", lineHeight: 1.5 }}>
            Mulai otomatisasi pembukuan UMKM Anda hari ini. Cepat, aman, dan gratis.
          </p>

          <form onSubmit={handleRegister} className="register-form" style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            {/* Name */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5vh", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Nama Bisnis / Anda
              </label>
              <div style={{ position: "relative" }}>
                <User size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  id="register-name"
                  className="input-field dynamic-input"
                  type="text"
                  placeholder="Contoh: Toko Maju Jaya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: "48px", paddingRight: "16px", height: "48px", borderRadius: "12px", background: "var(--bg-elevated)" }}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5vh", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  id="register-email"
                  className="input-field dynamic-input"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: "48px", paddingRight: "16px", height: "48px", borderRadius: "12px", background: "var(--bg-elevated)" }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5vh", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  id="register-password"
                  className="input-field dynamic-input"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: "48px", paddingRight: "16px", height: "48px", borderRadius: "12px", background: "var(--bg-elevated)" }}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn-primary dynamic-btn"
              disabled={loading}
              style={{
                fontSize: "16px",
                height: "52px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginTop: "1vh",
                boxShadow: "0 8px 24px var(--accent-glow)"
              }}
            >
              {loading ? (
                <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <UserPlus size={20} />
              )}
              {loading ? "Menyiapkan akun..." : "Daftar Sekarang"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "3vh", fontSize: "14px", color: "var(--text-secondary)" }}>
            Sudah punya akun?{" "}
            <Link href="/login" style={{ color: "var(--text-primary)", fontWeight: 800, textDecoration: "none", borderBottom: "1px solid var(--text-primary)", paddingBottom: "2px" }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* --- BAGIAN KANAN: VISUAL SAAS MODERN (Hanya Desktop) --- */}
      <div 
        className="auth-visual-section"
        style={{ 
          flex: "1 1 50%", 
          background: "radial-gradient(circle at top right, var(--color-income-bg) 0%, transparent 60%), var(--bg-elevated)", 
          borderLeft: "1px solid var(--border)",
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          padding: "5%",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", top: "10%", right: "10%", width: "300px", height: "300px", background: "var(--accent)", filter: "blur(150px)", opacity: 0.1, zIndex: 0 }}></div>

        <div className="animate-fade-in" style={{ position: "relative", zIndex: 1, maxWidth: "480px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--accent)", borderRadius: "100px", fontSize: "13px", fontWeight: 700, marginBottom: "3vh", boxShadow: "var(--shadow-card)" }}>
            <Sparkles size={16} /> Bergabung dengan 1.000+ UMKM
          </div>

          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: "3vh", letterSpacing: "-0.02em" }}>
            "Sejak pakai KasKawan, saya gak pernah lagi pusing cari bon yang hilang."
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "2vh", marginBottom: "5vh" }}>
            {[
              "Pencatatan suara dan foto struk otomatis",
              "Laporan harian dan bulanan instan",
              "100% aman dan data terenkripsi"
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <CheckCircle size={20} color="var(--color-income)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Testimonial Card */}
          <div className="glass-card" style={{ padding: "24px", background: "var(--bg-card)", borderRadius: "16px", position: "relative" }}>
            <Quote size={40} color="var(--border)" style={{ position: "absolute", top: "16px", right: "24px", opacity: 0.5 }} />
            <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.6, marginBottom: "16px", position: "relative", zIndex: 1, fontWeight: 500 }}>
              Sangat membantu buat saya yang gaptek akuntansi. Tinggal foto struk belanjaan kulakan, sistem langsung ngebaca dan masukin ke pengeluaran. Keren!
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px", flexShrink: 0 }}>
                BJ
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Budi Jaya</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Pemilik Toko Kelontong</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- CSS UNTUK RESPONSIVE & MENGHINDARI SCROLL --- */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Mobile Width Rules */
        @media (max-width: 900px) {
          .auth-visual-section {
            display: none !important;
          }
          .auth-form-section {
            flex: 1 1 100% !important;
            padding: 24px !important;
          }
          /* Ubah logo ke relative agar di mobile tidak nabrak form kalau layar HP nya pendek */
          .logo-container {
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            margin-bottom: 4vh;
            display: flex;
            justify-content: center;
          }
        }

        /* Rules untuk layar pendek (mencegah scroll walau tinggi mengecil) */
        @media (max-height: 700px) {
          .form-content h1 {
            font-size: 24px !important;
          }
          .form-content p {
            font-size: 14px !important;
            margin-bottom: 16px !important;
          }
          .register-form {
            gap: 12px !important;
          }
          .dynamic-input {
            height: 42px !important;
          }
          .dynamic-btn {
            height: 46px !important;
            font-size: 14px !important;
            margin-top: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
