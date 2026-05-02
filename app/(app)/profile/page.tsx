"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Save, Wallet, Store, PlusCircle, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopName, setShopName] = useState("Toko Saya");
  const [wallets, setWallets] = useState<{ id: string; name: string; is_primary: boolean }[]>([]);
  const [newWalletName, setNewWalletName] = useState("");

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
    }
  };

  if (loading) return <div style={{ padding: 40, color: "white" }}>Memuat...</div>;

  return (
    <div style={{ padding: "32px 28px", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 24 }}>Pengaturan Profil</h1>

      {/* Profile Form */}
      <div style={{ background: "hsl(220 20% 12%)", padding: 24, borderRadius: 16, border: "1px solid hsl(220 20% 18%)", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Store size={20} color="hsl(142 71% 55%)" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: 0 }}>Nama Toko / Bisnis</h2>
        </div>
        <input 
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="Masukkan nama toko..."
          style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "hsl(220 20% 8%)", border: "1px solid hsl(220 20% 20%)", color: "white", fontSize: 14, outline: "none", marginBottom: 16 }}
        />
        <button 
          onClick={handleSaveProfile}
          disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: "hsl(142 71% 45%)", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}
        >
          <Save size={16} />
          {saving ? "Menyimpan..." : "Simpan Profil"}
        </button>
      </div>

      {/* Wallets */}
      <div style={{ background: "hsl(220 20% 12%)", padding: 24, borderRadius: 16, border: "1px solid hsl(220 20% 18%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Wallet size={20} color="hsl(270 91% 65%)" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: 0 }}>Daftar Dompet</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {wallets.map((wallet) => (
            <div key={wallet.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "hsl(220 20% 8%)", padding: "12px 16px", borderRadius: 10, border: "1px solid hsl(220 20% 20%)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "white", fontSize: 14, fontWeight: 500 }}>{wallet.name}</span>
                {wallet.is_primary && (
                  <span style={{ fontSize: 10, padding: "2px 8px", background: "hsl(270 91% 65% / 0.2)", color: "hsl(270 91% 75%)", borderRadius: 20, fontWeight: 600 }}>Utama</span>
                )}
              </div>
              {!wallet.is_primary && (
                <button onClick={() => handleDeleteWallet(wallet.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(0 72% 51%)" }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input 
            value={newWalletName}
            onChange={(e) => setNewWalletName(e.target.value)}
            placeholder="Nama dompet baru (cth: BCA, Kasir)"
            style={{ flex: 1, padding: "10px 16px", borderRadius: 10, background: "hsl(220 20% 8%)", border: "1px solid hsl(220 20% 20%)", color: "white", fontSize: 14, outline: "none" }}
            onKeyDown={(e) => e.key === "Enter" && handleAddWallet()}
          />
          <button 
            onClick={handleAddWallet}
            disabled={!newWalletName.trim()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 16px", borderRadius: 10, background: newWalletName.trim() ? "hsl(270 91% 65%)" : "hsl(220 20% 20%)", color: "white", fontWeight: 600, border: "none", cursor: newWalletName.trim() ? "pointer" : "not-allowed" }}
          >
            <PlusCircle size={16} />
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
