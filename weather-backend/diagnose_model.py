import joblib
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parent / "ml_models"
model = joblib.load(MODELS_DIR / "temperature_model.joblib")

print("Type de modèle :", type(model))

# Si c'est un modèle linéaire ou un Pipeline contenant un modèle linéaire
if hasattr(model, "coef_"):
    print("Coefficients :", model.coef_)
    print("Intercept :", model.intercept_)
    if hasattr(model, "feature_names_in_"):
        print("Features (ordre) :", model.feature_names_in_)

# Si c'est un Pipeline (scaler + modèle)
if hasattr(model, "steps"):
    for name, step in model.steps:
        print(f"Étape: {name} -> {type(step)}")
        if hasattr(step, "coef_"):
            print("  Coefficients :", step.coef_)
            print("  Intercept :", step.intercept_)