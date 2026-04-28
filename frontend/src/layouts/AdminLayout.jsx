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
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      
      {isAptis ? (
        <AptisSideBar layoutProps={layoutProps} />
      ) : (
        <SideBar layoutProps={layoutProps} />
      )}

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER Component */}
        <Header />

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-auto p-8 bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;