# Setup

### 1. Inštaliraj pakete

```bash
npm install
```

### 2. Ustvari `.env`

Ustvari `.env` datoteko v root ( SvicMajster/.env ):

```env
# lokalni backend na LAN-u
EXPO_PUBLIC_API_BASE_URL=https://TVOJ-LOCAL-IP:3000/api

# primer za --tunnel
# EXPO_PUBLIC_API_BASE_URL=https://your-subdomain.loca.lt/api
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
http://TVOJ-LOCAL-IP:3000/api/health
```

Če vrne JSON datoteko, povezava z backendom deluje.

## 4. Če se aplikacija naloži in registracija/prijava ne dela

Opcije:

- Naredi, da je backend dosegljih na lokalnem IP...
- Odpri backend s tuneliranjem:

```bash
npx localtunnel --port 3000
npx expo start --tunnel
```
