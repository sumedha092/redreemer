import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AIAlert {
  id: number;
  message: string;
  level: 'warning' | 'danger';
  tool: string;
  timestamp: Date;
  read: boolean;
}

interface AIAlertContextType {
  alerts: AIAlert[];
  addAlert: (message: string, level: 'warning' | 'danger', tool?: string) => void;
  markRead: (id: number) => void;
  clearAll: () => void;
  unreadCount: number;
}

const AIAlertContext = createContext<AIAlertContextType>({
  alerts: [],
  addAlert: () => {},
  markRead: () => {},
  clearAll: () => {},
  unreadCount: 0,
});

export function AIAlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);

  const addAlert = useCallback((message: string, level: 'warning' | 'danger', tool = '') => {
    setAlerts(prev => {
      // Deduplicate — don't add same message twice
      if (prev.some(a => a.message === message)) return prev;
      return [{ id: Date.now(), message, level, tool, timestamp: new Date(), read: false }, ...prev];
    });
  }, []);

  const markRead = useCallback((id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const clearAll = useCallback(() => setAlerts([]), []);

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <AIAlertContext.Provider value={{ alerts, addAlert, markRead, clearAll, unreadCount }}>
      {children}
    </AIAlertContext.Provider>
  );
}

export const useAIAlerts = () => useContext(AIAlertContext);
