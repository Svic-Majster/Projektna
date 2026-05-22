import os
import cv2

MODEL_PATH = "lbph_model.yml"

GENUINE_TEST_PATH = "data/processed/1/test"
IMPOSTOR_TEST_PATH = "data/processed/2/test"

TARGET_LABEL = 1
THRESHOLD = 50


def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model ne obstaja: {MODEL_PATH}")

    model = cv2.face.LBPHFaceRecognizer_create()
    model.read(MODEL_PATH)
    return model


def load_images_from_folder(folder_path):
    images = []

    if not os.path.exists(folder_path):
        raise FileNotFoundError(f"Mapa ne obstaja: {folder_path}")

    for filename in os.listdir(folder_path):
        image_path = os.path.join(folder_path, filename)

        if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

        if image is None:
            print(f"Preskočena slika: {image_path}")
            continue

        images.append((filename, image))

    return images


def verify(model, image):
    predicted_label, confidence = model.predict(image)

    is_confirmed = predicted_label == TARGET_LABEL and confidence < THRESHOLD

    return predicted_label, confidence, is_confirmed


def evaluate():
    model = load_model()

    genuine_images = load_images_from_folder(GENUINE_TEST_PATH)
    impostor_images = load_images_from_folder(IMPOSTOR_TEST_PATH)

    true_accepts = 0
    false_rejects = 0
    true_rejects = 0
    false_accepts = 0

    print("\n=== TEST PRAVEGA UPORABNIKA ===")

    for filename, image in genuine_images:
        predicted_label, confidence, is_confirmed = verify(model, image)

        if is_confirmed:
            true_accepts += 1
            status = "POTRJEN"
        else:
            false_rejects += 1
            status = "ZAVRNJEN"

        print(f"{filename} | label={predicted_label} | confidence={confidence:.2f} | {status}")

    print("\n=== TEST NAPAČNEGA UPORABNIKA ===")

    for filename, image in impostor_images:
        predicted_label, confidence, is_confirmed = verify(model, image)

        if is_confirmed:
            false_accepts += 1
            status = "NAPACNO POTRJEN"
        else:
            true_rejects += 1
            status = "ZAVRNJEN"

        print(f"{filename} | label={predicted_label} | confidence={confidence:.2f} | {status}")

    total = true_accepts + false_rejects + true_rejects + false_accepts
    correct = true_accepts + true_rejects

    accuracy = correct / total if total > 0 else 0

    print("\n=== REZULTATI EVALUACIJE ===")
    print(f"True Accepts:  {true_accepts}")
    print(f"False Rejects: {false_rejects}")
    print(f"True Rejects:  {true_rejects}")
    print(f"False Accepts: {false_accepts}")
    print(f"Accuracy:      {accuracy:.2%}")


    far = false_accepts / (false_accepts + true_rejects) if (false_accepts + true_rejects) > 0 else 0

    frr = false_rejects / (false_rejects + true_accepts) if (false_rejects + true_accepts) > 0 else 0

    print(f"FAR:           {far:.2%}")
    print(f"FRR:           {frr:.2%}")


if __name__ == "__main__":
    evaluate()