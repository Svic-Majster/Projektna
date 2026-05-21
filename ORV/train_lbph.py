import cv2
import os
import numpy as np

TRAIN_PATH = "data/processed/1/train"

# LBPH model
model = cv2.face.LBPHFaceRecognizer_create()

face_images = []
labels = []

# preberi vse slike iz train mape
for filename in os.listdir(TRAIN_PATH):
    image_path = os.path.join(TRAIN_PATH, filename)

    # naloži sivinsko sliko
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    if image is None:
        continue

    face_images.append(image)

    # za zdaj samo uporabnik 1
    labels.append(1)

# pretvori labele v numpy array
labels = np.array(labels)

print(f"Naloženih slik: {len(face_images)}")

# nauči model
model.train(face_images, labels)

# shrani model
model.save("lbph_model.yml")

print("LBPH model uspešno naučen in shranjen.")