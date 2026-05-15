"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  List,
  Menu,
  X,
  Settings,
  Wallet,
  Bell,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { AIChatBubble } from "@/components/chat/AIChatBubble";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { WalletProvider } from "@/components/WalletProvider";
import { GlobalWalletSwitcher } from "@/components/GlobalWalletSwitcher";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/input", icon: PlusCircle, label: "Catat Transaksi" },
  { href: "/transactions", icon: List, label: "Riwayat Kas" },
  { href: "/profile", icon: Settings, label: "Pengaturan" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("shop_name").eq("id", user.id).single();
        setUserName(profile?.shop_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "");
        setUserEmail(user.email || "");
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Berhasil keluar");
    router.push("/");
    router.refresh();
  };

  const SidebarContent = () => (
    // DITAMBAH: overflowY: "auto" biar aman di layar HP kecil
    <div className="sidebar-scroll" style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--sidebar-bg)", overflowY: "auto", overflowX: "hidden" }}>
      {/* Logo Section */}
      <div style={{ padding: "32px 24px 24px", flexShrink: 0 }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <img 
            src="/logo.png" 
            alt="Kas Kawan" 
            style={{ height: "38px", width: "auto", objectFit: "contain", display: "block" }} 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'flex');
            }}
          />
          <div style={{ display: "none", width: "38px", height: "38px", borderRadius: "10px", background: "var(--accent)", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "white" }}>K</div>
          
          <div>
            <div style={{ fontWeight: 900, fontSize: "18px", letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.2 }}>
              Kas <span style={{ color: "var(--accent)" }}>Kawan</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              Enterprise
            </div>
          </div>
        </Link>
      </div>

      {/* Mini Profile Card */}
      <div style={{ padding: "0 16px 24px", flexShrink: 0 }}>
        <div style={{ 
          padding: "16px", borderRadius: "16px", background: "var(--bg-elevated)", 
          border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" 
        }}>
          <div style={{ 
            width: "36px", height: "36px", borderRadius: "10px", 
            background: "var(--accent-muted)", border: "1px solid var(--accent-light)",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--accent)", flexShrink: 0 
          }}>
            {userName.charAt(0).toUpperCase() || "U"}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: "13px", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName || "Memuat..."}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "0 12px", flex: 1 }}>
        <p style={{ 
          paddingLeft: "12px", fontSize: "11px", fontWeight: 800, 
          color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1.5px" 
        }}>
          Menu Utama
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{ 
                marginBottom: "4px", padding: "12px 14px", borderRadius: "12px",
                background: active ? "var(--accent-muted)" : "transparent",
                border: active ? "1px solid var(--accent-light)" : "1px solid transparent",
                display: "flex", alignItems: "center", gap: "12px",
                textDecoration: "none",
                transition: "all 0.2s ease", color: active ? "var(--accent)" : "var(--text-secondary)",
                fontWeight: active ? 800 : 600
              }}
            >
              <div style={{ color: active ? "var(--accent)" : "var(--text-muted)", display: "flex", alignItems: "center" }}>
                <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span style={{ fontSize: "14px" }}>{item.label}</span>
              {active && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Sidebar: Wallet Status */}
      {/* DITAMBAH: Padding bottom diperbesar jadi 48px biar nggak mepet bawah layar */}
      <div style={{ padding: "16px 16px 48px", flexShrink: 0 }}>
        <div style={{ padding: "16px", borderRadius: "16px", background: "var(--bg-card)", border: "1px dashed var(--border)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Wallet size={14} color="var(--accent)" />
            <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>Status Dompet</span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
            Kelola saldo & cabang di <Link href="/profile" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }} onClick={() => setMobileOpen(false)}>sini</Link>
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{ 
            marginTop: "16px", width: "100%", padding: "12px", borderRadius: "12px",
            border: "1px solid transparent", background: "transparent", 
            display: "flex", alignItems: "center", gap: "12px", cursor: "pointer",
            color: "var(--text-muted)", fontWeight: 600, fontSize: "14px", transition: "all 0.2s"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "var(--color-expense)";
            e.currentTarget.style.background = "var(--color-expense-bg)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut size={18} /> Keluar Aplikasi
        </button>
      </div>
    </div>
  );

  return (
    <WalletProvider>
      <div style={{ display: "flex", minHeight: "100dvh", background: "var(--bg-page)", color: "var(--text-primary)", overflowX: "hidden" }}>
        
        {/* ── DESKTOP SIDEBAR ── */}
        <aside
          style={{ width: "280px", background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 }}
          className="hidden-mobile"
        >
          <SidebarContent />
        </aside>

        {/* ── MOBILE HEADER ── */}
        <div
          className="mobile-header"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, height: "64px",
            background: "var(--sidebar-bg)", borderBottom: "1px solid var(--sidebar-border)",
            display: "none", alignItems: "center", justifyContent: "space-between",
            padding: "0 16px", zIndex: 100, backdropFilter: "blur(12px)"
          }}
        >
          {/* KIRI: Hamburger Menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ 
              background: "var(--bg-elevated)", border: "1px solid var(--border)", 
              borderRadius: "10px", color: "var(--text-primary)", width: "40px", height: "40px",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {/* KANAN: Tombol Dompet */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <GlobalWalletSwitcher />
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        {mobileOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(8px)" }} onClick={() => setMobileOpen(false)} className="animate-fade-in">
            <aside style={{ width: "280px", height: "100%", background: "var(--sidebar-bg)", boxShadow: "20px 0 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* ── MAIN CONTENT AREA ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }} className="main-content">
          
          {/* TOP BAR DESKTOP */}
          <header
            style={{
              height: "72px", padding: "0 40px", display: "flex", alignItems: "center",
              justifyContent: "flex-end", gap: "16px", position: "sticky", top: 0,
              background: "color-mix(in srgb, var(--bg-page) 80%, transparent)", 
              backdropFilter: "blur(12px)", zIndex: 90, borderBottom: "1px solid transparent"
            }}
            className="hidden-mobile"
          >
            <GlobalWalletSwitcher />
            
            <div style={{ height: "24px", width: "1px", background: "var(--border)", margin: "0 8px" }} />
            
            <button style={{ 
              width: "40px", height: "40px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
            }} title="Notifikasi" onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <Bell size={18} />
            </button>

            <Link href="/profile" style={{ textDecoration: "none" }}>
              <div style={{ 
                padding: "6px 6px 6px 16px", borderRadius: "100px", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", transition: "all 0.2s"
              }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{userName || "User"}</span>
                <div style={{ 
                  width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-muted)", border: "1px solid var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontWeight: 800, fontSize: "12px"
                }}>
                  {userName.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
            </Link>
          </header>

          {/* ── KONTEN HALAMAN ── */}
          <main className="animate-fade-in global-page-wrapper">
            {children}
          </main>
        </div>

        <AIChatBubble />
        <ThemeCustomizer />
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
        
        .main-content { margin-left: 280px; }

        .global-page-wrapper {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 40px 80px; 
          box-sizing: border-box;
        }

        /* Custom Scrollbar untuk Sidebar biar rapi pas di-scroll */
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 10px;
        }
        
        @media (max-width: 1024px) {
          .hidden-mobile { display: none !important; }
          .mobile-header { display: flex !important; }
          .main-content { margin-left: 0 !important; }
          .global-page-wrapper { padding: 88px 20px 140px; }
        }
      `}</style>
    </WalletProvider>
  );
}
