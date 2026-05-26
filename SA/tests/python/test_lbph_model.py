import cv2
import numpy as np


def test_lbph_model_creation():
    model = cv2.face.LBPHFaceRecognizer_create()

    assert model is not None

def test_lbph_model_training():
    model = cv2.face.LBPHFaceRecognizer_create()

    image1 = np.zeros((100, 100), dtype=np.uint8)
    image2 = np.ones((100, 100), dtype=np.uint8) * 255

    images = [image1, image2]
    labels = np.array([1, 1])

    model.train(images, labels)

    assert model is not None