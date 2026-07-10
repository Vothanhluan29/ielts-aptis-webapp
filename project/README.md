# Hướng dẫn Chạy dự án IELTS APTIS (Full-Stack)

Dự án này đã được đóng gói hoàn chỉnh lên Docker Hub. **KHÔNG CẦN** phải cài đặt Node.js, Python, hay PostgreSQL. Toàn bộ mã nguồn và dữ liệu (Database) sẽ được Docker tự động tải về và thiết lập.

---

## Yêu cầu Hệ thống
Máy tính cần được cài đặt sẵn và đang bật phần mềm **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**.

---

## Các bước khởi chạy dự án

**Bước 1:** Giải nén thư mục này, sau đó mở Terminal (hoặc Command Prompt / PowerShell) tại đúng thư mục vừa giải nén (nơi có chứa file `docker-compose.yml`).

**Bước 2:** Chạy lệnh sau để Docker tự động tải và khởi động toàn bộ hệ thống:
```bash
docker-compose up -d
```
*(Lưu ý: Lần chạy đầu tiên có thể mất từ 1-3 phút để Docker tải Image (Frontend, Backend, Database) từ trên mạng về máy).*

**Bước 3:** Trải nghiệm Website
- **Trang web chính (Frontend):** Truy cập [http://localhost](http://localhost)
- **Tài liệu API (Backend Swagger):** Truy cập [http://localhost:8000/docs](http://localhost:8000/docs)
- **Cơ sở dữ liệu:** Hệ thống đã tự động nạp sẵn dữ liệu mẫu. Có thể đăng nhập bằng tài khoản có sẵn hoặc tạo mới để kiểm tra.

---

## Cập nhật phiên bản mới (Nếu có)
Nếu có bản cập nhật code mới, chỉ cần mở Terminal tại thư mục này và gõ:
```bash
docker-compose pull
docker-compose up -d
```
Hệ thống sẽ tự động cập nhật lên phiên bản mới nhất.

---

## Cách Dừng và Dọn dẹp
- **Để tắt tạm thời:** Gõ `docker-compose stop`
- **Để tắt hẳn và xóa sạch dữ liệu test (Reset Database):** Gõ `docker-compose down -v`
