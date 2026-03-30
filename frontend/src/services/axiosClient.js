import axios from 'axios';
import toast from 'react-hot-toast'; // Import thư viện toast để thông báo đẹp hơn

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================================
// REQUEST INTERCEPTOR (Gắn Token)
// =====================================
axiosClient.interceptors.request.use(
  (config) => {
    // Đảm bảo lúc Login bạn cũng dùng đúng key 'access_token' này nhé
    const token = localStorage.getItem('access_token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================
// RESPONSE INTERCEPTOR (Xử lý lỗi)
// =====================================
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error;

    // 1. Lỗi xác thực (401 - Unauthorized / Token Expired)
    if (response && response.status === 401) {
      localStorage.removeItem('access_token');
      
      if (window.location.pathname !== '/login') {
        // Báo cho user biết lý do bị văng
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', { duration: 4000 });
        
        // Delay 1 chút rồi mới đá về Login để user kịp đọc dòng toast
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    // 2. Lỗi giới hạn truy cập (403 - Forbidden)
    if (response && response.status === 403) {
      const detail = response.data?.detail || "Bạn không có quyền thực hiện hành động này";
      // Thay alert() bằng toast để UI chuyên nghiệp hơn
      toast.error(`Từ chối quyền truy cập: ${detail}`); 
    }

    // 3. Xử lý thêm lỗi 422 (Validation Error) của FastAPI 
    // Rất hay gặp khi Admin điền thiếu trường bắt buộc lúc lưu form
    if (response && response.status === 422) {
        toast.error('Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại form!');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;