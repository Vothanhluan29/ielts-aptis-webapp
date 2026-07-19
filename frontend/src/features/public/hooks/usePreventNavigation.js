import React, { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

export const usePreventNavigation = (isPrevented = true, returnUrl = '/aptis/exam') => {
  const navigate = useNavigate();
  const location = useLocation();
  const modalOpenRef = useRef(false);
  const prevHashRef = useRef(location.hash);

  // 1. Prevent tab closing or reloading (Browser Native)
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isPrevented) {
        event.preventDefault();
        const message = 'The system will not save your progress. Are you sure you want to leave?';
        event.returnValue = message;
        return message;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPrevented]);

  // 2. Prevent back button (React Router Safe Hash Trick)
  useEffect(() => {
    if (!isPrevented) return;

    const currentHash = location.hash;
    const prevHash = prevHashRef.current;
    prevHashRef.current = currentHash; // Cập nhật cho lần render tiếp theo

    if (currentHash !== '#taking' && !modalOpenRef.current) {
      if (prevHash === '#taking' && currentHash === '') {
        // Người dùng thực sự vừa bấm nút Back từ trạng thái đang làm bài
        modalOpenRef.current = true;
        Modal.confirm({
          title: 'Leave Test?',
          icon: React.createElement(ExclamationCircleOutlined),
          content: 'The system will not save your progress. Are you sure you want to leave?',
          okText: 'Leave',
          cancelText: 'Stay',
          okType: 'danger',
          onOk() {
            modalOpenRef.current = false;
            navigate(returnUrl, { replace: true });
          },
          onCancel() {
            modalOpenRef.current = false;
            // Kéo họ trở lại bẫy hash
            navigate('#taking');
          },
        });
      } else {
        // Lần đầu tải trang, tự động đẩy hash vào để tạo lịch sử (bẫy)
        navigate('#taking');
      }
    }
  }, [isPrevented, location.hash, navigate, returnUrl]);
};
