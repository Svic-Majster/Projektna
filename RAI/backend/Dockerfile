FROM node:20-slim
WORKDIR /app/backend

# odvisnosti najprej (boljsi cache)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# koda backenda + frontend (backend ga streze staticno)
COPY backend/ ./
COPY frontend/ ../frontend/

ENV PORT=3000
EXPOSE 3000
CMD ["node", "index.js"]
