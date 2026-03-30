import google.generativeai as genai #type:ignore
import os
from dotenv import load_dotenv

# 1. Load API Key từ file .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Lỗi: Không tìm thấy GEMINI_API_KEY trong file .env")
else:
    # 2. Cấu hình
    genai.configure(api_key=api_key)

    print(f"✅ Đang kiểm tra các model khả dụng cho key: {api_key[:5]}...")
    print("-" * 30)

    # 3. Lấy danh sách và lọc ra model biết tạo nội dung (generateContent)
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"MODEL: {m.name}")
                print(f"--> Display Name: {m.display_name}")
                print("-" * 30)
    except Exception as e:
        print(f"❌ Lỗi kết nối: {e}")