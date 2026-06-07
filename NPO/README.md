# Setup

### 1. Inštaliraj pakete

```bash
npm install
```

### 2. Ustvari `.env`

Ustvari `.env` datoteko v root ( SvicMajster/.env ):

```env
# lokalni backend na LAN-u
EXPO_PUBLIC_API_BASE_URL=http://TVOJ-LOKALNI-IP:3000/api

# lokalni MQTT broker (Mosquitto)
EXPO_PUBLIC_MQTT_HOST=TVOJ-LOKALNI-IP
EXPO_PUBLIC_MQTT_PORT=9001

# mqtt ime in geslo
EXPO_PUBLIC_MQTT_USER=user_name
EXPO_PUBLIC_MQTT_PASSWORD=tvoje_geslo

# primer za --tunnel
# EXPO_PUBLIC_API_BASE_URL=https://four-coins-begin.loca.lt/api

```

Uporabi lokalni IP računalnika.

## 3. Zaženi aplikacijo

### Zaženi Expo

```bash
npx expo start
```
Skeniraj QR kodo z Expo GO aplikacijo na telefonu.

### Zaženi spletni backend

V RAI/.../backend mapi:

```bash
npm run dev
```

### Preveri backend povezavo

V brskalniku na tel. odpri (enak IP kot v .env):

```text
https://TVOJ-LOCAL-IP:3000/api/health
```

Če vrne JSON datoteko, povezava z backendom deluje.

## 4. Če se aplikacija naloži in registracija/prijava ne dela

Opcije:

- Naredi, da je backend dosegljih na lokalnem IP...
- Odpri backend s tuneliranjem:

```bash
# pri tem ukazu uporabi primer za tunnel v .env.example
npx localtunnel --port 3000
npx expo start --tunnel
```

## 5. Prijava in registracija z obrazom (Face ID)

Aplikacija podpira prijavo in registracijo obraza preko kamere.
Slike se pošljejo backendu, ta pa jih preveri s face servisom
(glej `RAI/face-service`).


### Kako deluje

- **Registracija obraza:** Profil → "Dodaj Face ID" → zajem iz treh smeri
  (naravnost, levo, desno). Slike gredo na `POST /api/auth/face-enroll`.
- **Prijava z obrazom:** Prijavni zaslon → "Prijava z obrazom" → vnesi
  email/uporabnisko ime in zajemi obraz. Slika gre na
  `POST /api/auth/face-login`.

### Zahteve

- Teči mora face servis (`RAI/face-service`, privzeto port 8000).
- Backend mora imeti nastavljen `FACE_SERVICE_URL` (glej `RAI/backend/.env.example`).
- Uporabnik mora najprej registrirati obraz, sele nato je mozna prijava z obrazom.
