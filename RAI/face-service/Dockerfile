FROM python:3.11-slim

# opencv runtime libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# kontekst gradnje je koren repozitorija (glej docker-compose.yml)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# zapeci ORV skripte v sliko (deljena predobdelava; samozadostnost za Docker Hub)
COPY ORV/ /app/orv/
ENV ORV_PATH=/app/orv

COPY RAI/face-service/ .

ENV FACE_MODELS_DIR=/app/models
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
