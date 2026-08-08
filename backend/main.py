# --- 1. Standard Library Imports ---
import os
import time
from contextlib import asynccontextmanager

# --- 2. Third-Party Imports ---
import uvicorn
from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# --- 3. Local Application Core Imports ---
from app.core.config import settings
from app.core.database import Base, engine
from app.core.rate_limiter import limiter
from app.core.scheduler import start_scheduler

# --- 4. Models Imports ---
from app.modules.users.models import User
from app.modules.IELTS.reading.models import ReadingTest
from app.modules.IELTS.listening.models import ListeningTest
from app.modules.IELTS.writing.models import WritingTest
from app.modules.IELTS.speaking.models import SpeakingTest
from app.modules.IELTS.exam.models import FullTest
from app.modules.subscriptions.models import UserUsage
from app.modules.feedbacks.models import Feedback
from app.modules.APTIS.listening.question_bank.models import AptisListeningBankGroup, AptisListeningBankQuestion
from app.modules.APTIS.reading.question_bank.models import AptisReadingBankGroup, AptisReadingBankQuestion
from app.modules.APTIS.grammar_vocab.question_bank.models import AptisGrammarVocabBankGroup, AptisGrammarVocabBankQuestion
from app.modules.APTIS.writing.question_bank.models import AptisWritingBankGroup, AptisWritingBankQuestion
from app.modules.APTIS.speaking.question_bank.models import AptisSpeakingBankGroup, AptisSpeakingBankQuestion

# --- 5. Router Modules Imports ---
# Core Routers
from app.modules.auth import web as auth_web
from app.modules.users import web as users_web
from app.modules.admin import web as admin_web
from app.modules.IELTS.user_stats import web as user_stats_web
from app.modules.subscriptions import web as subscriptions_web
from app.modules.notifications import web as notifications_web
from app.modules.feedbacks import web as feedbacks_web

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
from app.modules.APTIS.grammar_vocab.question_bank import web as aptis_grammar_vocab_bank_web
from app.modules.APTIS.listening.question_bank import web as aptis_listening_bank_web
from app.modules.APTIS.reading.question_bank import web as aptis_reading_bank_web
from app.modules.APTIS.writing.question_bank import web as aptis_writing_bank_web
from app.modules.APTIS.speaking.question_bank import web as aptis_speaking_bank_web
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
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


# ==========================================
# 4. CORS Setup
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",                       
        "http://localhost",
        "http://127.0.0.1",
        "https://ielts-aptis-frontend.onrender.com",
        "https://english.greenwich-it.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=()"
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
# 6. Register Routers 
# ==========================================

api_router = APIRouter(prefix="/api")

# --- Core & System ---
api_router.include_router(auth_web.router)
api_router.include_router(users_web.router)
api_router.include_router(user_stats_web.router)
api_router.include_router(admin_web.router)
api_router.include_router(subscriptions_web.router)
api_router.include_router(notifications_web.router)
api_router.include_router(feedbacks_web.router)

# --- IELTS ---
api_router.include_router(reading_web.router)
api_router.include_router(listening_web.router)
api_router.include_router(writing_web.router)
api_router.include_router(speaking_web.router)
api_router.include_router(exam_web.router)

# --- APTIS ---
api_router.include_router(aptis_grammar_vocab_web.router)
api_router.include_router(aptis_listening_web.router)
api_router.include_router(aptis_reading_web.router)
api_router.include_router(aptis_writing_web.router)
api_router.include_router(aptis_speaking_web.router)
api_router.include_router(aptis_grammar_vocab_bank_web.router)
api_router.include_router(aptis_listening_bank_web.router)
api_router.include_router(aptis_reading_bank_web.router)
api_router.include_router(aptis_writing_bank_web.router)
api_router.include_router(aptis_speaking_bank_web.router)
api_router.include_router(aptis_exam_web.router) 
api_router.include_router(aptis_user_stats_web.router)

app.include_router(api_router)


# ==========================================
# 7. Health Check
# ==========================================
@app.get("/api/", tags=["System"])
def root():
    return {"status": "ok", "message": f"{settings.PROJECT_NAME} System Ready!"}

@app.get("/api/health", tags=["System"])
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