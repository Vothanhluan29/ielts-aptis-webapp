import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SideBar from '../components/AdminLayout/SideBar';
import AptisSideBar from '../components/AdminLayout/AptisSideBar';
import Header from '../components/AdminLayout/Header';
import { useAdminLayout } from '../hooks/AdminLayout/useAdminLayout';

const AdminLayout = () => {

  const layoutProps = useAdminLayout();
  

  const location = useLocation();


  const isAptis = location.pathname.includes('/aptis');

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      
      {isAptis ? (
        <AptisSideBar layoutProps={layoutProps} />
      ) : (
        <SideBar layoutProps={layoutProps} />
      )}

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* HEADER Component */}
        <Header />

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-[#f8fafc] relative z-0">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;