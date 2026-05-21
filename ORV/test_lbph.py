import cv2
import os

MODEL_PATH = "lbph_model.yml"
TEST_PATH = "data/processed/1/test"

# naloži LBPH model
model = cv2.face.LBPHFaceRecognizer_create()
model.read(MODEL_PATH)

# testiranje modela
for filename in os.listdir(TEST_PATH):
    image_path = os.path.join(TEST_PATH, filename)

    # naloži testno sliko
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    if image is None:
        continue

    # napoved uporabnika
    predicted_label, confidence = model.predict(image)

    print(f"Slika: {filename}")
    print(f"Napovedan uporabnik: {predicted_label}")
    print(f"Confidence: {confidence}")
    print("----------------------")