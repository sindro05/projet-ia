from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.user import init_db
from routes.auth import router as auth_router

app = FastAPI(
    title="Face Auth API",
    description="Register & Login with face recognition (exactly one face required).",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
async def root():
    return {
        "message": "Face Auth API is running",
        "docs": "/docs",
        "endpoints": {
            "register": "POST /auth/register (form: name + photo)",
            "login": "POST /auth/login (form: name + photo)",
        },
    }


@app.get("/health")
async def health():
    return {"status": "ok"}