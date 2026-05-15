"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Save, Wallet, Store, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopName, setShopName] = useState("Toko Saya");
  const [wallets, setWallets] = useState<{ id: string; name: string; is_primary: boolean }[]>([]);
  const [newWalletName, setNewWalletName] = useState("");
  const { refreshWallets } = useWallet();

  const supabase = createClient();

  const fetchProfileAndWallets = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Profile
    let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (!profile) {
      const { data: newProfile } = await supabase.from("profiles").insert({ id: user.id, shop_name: "Toko Saya" }).select().single();
      profile = newProfile;
    }
    if (profile) setShopName(profile.shop_name);

    // Fetch Wallets
    const { data: userWallets } = await supabase.from("wallets").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
    
    if (!userWallets || userWallets.length === 0) {
      const { data: newWallet } = await supabase.from("wallets").insert({ user_id: user.id, name: "Dompet Utama", is_primary: true }).select().single();
      if (newWallet) setWallets([newWallet]);
    } else {
      setWallets(userWallets);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileAndWallets();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("profiles").update({ shop_name: shopName, updated_at: new Date().toISOString() }).eq("id", user.id);
      if (error) toast.error("Gagal menyimpan nama toko");
      else toast.success("Profil berhasil diperbarui");
    }
    setSaving(false);
  };

  const handleAddWallet = async () => {
    if (!newWalletName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newWallet, error } = await supabase.from("wallets").insert({
      user_id: user.id,
      name: newWalletName.trim(),
      is_primary: false
    }).select().single();

    if (error) {
      toast.error("Gagal menambahkan dompet");
    } else if (newWallet) {
      toast.success("Dompet ditambahkan");
      setWallets([...wallets, newWallet]);
      setNewWalletName("");
      refreshWallets();
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (wallets.length <= 1) {
      toast.error("Tidak dapat menghapus satu-satunya dompet");
      return;
    }
    const { error } = await supabase.from("wallets").delete().eq("id", id);
    if (error) toast.error("Gagal menghapus dompet");
    else {
      toast.success("Dompet dihapus");
      setWallets(wallets.filter(w => w.id !== id));
      refreshWallets();
    }
  };

  // ── LOADING SKELETON (PREMIUM) ──
  if (loading) return (
    <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div className="skeleton" style={{ width: "240px", height: "36px", borderRadius: "8px", margin: "0 auto 12px" }} />
        <div className="skeleton" style={{ width: "300px", height: "16px", borderRadius: "4px", margin: "0 auto" }} />
      </div>
      <div className="glass-card" style={{ padding: "clamp(20px, 4vw, 32px)", borderRadius: "24px", height: "220px" }}>
        <div className="skeleton" style={{ width: "100%", height: "100%", borderRadius: "16px" }} />
      </div>
      <div className="glass-card" style={{ padding: "clamp(20px, 4vw, 32px)", borderRadius: "24px", height: "340px" }}>
        <div className="skeleton" style={{ width: "100%", height: "100%", borderRadius: "16px" }} />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ── HEADER HALAMAN ── */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "8px" }}>
          Pengaturan
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px", fontWeight: 500 }}>
          Kelola identitas bisnis dan dompet kas Anda.
        </p>
      </div>

      {/* ── KARTU 1: PROFIL BISNIS ── */}
      <div className="glass-card animate-fade-in-up" style={{ padding: "clamp(20px, 4vw, 32px)", borderRadius: "24px", background: "var(--bg-card)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--accent-light)", flexShrink: 0 }}>
            <Store size={24} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: "2px" }}>Profil Bisnis</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>Nama toko yang akan tampil di laporan</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Nama Toko / Bisnis
            </label>
            <input 
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Masukkan nama toko..."
              style={{ 
                width: "100%", padding: "14px 16px", borderRadius: "12px", background: "var(--bg-elevated)", 
                border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "15px", fontWeight: 600,
                outline: "none", transition: "border-color 0.2s", fontFamily: "inherit"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>
          
          <button 
            onClick={handleSaveProfile}
            disabled={saving}
            className="btn-primary"
            style={{ 
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", 
              padding: "14px 24px", borderRadius: "12px", fontSize: "15px", fontWeight: 700,
              boxShadow: "0 4px 16px var(--accent-glow)"
            }}
          >
            {saving ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={18} />}
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* ── KARTU 2: MANAJEMEN DOMPET ── */}
      <div className="glass-card animate-fade-in-up" style={{ padding: "clamp(20px, 4vw, 32px)", borderRadius: "24px", background: "var(--bg-card)", animationDelay: "0.1s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--color-balance-bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-balance-border)", flexShrink: 0 }}>
            <Wallet size={24} color="var(--color-balance)" />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: "2px" }}>Manajemen Dompet</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>Kelola tempat penyimpanan dana Anda</p>
          </div>
        </div>

        {/* Daftar Dompet */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {wallets.map((wallet) => (
            <div 
              key={wallet.id} 
              style={{ 
                display: "flex", alignItems: "center", justifyContent: "space-between", 
                background: "var(--bg-elevated)", padding: "14px 16px", borderRadius: "14px", 
                border: "1px solid var(--border)", transition: "all 0.2s ease" 
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Wallet size={16} color={wallet.is_primary ? "var(--color-balance)" : "var(--text-muted)"} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: 700 }}>{wallet.name}</span>
                  {wallet.is_primary && (
                    <span style={{ fontSize: "11px", marginTop: "4px", padding: "2px 8px", background: "var(--color-balance-bg)", color: "var(--color-balance)", border: "1px solid var(--color-balance-border)", borderRadius: "100px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", alignSelf: "flex-start" }}>
                      Dompet Utama
                    </span>
                  )}
                </div>
              </div>
              
              {!wallet.is_primary && (
                <button 
                  onClick={() => handleDeleteWallet(wallet.id)} 
                  style={{ 
                    background: "var(--bg-card)", border: "1px solid var(--border)", cursor: "pointer", 
                    color: "var(--text-muted)", width: "36px", height: "36px", borderRadius: "10px", 
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", flexShrink: 0 
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--color-danger)"; e.currentTarget.style.background = "var(--color-expense-bg)"; e.currentTarget.style.borderColor = "var(--color-expense-border)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  title="Hapus Dompet"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Form Tambah Dompet */}
        <div style={{ paddingTop: "20px", borderTop: "1px dashed var(--border)" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Tambah Dompet Baru
          </label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input 
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              placeholder="Contoh: Rekening BCA, Laci Kasir..."
              style={{ 
                flex: "1 1 200px", padding: "12px 16px", borderRadius: "12px", background: "var(--bg-elevated)", 
                border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 500,
                outline: "none", transition: "border-color 0.2s", fontFamily: "inherit"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--color-balance)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
              onKeyDown={(e) => e.key === "Enter" && handleAddWallet()}
            />
            <button 
              onClick={handleAddWallet}
              disabled={!newWalletName.trim()}
              style={{ 
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", 
                padding: "12px 20px", borderRadius: "12px", 
                background: newWalletName.trim() ? "var(--color-balance)" : "var(--bg-elevated)", 
                color: newWalletName.trim() ? "white" : "var(--text-muted)", 
                fontWeight: 700, fontSize: "14px", border: "1px solid",
                borderColor: newWalletName.trim() ? "var(--color-balance)" : "var(--border)",
                cursor: newWalletName.trim() ? "pointer" : "not-allowed", 
                transition: "all 0.2s", flexShrink: 0
              }}
            >
              <PlusCircle size={18} />
              Tambah
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

