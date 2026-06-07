# 💪 Švic Majster

**ŠvicMajster** je gamificirana aplikacija za beleženje vadbe, kjer uporabniki tekmujejo v tedenskih izzivih. Točke se ne delijo "na oko", ampak se izračunajo na podlagi intenzivnosti, razdalje in vztrajnosti v različnih pogojih. Cilj je vsak teden okronati največjega "ŠvicMajstra".

Točke se računajo iz:

- **intenzivnosti vadbe** (pospeškometer – večji šum pomeni večjo intenzivnost),
- **razdalje in višinske razlike** (GPS),
- **bonusov iz zunanjih podatkov** (vreme in promet – ekstremne razmere prinesejo množitelj točk).

---

## 🗂️ Struktura repozitorija

Repozitorij je razdeljen na module, vsak pokriva svoj del projekta (poimenovani po predmetih):

| Mapa           | Predmet / namen                                  | Tehnologije                                 |
| -------------- | ------------------------------------------------ | ------------------------------------------- |
| [`NPO/`](NPO/) | Mobilna aplikacija ŠvicMajster                   | React Native, Expo, TypeScript              |
| [`RAI/`](RAI/) | Backend, spletni frontend, face-service, scraper | Node.js, Express, PostgreSQL, MQTT, FastAPI |
| [`ORV/`](ORV/) | Zajem in prepoznava obraza                       | Python, OpenCV (LBPH)                       |
| [`SA/`](SA/)   | Avtomatizirani testi                             | Jest, pytest                                |

```
Projektna/
├── NPO/SvicMajster/      # mobilna aplikacija (Expo)
├── RAI/
│   ├── backend/          # Express API + MQTT + PostgreSQL
│   ├── frontend/         # spletni vmesnik
│   ├── face-service/     # FastAPI servis za prepoznavo obraza
│   ├── scraper/          # zajem vremena/prometa (ARSO)
│   ├── mosquitto/        # MQTT broker konfiguracija
│   └── docker-compose.yml
├── ORV/                  # skripte za zajem in LBPH model
├── SA/tests/             # JS in Python testi
└── .github/workflows/    # CI (GitHub Actions)
```

---

## 🧩 Arhitektura

```
┌─────────────────┐      MQTT / REST      ┌──────────────────┐
│  Mobilna app    │ ───────────────────►  │   Backend (RAI)  │
│  (NPO / Expo)   │ ◄───────────────────  │  Express + PG    │
└─────────────────┘                       └────────┬─────────┘
        │ kamera                                    │
        │ (Face ID)                                 │ proxy slik
        ▼                                           ▼
┌─────────────────┐                       ┌──────────────────┐
│  Face Service   │ ◄──── obraz / model ──│  PostgreSQL DB    │
│  (FastAPI/LBPH) │                       └──────────────────┘
└─────────────────┘                                ▲
                                                   │ vreme / promet
                                          ┌────────┴─────────┐
                                          │  Scraper (ARSO)  │
                                          └──────────────────┘
```

- **Mobilna aplikacija** zajema senzorske podatke (GPS, kamera) in komunicira z backendom prek REST in MQTT.
- **Backend** hrani podatke v PostgreSQL, sprejema senzorske dogodke prek MQTT brokerja (Mosquitto), računa točke in proxy-a faceID slike na face-service.
- **Face Service** (FastAPI) izvaja registracijo in verifikacijo obraza z LBPH modelom. 
- **Scraper** periodično pridobiva zunanje podatke (vreme) za izračun bonusov.

---

## 🚀 Avtomatski zagon

### Na windowsu:

zaženi run.bat 
### Na linuxu:

```bash
sudo chmod +x run.sh
./run.sh
```

## 🔧Ročni zagon

Za polno delovanje je treba zagnati **backend (+ DB + MQTT)**, **face-service**, **mobilno aplikacijo**, po želji pa še **scraper**. Spodaj je povzetek; podrobnosti so v README-jih posameznih modulov.

### 1. Spletna aplikacija, baza in MQTT (RAI)

```bash
cd RAI/backend
npm install
```

Ustvari `.env` datoteke (v `RAI/.env` in `RAI/backend/.env` – glej [`RAI/README.md`](RAI/README.md)), nato:

```bash
cd RAI
docker compose down -v
docker compose up -d        # PostgreSQL + Mosquitto
cd backend
node db/seed.js             # testni podatki
npm run dev                 # API na http://localhost:3000
```

Preveri: `http://localhost:3000/api/health`

### 2. Mobilna aplikacija (NPO)

```bash
cd NPO/SvicMajster
npm install
```

Ustvari `.env` z lokalnim IP-jem (glej [`NPO/README.md`](NPO/README.md)), nato:

```bash
npx expo start
```

Skeniraj QR kodo z aplikacijo **Expo Go** na telefonu.

---

## 🧠 Prepoznava obraza (Face ID)

Sistem za prijavo/registracijo z obrazom:

1. **Zajem** – mobilna aplikacija zajame obraz iz treh smeri (naravnost, levo, desno).
2. **Obdelava** – slike se pretvorijo v sivinske, zglajene (Gaussian Blur) in kontrastno izboljšane (CLAHE).
3. **Model** – OpenCV **LBPH Face Recognizer** preveri podobnost; rezultat je `POTRJEN` / `ZAVRNJEN`.

Končne nastavitve modela (`radius=1, neighbors=8, grid_x=8, grid_y=8, THRESHOLD=50`) so dokumentirane v [`ORV/README.md`](ORV/README.md). Metrike evalvacije: **Accuracy, FAR** (False Acceptance Rate), **FRR** (False Rejection Rate).

---

## 🛠️ Tehnološki sklad

- **Mobilno:** React Native, Expo, TypeScript, expo-camera/-location/-sensors, paho-mqtt
- **Backend:** Node.js, Express, PostgreSQL, MQTT, Socket.IO, bcrypt, multer, node-cron
- **Face service:** Python, FastAPI, Uvicorn, OpenCV (LBPH)
- **Računalniški vid:** Python, OpenCV, NumPy
- **Infrastruktura:** Docker Compose, Mosquitto (MQTT broker)
- **Testiranje:** Jest (JS), pytest (Python)

---

## ✅ Testiranje in CI

Testi se nahajajo v [`SA/tests/`](SA/tests/) ter v posameznih modulih, in se samodejno izvajajo prek **GitHub Actions** ([`.github/workflows/`](.github/workflows/)):

| Workflow                 | Sproži ob spremembah v         | Kaj preverja                                |
| ------------------------ | ------------------------------ | ------------------------------------------- |
| JavaScript Testi (RAI)   | `RAI/**`                       | `npm test` v `RAI/backend` (Jest)           |
| React Native Testi (NPO) | `NPO/**`                       | TypeScript prevod + `npm test` (jest-expo)  |
| Python Testi (ORV)       | `ORV/**`, `SA/tests/python/**` | `pytest` (LBPH model, obdelava slik, zajem) |

Lokalni zagon:

```bash
# backend testi
cd RAI/backend && npm test

# mobilni testi
cd NPO/SvicMajster && npm test

# python testi
pytest SA/tests/python/
```

---

## 📄 Dokumentacija po modulih

- [NPO – mobilna aplikacija](NPO/README.md)
- [RAI – backend, frontend, face-service, scraper](RAI/README.md)
- [ORV – računalniški vid in LBPH model](ORV/README.md)
- [Face service](RAI/face-service/README.md)
