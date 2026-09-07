from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ml_utils.weather_utils import (
    WeatherModelError,
    predict_rain_tomorrow,
    predict_temperature,
)

router = APIRouter(prefix="/weather", tags=["Weather"])


class TemperatureRequest(BaseModel):
    day_of_year: int = Field(..., ge=1, le=366, description="Jour de l'année (1-366)")
    humidity: float = Field(..., ge=0, le=100, description="Humidité relative (%)")
    pressure: float = Field(..., ge=800, le=1100, description="Pression atmosphérique (hPa)")
    wind_speed: float = Field(..., ge=0, description="Vitesse du vent (km/h)")
    cloud_cover: float = Field(..., ge=0, le=100, description="Nébulosité (%)")


class TemperatureResponse(BaseModel):
    predicted_temperature: float


class RainRequest(BaseModel):
    humidity: float = Field(..., ge=0, le=100)
    pressure: float = Field(..., ge=800, le=1100)
    wind_speed: float = Field(..., ge=0)
    cloud_cover: float = Field(..., ge=0, le=100)
    rain_today: bool


class RainResponse(BaseModel):
    rain_tomorrow: bool
    probability: float


@router.post("/predict-temperature", response_model=TemperatureResponse)
def predict_temperature_endpoint(payload: TemperatureRequest):
    try:
        temperature = predict_temperature(
            day_of_year=payload.day_of_year,
            humidity=payload.humidity,
            pressure=payload.pressure,
            wind_speed=payload.wind_speed,
            cloud_cover=payload.cloud_cover,
        )
    except WeatherModelError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return TemperatureResponse(predicted_temperature=temperature)


@router.post("/predict-rain", response_model=RainResponse)
def predict_rain_endpoint(payload: RainRequest):
    try:
        rain_tomorrow, probability = predict_rain_tomorrow(
            humidity=payload.humidity,
            pressure=payload.pressure,
            wind_speed=payload.wind_speed,
            cloud_cover=payload.cloud_cover,
            rain_today=payload.rain_today,
        )
    except WeatherModelError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return RainResponse(rain_tomorrow=rain_tomorrow, probability=probability)