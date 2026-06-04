import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function useAutoLogout(timeoutMs: number = 3 * 60 * 60 * 1000) {
  const { user, logout } = useAuth();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const resetTimeout = () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(async () => {
        toast.error("Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas selama 3 jam. Silakan masuk kembali.", { duration: 5000 });
        await logout();
      }, timeoutMs);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    let lastCall = 0;
    
    // Throttle the reset calls to max once every 5 seconds
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastCall < 5000) return;
      lastCall = now;
      resetTimeout();
    };

    // Add event listeners
    events.forEach(event => window.addEventListener(event, throttledReset));
    
    // Initialize the timer
    resetTimeout();

    // Cleanup
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      events.forEach(event => window.removeEventListener(event, throttledReset));
    };
  }, [user, logout, timeoutMs]);
}
