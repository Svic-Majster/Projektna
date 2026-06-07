#!/bin/bash
set -e

ROOT_DIR=$PWD

echo "[1/2] Nameščanje odvisnosti"

echo "Instalacija backend odvisnosti"
cd "$ROOT_DIR"/RAI/backend && npm install

echo "Instalacija frontend odvisnosti"
cd "$ROOT_DIR"/NPO/SvicMajster && npm install

echo "[2/2] Zaganjanje sistema"

echo "Zagon backend Docker"
cd "$ROOT_DIR"/RAI/backend && docker compose up --build -d

echo "Zagon Expo..."
cd "$ROOT_DIR"/NPO/SvicMajster && npx expo start --clear &

sleep 1

echo "Zagon backend strežnika"
cd "$ROOT_DIR"/RAI/backend && npm run dev