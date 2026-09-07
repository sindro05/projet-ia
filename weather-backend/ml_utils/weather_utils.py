"""
Charge les modèles météo entraînés (joblib) et expose des fonctions de
prédiction simples, prêtes à être appelées depuis les routes FastAPI.

Les fichiers .joblib doivent se trouver dans un dossier `ml_models/` à la
racine du backend (voir le README pour l'emplacement exact et comment
copier les fichiers depuis le notebook).
"""

from pathlib import Path

import joblib
import pandas as pd

# Dossier contenant temperature_model.joblib et rain_model.joblib.
# Par défaut : <racine backend>/ml_models/
MODELS_DIR = Path(__file__).resolve().parent.parent / "ml_models"

_temperature_model = None
_rain_model = None


class WeatherModelError(Exception):
    """Levée quand un modèle météo est introuvable ou mal chargé."""


def _load_models() -> None:
    global _temperature_model, _rain_model

    temp_path = MODELS_DIR / "temperature_model.joblib"
    rain_path = MODELS_DIR / "rain_model.joblib"

    if not temp_path.exists() or not rain_path.exists():
        raise WeatherModelError(
            f"Modèles météo introuvables dans {MODELS_DIR}. "
            "Copie temperature_model.joblib et rain_model.joblib dans ce dossier "
            "(voir README du projet weather)."
        )

    _temperature_model = joblib.load(temp_path)
    _rain_model = joblib.load(rain_path)


def predict_temperature(
    day_of_year: int,
    humidity: float,
    pressure: float,
    wind_speed: float,
    cloud_cover: float,
) -> float:
    if _temperature_model is None:
        _load_models()

    row = pd.DataFrame(
        [
            {
                "day_of_year": day_of_year,
                "humidity": humidity,
                "pressure": pressure,
                "wind_speed": wind_speed,
                "cloud_cover": cloud_cover,
            }
        ]
    )
    prediction = _temperature_model.predict(row)[0]
    return round(float(prediction), 1)


def predict_rain_tomorrow(
    humidity: float,
    pressure: float,
    wind_speed: float,
    cloud_cover: float,
    rain_today: bool,
) -> tuple[bool, float]:
    if _rain_model is None:
        _load_models()

    row = pd.DataFrame(
        [
            {
                "humidity": humidity,
                "pressure": pressure,
                "wind_speed": wind_speed,
                "cloud_cover": cloud_cover,
                "rain_today": int(rain_today),
            }
        ]
    )
    prediction = bool(_rain_model.predict(row)[0])
    probability = float(_rain_model.predict_proba(row)[0, 1])
    return prediction, round(probability, 3)
