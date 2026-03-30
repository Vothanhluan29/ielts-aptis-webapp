import React, { useState} from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

// Import IELTS Components (Mặc định)
import Sidebar from '../components/MainLayout/Sidebar';
import Header from '../components/MainLayout/Header';

// Import APTIS Components (Bạn hãy check lại đường dẫn cho đúng nhé)
import AptisSidebar from '../components/MainLayout/AptisSidebar';
import AptisHeader from '../components/MainLayout/AptisHeader';

import { useMainLayout } from '../hooks/MainLayout/useMainLayout';

const MainLayout = () => {
  const navigate = useNavigate();

  /* ===================== HOOK ===================== */
  const {
    user,
    loadingUser,
    sidebarOpen,
    sidebarCollapsed,
    profileOpen,
    setSidebarOpen,
    setSidebarCollapsed,
    setProfileOpen,
    profileRef,
    handleLogout,
    pageTitle,
    location,
    fetchMe
  } = useMainLayout();

  /* ===================== WORKSPACE LOGIC ===================== */
  // Lấy trạng thái từ localStorage, mặc định là IELTS nếu chưa có
  const [examMode, setExamMode] = useState(() => {
    return localStorage.getItem('student_exam_mode') || 'IELTS';
  });

  // Hàm xử lý chuyển đổi Không gian học (Truyền xuống Header)
  const handleSwitchMode = (mode) => {
    setExamMode(mode);
    localStorage.setItem('student_exam_mode', mode);
    
    // Đóng menu/profile dropdown khi chuyển đổi
    setProfileOpen(false);
    setSidebarOpen(false);

    // Chuyển hướng về trang chủ của từng hệ tương ứng
    if (mode === 'APTIS') {
      navigate('/aptis/dashboard');
    } else {
      navigate('/dashboard'); // Đường dẫn dashboard của IELTS
    }
  };

  // Xác định Component nào sẽ được render dựa trên mode hiện tại
  const ActiveSidebar = examMode === 'APTIS' ? AptisSidebar : Sidebar;
  const ActiveHeader = examMode === 'APTIS' ? AptisHeader : Header;

  /* ===================== LOADING ===================== */
  if (loadingUser) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Đang xác thực quyền truy cập...
        </p>
      </div>
    );
  }

  /* ===================== GUARD ===================== */
  if (!user) return null;

  /* ===================== RENDER ===================== */
  return (
    <div className="h-screen flex bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      
      {/* ===================== SIDEBAR (DYNAMIC) ===================== */}
      <ActiveSidebar
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        pathname={location.pathname}
        handleLogout={handleLogout}
      />

      {/* ===================== MAIN ===================== */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* ===================== HEADER (DYNAMIC) ===================== */}
        <ActiveHeader
          pageTitle={pageTitle}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          profileRef={profileRef}
          user={user}
          loadingUser={loadingUser}
          handleLogout={handleLogout}
          // 🔥 TRUYỀN HÀM CHUYỂN ĐỔI XUỐNG HEADER
          onSwitchMode={handleSwitchMode} 
        />

        {/* ===================== CONTENT ===================== */}
        {/* Nền của content cũng có thể đổi màu nhẹ tùy theo mode nếu muốn */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 transition-colors duration-300 ${examMode === 'APTIS' ? 'bg-slate-50' : 'bg-[#F8FAFC]'}`}>
          {/* Truyền examMode xuống các component con nếu chúng cần biết đang ở chế độ nào */}
          <Outlet context={{ user, refreshUser: fetchMe, examMode }} />
        </main>
      </div>

      {/* ===================== MOBILE OVERLAY ===================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;