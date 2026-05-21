import os
import cv2

MODEL_PATH = "lbph_model.yml"

GENUINE_TEST_PATH = "data/processed/1/test"
IMPOSTOR_TEST_PATH = "data/processed/2/test"

TARGET_LABEL = 1

THRESHOLDS = [30, 40, 50, 60, 70, 80]

best_threshold = None
best_accuracy = -1
best_far = 999

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model ne obstaja: {MODEL_PATH}")

    model = cv2.face.LBPHFaceRecognizer_create()
    model.read(MODEL_PATH)

    return model


def load_images_from_folder(folder_path):
    images = []

    for filename in os.listdir(folder_path):
        image_path = os.path.join(folder_path, filename)

        if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

        if image is None:
            continue

        images.append(image)

    return images


def verify(model, image, threshold):
    predicted_label, confidence = model.predict(image)

    is_confirmed = (
        predicted_label == TARGET_LABEL
        and confidence < threshold
    )

    return is_confirmed


def evaluate_threshold(model, threshold, genuine_images, impostor_images):
    true_accepts = 0
    false_rejects = 0
    true_rejects = 0
    false_accepts = 0

    for image in genuine_images:
        is_confirmed = verify(model, image, threshold)

        if is_confirmed:
            true_accepts += 1
        else:
            false_rejects += 1

    for image in impostor_images:
        is_confirmed = verify(model, image, threshold)

        if is_confirmed:
            false_accepts += 1
        else:
            true_rejects += 1

    total = (
        true_accepts
        + false_rejects
        + true_rejects
        + false_accepts
    )

    correct = true_accepts + true_rejects

    accuracy = correct / total if total > 0 else 0

    far = (
        false_accepts / (false_accepts + true_rejects)
        if (false_accepts + true_rejects) > 0
        else 0
    )

    frr = (
        false_rejects / (false_rejects + true_accepts)
        if (false_rejects + true_accepts) > 0
        else 0
    )

    print(f"\n=== THRESHOLD {threshold} ===")
    print(f"True Accepts:  {true_accepts}")
    print(f"False Rejects: {false_rejects}")
    print(f"True Rejects:  {true_rejects}")
    print(f"False Accepts: {false_accepts}")
    print(f"Accuracy:      {accuracy:.2%}")
    print(f"FAR:           {far:.2%}")
    print(f"FRR:           {frr:.2%}")

    return accuracy, far


def main():
    model = load_model()

    genuine_images = load_images_from_folder(GENUINE_TEST_PATH)
    impostor_images = load_images_from_folder(IMPOSTOR_TEST_PATH)

    global best_threshold
    global best_accuracy
    global best_far

    for threshold in THRESHOLDS:
        accuracy, far = evaluate_threshold(
            model,
            threshold,
            genuine_images,
            impostor_images
        )

        if (
            accuracy > best_accuracy
            or (
                accuracy == best_accuracy
                and far < best_far
            )
        ):
            best_threshold = threshold
            best_accuracy = accuracy
            best_far = far

    print("\n=== NAJBOLJSI THRESHOLD ===")
    print(f"Threshold: {best_threshold}")
    print(f"Accuracy: {best_accuracy:.2%}")
    print(f"FAR:      {best_far:.2%}")


if __name__ == "__main__":
    main()