import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { tipsApi } from '../services/tipsApi';

export const useTips = (initialPageSize = 9) => {
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * pageSize;
      const params = {
        skip,
        limit: pageSize,
        category: category !== 'ALL' ? category : undefined,
        search: searchQuery.trim() || undefined,
      };

      const res = await tipsApi.getTipsList(params);
      setTips(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch tips:', err);
      message.error('Could not load tips. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, category, searchQuery]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  return {
    loading,
    tips,
    total,
    currentPage,
    pageSize,
    totalPages,
    category,
    searchQuery,
    setCategory: handleCategoryChange,
    setSearchQuery: handleSearchChange,
    setCurrentPage: handlePageChange,
    refetch: fetchTips,
  };
};
