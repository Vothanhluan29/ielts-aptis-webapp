import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/axiosClient';

const FeedbackCountContext = createContext({ count: 0, refreshCount: () => {} });

export const useFeedbackCount = () => useContext(FeedbackCountContext);

export const FeedbackCountProvider = ({ children }) => {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const data = await api.get('/feedbacks/pending-count');
      setCount(data?.count ?? 0);
    } catch {
      // Fail silently — sidebar should not break on auth error
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return (
    <FeedbackCountContext.Provider value={{ count, refreshCount: fetchCount }}>
      {children}
    </FeedbackCountContext.Provider>
  );
};
