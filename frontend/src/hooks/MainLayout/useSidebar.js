import { useCallback } from 'react';

export const useSidebar = ({ pathname }) => {
  const isActive = useCallback((path) => {
    if (!pathname) return false;
    return pathname.startsWith(path);
  }, [pathname]);

  return {
    isActive
  };
};