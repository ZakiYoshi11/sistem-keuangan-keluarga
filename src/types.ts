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

export interface Pocket {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  created_at: string;
  transaction_date: string;
  type: 'pemasukan' | 'pengeluaran';
  amount: number;
  category: string;
  pocket_id?: string;
  pockets?: { name: string };
  notes: string;
}
