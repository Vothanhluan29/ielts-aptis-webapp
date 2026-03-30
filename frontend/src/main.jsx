import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'; // 1. Import


// 2. Lấy ID chuẩn từ biến môi trường
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// // (Tùy chọn) In ra để kiểm tra xem đã ăn file .env chưa
// console.log("Check Client ID:", clientId); 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Bọc Provider ra ngoài cùng, truyền clientId vào */}
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)