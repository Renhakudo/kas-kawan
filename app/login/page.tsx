"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, LogIn, Loader2, BarChart3, Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password wajib diisi");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Email atau password salah"
          : error.message
      );
    } else {
      toast.success("Berhasil masuk!");
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div 
      style={{ 
        display: "flex", 
        height: "100dvh", // Menggunakan dvh agar presisi di mobile
        overflowY: "auto", // Mengizinkan scroll bawah jika layar terlalu pendek
        background: "var(--bg-page)", 
        fontFamily: "inherit", 
        color: "var(--text-primary)" 
      }}
    >
      
      {/* --- BAGIAN KIRI: VISUAL SAAS MODERN (DIBALIK DARI REGISTER) --- */}
      <div 
        className="auth-visual-section"
        style={{ 
          flex: "1 1 50%", 
          background: "radial-gradient(circle at top left, var(--color-balance-bg) 0%, transparent 60%), var(--bg-elevated)", 
          borderRight: "1px solid var(--border)",
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          padding: "5%",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Logo Absolute di Kiri Atas (Versi Desktop) */}
        <div style={{ position: "absolute", top: "5%", left: "5%" }}>
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
            <div style={{ display: "none", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 16 }}>K</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>KasKawan.</span>
            </div>
          </Link>
        </div>

        {/* Elemen Dekoratif Glow */}
        <div style={{ position: "absolute", bottom: "10%", left: "10%", width: "300px", height: "300px", background: "var(--color-balance)", filter: "blur(150px)", opacity: 0.1, zIndex: 0 }}></div>

        <div className="animate-fade-in" style={{ position: "relative", zIndex: 1, maxWidth: "480px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--color-balance)", borderRadius: "100px", fontSize: "13px", fontWeight: 700, marginBottom: "3vh", boxShadow: "var(--shadow-card)" }}>
            <Sparkles size={16} /> Pantau Bisnis Anda
          </div>

          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: "3vh", letterSpacing: "-0.02em" }}>
            Selamat datang kembali. <br/> Mari cek keuntungan hari ini!
          </h2>

          <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginBottom: "5vh", lineHeight: 1.6 }}>
            Akses dashboard Anda untuk melihat ringkasan arus kas, laporan penjualan, dan wawasan bisnis yang ditenagai oleh AI.
          </p>

          {/* Mini Dashboard Mockup */}
          <div className="glass-card" style={{ padding: "24px", background: "var(--bg-card)", borderRadius: "16px", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Omset Minggu Ini</p>
                <p style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Rp 4.250.000</p>
              </div>
              <div style={{ background: "var(--color-income-bg)", color: "var(--color-income)", padding: "6px 10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 800 }}>
                <TrendingUp size={16} /> +12%
              </div>
            </div>

            {/* Simple Line Graph Mockup */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "60px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
               {[40, 55, 30, 70, 45, 90, 80].map((h, i) => (
                 <div key={i} style={{ flex: 1, background: i === 6 ? "var(--accent)" : "var(--color-balance-bg)", height: `${h}%`, borderRadius: "4px 4px 0 0", transition: "height 0.3s ease" }}></div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- BAGIAN KANAN: FORM LOGIN --- */}
      <div 
        className="auth-form-section"
        style={{ 
          flex: "1 1 50%", 
          display: "flex", 
          flexDirection: "column", 
          padding: "5%", 
          position: "relative",
          justifyContent: "center"
        }}
      >
        {/* Logo Khusus Mobile (Disembunyikan di Desktop) */}
        <div className="logo-container-mobile" style={{ display: "none", marginBottom: "4vh", justifyContent: "center" }}>
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
            <div style={{ display: "none", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 16 }}>K</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>KasKawan.</span>
            </div>
          </Link>
        </div>

        {/* Kontainer Form */}
        <div className="form-content animate-fade-in-up" style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "1vh" }}>
            Masuk Akun
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "3vh", lineHeight: 1.5 }}>
            Silakan masuk untuk melanjutkan pencatatan kas bisnis Anda.
          </p>

          <form onSubmit={handleLogin} className="login-form" style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5vh", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  id="login-email"
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
                  id="login-password"
                  className="input-field dynamic-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: "48px", paddingRight: "16px", height: "48px", borderRadius: "12px", background: "var(--bg-elevated)" }}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              id="login-submit"
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
                <LogIn size={20} />
              )}
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "3vh", fontSize: "14px", color: "var(--text-secondary)" }}>
            Belum punya akun?{" "}
            <Link href="/register" style={{ color: "var(--text-primary)", fontWeight: 800, textDecoration: "none", borderBottom: "1px solid var(--text-primary)", paddingBottom: "2px" }}>
              Daftar Gratis
            </Link>
          </p>
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
          .logo-container-mobile {
            display: flex !important;
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
          .login-form {
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
