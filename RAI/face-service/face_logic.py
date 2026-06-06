"""
logika za prepoznavo obraza -> orv lbph

model na uporabnika: vsak uporabnik dobi models/lbph_<user_id>.yml,
treniran na registracijskih slikah.

enroll in verify zaganjata isti postopek: zaznaj obraz -> obrezi ->
clahe obdelava -> resize.
"""

import os
import sys
import cv2
import numpy as np

# pot do ORV skript (lokalno ../../ORV, v dockerju prek ORV_PATH)
ORV_PATH = os.environ.get(
    "ORV_PATH", os.path.join(os.path.dirname(__file__), "..", "..", "ORV")
)
if ORV_PATH not in sys.path:
    sys.path.insert(0, ORV_PATH)

# deljena obdelava in augmentacija iz ORV (procesiraj_slike.py)
try:
    from procesiraj_slike import izboljsaj_kontrast_obraza, augmentiraj_svetlost
except ImportError as e:
    raise RuntimeError(
        f"ne najdem ORV skript v '{ORV_PATH}'. "
        f"nastavi ORV_PATH ali primontiraj mapo ORV. ({e})"
    )

# nastavitve (lahko prek env)
MODELS_DIR = os.environ.get(
    "FACE_MODELS_DIR", os.path.join(os.path.dirname(__file__), "models")
)
THRESHOLD = float(os.environ.get("FACE_THRESHOLD", "50"))  # nizje = strozje
FACE_SIZE = (200, 200)
TARGET_LABEL = 1

# lbph params (isto ko orv train_lbph.py)
LBPH_PARAMS = {"radius": 1, "neighbors": 8, "grid_x": 8, "grid_y": 8}

os.makedirs(MODELS_DIR, exist_ok=True)

# haar kaskada, prilozena opencv-ju
_CASCADE_PATH = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
_face_cascade = cv2.CascadeClassifier(_CASCADE_PATH)

# preprost predpomnilnik, da ne nalagamo .yml ob vsakem verify
_model_cache = {}  # user_id -> (cas_spremembe, model)


def _model_path(user_id):
    return os.path.join(MODELS_DIR, f"lbph_{user_id}.yml")


def decode_image(raw_bytes):
    # surovi bajti -> bgr slika, ali None ce dekodiranje ne uspe
    arr = np.frombuffer(raw_bytes, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def detect_and_prepare(bgr_image):
    # zaznaj najvecji obraz, obrezi, obdelaj in resize; vrne sivo sliko ali None
    gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
    faces = _face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
    )
    if len(faces) == 0:
        return None

    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])  # najvecji obraz
    face_bgr = bgr_image[y:y + h, x:x + w]
    processed = izboljsaj_kontrast_obraza(face_bgr)
    return cv2.resize(processed, FACE_SIZE)


def _augment(face_gray):
    # dodatne ucne variante iz orv: temneje, svetleje, zrcaljeno
    return [
        face_gray,
        augmentiraj_svetlost(face_gray, 0.7),
        augmentiraj_svetlost(face_gray, 1.3),
        cv2.flip(face_gray, 1),
    ]


def _load_model(user_id):
    # nalozi uporabnikov model (predpomnilnik glede na cas spremembe)
    path = _model_path(user_id)
    if not os.path.exists(path):
        return None

    mtime = os.path.getmtime(path)
    cached = _model_cache.get(user_id)
    if cached and cached[0] == mtime:
        return cached[1]

    model = cv2.face.LBPHFaceRecognizer_create(**LBPH_PARAMS)
    model.read(path)
    _model_cache[user_id] = (mtime, model)
    return model


def enroll(user_id, image_bytes_list):
    # nauci (ali znova nauci) uporabnikov model iz registracijskih slik
    samples = []
    used = 0
    skipped = 0

    for raw in image_bytes_list:
        img = decode_image(raw)
        if img is None:
            skipped += 1
            continue
        face = detect_and_prepare(img)
        if face is None:
            skipped += 1
            continue
        samples.extend(_augment(face))
        used += 1

    if used == 0:
        return {"ok": False, "reason": "obraz_ni_zaznan", "used": 0, "skipped": skipped}

    model = cv2.face.LBPHFaceRecognizer_create(**LBPH_PARAMS)
    labels = np.array([TARGET_LABEL] * len(samples))
    model.train(samples, labels)
    model.save(_model_path(user_id))
    _model_cache.pop(user_id, None)  # pocisti predpomnilnik

    return {
        "ok": True,
        "used": used,
        "skipped": skipped,
        "training_samples": len(samples),
    }


def verify(user_id, image_bytes):
    """preveri, ali se slika ujema z uporabnikovim modelom"""
    model = _load_model(user_id)
    if model is None:
        return {"status": "ni_modela", "enrolled": False}

    img = decode_image(image_bytes)
    if img is None:
        return {"status": "obraz_ni_zaznan", "confidence": None}

    face = detect_and_prepare(img)
    if face is None:
        return {"status": "obraz_ni_zaznan", "confidence": None}

    label, confidence = model.predict(face)
    confirmed = label == TARGET_LABEL and confidence < THRESHOLD

    # statusi ustrezajo enumu login_status v bazi
    return {
        "status": "uspesno" if confirmed else "zavrnjeno_nizek_ujemanje",
        "confirmed": confirmed,
        "confidence": round(float(confidence), 2),
        "threshold": THRESHOLD,
    }
