"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  PlusCircle,
  MessageSquare,
  LogOut,
  TrendingUp,
  List,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/input", icon: PlusCircle, label: "Catat Transaksi" },
  { href: "/transactions", icon: List, label: "Riwayat" },
  { href: "/assistant", icon: MessageSquare, label: "Asisten AI" },
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Berhasil keluar");
    router.push("/");
    router.refresh();
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "24px 20px 20px",
          borderBottom: "1px solid hsl(220 20% 18%)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "linear-gradient(135deg, hsl(142 71% 45%), hsl(161 94% 30%))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 16px hsl(142 71% 45% / 0.35)",
          }}
        >
          <TrendingUp size={22} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
            Kas <span className="gradient-text">Kawan</span>
          </div>
          <div style={{ fontSize: 11, color: "hsl(215 20% 55%)", marginTop: 1 }}>
            Asisten Keuangan UMKM
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "hsl(215 20% 45%)", letterSpacing: "0.08em", marginBottom: 8, paddingLeft: 8 }}>
          MENU
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                marginBottom: 4,
                textDecoration: "none",
                background: active
                  ? "linear-gradient(135deg, hsl(142 71% 45% / 0.2), hsl(161 94% 30% / 0.15))"
                  : "transparent",
                border: active ? "1px solid hsl(142 71% 45% / 0.3)" : "1px solid transparent",
                color: active ? "hsl(142 71% 65%)" : "hsl(215 20% 60%)",
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                transition: "all 0.15s ease",
              }}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid hsl(220 20% 18%)" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            borderRadius: 10,
            width: "100%",
            background: "transparent",
            border: "1px solid transparent",
            color: "hsl(215 20% 55%)",
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "hsl(0 72% 51% / 0.1)";
            (e.currentTarget as HTMLButtonElement).style.color = "hsl(0 72% 65%)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "hsl(215 20% 55%)";
          }}
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: 240,
          background: "hsl(220 20% 9%)",
          borderRight: "1px solid hsl(220 20% 14%)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
        }}
        className="hidden-mobile"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div
        className="mobile-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "hsl(220 20% 9% / 0.95)",
          borderBottom: "1px solid hsl(220 20% 14%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 40,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, hsl(142 71% 45%), hsl(161 94% 30%))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUp size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17 }}>
            Kas <span className="gradient-text">Kawan</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", color: "hsl(210 40% 96%)", cursor: "pointer", padding: 4 }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "hsl(220 20% 5% / 0.8)",
          }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            style={{
              width: 260,
              height: "100%",
              background: "hsl(220 20% 9%)",
              borderRight: "1px solid hsl(220 20% 14%)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: 240,
          minHeight: "100vh",
          background: "hsl(220 20% 7%)",
        }}
        className="main-content"
      >
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .main-content { margin-left: 0 !important; padding-top: 60px; }
          .mobile-header { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-header { display: none !important; }
        }
      `}</style>
    </div>
  );
}
