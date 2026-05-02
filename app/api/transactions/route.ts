import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const walletId = searchParams.get("wallet_id");

  // Get current month boundaries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false });

  if (walletId) {
    query = query.eq("wallet_id", walletId);
  }

  const { data: transactions, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also fetch user wallets for dashboard switcher
  const { data: wallets } = await supabase
    .from("wallets")
    .select("id, name, is_primary")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ transactions, startOfMonth, wallets: wallets || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, amount, category, description, transaction_date, receipt_image_url, wallet_id } = body;

  if (!type || !amount || !category) {
    return NextResponse.json(
      { error: "Type, amount, dan category wajib diisi" },
      { status: 400 }
    );
  }

  let finalWalletId = wallet_id;
  if (!finalWalletId) {
    const { data: primaryWallet } = await supabase.from("wallets").select("id").eq("user_id", user.id).eq("is_primary", true).single();
    if (primaryWallet) {
      finalWalletId = primaryWallet.id;
    }
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      wallet_id: finalWalletId || null,
      type,
      amount: parseFloat(amount),
      category,
      description: description || null,
      transaction_date: transaction_date || new Date().toISOString(),
      receipt_image_url: receipt_image_url || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ transaction: data }, { status: 201 });
}
