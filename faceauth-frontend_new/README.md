# FaceAuth Frontend

Interface Next.js (App Router, TypeScript, Tailwind) pour les endpoints
`POST /auth/register` et `POST /auth/login` du backend FastAPI.

## Installation

```bash
cd faceauth-frontend
npm install
cp .env.local.example .env.local
```

Ouvre `.env.local` et vérifie que `NEXT_PUBLIC_API_URL` pointe bien vers ton
backend (par défaut `http://127.0.0.1:8000`).

## Lancer en développement

```bash
npm run dev
```

Puis ouvre http://localhost:3000.

## ⚠️ Important : configurer le CORS côté backend

Le navigateur bloquera les requêtes si FastAPI n'autorise pas explicitement
l'origine `http://localhost:3000`. Dans `main.py` (backend), vérifie que le
middleware CORS ressemble à ceci :

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redémarre `uvicorn` après cette modification.

## Structure

- `app/page.tsx` — page d'accueil, liens vers inscription / connexion
- `app/register/page.tsx` — formulaire nom + photo → `POST /auth/register`
- `app/login/page.tsx` — formulaire nom + photo → `POST /auth/login`
- `components/PhotoCapture.tsx` — capture webcam ou import de fichier, aperçu, reprise
- `components/StatusMessage.tsx` — bandeau succès / erreur
- `lib/api.ts` — client fetch vers le backend, normalise les erreurs FastAPI (400 / 422)

## Notes

- La capture webcam nécessite un contexte sécurisé : `http://localhost` fonctionne
  en développement, mais en production il faudra HTTPS.
- Le composant `PhotoCapture` fonctionne aussi bien pour l'inscription que la
  connexion : la photo capturée ou importée devient un `File` (JPEG) envoyé
  tel quel en `multipart/form-data`, exactement comme dans les exemples curl
  de Swagger (`photo=@...;type=image/jpeg`).
