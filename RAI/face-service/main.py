"""
fastapi face service

endpoints:
  GET  /health          - ce dela
  POST /enroll          - "streniraj" uporabnikov faceid z slikami
  POST /verify          - preveri sliko z uporabnikovimi faceid modeli

node backend proxy-a slike tu in jih shrani v tabeli "obdelani_podatki_ai".

vrednosti statusa:
login_status enum (uspesno / zavrnjeno_nizek_ujemanje / obraz_ni_zaznan).
"""

from typing import List

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

import face_logic

app = FastAPI(title="SvicMajster Face Service", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok", "threshold": face_logic.THRESHOLD}


@app.post("/enroll")
async def enroll(
    user_id: int = Form(...),
    images: List[UploadFile] = File(...),
):
    if not images:
        raise HTTPException(status_code=400, detail="Ni poslanih slik.")

    raw = [await f.read() for f in images]
    result = face_logic.enroll(user_id, raw)

    if not result["ok"]:
        # na nobeni sliki ni bilo uporabnega obraza
        raise HTTPException(status_code=422, detail=result)

    return result


@app.post("/verify")
async def verify(
    user_id: int = Form(...),
    image: UploadFile = File(...),
):
    raw = await image.read()
    result = face_logic.verify(user_id, raw)

    if result["status"] == "ni_modela":
        raise HTTPException(
            status_code=404, detail="Uporabnik nima registriranega obraza."
        )

    return result
