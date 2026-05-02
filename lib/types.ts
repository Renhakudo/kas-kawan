export interface Transaction {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string | null;
  transaction_date: string;
  receipt_image_url: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  icon: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeChange: number;
  expenseChange: number;
}

export interface ChartDataPoint {
  date: string;
  income: number;
  expense: number;
}

export interface ParsedTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
