import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import Sidebar from '../components/MainLayout/IELTS/Sidebar';
import Header from '../components/MainLayout/IELTS/Header';


import AptisSidebar from '../components/MainLayout/APTIS/AptisSidebar';
import AptisHeader from '../components/MainLayout/APTIS/AptisHeader';

import { useMainLayout } from '../hooks/MainLayout/useMainLayout';
import { NotificationProvider } from '../contexts/NotificationContext';

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

  const [examMode, setExamMode] = useState(() => {
    const path = window.location.pathname;
    if (path.includes('/aptis')) {
      return 'APTIS';
    } else if (
      path === '/dashboard' || 
      path.startsWith('/exam') || 
      path.startsWith('/reading') || 
      path.startsWith('/listening') || 
      path.startsWith('/writing') || 
      path.startsWith('/speaking')
    ) {
      return 'IELTS';
    }
    return 'APTIS';
  });

  useEffect(() => {
    if (location.pathname.includes('/aptis') && examMode !== 'APTIS') {
      setExamMode('APTIS');
      localStorage.setItem('student_exam_mode', 'APTIS');
    } else if (
      (location.pathname === '/dashboard' || 
       location.pathname.startsWith('/exam') || 
       location.pathname.startsWith('/reading') || 
       location.pathname.startsWith('/listening') || 
       location.pathname.startsWith('/writing') || 
       location.pathname.startsWith('/speaking')) && 
      !location.pathname.includes('/aptis') && 
      examMode !== 'IELTS'
    ) {
      setExamMode('IELTS');
      localStorage.setItem('student_exam_mode', 'IELTS');
    }
  }, [location.pathname, examMode]);


  const handleSwitchMode = (mode) => {
    setExamMode(mode);
    localStorage.setItem('student_exam_mode', mode);
    

    setProfileOpen(false);
    setSidebarOpen(false);


    if (mode === 'APTIS') {
      navigate('/aptis/dashboard');
    } else {
      navigate('/dashboard'); 
    }
  };


  const ActiveSidebar = examMode === 'APTIS' ? AptisSidebar : Sidebar;
  const ActiveHeader = examMode === 'APTIS' ? AptisHeader : Header;

  /* ===================== LOADING ===================== */
  if (loadingUser) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  /* ===================== GUARD ===================== */
  if (!user) return null;

  /* ===================== RENDER ===================== */
  return (
    <NotificationProvider>
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
          onSwitchMode={handleSwitchMode} 
        />

        {/* ===================== CONTENT ===================== */}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#F7F7FB]">

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
    </NotificationProvider>
  );
};

export default MainLayout;