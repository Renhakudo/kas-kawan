"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TrendingUp, Mail, Lock, User, UserPlus, Loader2 } from "lucide-react";

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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "radial-gradient(ellipse at top, hsl(142 71% 45% / 0.07) 0%, transparent 55%), hsl(220 20% 7%)",
      }}
    >
      <div
        className="glass-card animate-fade-in-up"
        style={{ width: "100%", maxWidth: 420, padding: "40px 36px" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, hsl(142 71% 45%), hsl(161 94% 30%))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 32px hsl(142 71% 45% / 0.35)",
            }}
          >
            <TrendingUp size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Buat Akun Baru
          </h1>
          <p style={{ color: "hsl(215 20% 60%)", marginTop: 6, fontSize: 14 }}>
            Mulai kelola keuangan UMKM Anda
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "hsl(215 20% 70%)", marginBottom: 6 }}>
              Nama Bisnis / Nama Anda
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "hsl(215 20% 50%)" }} />
              <input
                id="register-name"
                className="input-field"
                type="text"
                placeholder="Toko Maju Jaya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: 42 }}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "hsl(215 20% 70%)", marginBottom: 6 }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "hsl(215 20% 50%)" }} />
              <input
                id="register-email"
                className="input-field"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 42 }}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "hsl(215 20% 70%)", marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "hsl(215 20% 50%)" }} />
              <input
                id="register-password"
                className="input-field"
                type="password"
                placeholder="Min. 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 42 }}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              fontSize: 15,
              padding: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <UserPlus size={18} />
            )}
            {loading ? "Membuat akun..." : "Daftar Sekarang"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "hsl(215 20% 55%)" }}>
          Sudah punya akun?{" "}
          <Link href="/login" style={{ color: "hsl(142 71% 55%)", fontWeight: 600, textDecoration: "none" }}>
            Masuk
          </Link>
        </p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
