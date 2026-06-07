@echo off
echo [1/2] Namescanje odvisnosti

echo instalacija backend odvisnosti
cd RAI\backend
call npm install
cd ..\..

echo instalacija frontend odvisnosti
cd NPO\SvicMajster
call npm install
cd ..\..

echo [2/2] Zaganjanje sistema

echo zagon backend Docker
cd RAI\backend
docker compose up --build -d
cd ..\..

echo zagon Expo v novem oknu
start cmd /k "cd NPO\SvicMajster && npx expo start"

echo zagon backend streznika
cd RAI\backend
npm run dev