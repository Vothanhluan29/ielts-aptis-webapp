import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import examAptisAdminApi from '../../../api/APTIS/exam/examAptisAdminApi';

export const useExamAptisSubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // State cho CEFR override modal
  const [cefrModalOpen, setCefrModalOpen] = useState(false);
  const [cefrLoading, setCefrLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examAptisAdminApi.getSubmissionDetail(id);
      setData(res.data || res);
    } catch {
      message.error('Unable to load submission data!');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleGrade = useCallback((label, subId) => {
    if (!data) return;
    if (label === 'Writing') {
      navigate(`/admin/aptis/submissions/writing/${subId}`, { state: { fromExamId: data.id } });
    } else if (label === 'Speaking') {
      navigate(`/admin/aptis/submissions/speaking/${subId}`, { state: { fromExamId: data.id } });
    }
  }, [navigate, data]);

  // Mở modal chỉnh CEFR
  const handleOpenCefrModal = useCallback(() => {
    setCefrModalOpen(true);
  }, []);

  // Lưu CEFR level do admin chọn
  const handleSaveCefr = useCallback(async (cefrLevel) => {
    if (!data) return;
    setCefrLoading(true);
    try {
      await examAptisAdminApi.updateCefrLevel(data.id, cefrLevel);
      message.success(`CEFR level updated to ${cefrLevel}`);
      setCefrModalOpen(false);
      await fetchDetail();
    } catch {
      message.error('Failed to update CEFR level!');
    } finally {
      setCefrLoading(false);
    }
  }, [data, fetchDetail]);

  // Giá trị tính toán:
  // overall = chỉ 4 kỹ năng chính, max /200 (Grammar&Vocab tách riêng)
  const isCompleted = data?.status === 'COMPLETED';
  const overall = data?.overall_score || 0;
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (overall / 200) * circumference;

  return {
    id,
    loading,
    data,
    isCompleted,
    overall,
    circumference,
    offset,
    fetchDetail,
    handleGrade,
    navigate,
    // CEFR modal
    cefrModalOpen,
    cefrLoading,
    handleOpenCefrModal,
    handleSaveCefr,
    setCefrModalOpen,
  };
};