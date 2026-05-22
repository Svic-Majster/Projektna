import os
import cv2

MODEL_PATH = "lbph_model.yml"

GENUINE_TEST_PATH = "data/processed/1/test"
IMPOSTOR_TEST_PATH = "data/processed/2/test"

TARGET_LABEL = 1
THRESHOLDS = [30, 40, 50, 60, 70, 80]


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


def evaluate(model, genuine_images, impostor_images, threshold):
    true_accepts = false_rejects = true_rejects = false_accepts = 0

    for image in genuine_images:
        label, confidence = model.predict(image)

        if label == TARGET_LABEL and confidence < threshold:
            true_accepts += 1
        else:
            false_rejects += 1

    for image in impostor_images:
        label, confidence = model.predict(image)

        if label == TARGET_LABEL and confidence < threshold:
            false_accepts += 1
        else:
            true_rejects += 1

    total = true_accepts + false_rejects + true_rejects + false_accepts
    accuracy = (true_accepts + true_rejects) / total if total > 0 else 0

    far = false_accepts / (false_accepts + true_rejects) if (false_accepts + true_rejects) > 0 else 0
    frr = false_rejects / (false_rejects + true_accepts) if (false_rejects + true_accepts) > 0 else 0

    return true_accepts, false_rejects, true_rejects, false_accepts, accuracy, far, frr


def main():
    model = cv2.face.LBPHFaceRecognizer_create()
    model.read(MODEL_PATH)

    genuine_images = load_images(GENUINE_TEST_PATH)
    impostor_images = load_images(IMPOSTOR_TEST_PATH)

    for threshold in THRESHOLDS:
        true_accepts, false_rejects, true_rejects, false_accepts, accuracy, far, frr = evaluate(
            model,
            genuine_images,
            impostor_images,
            threshold
        )

        print(f"\n=== THRESHOLD {threshold} ===")
        print(f"True Accepts:  {true_accepts}")
        print(f"False Rejects: {false_rejects}")
        print(f"True Rejects:  {true_rejects}")
        print(f"False Accepts: {false_accepts}")
        print(f"Accuracy:      {accuracy:.2%}")
        print(f"FAR:           {far:.2%}")
        print(f"FRR:           {frr:.2%}")


if __name__ == "__main__":
    main()