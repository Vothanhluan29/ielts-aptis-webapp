from fastapi import FastAPI, APIRouter, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import uvicorn
import time

# Import Config & DB
from app.core.config import settings
from app.core.database import engine, Base
from app.core.scheduler import start_scheduler

# Import Models (Phải import để Base.metadata.create_all nhận diện được bảng)
from app.modules.users.models import User
from app.modules.IELTS.reading.models import ReadingTest
from app.modules.IELTS.listening.models import ListeningTest
from app.modules.IELTS.writing.models import WritingTest
from app.modules.IELTS.speaking.models import SpeakingTest
from app.modules.IELTS.exam.models import FullTest
from app.modules.subscriptions.models import UserUsage
# Đảm bảo bạn đã import các Model của APTIS ở đâu đó hoặc import tại đây

# Import Routers
from app.modules.auth import web as auth_web
from app.modules.users import web as users_web
from app.modules.admin import web as admin_web
from app.modules.IELTS.user_stats import web as user_stats_web
from app.modules.subscriptions import web as subscriptions_web

# IELTS Routers
from app.modules.IELTS.reading import web as reading_web
from app.modules.IELTS.listening import web as listening_web
from app.modules.IELTS.writing import web as writing_web
from app.modules.IELTS.speaking import web as speaking_web
from app.modules.IELTS.exam import web as exam_web

# APTIS Routers
from app.modules.APTIS.grammar_vocab import web as aptis_grammar_vocab_web
from app.modules.APTIS.listening import web as aptis_listening_web
from app.modules.APTIS.reading import web as aptis_reading_web
from app.modules.APTIS.writing import web as aptis_writing_web
from app.modules.APTIS.speaking import web as aptis_speaking_web
from app.modules.APTIS.exam import web as aptis_exam_web
from app.modules.APTIS.user_stats_Aptis import web as aptis_user_stats_web


# ==========================================
# 1. Create Database Tables
# ==========================================
Base.metadata.create_all(bind=engine)


# ==========================================
# 2. Lifespan (Startup / Shutdown)
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Application Scheduler...")
    start_scheduler()
    yield
    print("Shutting down Application...")


# ==========================================
# 3. Create FastAPI App
# ==========================================
app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)


# ==========================================
# 4. CORS Setup
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    # Cho phép ứng dụng giao tiếp với các cửa sổ popup (Login Google, Facebook...)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    # Hoặc nếu vẫn lỗi, bạn dùng dòng dưới này (kém bảo mật hơn chút nhưng sửa triệt để):
    # response.headers["Cross-Origin-Opener-Policy"] = "unsafe-none" 
    return response

# ==========================================
# 5. Static Files Configuration
# ==========================================
base_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(base_dir, "static")
audio_dir = os.path.join(static_dir, "audio")

os.makedirs(audio_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

print(f"Static Directory mounted at: {static_dir}")


# ==========================================
# 6. Register Routers (Đã Tối Ưu Hóa)
# ==========================================
# Thay vì tạo các APIRouter() trung gian rỗng, ta include thẳng vào app.
# Các prefix như "/aptis/exam" đã được định nghĩa sẵn trong các file web.py của bạn.

# --- Core & System ---
app.include_router(auth_web.router)
app.include_router(users_web.router)
app.include_router(user_stats_web.router)
app.include_router(admin_web.router)
app.include_router(subscriptions_web.router)

# --- IELTS ---
app.include_router(reading_web.router)
app.include_router(listening_web.router)
app.include_router(writing_web.router)
app.include_router(speaking_web.router)
app.include_router(exam_web.router)

# --- APTIS ---
app.include_router(aptis_grammar_vocab_web.router)
app.include_router(aptis_listening_web.router)
app.include_router(aptis_reading_web.router)
app.include_router(aptis_writing_web.router)
app.include_router(aptis_speaking_web.router)
app.include_router(aptis_exam_web.router) # Router cho Aptis Full Test
app.include_router(aptis_user_stats_web.router)


# ==========================================
# 7. Health Check
# ==========================================
@app.get("/", tags=["System"])
def root():
    return {"status": "ok", "message": f"{settings.PROJECT_NAME} System Ready!"}

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0"
    }


# ==========================================
# 8. Run App
# ==========================================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)