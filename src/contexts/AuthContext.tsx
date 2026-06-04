import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Role } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: Role | null;
  connectionToken: string | null;
  loading: boolean;
  isRecovery: boolean;
  setIsRecovery: (val: boolean) => void;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [connectionToken, setConnectionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, connection_token')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching role from user_roles:', error);
        // Fallback to metadata if table is empty or error
        const metadataRole = user.user_metadata?.role;
        setRole(metadataRole === 'admin' ? 'admin' : 'guest');
      } else if (data) {
        setRole(data.role as Role);
        setConnectionToken(data.connection_token || null);
      } else {
        // Fallback
        setRole((user.user_metadata?.role as Role) || 'guest');
      }
    } catch (e) {
      console.error(e);
      setRole((user.user_metadata?.role as Role) || 'guest');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Gagal logout: ' + error.message);
    } else {
      toast.success('Berhasil logout');
    }
  };

  const refreshRole = async () => {
    if (user) {
      setLoading(true);
      await fetchUserRole(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, connectionToken, loading, isRecovery, setIsRecovery, logout, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
