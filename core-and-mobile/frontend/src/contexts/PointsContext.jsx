import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const PointsContext = createContext();

export function PointsProvider({ children }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/users/${user.id}/balance`);
      setBalance(res.data.balance);
    } catch (err) {
      console.error('Failed to fetch balance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBalance();
  }, [user]);

  return (
    <PointsContext.Provider value={{ balance, loading, refreshBalance: fetchBalance }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  return useContext(PointsContext);
}