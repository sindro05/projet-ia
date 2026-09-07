import numpy as np
from typing import Tuple, NamedTuple
from io import BytesIO
from PIL import Image
import face_recognition


class FaceValidationError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class FaceMatchResult(NamedTuple):
    is_match: bool
    distance: float
    confidence: float  # 0-100%, plus c'est haut, plus c'est fiable
    message: str


def _load_image_from_bytes(image_bytes: bytes) -> np.ndarray:
    try:
        img = Image.open(BytesIO(image_bytes))
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Force uint8 dtype et mémoire contiguë, requis par dlib
        # (corrige "Unsupported image type, must be 8bit gray or RGB image")
        arr = np.array(img, dtype=np.uint8)
        arr = np.ascontiguousarray(arr)
        return arr
    except FaceValidationError:
        raise
    except Exception:
        raise FaceValidationError(
            "Image invalide : impossible de lire le fichier. "
            "Vérifiez qu'il s'agit bien d'une photo (JPG, PNG...).",
            status_code=400,
        )


def extract_face_embedding(image_bytes: bytes) -> Tuple[np.ndarray, int]:
    """
    Extrait l'empreinte faciale.
    - Exactement UN visage requis.
    """
    image = _load_image_from_bytes(image_bytes)

    face_locations = face_recognition.face_locations(image)
    num_faces = len(face_locations)

    if num_faces == 0:
        raise FaceValidationError(
            "❌ Aucun visage détecté. Prenez une photo nette, de face, "
            "avec un bon éclairage.",
            status_code=400,
        )

    if num_faces > 1:
        raise FaceValidationError(
            f"❌ {num_faces} visages détectés. Une seule personne doit "
            "apparaître sur la photo.",
            status_code=400,
        )

    encodings = face_recognition.face_encodings(
        image, known_face_locations=face_locations
    )

    if not encodings:
        raise FaceValidationError(
            "❌ Visage détecté mais impossible d'analyser ses traits. "
            "Réessayez avec une photo plus nette.",
            status_code=400,
        )

    return encodings[0], num_faces


def compare_embeddings(
    known_embedding: np.ndarray,
    unknown_embedding: np.ndarray,
    tolerance: float = 0.6,
) -> FaceMatchResult:
    """
    Compare deux empreintes faciales et renvoie un résultat détaillé
    avec un message clair, prêt à afficher à l'utilisateur.
    """
    distance = float(np.linalg.norm(known_embedding - unknown_embedding))
    is_match = distance <= tolerance

    # Conversion approximative distance -> confiance en %
    if is_match:
        confidence = max(0.0, min(100.0, (1 - distance / tolerance) * 100))
    else:
        confidence = max(0.0, min(100.0, (1 - (distance - tolerance) / tolerance) * 100))

    if is_match:
        message = f"✅ Visage reconnu (confiance : {confidence:.0f}%)."
    else:
        message = (
            f"❌ Visage non reconnu. Ce visage ne correspond pas au profil "
            f"enregistré (confiance : {confidence:.0f}%)."
        )

    return FaceMatchResult(
        is_match=is_match,
        distance=distance,
        confidence=confidence,
        message=message,
    )


def embedding_to_bytes(embedding: np.ndarray) -> bytes:
    return embedding.astype(np.float64).tobytes()


def bytes_to_embedding(data: bytes) -> np.ndarray:
    return np.frombuffer(data, dtype=np.float64)