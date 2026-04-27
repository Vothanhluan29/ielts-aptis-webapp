import { useState, useEffect, useMemo } from 'react';
import { listeningStudentApi } from '../../../api/IELTS/listening/listeningStudentApi'; 

export const useListeningHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await listeningStudentApi.getMyHistory();

        const data = Array.isArray(response) ? response : response.data || [];
        setHistory(data);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);


  const best = useMemo(() => {
    if (history.length === 0) return null;
    return Math.max(...history.map((h) => h.band_score || 0));
  }, [history]);

  /* Lọc danh sách */
  const filtered = useMemo(() => {
    return history.filter((item) => {

      const titleToSearch = item.test?.title || item.test_title || '';
      
      const matchSearch =
        titleToSearch.toLowerCase().includes(search.toLowerCase()) ||
        String(item.id).includes(search);

      const score = item.band_score ?? 0;
      const matchFilter =
        filter === 'ALL' ||
        (filter === 'HIGH' && score >= 7) ||
        (filter === 'MID' && score >= 5.5 && score < 7) ||
        (filter === 'LOW' && score < 5.5);

      return matchSearch && matchFilter;
    });
  }, [history, search, filter]);

  return {
    history,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    filtered,
    best
  };
};