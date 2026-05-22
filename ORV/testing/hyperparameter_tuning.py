import os
import cv2
import numpy as np

TRAIN_PATH = "data/processed/1/train"
GENUINE_TEST_PATH = "data/processed/1/test"
IMPOSTOR_TEST_PATH = "data/processed/2/test"

TARGET_LABEL = 1
THRESHOLD = 50

PARAMETER_SETS = [
    {"radius": 1, "neighbors": 8, "grid_x": 8, "grid_y": 8},
    {"radius": 2, "neighbors": 8, "grid_x": 8, "grid_y": 8},
    {"radius": 1, "neighbors": 16, "grid_x": 8, "grid_y": 8},
    {"radius": 1, "neighbors": 8, "grid_x": 9, "grid_y": 9},
]


def load_images(folder_path):
    images = []

    for filename in os.listdir(folder_path):
        if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        image_path = os.path.join(folder_path, filename)
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

        if image is not None:
            images.append(image)

    return images


def evaluate(model, genuine_images, impostor_images):
    true_accepts = false_rejects = true_rejects = false_accepts = 0

    for image in genuine_images:
        label, confidence = model.predict(image)

        if label == TARGET_LABEL and confidence < THRESHOLD:
            true_accepts += 1
        else:
            false_rejects += 1

    for image in impostor_images:
        label, confidence = model.predict(image)

        if label == TARGET_LABEL and confidence < THRESHOLD:
            false_accepts += 1
        else:
            true_rejects += 1

    total = true_accepts + false_rejects + true_rejects + false_accepts
    accuracy = (true_accepts + true_rejects) / total if total > 0 else 0

    far = false_accepts / (false_accepts + true_rejects) if (false_accepts + true_rejects) > 0 else 0
    frr = false_rejects / (false_rejects + true_accepts) if (false_rejects + true_accepts) > 0 else 0

    return accuracy, far, frr


def main():
    train_images = load_images(TRAIN_PATH)
    genuine_images = load_images(GENUINE_TEST_PATH)
    impostor_images = load_images(IMPOSTOR_TEST_PATH)

    labels = np.array([TARGET_LABEL] * len(train_images), dtype=np.int32)

    for params in PARAMETER_SETS:
        model = cv2.face.LBPHFaceRecognizer_create(**params)
        model.train(train_images, labels)

        accuracy, far, frr = evaluate(model, genuine_images, impostor_images)

        print("\n==============================")
        print(f"Parametri: {params}")
        print(f"Accuracy:  {accuracy:.2%}")
        print(f"FAR:       {far:.2%}")
        print(f"FRR:       {frr:.2%}")


if __name__ == "__main__":
    main()