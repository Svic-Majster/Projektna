import cv2


def test_lbph_model_creation():
    model = cv2.face.LBPHFaceRecognizer_create()

    assert model is not None