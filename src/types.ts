export type Role = 'admin' | 'guest';

export interface UserRole {
  user_id: string;
  role: Role;
  connection_token?: string;
}

export interface ParentAdminLink {
  parent_id: string;
  admin_id: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  created_at: string;
  transaction_date: string;
  type: 'pemasukan' | 'pengeluaran';
  amount: number;
  category: string;
  notes: string;
}
