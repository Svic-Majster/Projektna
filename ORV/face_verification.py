import os
import cv2

MODEL_PATH = "lbph_model.yml"
TARGET_LABEL = 1
THRESHOLD = 50

def verify_face(image_path):
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model ne obstaja: {MODEL_PATH}")

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Slika ne obstaja: {image_path}")

    model = cv2.face.LBPHFaceRecognizer_create()
    model.read(MODEL_PATH)

    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    if image is None:
        raise ValueError(f"Slike ni mogoče prebrati: {image_path}")

    predicted_label, confidence = model.predict(image)

    is_confirmed = predicted_label == TARGET_LABEL and confidence < THRESHOLD

    if is_confirmed:
        status = "POTRJEN"
    else:
        status = "ZAVRNJEN"

    return {
        "status": status,
        "predicted_label": predicted_label,
        "confidence": confidence
    }


if __name__ == "__main__":
    test_image = "data/processed/1/test/naravnost_0.jpg"

    result = verify_face(test_image)

    print("=== FACE VERIFICATION RESULT ===")
    print(f"Status:          {result['status']}")
    print(f"Predicted label: {result['predicted_label']}")
    print(f"Confidence:      {result['confidence']:.2f}")