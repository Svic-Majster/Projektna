# Face Service

Storitev za registracijo in preverjanje obraza (FastAPI + OpenCV LBPH).
Vsak uporabnik ima svoj model v `models/lbph_<user_id>.yml`.

## Endpointi

| Metoda | Pot       | Telo (form-data)                     |
|--------|-----------|--------------------------------------|
| GET    | `/health` | –                                    |
| POST   | `/enroll` | `user_id`, `images` (1 ali več slik) |
| POST   | `/verify` | `user_id`, `image` (1 slika)         |

`status` v odgovoru ustreza enumu `login_status` v bazi:
`uspesno`, `zavrnjeno_nizek_ujemanje`, `obraz_ni_zaznan`.
`/verify` vrne 404, če uporabnik še ni registriran.

## Nastavitve (env)

| Spremenljivka | Privzeto | Pomen |
|---------------|----------|-------|
| `FACE_MODELS_DIR` | `./models` | kam se shranijo modeli |
| `FACE_THRESHOLD`  | `50` | meja ujemanja — nižje je strožje |
| `ORV_PATH` | `../../ORV` | pot do ORV skript (obdelava slik) |

## Zagon (lokalno)

Odvisnosti so v skupnem `requirements.txt` v korenu repozitorija.

Dokumentacija: http://localhost:8000/docs

## Zagon (Docker)

```bash
cd RAI
docker compose up faceid
```

## Test (curl)

```bash
# registracija (več slik iste osebe)
curl -F "user_id=1" -F "images=@obraz1.jpg" -F "images=@test1.jpg" \
     http://localhost:8000/enroll

# preverjanje
curl -F "user_id=1" -F "image=@test2.jpg \
     http://localhost:8000/verify
```
