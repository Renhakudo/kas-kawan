"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type WalletType = {
  id: string;
  name: string;
  is_primary: boolean;
};

type WalletContextType = {
  wallets: WalletType[];
  selectedWalletId: string;
  setSelectedWalletId: (id: string) => void;
  loadingWallets: boolean;
  refreshWallets: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [loadingWallets, setLoadingWallets] = useState(true);
  const supabase = createClient();

  // INOVASI: Logic untuk set dompet terpilih sekaligus simpan ke memori lokal
  const handleSetSelectedWallet = useCallback((id: string) => {
    setSelectedWalletId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("kaskawan_last_wallet", id);
    }
  }, []);

  const fetchWallets = useCallback(async () => {
    setLoadingWallets(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoadingWallets(false);
      return;
    }

    const { data } = await supabase
      .from("wallets")
      .select("id, name, is_primary")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      // Deduplicate dengan gaya modern (Array filter)
      const unique = data.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
      setWallets(unique);
      
      // INOVASI: Ambil dompet terakhir yang dipakai dari localStorage
      const savedId = typeof window !== "undefined" ? localStorage.getItem("kaskawan_last_wallet") : null;
      const walletStillExists = unique.find(w => w.id === savedId);

      if (savedId && walletStillExists) {
        setSelectedWalletId(savedId);
      } else {
        // Fallback ke primary atau dompet pertama
        const primary = unique.find((w: WalletType) => w.is_primary) || unique[0];
        setSelectedWalletId(primary.id);
      }
    }
    setLoadingWallets(false);
  }, [supabase]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return (
    <WalletContext.Provider 
      value={{ 
        wallets, 
        selectedWalletId, 
        setSelectedWalletId: handleSetSelectedWallet, // Pakai fungsi baru yang ada memori
        loadingWallets, 
        refreshWallets: fetchWallets 
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}