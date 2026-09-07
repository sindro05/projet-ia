from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from models.user import get_db, User
from face_utils.utils import (
    extract_face_embedding,
    compare_embeddings,
    embedding_to_bytes,
    bytes_to_embedding,
    FaceValidationError,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    name: str = Form(..., min_length=1, max_length=100),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    cleaned_name = name.strip()
    if not cleaned_name:
        return JSONResponse(
            status_code=400,
            content={"success": False, "detail": "Le nom ne peut pas être vide.", "code": "EMPTY_NAME"},
        )

    if db.query(User).filter(User.name == cleaned_name).first():
        return JSONResponse(
            status_code=409,
            content={
                "success": False,
                "detail": f"Un utilisateur nommé '{cleaned_name}' existe déjà.",
                "code": "USER_ALREADY_EXISTS",
            },
        )

    try:
        image_bytes = await photo.read()
        if not image_bytes:
            return JSONResponse(
                status_code=400,
                content={"success": False, "detail": "Le fichier image reçu est vide.", "code": "EMPTY_IMAGE"},
            )
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "detail": f"Échec de lecture du fichier envoyé : {str(e)}", "code": "FILE_READ_ERROR"},
        )

    try:
        embedding, _ = extract_face_embedding(image_bytes)
    except FaceValidationError as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"success": False, "detail": e.message, "code": "FACE_VALIDATION_ERROR"},
        )

    try:
        user = User(name=cleaned_name, embedding=embedding_to_bytes(embedding))
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={"success": False, "detail": f"Échec de l'enregistrement de l'utilisateur : {str(e)}", "code": "DB_ERROR"},
        )

    return {
        "success": True,
        "message": f"Profil '{cleaned_name}' créé avec succès.",
        "user_id": user.id,
        "name": user.name,
    }


@router.post("/login")
async def login(
    name: str = Form(..., min_length=1, max_length=100),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    cleaned_name = name.strip()
    if not cleaned_name:
        return JSONResponse(
            status_code=400,
            content={"success": False, "detail": "Le nom ne peut pas être vide.", "code": "EMPTY_NAME"},
        )

    user = db.query(User).filter(User.name == cleaned_name).first()
    if not user:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "detail": f"Utilisateur '{cleaned_name}' introuvable. Créez d'abord votre profil.",
                "code": "USER_NOT_FOUND",
            },
        )

    try:
        image_bytes = await photo.read()
        if not image_bytes:
            return JSONResponse(
                status_code=400,
                content={"success": False, "detail": "Le fichier image reçu est vide.", "code": "EMPTY_IMAGE"},
            )
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "detail": f"Échec de lecture du fichier envoyé : {str(e)}", "code": "FILE_READ_ERROR"},
        )

    try:
        login_embedding, _ = extract_face_embedding(image_bytes)
    except FaceValidationError as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"success": False, "detail": e.message, "code": "FACE_VALIDATION_ERROR"},
        )

    try:
        known_embedding = bytes_to_embedding(user.embedding)
        match_result = compare_embeddings(known_embedding, login_embedding)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "detail": f"Échec de la comparaison des visages : {str(e)}", "code": "COMPARISON_ERROR"},
        )

    if not match_result.is_match:
        return JSONResponse(
            status_code=401,
            content={
                "success": False,
                "detail": match_result.message,
                "code": "FACE_MISMATCH",
                "confidence": round(match_result.confidence, 1),
            },
        )

    return {
        "success": True,
        "message": f"Connexion réussie. Bienvenue {user.name} !",
        "user_id": user.id,
        "name": user.name,
        "confidence": round(match_result.confidence, 1),
    }