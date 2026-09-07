from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.weather import router as weather_router

app = FastAPI(title="Weather Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather_router)


@app.get("/")
def root():
    return {"service": "weather-backend", "status": "ok"}
